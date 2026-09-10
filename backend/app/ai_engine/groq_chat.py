"""OpenAI-compatible chat HTTP (Groq or Modal vLLM)."""

import httpx
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatResult


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
        if stop:
            payload["stop"] = stop

        response = httpx.post(
            chat_completions_url(self.base_url),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=self.timeout,
        )
        if response.status_code >= 400:
            raise RuntimeError(
                f"{self.provider_name} error {response.status_code}: {response.text[:400]}"
            )
        data = response.json()
        message = data["choices"][0]["message"]
        text = (message.get("content") or message.get("reasoning") or "").strip()
        if not text:
            raise RuntimeError(f"{self.provider_name} returned an empty message.")
        return ChatResult(generations=[ChatGeneration(message=AIMessage(content=text))])


class GroqChat(OpenAICompatChat):
    base_url: str = "https://api.groq.com/openai/v1"
    model: str = "openai/gpt-oss-20b"
    max_tokens: int = 512
    provider_name: str = "groq"
