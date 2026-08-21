"""
Data Ingestion Module for Retrieval-Augmented Generation (RAG) Pipeline.

This module is responsible for extracting text from educational PDF materials
using PyMuPDF, splitting the text into semantically cohesive chunks, and 
generating high-dimensional vector embeddings using local models. 
The generated embeddings are persisted to a local vector database.
"""

import logging
import os
import sys
import glob
from typing import List

from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

# Configure standard logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


class DataIngestionPipeline:
    """
    Handles the ingestion, chunking, and embedding of document data.
    """

    def __init__(
        self,
        data_directory: str = "data/pdfs/",
        persist_directory: str = "storage/chroma_db/",
        embedding_model_name: str = "nomic-embed-text"
    ) -> None:
        """
        Initializes the Data Ingestion Pipeline with necessary configuration.

        Args:
            data_directory: The path to the directory containing source PDF documents.
            persist_directory: The local directory to store the database.
            embedding_model_name: The name of the local Ollama embedding model.
        """
        self.data_directory = data_directory
        self.persist_directory = persist_directory
        self.embedding_model_name = embedding_model_name

    def load_documents(self) -> List[Document]:
        """
        Loads and parses all PDF documents in the data directory using PyMuPDFLoader.

        Returns:
            A list of Document objects extracted from the PDFs.

        Raises:
            FileNotFoundError: If the specified directory does not exist or has no PDFs.
            ValueError: If the extracted document list is empty.
        """
        if not os.path.exists(self.data_directory):
            logger.error("The specified data directory does not exist: %s", self.data_directory)
            raise FileNotFoundError(f"Directory not found: {self.data_directory}")

        pdf_files = glob.glob(os.path.join(self.data_directory, "*.pdf"))
        if not pdf_files:
            logger.error("No PDF files found in the directory: %s", self.data_directory)
            raise FileNotFoundError(f"No PDFs found in: {self.data_directory}")

        logger.info("Initiating document loading from %d PDF(s) in: %s", len(pdf_files), self.data_directory)
        
        all_documents = []
        try:
            for file_path in pdf_files:
                logger.info("Loading document: %s", file_path)
                loader = PyMuPDFLoader(file_path)
                documents = loader.load()
                all_documents.extend(documents)
            
            if not all_documents:
                logger.error("No content could be extracted from the PDFs.")
                raise ValueError("Extracted document list is empty.")
                
            logger.info("Successfully loaded a total of %d pages from all documents.", len(all_documents))
            return all_documents

        except Exception as error:
            logger.error("An error occurred during document extraction: %s", str(error))
            raise

    def split_text(self, documents: List[Document]) -> List[Document]:
        """
        Splits the loaded documents into smaller, semantically meaningful chunks.

        Args:
            documents: The list of Document objects to be split.

        Returns:
            A list of chunked Document objects.
        """
        logger.info("Initializing text splitting process.")
        
        # A chunk size of 512 characters with a 64-character overlap is explicitly 
        # optimized for scientific texts. This specific configuration ensures that 
        # multiline scientific equations, chemical formulas, and contiguous 
        # theoretical principles (such as Ohm's Law or Mendel's principles) remain 
        # structurally sound and contextually isolated without fragmentation.
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=512,
            chunk_overlap=64,
            length_function=len,
            is_separator_regex=False,
        )
        
        chunks = text_splitter.split_documents(documents)
        logger.info("Successfully split documents into %d chunks.", len(chunks))
        
        return chunks

    def create_and_persist_embeddings(self, chunks: List[Document]) -> None:
        """
        Generates embeddings for the text chunks and persists them to a database.

        Args:
            chunks: The list of chunked Document objects.
        """
        logger.info("Initializing embedding generation using local model: %s", self.embedding_model_name)
        
        try:
            embeddings = OllamaEmbeddings(model=self.embedding_model_name)
            
            logger.info("Persisting embeddings to local directory: %s", self.persist_directory)
            vector_store = Chroma.from_documents(
                documents=chunks,
                embedding=embeddings,
                persist_directory=self.persist_directory
            )
            
            vector_store.persist()
            logger.info("Successfully completed vector database persistence.")
            
        except Exception as error:
            logger.error("An error occurred during embedding generation or database persistence: %s", str(error))
            raise

    def run(self) -> None:
        """
        Executes the complete data ingestion pipeline sequentially.
        """
        logger.info("Starting the data ingestion pipeline.")
        try:
            documents = self.load_documents()
            chunks = self.split_text(documents)
            self.create_and_persist_embeddings(chunks)
            logger.info("Data ingestion pipeline completed successfully.")
        except Exception as error:
            logger.critical("Pipeline execution failed: %s", str(error))
            sys.exit(1)


if __name__ == "__main__":
    # Assuming the script is run from the backend/ directory
    pipeline = DataIngestionPipeline()
    pipeline.run()
