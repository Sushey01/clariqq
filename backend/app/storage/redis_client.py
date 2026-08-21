"""
Clariq Architecture - Storage Layer: Redis Session Cache.
Manages connection pools to store multi-turn chat memory 
and curriculum concept states natively.
"""

import json
import logging
import redis
from typing import List
from langchain_core.messages import messages_from_dict, messages_to_dict, BaseMessage

REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_DB = 0
SESSION_TTL = 3600  # Automatically clear inactive cache sessions after 1 hour


class RedisSessionCache:
    def __init__(self):
        """Initializes a connection pool matching standard MLOps runtime patterns."""
        try:
            self.pool = redis.ConnectionPool(
                host=REDIS_HOST, 
                port=REDIS_PORT, 
                db=REDIS_DB, 
                decode_responses=True
            )
            # Verify connectivity immediately during runtime init
            client = redis.Redis(connection_pool=self.pool)
            client.ping()
            logging.info("Successfully established active Redis memory cache connection pool.")
        except redis.ConnectionError as e:
            logging.error(f"Failed to connect to local Redis memory engine instance: {str(e)}")
            raise e

    def _get_client(self) -> redis.Redis:
        return redis.Redis(connection_pool=self.pool)

    def save_chat_session(self, session_id: str, messages: List[BaseMessage]) -> None:
        """Serializes LangChain BaseMessage components into string blocks inside Redis."""
        client = self._get_client()
        # Convert complex LangChain structures into plain serializable arrays of dicts
        serialized_messages = messages_to_dict(messages)
        
        client.set(
            name=f"session:{session_id}",
            value=json.dumps(serialized_messages),
            ex=SESSION_TTL
        )

    def load_chat_session(self, session_id: str) -> List[BaseMessage]:
        """Fetches string structures from cache memory and rebuilds LangChain message vectors."""
        client = self._get_client()
        raw_data = client.get(f"session:{session_id}")
        
        if not raw_data:
            return []
            
        serialized_messages = json.loads(raw_data)
        # Reconstruct standard HumanMessage and AIMessage classes instantly
        return messages_from_dict(serialized_messages)


# Export standard singleton client instance for your FastAPI application layer
redis_cache = RedisSessionCache()
