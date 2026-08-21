"""
Clariq Architecture - Pipeline Layer: Retrieval-Augmented Generation.
Orchestrates the connection between the Vector Store (context) and the LLM (generation).
"""

import logging
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# Import the initialized clients from our subsystems
from app.storage.vector_client import vector_client
from app.ai_engine.llm_client import clariq_llm

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
        # Note: In a larger app, this string can be moved to app/ai_engine/templates.py
        system_template = (
            "You are a strict but encouraging Socratic tutor for the Class 10 Science curriculum.\n"
            "Use the following textbook excerpts to formulate your response.\n"
            "Do NOT give the student the direct answer right away. Instead, use the context to ask "
            "a guiding question that helps them figure it out themselves.\n\n"
            "Textbook Context:\n{context}\n\n"
        )
        return ChatPromptTemplate.from_messages([
            ("system", system_template),
            ("human", "{question}")
        ])

    @staticmethod
    def _format_docs(docs) -> str:
        """Helper to format retrieved LangChain Document objects into plain text strings."""
        return "\n\n".join(doc.page_content for doc in docs)

    def _build_chain(self):
        """Assembles the LangChain Expression Language (LCEL) retrieval pipeline."""
        return (
            # 1. Retrieve the docs and format them, while passing the user's question through
            {"context": self.retriever | self._format_docs, "question": RunnablePassthrough()}
            # 2. Inject context and question into the prompt template
            | self.prompt
            # 3. Send the prompt to the local LLM
            | clariq_llm
            # 4. Parse the raw AI output into a clean python string
            | StrOutputParser()
        )

    def invoke(self, question: str) -> str:
        """
        Executes the RAG pipeline for a given user question.
        
        Args:
            question: The string input from the user.
            
        Returns:
            The generated string response from the LLM.
        """
        logging.info(f"Executing RAG pipeline for question: {question}")
        try:
            response = self.chain.invoke(question)
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
        # Allow the user to type any question in the terminal!
        test_question = input("Enter a Science Question (or press Enter for default): ")
        if not test_question.strip():
            test_question = "What is photosynthesis?"
            
        print(f"\nUser Question: {test_question}\n")
        print("Tutor Response (Thinking...):")
        try:
            answer = rag_chain_pipeline.invoke(test_question)
            print("\n" + answer)
        except Exception as e:
            print(f"Execution failed: {e}")
        print("\n" + "="*50 + "\n")
