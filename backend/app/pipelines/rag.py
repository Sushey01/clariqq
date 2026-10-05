"""Ask the tutor model. One method: ask().

The live reply is the student's words plus the Space tutor prompt.
Textbook retrieval is not pasted into this turn.
"""

import threading

from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.ai_engine.llm import get_llm
from app.pipelines.turn_policy import (
    canned_non_science_reply,
    classify_turn,
    ensure_socratic_reply,
    is_standalone_new_question,
    last_science_topic,
)
from app.prompts import system_prompt, turn_addendum
from app.storage.sessions import sessions

_MAX_HISTORY_MESSAGES = 4
_INFER_LOCK = threading.Lock()


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
        history = sessions.load(session_id)
        kind = classify_turn(question)
        topic = last_science_topic(history, question)
        canned = canned_non_science_reply(kind, topic)
        if canned is not None:
            history.append(HumanMessage(content=question))
            history.append(AIMessage(content=canned))
            sessions.save(session_id, history)
            return canned

        # Textbook chunks stay out of this turn. The Space sends only the
        # student's words; pasting a retrieved paragraph makes the model recite it.
        extra = turn_addendum(kind, topic)
        student_turn = question

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    system_prompt(mode) + extra,
                ),
                MessagesPlaceholder("chat_history"),
                ("human", "{question}"),
            ]
        )
        if is_standalone_new_question(question):
            model_history = []
        else:
            model_history = history[-_MAX_HISTORY_MESSAGES:]
        chain = prompt | self.llm | StrOutputParser()
        # ChatLlamaCpp runs C-bindings that require serialization; cloud API providers
        # (Groq, Modal, HF Space) are thread-safe HTTP clients that can execute concurrently.
        if getattr(self.llm, "__class__", None).__name__ == "ChatLlamaCpp":
            with _INFER_LOCK:
                answer = chain.invoke(
                    {
                        "chat_history": model_history,
                        "question": student_turn,
                    }
                )
        else:
            answer = chain.invoke(
                {
                    "chat_history": model_history,
                    "question": student_turn,
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
