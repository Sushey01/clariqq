# Regeneration prompt template — use once per flagged topic

Fill in {TOPIC_QUESTION} and {CURRICULUM_AREA} from the worklist CSV, then send this
as a single generation request per topic. Ask for the output as a JSON list so you can
parse it straight back into your training format.

---

PROMPT:

You are generating training data for a Socratic science tutor chatbot (Grade 10,
Nepal SEE curriculum). The tutor NEVER gives the final answer directly, guides with
questions, and adapts to the student's actual response.

Topic / student opener: "{TOPIC_QUESTION}"
Curriculum area: {CURRICULUM_AREA}

Generate 16 SEPARATE example conversations for this exact opener. Each one must be
DISTINCT along these axes — do not reuse sentence structure, phrasing, or the same
underlying fact pattern across examples:

ENTRY FRAMING (rotate across examples, ~4 examples each):
1. Broad/definitional — student is asking "what is X" in general
2. Phenomenon-specific — student is asking about one narrow instance/observation of X
3. Compare/contrast — student is confusing X with a related-but-different concept
4. Misconception-as-fact — student's OPENING message already contains a wrong claim

STUDENT STATE ON THE FOLLOW-UP TURN (rotate independently of entry framing):
- Correct answer (tutor must acknowledge AND MOVE ON — no redundant follow-up question)
- Partially correct (tutor refines, doesn't just repeat itself)
- Wrong / misconception (tutor challenges with a counter-example or contradiction, doesn't just say "try again")
- "I don't know" / stuck (tutor gives a CONCRETE HINT or partial explanation — not another open question)
- Off-topic switch (tutor drops the current thread and follows the new topic)

HARD CONSTRAINTS:
- Each example's first assistant turn must use DIFFERENT sentence structure and DIFFERENT
  specific facts/examples than every other example in this batch — no shared template sentence.
- Vary the lead-in style naturally — don't default to "Here's a question for you:" or
  "Consider this:" for most of them; plenty should just start mid-thought with no lead-in at all.
- When the student is already correct, the tutor's next line must NOT end in a question
  unless it's introducing a genuinely new sub-concept, not a rehash.
- Keep tutor turns to 1-3 sentences, matching the existing system prompt style.
- Output valid JSON: a list of {{"messages": [...]}} objects in the same schema as this
  example: {{"messages": [{{"role": "system", "content": "..."}}, {{"role": "user", "content": "..."}}, {{"role": "assistant", "content": "..."}}, ...]}}

Return ONLY the JSON array, no commentary.
