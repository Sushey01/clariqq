"""Chat history per session_id. Uses Redis, or a dict if Redis is down."""

import json

import redis
from langchain_core.messages import BaseMessage, messages_from_dict, messages_to_dict

from app.config import REDIS_DB, REDIS_HOST, REDIS_PORT, SESSION_TTL_SECONDS


class SessionStore:
    def __init__(self):
        self._memory = {}
        self._redis = None
        try:
            client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                db=REDIS_DB,
                decode_responses=True,
            )
            client.ping()
            self._redis = client
        except redis.RedisError:
            pass

    def load(self, session_id: str) -> list[BaseMessage]:
        raw = self._get(f"session:{session_id}")
        if not raw:
            return []
        return messages_from_dict(json.loads(raw))

    def save(self, session_id: str, messages: list[BaseMessage]) -> None:
        payload = json.dumps(messages_to_dict(messages))
        self._set(f"session:{session_id}", payload)

    def _get(self, key: str):
        if self._redis is not None:
            return self._redis.get(key)
        return self._memory.get(key)

    def _set(self, key: str, value: str) -> None:
        if self._redis is not None:
            self._redis.set(key, value, ex=SESSION_TTL_SECONDS)
            return
        self._memory[key] = value


sessions = SessionStore()
