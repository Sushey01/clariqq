"""Hugging Face ZeroGPU Gradio Space as a LangChain chat model."""

from __future__ import annotations

from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatResult

SPACE_FORMAT_HINT = (
    "The Hugging Face Space chat API is still on Gradio tuple history. "
    "Upload hf_space/socratic/app.py to Susu11/socratic, wait for rebuild, "
    "then send the question again from the frontend."
)
DNS_HINT = (
    "Could not resolve Hugging Face DNS. Clariq now calls "
    "https://susu11-socratic.hf.space directly. Retry the message."
)


def space_src(space_id: str) -> str:
    """Use the Space HTTPS host so Client does not need huggingface.co DNS."""
    value = (space_id or "").strip()
    if value.startswith("http://") or value.startswith("https://"):
        return value.rstrip("/")
    owner, sep, name = value.partition("/")
    if not sep or not name:
        return value
    return f"https://{owner}-{name}.hf.space".lower()

_client = None
_client_space = None


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


def split_space_payload(messages: list[BaseMessage]) -> tuple[str, list[dict]]:
    """Last user turn plus prior user/assistant rows for Gradio /chat."""
    rows = _as_chat_dicts(messages)
    system = "\n\n".join(
        row["content"] for row in rows if row["role"] == "system" and row["content"]
    )
    turns = [row for row in rows if row["role"] != "system"]
    question = turns[-1]["content"] if turns else ""
    history = [
        {"role": row["role"], "content": row["content"]} for row in turns[:-1]
    ]
    if system:
        question = f"{system}\n\nStudent message:\n{question}"
    return question, history


def assistant_text_from_space(result) -> str:
    if result is None:
        return ""
    if isinstance(result, str):
        return result.strip()
    if isinstance(result, list) and result:
        last = result[-1]
        if isinstance(last, dict):
            content = last.get("content")
            if isinstance(content, list):
                parts = []
                for item in content:
                    if isinstance(item, dict) and item.get("type") == "text":
                        parts.append(str(item.get("text") or ""))
                    elif isinstance(item, dict) and "text" in item:
                        parts.append(str(item.get("text") or ""))
                return "".join(parts).strip()
            return str(content or "").strip()
        if isinstance(last, (list, tuple)) and len(last) >= 2:
            return str(last[1] or "").strip()
    return str(result).strip()


def reset_space_client() -> None:
    global _client, _client_space
    _client = None
    _client_space = None


def _gradio_token(token: str | None):
    # None would reuse a locally saved HF token and look up huggingface.co.
    return token if token else False


def _space_client(space_id: str, token: str | None, timeout: float):
    global _client, _client_space
    from gradio_client import Client

    src = space_src(space_id)
    cache_key = (src, bool(token), len(token or ""))
    if _client is not None and _client_space == cache_key:
        return _client
    _client = Client(
        src,
        token=_gradio_token(token),
        analytics_enabled=False,
        httpx_kwargs={"timeout": timeout},
    )
    _client_space = cache_key
    return _client


class HfSpaceChat(BaseChatModel):
    space_id: str = "Susu11/socratic"
    token: str = ""
    timeout: float = 300.0

    @property
    def _llm_type(self) -> str:
        return "hf_space"

    def _generate(
        self,
        messages: list[BaseMessage],
        stop: list[str] | None = None,
        run_manager: CallbackManagerForLLMRun | None = None,
        **kwargs,
    ) -> ChatResult:
        question, history = split_space_payload(messages)
        try:
            client = _space_client(self.space_id, self.token or None, self.timeout)
            info = client.view_api(print_info=False, return_format="dict") or {}
            endpoints = info.get("named_endpoints") or {}
            if "/chat" in endpoints:
                raw = client.predict(question, history, api_name="/chat")
            else:
                _, hist = client.predict(question, [], api_name="/user_message")
                raw = client.predict(hist, api_name="/bot_response")
        except Exception as exc:
            reset_space_client()
            detail = str(exc)
            lowered = detail.lower()
            if "messages format" in lowered or "incompatible" in lowered:
                raise RuntimeError(SPACE_FORMAT_HINT) from exc
            if "name resolution" in lowered or "errno -3" in lowered:
                raise RuntimeError(DNS_HINT) from exc
            if "zerogpu quota" in lowered or "exceeded your zerogpu" in lowered:
                raise RuntimeError(
                    "ZeroGPU daily quota is used up. Wait for the reset time in "
                    "the Hugging Face error, or set HUGGINGFACE_API_KEY in .env "
                    "(a token from huggingface.co/settings/tokens) and restart "
                    "the backend for more quota."
                ) from exc
            raise RuntimeError(f"hf_space error: {exc}") from exc

        text = assistant_text_from_space(raw)
        if text == "Thinking...":
            text = ""
        if not text:
            raise RuntimeError("hf_space returned an empty message.")
        return ChatResult(generations=[ChatGeneration(message=AIMessage(content=text))])
