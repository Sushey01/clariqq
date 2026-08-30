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
        """Initializes a connection pool, or falls back to in-memory dictionary."""
        self.use_fallback = False
        self.fallback_cache = {}
        
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
        except (redis.ConnectionError, redis.exceptions.ConnectionError, Exception) as e:
            logging.warning(f"Redis not available, falling back to in-memory dictionary: {str(e)}")
            self.use_fallback = True

    def _get_client(self):
        if self.use_fallback:
            return None
        return redis.Redis(connection_pool=self.pool)

    def save_chat_session(self, session_id: str, messages: List[BaseMessage]) -> None:
        """Serializes LangChain BaseMessage components into string blocks inside Redis or Dict."""
        serialized_messages = messages_to_dict(messages)
        
        if self.use_fallback:
            self.fallback_cache[f"session:{session_id}"] = json.dumps(serialized_messages)
            return

        client = self._get_client()
        client.set(
            name=f"session:{session_id}",
            value=json.dumps(serialized_messages),
            ex=SESSION_TTL
        )

    def load_chat_session(self, session_id: str) -> List[BaseMessage]:
        """Fetches string structures from cache memory and rebuilds LangChain message vectors."""
        if self.use_fallback:
            raw_data = self.fallback_cache.get(f"session:{session_id}")
        else:
            client = self._get_client()
            raw_data = client.get(f"session:{session_id}")
        
        if not raw_data:
            return []
            
        serialized_messages = json.loads(raw_data)
        # Reconstruct standard HumanMessage and AIMessage classes instantly
        return messages_from_dict(serialized_messages)


# Export standard singleton client instance for your FastAPI application layer
redis_cache = RedisSessionCache()
