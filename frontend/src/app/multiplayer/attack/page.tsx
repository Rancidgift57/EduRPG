"use client";
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
    const totalTimeRef = useRef(0);   // total seconds used across all questions
    const qStartTimeRef = useRef(30);  // seconds remaining when question started

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
            resetQuestionTimer();   // defined below after useBattleTimer
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
        // Stale closure safe — using refs
        if (answeredRef.current || isSubmittingRef.current) return;

        const q = myQsRef.current[currentQIdxRef.current];
        if (!q) return;

        // Record as timeout (-1)
        const newAnswers = { ...answersRef.current, [q.id]: -1 };
        answersRef.current = newAnswers;
        setAnswers(newAnswers);

        totalTimeRef.current += 30;  // used full 30s
        answeredRef.current = true;
        setShowQExpired(true);

        // Auto-advance after overlay shows
        setTimeout(() => {
            setShowQExpired(false);
            advanceQuestion();
        }, 2200);
    }, [advanceQuestion]);

    const handleBattleExpire = useCallback(() => {
        stopTimers();
        setShowBExpired(true);
        // Auto-submit after overlay
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
        // If all done, timer just keeps running until manually submitted
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

            // ✅ Start multiplayer timers NOW — only in multiplayer
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
        pauseTimer();  // ⏸ freeze timer while "processing"

        // Short pause to show selection, then advance
        setTimeout(() => {
            isSubmittingRef.current = false;
            resumeTimer();  // ▶ resume
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

                <div style={{
                    display: "flex", flexDirection: "column",
                    gap: 10, marginBottom: 20
                }}>
                    {questions.map((q, i) => {
                        const sel = picked.includes(q.id);
                        return (
                            <button key={q.id} onClick={() => togglePick(q.id)} style={{
                                background: sel
                                    ? "rgba(239,68,68,0.14)" : "rgba(255,255,255,.02)",
                                border: `1px solid ${sel
                                    ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.06)"}`,
                                borderRadius: 12, padding: "14px 16px",
                                color: "#e2e8f0", cursor: "pointer",
                                textAlign: "left", fontSize: 13,
                                fontFamily: "Rajdhani", fontWeight: 500,
                                transition: "all .2s",
                                transform: sel ? "scale(1.01)" : "scale(1)",
                            }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "flex-start", gap: 10
                                }}>
                                    <div style={{
                                        width: 24, height: 24, borderRadius: "50%",
                                        flexShrink: 0,
                                        background: sel
                                            ? "#ef4444" : "rgba(255,255,255,.05)",
                                        border: `1px solid ${sel
                                            ? "#ef4444" : "rgba(255,255,255,.1)"}`,
                                        display: "flex", alignItems: "center",
                                        justifyContent: "center",
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
                        {picked.length < 3 && (
                            <span style={{ color: "#ef4444" }}> (min 3)</span>
                        )}
                    </div>
                    <button
                        onClick={confirmPick}
                        disabled={picked.length < 3 || loading}
                        style={{
                            backgroundImage: picked.length >= 3
                                ? "linear-gradient(135deg,#dc2626,#991b1b)"
                                : "none",
                            background: picked.length < 3
                                ? "rgba(255,255,255,.05)" : undefined,
                            border: "none", borderRadius: 12,
                            padding: "14px 40px", color: "#fff",
                            fontFamily: "Cinzel", fontSize: 15,
                            fontWeight: 700, cursor: picked.length >= 3
                                ? "pointer" : "not-allowed",
                            opacity: picked.length >= 3 ? 1 : .5,
                            letterSpacing: ".1em",
                            boxShadow: picked.length >= 3
                                ? "0 0 20px rgba(220,38,38,.4)" : "none",
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
            {showQExpired && (
                <TimeoutOverlay
                    type="question"
                    onClose={() => setShowQExpired(false)}
                />
            )}
            {showBExpired && (
                <TimeoutOverlay
                    type="battle"
                    onClose={() => setShowBExpired(false)}
                />
            )}

            <div style={{ maxWidth: 700, margin: "0 auto" }}>

                {/* Header row with battle clock */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                    flexWrap: "wrap",
                    gap: 12,
                }}>
                    <div>
                        <div style={{
                            fontSize: 10, color: "#22c55e",
                            letterSpacing: ".2em", fontWeight: 700
                        }}>
                            STEP 2 OF 2 — MULTIPLAYER
                        </div>
                        <h2 style={{
                            fontFamily: "Cinzel",
                            fontSize: "clamp(16px,4vw,20px)",
                            color: "#e9d5ff", margin: "4px 0 2px"
                        }}>
                            Answer Your Questions
                        </h2>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                            Question {currentQIdx + 1} of {myQs.length}
                        </div>
                    </div>

                    {/* ✅ BATTLE CLOCK — only shown in multiplayer answer phase */}
                    <BattleClock timeLeft={battleTimeLeft} isPaused={isPaused} />
                </div>

                {/* Progress dots */}
                <div style={{
                    display: "flex",
                    gap: 6,
                    marginBottom: 20,
                    justifyContent: "center",
                    flexWrap: "wrap",
                }}>
                    {myQs.map((q, i) => {
                        const isDone = q.id in answers;
                        const isTimeout = answers[q.id] === -1;
                        const isCurrent = i === currentQIdx;
                        return (
                            <div key={q.id} style={{
                                width: isCurrent ? 26 : 10,
                                height: 10,
                                borderRadius: 5,
                                background: isDone
                                    ? isTimeout ? "#ef4444" : "#22c55e"
                                    : isCurrent ? "#a855f7"
                                        : "rgba(255,255,255,.1)",
                                transition: "all .3s",
                                boxShadow: isCurrent
                                    ? "0 0 8px rgba(168,85,247,.6)" : "none",
                            }} />
                        );
                    })}
                </div>

                {/* Current question */}
                {currentQ && !allAnswered && (
                    <div style={{
                        background: "rgba(0,0,0,.5)",
                        border: "1px solid rgba(168,85,247,.2)",
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 16,
                        animation: "mpFadeIn .3s ease-out",
                    }}>
                        {/* ✅ QUESTION TIMER BAR — only in multiplayer */}
                        <QuestionTimerBar
                            timeLeft={questionTimeLeft}
                            maxTime={30}
                            isPaused={isPaused}
                        />

                        <p style={{
                            fontSize: 15,
                            lineHeight: 1.65,
                            color: "#e2e8f0",
                            marginBottom: 16,
                            fontWeight: 500,
                        }}>
                            {currentQ.body}
                        </p>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 9,
                        }}>
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
                                        cursor: answeredRef.current
                                            ? "not-allowed" : "pointer",
                                        textAlign: "left",
                                        fontSize: "clamp(12px,3vw,14px)",
                                        fontFamily: "Rajdhani",
                                        fontWeight: 600,
                                        transition: "all .2s",
                                        minHeight: 48,
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
                                        color: "#6b7280",
                                        fontWeight: 800,
                                        marginRight: 7,
                                        fontFamily: "Cinzel",
                                        fontSize: "clamp(10px,2.5vw,12px)",
                                    }}>
                                        {["A", "B", "C", "D"][i]}
                                    </span>
                                    {opt}
                                </button>
                            ))}
                        </div>

                        {isPaused && (
                            <div style={{
                                textAlign: "center",
                                marginTop: 10,
                                fontSize: 11,
                                color: "#9ca3af",
                                animation: "mpPulse 1s ease infinite",
                            }}>
                                ⏳ Processing...
                            </div>
                        )}
                    </div>
                )}

                {/* All answered — manual submit button */}
                {allAnswered && !loading && (
                    <div style={{ textAlign: "center", animation: "mpFadeIn .3s ease-out" }}>
                        <div style={{
                            color: "#22c55e", fontSize: 13,
                            fontWeight: 700, marginBottom: 16
                        }}>
                            ✅ All questions answered!
                        </div>
                        <button
                            onClick={() => doSubmitToBackend()}
                            style={{
                                backgroundImage: "linear-gradient(135deg,#7c3aed,#be185d)",
                                border: "none",
                                borderRadius: 12,
                                padding: "14px 48px",
                                color: "#fff",
                                fontFamily: "Cinzel",
                                fontSize: 15,
                                fontWeight: 700,
                                cursor: "pointer",
                                letterSpacing: ".1em",
                                boxShadow: "0 0 24px rgba(124,58,237,.5)",
                            }}>
                            ⚔️ SUBMIT ATTACK
                        </button>
                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}>
                            Time used: {totalTimeRef.current}s
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes mpFadeIn {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes mpPulse {
          0%,100% { opacity:.5; }
          50%      { opacity:1; }
        }
        @keyframes mpSpin {
          from { transform:rotate(0); }
          to   { transform:rotate(360deg); }
        }
      `}</style>
        </Screen>
    );

    // ── Waiting for opponent ──────────────────────────────────────────
    if (step === "waiting") return (
        <Screen>
            <div style={{ textAlign: "center", maxWidth: 400, margin: "0 auto" }}>
                <div style={{
                    fontSize: 64, marginBottom: 16,
                    animation: "mpSpin 3s linear infinite"
                }}>⏳</div>
                <h2 style={{
                    fontFamily: "Cinzel", fontSize: 22,
                    color: "#c084fc", marginBottom: 8
                }}>ATTACK SENT!</h2>
                <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 4 }}>
                    Your score:{" "}
                    <span style={{
                        color: "#22c55e", fontWeight: 700,
                        fontFamily: "Cinzel"
                    }}>
                        {score}/{myQs.length}
                    </span>
                </p>
                <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 4 }}>
                    Opponent gets{" "}
                    <strong style={{ color: "#fbbf24" }}>30s per question</strong>
                    {" "}·{" "}
                    <strong style={{ color: "#fbbf24" }}>3 min total</strong>
                    {" "}to defend.
                </p>
                <p style={{ color: "#4b5563", fontSize: 11 }}>
                    Your total time: {totalTimeRef.current}s
                </p>
                <button
                    onClick={() => router.push("/multiplayer")}
                    style={{
                        marginTop: 24,
                        background: "rgba(124,58,237,.3)",
                        border: "1px solid rgba(168,85,247,.3)",
                        borderRadius: 12,
                        padding: "12px 32px",
                        color: "#c084fc",
                        cursor: "pointer",
                        fontFamily: "Cinzel",
                        fontSize: 13,
                    }}>
                    🏠 BACK TO HUB
                </button>
            </div>
            <style>{`
        @keyframes mpSpin {
          from { transform:rotate(0); }
          to   { transform:rotate(360deg); }
        }
      `}</style>
        </Screen>
    );

    return null;
}

// ── Shared layout helpers ─────────────────────────────────────────────

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
                @keyframes mpFadeIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes mpPulse {
                    0%, 100% { opacity: .5; }
                    50%       { opacity: 1; }
                }
                @keyframes mpSpin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
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
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
                fontSize: 13,
                marginBottom: 20,
                display: "block",
                fontFamily: "Rajdhani",
                fontWeight: 600,
            }}>
            ← Back
        </button>
    );
}
