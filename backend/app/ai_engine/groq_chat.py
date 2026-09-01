"""Groq OpenAI-compatible chat, used until the local GGUF is ready."""

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


class GroqChat(BaseChatModel):
    api_key: str
    model: str = "openai/gpt-oss-20b"
    temperature: float = 0.1
    max_tokens: int = 512

    @property
    def _llm_type(self) -> str:
        return "groq"

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
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=60.0,
        )
        if response.status_code >= 400:
            raise RuntimeError(f"Groq error {response.status_code}: {response.text[:400]}")
        data = response.json()
        message = data["choices"][0]["message"]
        text = (message.get("content") or message.get("reasoning") or "").strip()
        if not text:
            raise RuntimeError("Groq returned an empty message.")
        return ChatResult(generations=[ChatGeneration(message=AIMessage(content=text))])
