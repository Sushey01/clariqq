"""Record a student turn onto the knowledge graph. Never raises into the chat route."""

from __future__ import annotations

import logging

from app.knowledge.graph import node_by_id
from app.knowledge.scoring import coherence, map_concept, similarity
from app.pipelines.turn_policy import KIND_SCIENCE, classify_turn, filter_relevant_docs
from app.storage.chroma import retrieve_documents
from app.storage.mastery import apply_score

logger = logging.getLogger(__name__)


def record_student_turn(
    *,
    user_id: str | None,
    question: str,
) -> dict | None:
    """Score the student's message against textbook chunks. Guests are skipped."""
    if not user_id:
        return None
    if classify_turn(question) != KIND_SCIENCE:
        logger.info("knowledge: skip non-science turn for user %s", user_id)
        return None

    concept_id, map_score = map_concept(question)
    if not concept_id:
        logger.info("knowledge: no concept mapped for %r", question[:80])
        return {
            "skipped": True,
            "reason": "no_concept",
            "map_score": map_score,
        }

    textbook = []
    try:
        docs = retrieve_documents(question, user_id=None)
        textbook = [
            doc
            for doc in filter_relevant_docs(question, docs)
            if (doc.metadata or {}).get("source_kind", "textbook") != "notes"
        ]
        if not textbook:
            textbook = [
                doc
                for doc in docs
                if (doc.metadata or {}).get("source_kind", "textbook") != "notes"
            ]
    except Exception as exc:
        logger.warning("knowledge: retrieval failed (%s); scoring without curriculum text", exc)

    curriculum = textbook[0].page_content if textbook else ""
    sim = similarity(question, curriculum) if curriculum else 0.0
    coh = coherence(question, curriculum)
    st = sim * coh

    result = apply_score(
        user_id,
        concept_id,
        st=st,
        sim=sim,
        coherence=coh,
        map_score=map_score,
        question=question,
    )
    result["concept"] = node_by_id().get(concept_id)
    result["used_curriculum"] = bool(curriculum)
    logger.info(
        "knowledge: user=%s concept=%s st=%.3f m=%.3f confused=%s",
        user_id,
        concept_id,
        st,
        result["m"],
        result["confused"],
    )
    return result
