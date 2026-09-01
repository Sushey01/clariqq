"""Ask the textbook (Chroma) then the tutor model. One method: ask()."""

from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.ai_engine.llm import get_llm
from app.prompts import system_prompt
from app.storage.chroma import get_retriever
from app.storage.sessions import sessions


class Tutor:
    def __init__(self, llm, retriever):
        self.llm = llm
        self.retriever = retriever

    def ask(self, question: str, session_id: str, mode: str = "strict") -> str:
        history = sessions.load(session_id)
        docs = self.retriever.get_relevant_documents(question)
        context = "\n\n".join(doc.page_content for doc in docs)

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt(mode) + "\n\nTextbook context:\n{context}"),
                MessagesPlaceholder("chat_history"),
                ("human", "{question}"),
            ]
        )
        chain = prompt | self.llm | StrOutputParser()
        answer = chain.invoke(
            {
                "context": context,
                "chat_history": history,
                "question": question,
            }
        )

        history.append(HumanMessage(content=question))
        history.append(AIMessage(content=answer))
        sessions.save(session_id, history)
        return answer


_tutor = None
_error = None


def get_tutor() -> Tutor | None:
    global _tutor, _error
    if _tutor is not None:
        return _tutor
    try:
        _tutor = Tutor(llm=get_llm(), retriever=get_retriever())
        _error = None
    except Exception as exc:
        _tutor = None
        _error = str(exc)
    return _tutor


def tutor_error() -> str | None:
    if _tutor is None and _error is None:
        get_tutor()
    return _error
