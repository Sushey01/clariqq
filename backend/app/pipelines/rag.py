"""Ask the textbook and student notes (Chroma) then the tutor model. One method: ask()."""

import threading

from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.ai_engine.llm import get_llm
from app.pipelines.turn_policy import (
    canned_non_science_reply,
    classify_turn,
    ensure_socratic_reply,
    filter_relevant_docs,
    last_science_topic,
)
from app.prompts import system_prompt, turn_addendum
from app.storage.chroma import retrieve_documents
from app.storage.sessions import sessions

_MAX_CONTEXT_CHARS = 1500
_MAX_HISTORY_MESSAGES = 6
_INFER_LOCK = threading.Lock()


def _format_context(docs) -> str:
    parts = []
    for doc in docs:
        meta = doc.metadata or {}
        kind = meta.get("source_kind") or "textbook"
        name = meta.get("source") or ""
        label = "Student notes" if kind == "notes" else "Textbook"
        header = f"[{label}: {name}]" if name else f"[{label}]"
        parts.append(f"{header}\n{doc.page_content}")
    return "\n\n".join(parts)[:_MAX_CONTEXT_CHARS]


class Tutor:
    def __init__(self, llm):
        self.llm = llm

    def ask(
        self,
        question: str,
        session_id: str,
        mode: str = "strict",
        user_id: str | None = None,
    ) -> str:
        history = sessions.load(session_id)[-_MAX_HISTORY_MESSAGES:]
        kind = classify_turn(question)
        topic = last_science_topic(history, question)
        canned = canned_non_science_reply(kind, topic)
        if canned is not None:
            history.append(HumanMessage(content=question))
            history.append(AIMessage(content=canned))
            sessions.save(session_id, history)
            return canned

        docs = filter_relevant_docs(
            question, retrieve_documents(question, user_id=user_id)
        )
        context = _format_context(docs) or "(none)"
        extra = turn_addendum(kind, topic)

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    system_prompt(mode) + extra + "\n\nRetrieved context:\n{context}",
                ),
                MessagesPlaceholder("chat_history"),
                ("human", "{question}"),
            ]
        )
        chain = prompt | self.llm | StrOutputParser()
        with _INFER_LOCK:
            answer = chain.invoke(
                {
                    "context": context,
                    "chat_history": history,
                    "question": question,
                }
            )
        answer = ensure_socratic_reply(answer, question, mode, topic)

        history.append(HumanMessage(content=question))
        history.append(AIMessage(content=answer))
        sessions.save(session_id, history)
        return answer


_tutor = None
_error = None
_tutor_llm_id = None


def get_tutor() -> Tutor | None:
    global _tutor, _error, _tutor_llm_id
    llm = None
    try:
        llm = get_llm()
    except Exception as exc:
        _tutor = None
        _error = str(exc)
        _tutor_llm_id = None
        return None
    if _tutor is not None and _tutor_llm_id is llm:
        return _tutor
    try:
        _tutor = Tutor(llm=llm)
        _tutor_llm_id = llm
        _error = None
        return _tutor
    except Exception as exc:
        _tutor = None
        _tutor_llm_id = None
        _error = str(exc)
        return None


def tutor_error() -> str | None:
    if _tutor is None and _error is None:
        get_tutor()
    return _error
