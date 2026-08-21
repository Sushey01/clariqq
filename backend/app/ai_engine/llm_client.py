"""
Clariq Architecture - Inference Layer: Large Language Model Client.
Manages connection interfaces to local execution engines, setting 
deterministic inference thresholds for the Socratic pipeline.
"""

import logging
from huggingface_hub import hf_hub_download
from langchain_community.chat_models import ChatLlamaCpp
from langchain_core.messages import SystemMessage

# Model configuration properties - Using fine-tuned GGUF from Hugging Face
REPO_ID = "Susu11/clariq_socratic-GGUF"
FILENAME = "model.gguf"
INFERENCE_TEMPERATURE = 0.1     # Low value suppresses model variance and ensures strict consistency


class SocraticLLMClient:
    def __init__(self, repo_id: str, filename: str, temperature: float):
        """Initializes the LlamaCpp interface engine framework wrapper securely."""
        self.repo_id = repo_id
        self.filename = filename
        self.temperature = temperature
        
        logging.info(f"Downloading/Locating model '{self.filename}' from '{self.repo_id}'...")
        try:
            # This downloads the model to ~/.cache/huggingface if not already present
            model_path = hf_hub_download(repo_id=self.repo_id, filename=self.filename)
            logging.info(f"Model ready at: {model_path}")
            
            # Setting up ChatLlamaCpp connection
            self.model_instance = ChatLlamaCpp(
                model_path=model_path,
                temperature=self.temperature,
                n_ctx=2048, # Adjust context window size if needed
                max_tokens=512,
                # n_gpu_layers=-1 # Uncomment to offload completely to GPU if available
            )
            logging.info("Local inference client engine connected and ready for execution traces.")
        except Exception as e:
            logging.error(f"Failed to bind connection parameters to LlamaCpp runtime: {str(e)}")
            raise e

    def get_model(self):
        """Exposes the instantiated model handle for graph orchestration chains."""
        return self.model_instance


# Export single initialized runtime client to keep connection allocation clean
try:
    llm_system_client = SocraticLLMClient(REPO_ID, FILENAME, INFERENCE_TEMPERATURE)
    clariq_llm = llm_system_client.get_model()
except Exception as init_fault:
    logging.critical(f"Critical Subsystem Failure: LLM Initialization crashed: {str(init_fault)}")
    clariq_llm = None
