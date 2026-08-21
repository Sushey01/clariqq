"""
Clariq Architecture - Storage Layer: Vector Client.
Manages localized connection tracking to the persisted Chroma vector database
to handle semantic retrieval queries cleanly.
"""

import os
import sys
import logging
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Chroma

# Absolute data pathways mapping directly to your successful ingestion output logs
DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../..", "storage/chroma_db"))
EMBED_MODEL = "nomic-embed-text"


class VectorStoreClient:
    def __init__(self):
        """Initializes the database connection layer natively with defensive validations."""
        if not os.path.exists(DB_DIR):
            logging.error(f"Vector directory database checkpoint target missing at: {DB_DIR}")
            raise FileNotFoundError(f"ChromaDB persistent store directory not found at {DB_DIR}")

        try:
            logging.info(f"Connecting to persistent Chroma storage layer at: {DB_DIR}")
            self.embeddings = OllamaEmbeddings(model=EMBED_MODEL)
            self.vector_db = Chroma(
                persist_directory=DB_DIR, 
                embedding_function=self.embeddings
            )
            logging.info("Vector database connector context bound successfully.")
        except Exception as e:
            logging.error(f"Failed to connect to local Chroma database instance: {str(e)}")
            raise e

    def get_retriever(self, search_k: int = 2):
        """Exposes a standardized vector search retrieval abstraction interface."""
        return self.vector_db.as_retriever(search_kwargs={"k": search_k})


# Export standard singleton client instance for your LangGraph retrieval pipeline nodes
try:
    vector_client = VectorStoreClient()
except Exception as init_error:
    logging.critical(f"Critical System Vector Storage initialization crash: {str(init_error)}")
    vector_client = None
