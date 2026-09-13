"""OpenAI-compatible chat HTTP (Groq or Modal vLLM)."""

import time

import httpx
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatResult

from app.pipelines.turn_policy import strip_phi3_specials

_RETRY_STATUSES = {502, 503, 504}


def _as_chat_dicts(messages: list[BaseMessage]) -> list[dict]:
    rows = []
    for message in messages:
        if message.type == "system":
            role = "system"
        elif message.type == "ai":
            role = "assistant"
        else:
            role = "user"
        rows.append({"role": role, "content": str(message.content)})
    return rows


def chat_completions_url(base_url: str) -> str:
    base = (base_url or "").rstrip("/")
    if base.endswith("/chat/completions"):
        return base
    if base.endswith("/v1"):
        return f"{base}/chat/completions"
    return f"{base}/v1/chat/completions"


class OpenAICompatChat(BaseChatModel):
    api_key: str
    model: str
    base_url: str
    temperature: float = 0.1
    max_tokens: int = 256
    timeout: float = 60.0
    provider_name: str = "openai_compat"
    retry_transient: bool = False
    stop_sequences: list[str] | None = None

    @property
    def _llm_type(self) -> str:
        return self.provider_name

    def _generate(
        self,
        messages: list[BaseMessage],
        stop: list[str] | None = None,
        run_manager: CallbackManagerForLLMRun | None = None,
        **kwargs,
    ) -> ChatResult:
        payload = {
            "model": self.model,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "messages": _as_chat_dicts(messages),
        }
        stops = list(stop or self.stop_sequences or [])
        if stops:
            payload["stop"] = stops

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        url = chat_completions_url(self.base_url)
        deadline = time.monotonic() + self.timeout
        last_error = "no response"
        attempt = 0

        while time.monotonic() < deadline:
            attempt += 1
            remaining = max(10.0, deadline - time.monotonic())
            try:
                response = httpx.post(
                    url,
                    headers=headers,
                    json=payload,
                    timeout=min(120.0, remaining),
                )
            except httpx.RequestError as exc:
                last_error = f"{self.provider_name} network error: {exc}"
                if not self.retry_transient:
                    raise RuntimeError(last_error) from exc
                time.sleep(min(5.0, remaining))
                continue

            body = (response.text or "").strip()
            if response.status_code in _RETRY_STATUSES or (
                response.status_code == 200 and not body
            ):
                snippet = body[:300] or "empty body"
                last_error = (
                    f"{self.provider_name} error {response.status_code} "
                    f"(GPU still starting, attempt {attempt}): {snippet}"
                )
                if not self.retry_transient:
                    raise RuntimeError(last_error)
                time.sleep(min(5.0, max(1.0, deadline - time.monotonic())))
                continue

            if response.status_code >= 400:
                raise RuntimeError(
                    f"{self.provider_name} error {response.status_code}: {body[:400]}"
                )

            try:
                data = response.json()
            except ValueError as exc:
                last_error = (
                    f"{self.provider_name} returned non-JSON "
                    f"({response.status_code}): {body[:200]}"
                )
                if self.retry_transient:
                    time.sleep(min(5.0, max(1.0, deadline - time.monotonic())))
                    continue
                raise RuntimeError(last_error) from exc

            message = data["choices"][0]["message"]
            text = strip_phi3_specials(
                message.get("content") or message.get("reasoning") or ""
            )
            if not text:
                raise RuntimeError(f"{self.provider_name} returned an empty message.")
            return ChatResult(generations=[ChatGeneration(message=AIMessage(content=text))])

        raise RuntimeError(
            f"{self.provider_name} did not become ready within {self.timeout:.0f}s. "
            f"Last error: {last_error}"
        )


class GroqChat(OpenAICompatChat):
    base_url: str = "https://api.groq.com/openai/v1"
    model: str = "openai/gpt-oss-20b"
    max_tokens: int = 512
    provider_name: str = "groq"
    retry_transient: bool = False
