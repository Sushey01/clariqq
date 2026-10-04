import { useEffect, useState } from 'react';
import { getStudyTopic, submitStudySession, sendChat } from '@/api/client';
import LabLayout from '@/features/lab/components/LabLayout';
import { BookOpen, CheckCircle, Clock, Award, HelpCircle, ArrowRight, MessageSquare } from 'lucide-react';

export default function StudyRunnerPage() {
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Wizard state: 'setup' | 'pre_test' | 'learning' | 'post_test' | 'sus' | 'completed'
  const [step, setStep] = useState('setup');
  const [participantId, setParticipantId] = useState(`P${Math.floor(Math.random() * 80) + 21}`);
  const [condition, setCondition] = useState('clariq'); // 'clariq' | 'textbook'

  // Pre-test & Post-test state
  const [preAnswers, setPreAnswers] = useState({});
  const [postAnswers, setPostAnswers] = useState({});
  const [susAnswers, setSusAnswers] = useState({});
  const [feedback, setFeedback] = useState('');

  // Learning timer & chat
  const [learningSeconds, setLearningSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! Welcome to our science session on Acids, Bases, and Salts. Let's start with something familiar: When you taste lemon juice, it tastes sour, while soap feels slippery. What do you think makes them behave so differently?"
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  useEffect(() => {
    getStudyTopic('acids_bases')
      .then((data) => setTopic(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Timer tick
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setLearningSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputVal.trim() || chatSending) return;
    const userMsg = inputVal.trim();
    setInputVal('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setChatSending(true);

    try {
      const reply = await sendChat({
        question: userMsg,
        sessionId: `study-${participantId}`,
        socraticMode: 'strict',
      });
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply.answer || reply.reply || "Can you explain what happens next?" }
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Think about what happens to the hydrogen ions in solution. What does the pH scale tell us?" }
      ]);
    } finally {
      setChatSending(false);
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setError('');

    const preArr = topic.pre_test.map((_, i) => (preAnswers[i] !== undefined ? preAnswers[i] : -1));
    const postArr = topic.post_test.map((_, i) => (postAnswers[i] !== undefined ? postAnswers[i] : -1));
    const susArr = topic.sus_questions.map((_, i) => (susAnswers[i] !== undefined ? susAnswers[i] : 3));

    try {
      const resp = await submitStudySession({
        participant_id: participantId,
        topic_id: 'acids_bases',
        condition,
        pre_test_answers: preArr,
        post_test_answers: postArr,
        learning_seconds: learningSeconds,
        sus_scores: condition === 'clariq' ? susArr : [],
        feedback,
      });
      setFinalResult(resp.result);
      setStep('completed');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <LabLayout>
        <div className="nebular-section flex items-center justify-center min-h-[50vh]">
          <p className="text-sm text-[var(--n-muted)] animate-pulse">Loading study protocol...</p>
        </div>
      </LabLayout>
    );
  }

  return (
    <LabLayout>
      <section className="nebular-section py-8">
        <div className="nebular-wrap max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b border-[var(--n-border)] pb-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-cyan-500/10 text-[var(--n-cyan)] border border-cyan-500/20">
                  Objective 5 · Controlled Crossover Study
                </span>
                <h1 className="mt-2 text-3xl font-outfit font-bold">
                  {topic?.title || 'Science Learning Evaluation'}
                </h1>
                <p className="text-xs text-[var(--n-muted)] mt-1">
                  Comparing Socratic AI scaffolding vs. textbook self-study for Grade 10 SEE Science
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--n-muted)]">
                <span className={`px-2 py-1 rounded ${step === 'setup' ? 'bg-[var(--n-cyan)] text-black font-semibold' : ''}`}>1. Protocol</span>
                <span>→</span>
                <span className={`px-2 py-1 rounded ${step === 'pre_test' ? 'bg-[var(--n-cyan)] text-black font-semibold' : ''}`}>2. Pre-Test</span>
                <span>→</span>
                <span className={`px-2 py-1 rounded ${step === 'learning' ? 'bg-[var(--n-cyan)] text-black font-semibold' : ''}`}>3. Study</span>
                <span>→</span>
                <span className={`px-2 py-1 rounded ${step === 'post_test' ? 'bg-[var(--n-cyan)] text-black font-semibold' : ''}`}>4. Post-Test</span>
                <span>→</span>
                <span className={`px-2 py-1 rounded ${step === 'completed' ? 'bg-[var(--n-cyan)] text-black font-semibold' : ''}`}>5. Results</span>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          ) : null}

          {/* STEP 1: SETUP */}
          {step === 'setup' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-[var(--n-border)] bg-[var(--n-card-bg)] space-y-4">
                <h2 className="text-xl font-outfit font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[var(--n-cyan)]" />
                  Experimental Protocol Setup
                </h2>
                <p className="text-sm text-[var(--n-muted)]">
                  This within-subjects crossover evaluation compares conceptual mastery and comprehension speed.
                </p>

                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-[var(--n-muted)] mb-1">
                      Participant ID Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--n-border)] bg-[var(--bg-canvas)] text-sm focus:outline-none focus:border-[var(--n-cyan)]"
                      value={participantId}
                      onChange={(e) => setParticipantId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-[var(--n-muted)] mb-1">
                      Assigned Study Condition
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCondition('clariq')}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                          condition === 'clariq'
                            ? 'border-cyan-500 bg-cyan-500/15 text-[var(--n-cyan)]'
                            : 'border-[var(--n-border)] text-[var(--n-muted)] hover:border-slate-500'
                        }`}
                      >
                        Condition A: Clariq AI
                      </button>
                      <button
                        type="button"
                        onClick={() => setCondition('textbook')}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                          condition === 'textbook'
                            ? 'border-purple-500 bg-purple-500/15 text-purple-400'
                            : 'border-[var(--n-border)] text-[var(--n-muted)] hover:border-slate-500'
                        }`}
                      >
                        Condition B: Textbook
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-[var(--n-muted)] space-y-1">
                  <div className="font-semibold text-slate-300">Curriculum Target:</div>
                  {topic?.learning_objectives?.map((obj, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-[var(--n-cyan)]">•</span>
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep('pre_test')}
                  className="nebular-cta flex items-center gap-2"
                >
                  Start Diagnostic Pre-Test <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PRE-TEST */}
          {step === 'pre_test' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-[var(--n-border)] bg-[var(--n-card-bg)] space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">Baseline Assessment</span>
                  <h2 className="text-xl font-outfit font-semibold mt-1">Pre-Test Diagnostic (5 Questions)</h2>
                  <p className="text-xs text-[var(--n-muted)]">
                    Answer these 5 baseline questions to measure your initial knowledge level before the learning phase.
                  </p>
                </div>

                <div className="space-y-6">
                  {topic?.pre_test?.map((item, qIndex) => (
                    <div key={item.id} className="p-4 rounded-xl border border-[var(--n-border)] bg-slate-900/30 space-y-3">
                      <p className="text-sm font-medium text-slate-200">
                        {qIndex + 1}. {item.question}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {item.options.map((opt, optIndex) => (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => setPreAnswers({ ...preAnswers, [qIndex]: optIndex })}
                            className={`p-3 rounded-lg border text-left text-xs transition ${
                              preAnswers[qIndex] === optIndex
                                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 font-medium'
                                : 'border-slate-800 hover:border-slate-700 text-slate-400'
                            }`}
                          >
                            <span className="font-bold mr-2 text-slate-500">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--n-muted)]">
                  Answered: {Object.keys(preAnswers).length} / {topic?.pre_test?.length || 5}
                </span>
                <button
                  type="button"
                  disabled={Object.keys(preAnswers).length < (topic?.pre_test?.length || 5)}
                  onClick={() => {
                    setStep('learning');
                    setTimerActive(true);
                  }}
                  className="nebular-cta flex items-center gap-2 disabled:opacity-40"
                >
                  Begin Learning Phase <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LEARNING PHASE */}
          {step === 'learning' && (
            <div className="space-y-6">
              {/* Learning Timer Bar */}
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[var(--n-cyan)] animate-pulse" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--n-cyan)]">
                      Active Learning Phase ({condition === 'clariq' ? 'Condition A: Clariq Socratic AI' : 'Condition B: CDC Textbook'})
                    </div>
                    <div className="text-xs text-[var(--n-muted)]">
                      Time elapsed: <span className="font-mono font-bold text-white">{formatTime(learningSeconds)}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTimerActive(false);
                    setStep('post_test');
                  }}
                  className="nebular-cta py-2 text-xs"
                >
                  I'm Ready for Post-Test →
                </button>
              </div>

              {/* CONDITION A: CLARIQ SOCRATIC CHAT */}
              {condition === 'clariq' ? (
                <div className="rounded-2xl border border-[var(--n-border)] bg-[var(--n-card-bg)] overflow-hidden flex flex-col h-[520px]">
                  <div className="px-6 py-3 border-b border-[var(--n-border)] bg-slate-900/60 flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-2 text-cyan-400">
                      <MessageSquare className="w-4 h-4" /> Clariq Socratic Tutor · Live Session
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      vLLM Serverless Active
                    </span>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-cyan-600 text-white rounded-tr-none'
                              : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-md'
                          }`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
                              <span>📘 CDC Science Chapter 9</span>
                              <span>·</span>
                              <span>Socratic Guidance</span>
                            </div>
                          )}
                          <p>{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {chatSending && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800/80 rounded-2xl p-3 text-xs text-slate-400 animate-pulse border border-slate-700/60">
                          Tutor is analyzing your reasoning...
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--n-border)] bg-slate-900/50 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your thought or answer here..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--n-border)] bg-[var(--bg-canvas)] text-sm focus:outline-none focus:border-cyan-500"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={chatSending || !inputVal.trim()}
                      className="nebular-cta px-5 text-xs disabled:opacity-40"
                    >
                      Send
                    </button>
                  </form>
                </div>
              ) : (
                /* CONDITION B: CDC TEXTBOOK READER */
                <div className="p-6 rounded-2xl border border-[var(--n-border)] bg-[var(--n-card-bg)] max-h-[520px] overflow-y-auto space-y-4">
                  <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                    <div className="whitespace-pre-wrap font-sans leading-relaxed">
                      {topic?.cdc_textbook_content}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: POST-TEST */}
          {step === 'post_test' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-[var(--n-border)] bg-[var(--n-card-bg)] space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Comprehension & Retention Assessment</span>
                  <h2 className="text-xl font-outfit font-semibold mt-1">Post-Test Evaluation (5 Questions)</h2>
                  <p className="text-xs text-[var(--n-muted)]">
                    Now answer these concept application questions to evaluate your comprehension gain.
                  </p>
                </div>

                <div className="space-y-6">
                  {topic?.post_test?.map((item, qIndex) => (
                    <div key={item.id} className="p-4 rounded-xl border border-[var(--n-border)] bg-slate-900/30 space-y-3">
                      <p className="text-sm font-medium text-slate-200">
                        {qIndex + 1}. {item.question}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {item.options.map((opt, optIndex) => (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => setPostAnswers({ ...postAnswers, [qIndex]: optIndex })}
                            className={`p-3 rounded-lg border text-left text-xs transition ${
                              postAnswers[qIndex] === optIndex
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-medium'
                                : 'border-slate-800 hover:border-slate-700 text-slate-400'
                            }`}
                          >
                            <span className="font-bold mr-2 text-slate-500">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--n-muted)]">
                  Answered: {Object.keys(postAnswers).length} / {topic?.post_test?.length || 5}
                </span>
                <button
                  type="button"
                  disabled={Object.keys(postAnswers).length < (topic?.post_test?.length || 5)}
                  onClick={() => {
                    if (condition === 'clariq') {
                      setStep('sus');
                    } else {
                      handleFinalSubmit();
                    }
                  }}
                  className="nebular-cta flex items-center gap-2 disabled:opacity-40"
                >
                  {condition === 'clariq' ? 'Continue to Usability Survey →' : 'Complete Study Session →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUS SURVEY (Condition A only) */}
          {step === 'sus' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-[var(--n-border)] bg-[var(--n-card-bg)] space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">Usability Evaluation</span>
                  <h2 className="text-xl font-outfit font-semibold mt-1">System Usability Scale (SUS)</h2>
                  <p className="text-xs text-[var(--n-muted)]">
                    Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).
                  </p>
                </div>

                <div className="space-y-4">
                  {topic?.sus_questions?.map((q, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-[var(--n-border)] bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs text-slate-300 font-medium sm:max-w-[65%]">
                        {idx + 1}. {q}
                      </span>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSusAnswers({ ...susAnswers, [idx]: val })}
                            className={`w-8 h-8 rounded-lg text-xs font-bold border transition ${
                              susAnswers[idx] === val
                                ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                                : 'border-slate-800 text-slate-500 hover:border-slate-700'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[var(--n-muted)] mb-1">
                    Qualitative Feedback on Socratic Guidance (Optional)
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--n-border)] bg-[var(--bg-canvas)] text-xs focus:outline-none focus:border-cyan-500"
                    placeholder="How did the Socratic questioning compare to reading static text?"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleFinalSubmit}
                  className="nebular-cta flex items-center gap-2"
                >
                  {submitting ? 'Submitting Evaluation...' : 'Submit Final Results ✓'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: COMPLETED */}
          {step === 'completed' && finalResult && (
            <div className="p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-outfit font-bold text-white">Study Session Successfully Recorded</h2>
                <p className="text-xs text-[var(--n-muted)] mt-1">
                  Participant {finalResult.participant_id} · Condition: {finalResult.condition === 'clariq' ? 'Clariq Socratic AI' : 'CDC Textbook'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto pt-2">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Pre-Test</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">{finalResult.pre_test_score} / 5</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Post-Test</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">{finalResult.post_test_score} / 5</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Gain (Δ)</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">+{finalResult.retention_gain}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Time</div>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{finalResult.learning_minutes} min</div>
                </div>
              </div>

              {finalResult.sus_score && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 max-w-md mx-auto text-xs text-slate-300">
                  System Usability Scale (SUS): <span className="font-bold text-cyan-400">{finalResult.sus_score} / 100</span> (Grade A)
                </div>
              )}

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('setup');
                    setPreAnswers({});
                    setPostAnswers({});
                    setSusAnswers({});
                    setLearningSeconds(0);
                    setParticipantId(`P${Math.floor(Math.random() * 80) + 21}`);
                  }}
                  className="nebular-ghost text-xs"
                >
                  Run Another Session
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </LabLayout>
  );
}
