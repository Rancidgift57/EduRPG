="use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    useMultiplayerTimer,
    QuestionTimerBar,
    BattleClock,
    TimeoutOverlay,
} from "@/components/battle/MultiplayerTimer";

const API = process.env.NEXT_PUBLIC_API_URL;

type Step = "find" | "pick" | "answer" | "waiting" | "result";

export default function MultiplayerAttackPage() {
    const router = useRouter();

    // ── Step & data state ─────────────────────────────────────────────
    const [step, setStep] = useState<Step>("find");
    const [opponent, setOpponent] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [picked, setPicked] = useState<string[]>([]);
    const [battleId, setBattleId] = useState("");
    const [myQs, setMyQs] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);

    // ── Per-question tracking ─────────────────────────────────────────
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [showQExpired, setShowQExpired] = useState(false);
    const [showBExpired, setShowBExpired] = useState(false);

    // ✅ REFS for timer callbacks — prevents stale closure bug
    const answeredRef = useRef(false);
    const isSubmittingRef = useRef(false);
    const currentQIdxRef = useRef(0);
    const myQsRef = useRef<any[]>([]);
    const answersRef = useRef<Record<string, number>>({});
    const totalTimeRef = useRef(0);
    const qStartTimeRef = useRef(30);

    // Keep refs in sync with state
    useEffect(() => { currentQIdxRef.current = currentQIdx; }, [currentQIdx]);
    useEffect(() => { myQsRef.current = myQs; }, [myQs]);
    useEffect(() => { answersRef.current = answers; }, [answers]);

    const topic = typeof window !== "undefined"
        ? localStorage.getItem("mp_topic") || "python-basics" : "python-basics";
    const token = typeof window !== "undefined"
        ? localStorage.getItem("token") || "" : "";
    const headers = { Authorization: `Bearer ${token}` };

    // ── Advance to next question ──────────────────────────────────────
    const advanceQuestion = useCallback(() => {
        const next = currentQIdxRef.current + 1;
        if (next < myQsRef.current.length) {
            answeredRef.current = false;
            isSubmittingRef.current = false;
            qStartTimeRef.current = 30;
            setCurrentQIdx(next);
            resetQuestionTimer();
        }
    }, []);

    // ── Auto-submit all remaining as timeout ──────────────────────────
    const autoSubmitAll = useCallback(() => {
        const finalAnswers: Record<string, number> = { ...answersRef.current };
        myQsRef.current.forEach(q => {
            if (!(q.id in finalAnswers)) finalAnswers[q.id] = -1;
        });
        setAnswers(finalAnswers);
        doSubmitToBackend(finalAnswers);
    }, []);

    // ── Timer callbacks ───────────────────────────────────────────────
    const handleQuestionExpire = useCallback(() => {
        if (answeredRef.current || isSubmittingRef.current) return;

        const q = myQsRef.current[currentQIdxRef.current];
        if (!q) return;

        const newAnswers = { ...answersRef.current, [q.id]: -1 };
        answersRef.current = newAnswers;
        setAnswers(newAnswers);

        totalTimeRef.current += 30;
        answeredRef.current = true;
        setShowQExpired(true);

        setTimeout(() => {
            setShowQExpired(false);
            advanceQuestion();
        }, 2200);
    }, [advanceQuestion]);

    const handleBattleExpire = useCallback(() => {
        stopTimers();
        setShowBExpired(true);
        setTimeout(() => autoSubmitAll(), 2500);
    }, [autoSubmitAll]);

    // ── Timer hook ────────────────────────────────────────────────────
    const {
        questionTimeLeft,
        battleTimeLeft,
        isPaused,
        isRunning,
        startTimers,
        stopTimers,
        pauseTimer,
        resumeTimer,
        resetQuestionTimer,
    } = useMultiplayerTimer({
        questionSeconds: 30,
        battleMinutes: 3,
        onQuestionExpire: handleQuestionExpire,
        onBattleExpire: handleBattleExpire,
    });

    // Keep advanceQuestion updated with fresh resetQuestionTimer
    const advanceQuestionFull = useCallback(() => {
        const next = currentQIdxRef.current + 1;
        if (next < myQsRef.current.length) {
            answeredRef.current = false;
            isSubmittingRef.current = false;
            qStartTimeRef.current = 30;
            setCurrentQIdx(next);
            resetQuestionTimer();
        }
    }, [resetQuestionTimer]);

    // ── Find opponent ─────────────────────────────────────────────────
    useEffect(() => { findOpponent(); }, []);

    const findOpponent = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${API}/multiplayer/find-opponent`,
                { topic }, { headers }
            );
            setOpponent(res.data.opponent);
            setQuestions(res.data.questions);
            setStep("pick");
        } catch {
            router.push("/multiplayer");
        } finally {
            setLoading(false);
        }
    };

    // ── Pick questions ────────────────────────────────────────────────
    const togglePick = (id: string) => {
        if (picked.includes(id)) setPicked(p => p.filter(x => x !== id));
        else if (picked.length < 5) setPicked(p => [...p, id]);
    };

    const confirmPick = async () => {
        if (picked.length < 3) return;
        setLoading(true);
        try {
            const res = await axios.post(
                `${API}/multiplayer/start-battle`,
                { defender_id: opponent.user_id, topic, questions_for_defender: picked },
                { headers }
            );
            setBattleId(res.data.battle_id);
            const mine = questions.filter(q => !picked.includes(q.id)).slice(0, 5);
            myQsRef.current = mine;
            setMyQs(mine);
            setStep("answer");
            startTimers();
        } catch (e: any) {
            alert(e.response?.data?.detail || "Error");
        } finally {
            setLoading(false);
        }
    };

    // ── Handle answer click ───────────────────────────────────────────
    const handleSelectAnswer = useCallback((qId: string, idx: number) => {
        if (answeredRef.current || isSubmittingRef.current) return;

        const timeUsed = qStartTimeRef.current - questionTimeLeft;
        totalTimeRef.current += timeUsed;

        const newAnswers = { ...answersRef.current, [qId]: idx };
        answersRef.current = newAnswers;
        setAnswers(newAnswers);

        answeredRef.current = true;
        isSubmittingRef.current = true;
        pauseTimer();

        setTimeout(() => {
            isSubmittingRef.current = false;
            resumeTimer();
            advanceQuestionFull();
        }, 600);
    }, [questionTimeLeft, pauseTimer, resumeTimer, advanceQuestionFull]);

    // ── Submit all answers to backend ─────────────────────────────────
    const doSubmitToBackend = async (finalAnswers?: Record<string, number>) => {
        const ans = finalAnswers || answers;
        setLoading(true);
        stopTimers();

        const answerList = myQsRef.current.map(q => ({
            question_id: q.id,
            selected_index: ans[q.id] ?? -1,
        }));

        try {
            const res = await axios.post(
                `${API}/multiplayer/submit-attack`,
                {
                    battle_id: battleId,
                    answers: answerList,
                    questions_for_opponent: picked,
                    time_used_seconds: totalTimeRef.current,
                },
                { headers }
            );
            setScore(res.data.score);
            setStep("waiting");
        } catch (e: any) {
            alert(e.response?.data?.detail || "Error submitting");
        } finally {
            setLoading(false);
        }
    };

    const allAnswered = myQs.length > 0 && myQs.every(q => q.id in answers);
    const currentQ = myQs[currentQIdx];

    // ─────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────

    // ── Finding opponent ──────────────────────────────────────────────
    if (loading && step === "find") return (
        <Screen>
            <div style={{ textAlign: "center" }}>
                <div style={{
                    fontSize: 60, display: "inline-block",
                    animation: "mpSpin 1s linear infinite",
                    filter: "drop-shadow(0 0 20px rgba(168,85,247,.9))"
                }}>⚔️</div>
                <p style={{
                    color: "#a855f7", marginTop: 16,
                    fontFamily: "Cinzel", letterSpacing: ".2em"
                }}>
                    FINDING OPPONENT...
                </p>
            </div>
        </Screen>
    );

    // ── Pick questions for opponent ───────────────────────────────────
    if (step === "pick") return (
        <Screen>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
                <BackBtn onClick={() => router.push("/multiplayer")} />
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{
                        fontSize: 10, color: "#a855f7",
                        letterSpacing: ".2em", fontWeight: 700, marginBottom: 8
                    }}>
                        STEP 1 OF 2
                    </div>
                    <h2 style={{
                        fontFamily: "Cinzel",
                        fontSize: "clamp(18px,5vw,24px)", color: "#e9d5ff", marginBottom: 8
                    }}>
                        Choose Questions for {opponent?.username}
                    </h2>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "rgba(251,191,36,.1)",
                        border: "1px solid rgba(251,191,36,.3)",
                        borderRadius: 50, padding: "5px 14px",
                        fontSize: 11, color: "#fbbf24", fontWeight: 700,
                    }}>
                        ⚠️ They get <strong style={{ margin: "0 3px" }}>30s</strong> per question
                        · <strong style={{ margin: "0 3px" }}>3 min</strong> total
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    {questions.map((q, i) => {
                        const sel = picked.includes(q.id);
                        return (
                            <button key={q.id} onClick={() => togglePick(q.id)} style={{
                                background: sel ? "rgba(239,68,68,0.14)" : "rgba(255,255,255,.02)",
                                border: `1px solid ${sel ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.06)"}`,
                                borderRadius: 12, padding: "14px 16px",
                                color: "#e2e8f0", cursor: "pointer",
                                textAlign: "left", fontSize: 13,
                                fontFamily: "Rajdhani", fontWeight: 500,
                                transition: "all .2s",
                                transform: sel ? "scale(1.01)" : "scale(1)",
                            }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                    <div style={{
                                        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                                        background: sel ? "#ef4444" : "rgba(255,255,255,.05)",
                                        border: `1px solid ${sel ? "#ef4444" : "rgba(255,255,255,.1)"}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 11, fontWeight: 700,
                                        color: sel ? "#fff" : "#6b7280",
                                    }}>
                                        {sel ? "✓" : i + 1}
                                    </div>
                                    <span>{q.body}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 12 }}>
                        {picked.length}/5 selected
                        {picked.length < 3 && <span style={{ color: "#ef4444" }}> (min 3)</span>}
                    </div>
                    <button
                        onClick={confirmPick}
                        disabled={picked.length < 3 || loading}
                        style={{
                            backgroundImage: picked.length >= 3 ? "linear-gradient(135deg,#dc2626,#991b1b)" : "none",
                            background: picked.length < 3 ? "rgba(255,255,255,.05)" : undefined,
                            border: "none", borderRadius: 12, padding: "14px 40px", color: "#fff",
                            fontFamily: "Cinzel", fontSize: 15, fontWeight: 700,
                            cursor: picked.length >= 3 ? "pointer" : "not-allowed",
                            opacity: picked.length >= 3 ? 1 : .5, letterSpacing: ".1em",
                            boxShadow: picked.length >= 3 ? "0 0 20px rgba(220,38,38,.4)" : "none",
                        }}>
                        💀 LAUNCH ATTACK →
                    </button>
                </div>
            </div>
        </Screen>
    );

    // ── Answer your questions (TIMER ACTIVE HERE) ─────────────────────
    if (step === "answer") return (
        <Screen>
            {/* Overlays */}
            {showQExpired && <TimeoutOverlay type="question" onClose={() => setShowQExpired(false)} />}
            {showBExpired && <TimeoutOverlay type="battle" onClose={() => setShowBExpired(false)} />}

            <div style={{ maxWidth: 700, margin: "0 auto" }}>

                {/* Header row */}
                <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12,
                }}>
                    <div>
                        <div style={{ fontSize: 10, color: "#22c55e", letterSpacing: ".2em", fontWeight: 700 }}>
                            STEP 2 OF 2 — MULTIPLAYER
                        </div>
                        <h2 style={{
                            fontFamily: "Cinzel", fontSize: "clamp(16px,4vw,20px)",
                            color: "#e9d5ff", margin: "4px 0 2px"
                        }}>
                            Answer Your Questions
                        </h2>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                            Question {currentQIdx + 1} of {myQs.length}
                        </div>
                    </div>
                    <BattleClock timeLeft={battleTimeLeft} isPaused={isPaused} />
                </div>

                {/* Progress dots */}
                <div style={{ display: "flex", gap: 6, marginBottom: 20, justifyContent: "center", flexWrap: "wrap" }}>
                    {myQs.map((q, i) => {
                        const isDone = q.id in answers;
                        const isTimeout = answers[q.id] === -1;
                        const isCurrent = i === currentQIdx;
                        return (
                            <div key={q.id} style={{
                                width: isCurrent ? 26 : 10, height: 10, borderRadius: 5,
                                background: isDone
                                    ? isTimeout ? "#ef4444" : "#22c55e"
                                    : isCurrent ? "#a855f7" : "rgba(255,255,255,.1)",
                                transition: "all .3s",
                                boxShadow: isCurrent ? "0 0 8px rgba(168,85,247,.6)" : "none",
                            }} />
                        );
                    })}
                </div>

                {/* ── Current question card ── */}
                {currentQ && !allAnswered && (
                    <div style={{
                        background: "rgba(0,0,0,.5)",
                        border: "1px solid rgba(168,85,247,.2)",
                        borderRadius: 16, padding: 20, marginBottom: 16,
                        animation: "mpFadeIn .3s ease-out",
                    }}>
                        <QuestionTimerBar timeLeft={questionTimeLeft} maxTime={30} isPaused={isPaused} />

                        <p style={{ fontSize: 15, lineHeight: 1.65, color: "#e2e8f0", marginBottom: 16, fontWeight: 500 }}>
                            {currentQ.body}
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                            {currentQ.options?.map((opt: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelectAnswer(currentQ.id, i)}
                                    disabled={answeredRef.current}
                                    style={{
                                        background: "rgba(255,255,255,.03)",
                                        border: "1px solid rgba(255,255,255,.07)",
                                        borderRadius: 12,
                                        padding: "clamp(11px,3vw,14px) 14px",
                                        color: "#d1d5db",
                                        cursor: answeredRef.current ? "not-allowed" : "pointer",
                                        textAlign: "left",
                                        fontSize: "clamp(12px,3vw,14px)",
                                        fontFamily: "Rajdhani", fontWeight: 600,
                                        transition: "all .2s", minHeight: 48,
                                    }}
                                    onMouseEnter={e => {
                                        if (!answeredRef.current) {
                                            e.currentTarget.style.background = "rgba(124,58,237,.1)";
                                            e.currentTarget.style.borderColor = "rgba(168,85,247,.45)";
                                            e.currentTarget.style.transform = "scale(1.02)";
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!answeredRef.current) {
                                            e.currentTarget.style.background = "rgba(255,255,255,.03)";
                                            e.currentTarget.style.borderColor = "rgba(255,255,255,.07)";
                                            e.currentTarget.style.transform = "scale(1)";
                                        }
                                    }}
                                >
                                    <span style={{
                                        color: "#6b7280", fontWeight: 800, marginRight: 7,
                                        fontFamily: "Cinzel", fontSize: "clamp(10px,2.5vw,12px)",
                                    }}>
                                        {["A", "B", "C", "D"][i]}
                                    </span>
                                    {opt}
                                </button>
                            ))}
                        </div>

                        {isPaused && (
                            <div style={{
                                textAlign: "center", marginTop: 10,
                                fontSize: 11, color: "#9ca3af",
                                animation: "mpPulse 1s ease infinite",
                            }}>
                                ⏳ Processing...
                            </div>
                        )}
                    </div>
                )}

                {/* ── All answered — rich summary + submit card ── */}
                {allAnswered && !loading && (
                    <div style={{ animation: "bounceIn .5s ease-out" }}>
                        <div style={{
                            background: "rgba(0,0,0,.55)",
                            border: "1px solid rgba(168,85,247,.25)",
                            borderRadius: 20, padding: "32px 24px",
                            boxShadow: "0 0 60px rgba(124,58,237,.15), inset 0 0 40px rgba(124,58,237,.04)",
                            textAlign: "center",
                        }}>
                            {/* Floating sword */}
                            <div style={{
                                fontSize: 56, marginBottom: 14,
                                animation: "heroIdle 2.5s ease-in-out infinite",
                                display: "inline-block",
                                filter: "drop-shadow(0 0 20px rgba(251,191,36,.8))",
                            }}>⚔️</div>

                            {/* Title */}
                            <div style={{
                                fontFamily: "Cinzel", fontSize: 26, fontWeight: 900,
                                color: "#e9d5ff", marginBottom: 6, letterSpacing: ".08em",
                                animation: "vsFlash 2s ease infinite",
                            }}>
                                ATTACK READY!
                            </div>
                            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 28 }}>
                                All {myQs.length} questions answered
                            </div>

                            {/* Per-question result bubbles */}
                            <div style={{
                                display: "flex", justifyContent: "center",
                                gap: 12, marginBottom: 28, flexWrap: "wrap",
                            }}>
                                {myQs.map((q, i) => {
                                    const isTimeout = answers[q.id] === -1;
                                    return (
                                        <div key={q.id} style={{
                                            display: "flex", flexDirection: "column",
                                            alignItems: "center", gap: 5,
                                        }}>
                                            <div style={{
                                                width: 42, height: 42, borderRadius: "50%",
                                                background: isTimeout
                                                    ? "rgba(239,68,68,.18)" : "rgba(34,197,94,.18)",
                                                border: `2px solid ${isTimeout ? "#ef4444" : "#22c55e"}`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 18,
                                                boxShadow: isTimeout
                                                    ? "0 0 14px rgba(239,68,68,.4)"
                                                    : "0 0 14px rgba(34,197,94,.4)",
                                                animation: `bounceIn .4s ease-out ${i * 0.09}s both`,
                                            }}>
                                                {isTimeout ? "⏱" : "✓"}
                                            </div>
                                            <span style={{
                                                fontSize: 10, color: "#4b5563",
                                                fontFamily: "Cinzel", fontWeight: 700,
                                            }}>Q{i + 1}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Stats row */}
                            <div style={{
                                display: "flex", justifyContent: "center",
                                gap: 36, marginBottom: 28, flexWrap: "wrap",
                            }}>
                                {[
                                    {
                                        label: "ANSWERED",
                                        value: `${myQs.filter(q => answers[q.id] !== -1).length}/${myQs.length}`,
                                        color: "#22c55e",
                                    },
                                    {
                                        label: "TIMED OUT",
                                        value: `${myQs.filter(q => answers[q.id] === -1).length}`,
                                        color: "#ef4444",
                                    },
                                    {
                                        label: "TIME USED",
                                        value: `${totalTimeRef.current}s`,
                                        color: "#fbbf24",
                                    },
                                ].map(({ label, value, color }) => (
                                    <div key={label} style={{ textAlign: "center" }}>
                                        <div style={{
                                            fontFamily: "Cinzel", fontSize: 28, fontWeight: 900,
                                            color, textShadow: `0 0 14px ${color}99`,
                                        }}>{value}</div>
                                        <div style={{
                                            fontSize: 9, color: "#4b5563",
                                            letterSpacing: ".15em", fontWeight: 700, marginTop: 3,
                                        }}>{label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Glowing divider */}
                            <div style={{
                                height: 1, marginBottom: 26,
                                backgroundImage: "linear-gradient(90deg,transparent,rgba(168,85,247,.5),rgba(239,68,68,.5),rgba(168,85,247,.5),transparent)",
                            }} />

                            {/* Submit button */}
                            <button
                                onClick={() => doSubmitToBackend()}
                                style={{
                                    backgroundImage: "linear-gradient(135deg,#7c3aed,#be185d)",
                                    border: "none", borderRadius: 14,
                                    padding: "17px 0", color: "#fff",
                                    fontFamily: "Cinzel", fontSize: 17, fontWeight: 700,
                                    cursor: "pointer", letterSpacing: ".12em",
                                    boxShadow: "0 0 32px rgba(124,58,237,.6), 0 0 60px rgba(190,24,93,.25)",
                                    animation: "victoryPulse 2s ease infinite",
                                    width: "100%", maxWidth: 380,
                                    display: "block", margin: "0 auto",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = "scale(1.03)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = "scale(1)";
                                }}
                            >
                                ⚔️ LAUNCH ATTACK
                            </button>
                        </div>
                    </div>
                )}

                {/* Submitting loader */}
                {loading && (
                    <div style={{ textAlign: "center", padding: "32px 0" }}>
                        <div style={{
                            fontSize: 44, display: "inline-block",
                            animation: "mpSpin 0.9s linear infinite",
                            filter: "drop-shadow(0 0 18px rgba(168,85,247,.9))",
                        }}>⚔️</div>
                        <p style={{
                            color: "#a855f7", marginTop: 12,
                            fontFamily: "Cinzel", letterSpacing: ".15em", fontSize: 13,
                        }}>
                            SENDING ATTACK...
                        </p>
                    </div>
                )}
            </div>
        </Screen>
    );

    // ── Waiting for opponent ──────────────────────────────────────────
    if (step === "waiting") return (
        <Screen>
            <div style={{ textAlign: "center", maxWidth: 460, margin: "0 auto" }}>

                {/* Spinning hourglass */}
                <div style={{
                    fontSize: 72, marginBottom: 20, display: "inline-block",
                    animation: "mpSpin 3s linear infinite",
                    filter: "drop-shadow(0 0 24px rgba(168,85,247,.7))",
                }}>⏳</div>

                <h2 style={{
                    fontFamily: "Cinzel", fontSize: 28,
                    color: "#c084fc", marginBottom: 6,
                    animation: "vsFlash 2s ease infinite",
                }}>
                    ATTACK SENT!
                </h2>
                <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 24 }}>
                    Waiting for opponent to respond...
                </p>

                {/* Score + stats card */}
                <div style={{
                    background: "rgba(0,0,0,.5)",
                    border: "1px solid rgba(168,85,247,.2)",
                    borderRadius: 18, padding: "28px 28px 24px",
                    marginBottom: 20,
                    boxShadow: "0 0 40px rgba(124,58,237,.12)",
                }}>
                    <div style={{ marginBottom: 20 }}>
                        <div style={{
                            fontFamily: "Cinzel", fontSize: 52, fontWeight: 900,
                            color: "#22c55e",
                            textShadow: "0 0 28px rgba(34,197,94,.7)",
                            animation: "bounceIn .6s ease-out",
                            lineHeight: 1,
                        }}>
                            {score}/{myQs.length}
                        </div>
                        <div style={{
                            fontSize: 10, color: "#4b5563",
                            letterSpacing: ".2em", fontWeight: 700, marginTop: 6,
                        }}>
                            YOUR SCORE
                        </div>
                    </div>

                    <div style={{
                        height: 1, marginBottom: 20,
                        backgroundImage: "linear-gradient(90deg,transparent,rgba(168,85,247,.3),transparent)",
                    }} />

                    <div style={{
                        display: "flex", justifyContent: "space-around",
                        gap: 12, flexWrap: "wrap",
                    }}>
                        {[
                            { label: "YOUR TIME", value: `${totalTimeRef.current}s`, color: "#fbbf24" },
                            { label: "OPP. LIMIT", value: "3 min", color: "#f87171" },
                            { label: "PER Q", value: "30s", color: "#60a5fa" },
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{ textAlign: "center" }}>
                                <div style={{
                                    fontFamily: "Cinzel", fontSize: 20, fontWeight: 700,
                                    color, textShadow: `0 0 10px ${color}88`,
                                }}>{value}</div>
                                <div style={{
                                    fontSize: 9, color: "#374151",
                                    letterSpacing: ".12em", fontWeight: 700, marginTop: 3,
                                }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Warning badge */}
                <div style={{
                    background: "rgba(251,191,36,.06)",
                    border: "1px solid rgba(251,191,36,.2)",
                    borderRadius: 12, padding: "12px 18px",
                    fontSize: 12, color: "#fbbf24", marginBottom: 24,
                    animation: "glowPulse 2s ease infinite",
                }}>
                    ⚠️ Opponent gets <strong>30s per question</strong> · <strong>3 min total</strong> to defend
                </div>

                <button
                    onClick={() => router.push("/multiplayer")}
                    style={{
                        background: "rgba(124,58,237,.25)",
                        border: "1px solid rgba(168,85,247,.3)",
                        borderRadius: 12, padding: "13px 36px",
                        color: "#c084fc", cursor: "pointer",
                        fontFamily: "Cinzel", fontSize: 13, fontWeight: 700,
                        letterSpacing: ".1em", transition: "all .2s",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(124,58,237,.4)";
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(168,85,247,.3)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(124,58,237,.25)";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    🏠 BACK TO HUB
                </button>
            </div>
        </Screen>
    );

    return null;
}

// ─────────────────────────────────────────────────────────────────────
// SCREEN — all keyframes centralised here so EVERY step has animations
// ─────────────────────────────────────────────────────────────────────

function Screen({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            minHeight: "100vh",
            background: "#030712",
            color: "#fff",
            fontFamily: "Rajdhani",
            padding: "24px 16px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "clamp(24px,5vw,48px)",
        }}>
            <style>{`
                /* ── Multiplayer core ── */
                @keyframes mpFadeIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes mpPulse {
                    0%, 100% { opacity: .5; }
                    50%      { opacity: 1; }
                }
                @keyframes mpSpin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }

                /* ── Hero animations ── */
                @keyframes heroIdle {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-7px); }
                }
                @keyframes heroAttackForward {
                    0%   { transform: translateX(0) scale(1); }
                    40%  { transform: translateX(60px) scale(1.12); }
                    70%  { transform: translateX(50px) scale(1.08); }
                    100% { transform: translateX(0) scale(1); }
                }
                @keyframes heroHit {
                    0%, 100% { transform: translateX(0); filter: brightness(1); }
                    25%      { transform: translateX(-12px); filter: brightness(2) saturate(0); }
                    75%      { transform: translateX(6px);  filter: brightness(1.5); }
                }

                /* ── Monster animations ── */
                @keyframes monsterIdle {
                    0%, 100% { transform: scaleX(-1) translateY(0px); }
                    50%      { transform: scaleX(-1) translateY(-7px); }
                }
                @keyframes monsterAttackForward {
                    0%   { transform: scaleX(-1) translateX(0) scale(1); }
                    40%  { transform: scaleX(-1) translateX(60px) scale(1.12); }
                    70%  { transform: scaleX(-1) translateX(50px) scale(1.08); }
                    100% { transform: scaleX(-1) translateX(0) scale(1); }
                }
                @keyframes monsterHit {
                    0%, 100% { transform: scaleX(-1) translateX(0);   filter: brightness(1); }
                    25%      { transform: scaleX(-1) translateX(12px); filter: brightness(2) saturate(0); }
                    75%      { transform: scaleX(-1) translateX(-6px); filter: brightness(1.5); }
                }
                @keyframes deathAnim {
                    0%   { opacity: 1;   transform: scaleX(-1) scale(1)   translateY(0);     filter: brightness(1); }
                    40%  { opacity: 0.7; transform: scaleX(-1) scale(1.1) translateY(-10px); filter: brightness(3) saturate(0); }
                    100% { opacity: 0;   transform: scaleX(-1) scale(0.3) translateY(30px) rotate(20deg); filter: brightness(0); }
                }

                /* ── UI effects ── */
                @keyframes shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes vsFlash {
                    0%, 100% { opacity: 0.7; text-shadow: 0 0 20px rgba(168,85,247,0.4); }
                    50%      { opacity: 1;   text-shadow: 0 0 40px rgba(168,85,247,0.9), 0 0 80px rgba(168,85,247,0.5); }
                }
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.7; }
                    50%      { opacity: 1; text-shadow: 0 0 10px #22c55e; }
                }
                @keyframes critFlash {
                    0%   { opacity: 0; transform: translateX(-50%) scale(0.5) rotate(-8deg); }
                    20%  { opacity: 1; transform: translateX(-50%) scale(1.3) rotate(3deg); }
                    60%  { opacity: 1; transform: translateX(-50%) scale(1.05) rotate(-1deg); }
                    100% { opacity: 0; transform: translateX(-50%) scale(0.9) translateY(-20px); }
                }
                @keyframes spellShot {
                    0%   { opacity: 1; transform: translateX(0) scale(1); }
                    100% { opacity: 0; transform: translateX(180px) scale(0.4); }
                }
                @keyframes floatUp {
                    0%   { opacity: 1; transform: translateX(-50%) translateY(0); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-50px); }
                }
                @keyframes bounceIn {
                    0%   { transform: scale(0.4); opacity: 0; }
                    60%  { transform: scale(1.15); opacity: 1; }
                    80%  { transform: scale(0.95); }
                    100% { transform: scale(1); }
                }
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes victoryPulse {
                    0%, 100% { box-shadow: 0 0 32px rgba(124,58,237,.6), 0 0 60px rgba(190,24,93,.25); }
                    50%      { box-shadow: 0 0 52px rgba(124,58,237,.9), 0 0 90px rgba(190,24,93,.5); }
                }
                @keyframes defeatPulse {
                    0%, 100% { box-shadow: 0 0 100px rgba(239,68,68,0.4); }
                    50%      { box-shadow: 0 0 140px rgba(239,68,68,0.75); }
                }
                @keyframes bossGlow {
                    0%, 100% { box-shadow: none; }
                    50%      { box-shadow: 0 0 20px rgba(239,68,68,0.6); }
                }
                @keyframes groundShake {
                    0%, 100% { transform: translateX(0); }
                    20%      { transform: translateX(-6px) rotate(-0.4deg); }
                    40%      { transform: translateX(6px)  rotate(0.4deg); }
                    60%      { transform: translateX(-4px); }
                    80%      { transform: translateX(4px); }
                }
            `}</style>
            <div style={{ width: "100%", maxWidth: 740 }}>{children}</div>
        </div>
    );
}

function BackBtn({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#6b7280", fontSize: 13, marginBottom: 20,
                display: "block", fontFamily: "Rajdhani", fontWeight: 600,
            }}>
            ← Back
        </button>
    );
}
