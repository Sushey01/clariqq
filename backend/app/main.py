"""
Clariq Architecture - Application Server: Main Gateway.
Initializes the FastAPI application, configures CORS, and exposes
the REST endpoints for the React frontend to communicate with the RAG Pipeline.
"""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import our core orchestration pipeline
from app.pipelines.rag_pipeline import rag_chain_pipeline

# Configure logging for the API layer
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api_gateway")

# Initialize FastAPI App
app = FastAPI(
    title="Clariq Socratic RAG API",
    description="Microservice Gateway for the Grade 10 Science AI Tutor.",
    version="1.0.0"
)

# Configure CORS so the React frontend can make requests to this API securely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    """Pydantic Schema defining the expected inbound JSON payload."""
    question: str
    session_id: str = "default_session"

class ChatResponse(BaseModel):
    """Pydantic Schema defining the outbound JSON structure."""
    answer: str
    session_id: str

@app.get("/health")
def health_check():
    """Simple diagnostic endpoint to verify the API is running."""
    status = "healthy" if rag_chain_pipeline else "degraded"
    return {"status": status, "rag_pipeline_loaded": bool(rag_chain_pipeline)}

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    """
    Main conversational endpoint.
    Receives a student's question, routes it through the RAG engine, and returns the Socratic response.
    """
    if not rag_chain_pipeline:
        raise HTTPException(status_code=500, detail="RAG Pipeline is currently offline or failed to initialize.")
    
    logger.info(f"Received query for session '{payload.session_id}': {payload.question}")
    
    try:
        # Invoke the LangChain RAG pipeline
        answer = rag_chain_pipeline.invoke(payload.question)
        
        return ChatResponse(
            answer=answer,
            session_id=payload.session_id
        )
    except Exception as e:
        logger.error(f"Failed to generate response: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while generating the tutor response.")
