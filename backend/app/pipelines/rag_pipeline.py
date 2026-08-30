"""
Clariq Architecture - Pipeline Layer: Retrieval-Augmented Generation.
Orchestrates the connection between the Vector Store (context) and the LLM (generation).
"""

import logging
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage
from operator import itemgetter

# Import the initialized clients from our subsystems
from app.storage.vector_client import vector_client
from app.ai_engine.llm_client import clariq_llm
from app.storage.redis_client import redis_cache

class RAGPipeline:
    def __init__(self):
        """Initializes the RAG execution chain using LangChain Expression Language (LCEL)."""
        if not vector_client or not clariq_llm:
            logging.critical("RAG Pipeline cannot initialize: Missing Vector or LLM Client.")
            raise RuntimeError("Missing dependencies for RAG Pipeline.")
        
        # Pull the top 3 most relevant textbook paragraphs for any given query
        self.retriever = vector_client.get_retriever(search_k=3)
        self.prompt = self._build_prompt_template()
        self.chain = self._build_chain()
        logging.info("RAG Pipeline Chain successfully assembled.")

    def _build_prompt_template(self) -> ChatPromptTemplate:
        """Constructs the Socratic curriculum-grounded prompt."""
        system_template = (
            "You are a strict but encouraging Socratic tutor for the Class 10 Science curriculum.\n"
            "Your goal is to guide the student to the answer step-by-step. NEVER give them the direct answer.\n"
            "Follow these RULES strictly:\n"
            "1. NEVER give the direct answer to the student's question.\n"
            "2. Keep your response very short (1-3 sentences maximum).\n"
            "3. ALWAYS end your response with a single guiding question.\n"
            "4. Praise the student when they get something right, then guide them to the next step.\n"
            "5. If the student doesn't know, provide a hint and ask a simpler question.\n"
            "6. If the student asks a COMPLETELY NEW question, seamlessly pivot to the new topic and start a new Socratic line of questioning. Do not force them to finish the old topic.\n\n"
            "Textbook Context:\n{context}\n\n"
        )
        return ChatPromptTemplate.from_messages([
            ("system", system_template),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{question}")
        ])

    @staticmethod
    def _format_docs(docs) -> str:
        """Helper to format retrieved LangChain Document objects into plain text strings."""
        return "\n\n".join(doc.page_content for doc in docs)

    def _build_chain(self):
        """Assembles the LangChain Expression Language (LCEL) retrieval pipeline."""
        return (
            {
                "context": itemgetter("question") | self.retriever | self._format_docs, 
                "question": itemgetter("question"),
                "chat_history": itemgetter("chat_history")
            }
            | self.prompt
            | clariq_llm
            | StrOutputParser()
        )

    def invoke(self, question: str, session_id: str = "default_session") -> str:
        """
        Executes the RAG pipeline with chat history memory.
        """
        logging.info(f"Executing RAG pipeline for session '{session_id}' - question: {question}")
        try:
            # 1. Load history
            history = redis_cache.load_chat_session(session_id)
            
            # 2. Run chain
            response = self.chain.invoke({
                "question": question,
                "chat_history": history
            })
            
            # 3. Update history
            history.append(HumanMessage(content=question))
            history.append(AIMessage(content=response))
            redis_cache.save_chat_session(session_id, history)
            
            return response
        except Exception as e:
            logging.error(f"Error during RAG pipeline execution: {str(e)}")
            raise e

# Export a singleton instance of the pipeline for the FastAPI endpoints
try:
    rag_chain_pipeline = RAGPipeline()
except Exception as e:
    logging.error("Failed to export RAGPipeline singleton.")
    rag_chain_pipeline = None

if __name__ == "__main__":
    # A quick testing block so you can run this script directly to test your AI!
    if rag_chain_pipeline:
        print("\n" + "="*50)
        print("Socratic Tutor Terminal Test (Type 'quit' or 'exit' to stop)")
        print("="*50 + "\n")
        
        while True:
            test_question = input("\nStudent: ")
            
            if test_question.strip().lower() in ['quit', 'exit']:
                print("Ending session.")
                break
            
            if not test_question.strip():
                continue
                
            print("\nTutor (Thinking...): ", end="", flush=True)
            try:
                answer = rag_chain_pipeline.invoke(test_question, session_id="terminal_test")
                print("\n" + answer)
            except Exception as e:
                print(f"\nExecution failed: {e}")
