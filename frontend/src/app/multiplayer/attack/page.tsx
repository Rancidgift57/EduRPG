"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

type Step = "find" | "pick" | "answer" | "waiting" | "result";

export default function AttackPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("find");
    const [opponent, setOpponent] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [picked, setPicked] = useState<string[]>([]);   // IDs chosen for opponent
    const [battleId, setBattleId] = useState("");
    const [myQuestions, setMyQuestions] = useState<any[]>([]); // Questions sent to me
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [score, setScore] = useState(0);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [topic] = useState(
        typeof window !== "undefined"
            ? localStorage.getItem("mp_topic") || "python-basics" : "python-basics"
    );

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { findOpponent(); }, []);

    const findOpponent = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API}/multiplayer/find-opponent`,
                { topic }, { headers });
            setOpponent(res.data.opponent);
            setQuestions(res.data.questions);
            setStep("pick");
        } catch {
            router.push("/multiplayer");
        } finally {
            setLoading(false);
        }
    };

    const togglePick = (id: string) => {
        if (picked.includes(id)) {
            setPicked(p => p.filter(x => x !== id));
        } else if (picked.length < 5) {
            setPicked(p => [...p, id]);
        }
    };

    const confirmPick = async () => {
        if (picked.length < 3) return;
        setLoading(true);
        try {
            const res = await axios.post(`${API}/multiplayer/start-battle`, {
                defender_id: opponent.user_id,
                topic,
                questions_for_defender: picked,
            }, { headers });
            setBattleId(res.data.battle_id);
            // My questions = remaining ones not picked for opponent
            const mine = questions
                .filter(q => !picked.includes(q.id))
                .slice(0, 5);
            setMyQuestions(mine);
            setStep("answer");
        } catch (e: any) {
            alert(e.response?.data?.detail || "Error");
        } finally {
            setLoading(false);
        }
    };

    const submitAnswers = async () => {
        setLoading(true);
        const answerList = myQuestions.map(q => ({
            question_id: q.id,
            selected_index: answers[q.id] ?? -1,
        }));
        try {
            const res = await axios.post(`${API}/multiplayer/submit-attack`, {
                battle_id: battleId,
                answers: answerList,
                questions_for_opponent: picked,
            }, { headers });
            setScore(res.data.score);
            setStep("waiting");
        } catch (e: any) {
            alert(e.response?.data?.detail || "Error");
        } finally {
            setLoading(false);
        }
    };

    if (loading && step === "find") return (
        <Screen>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 60, animation: "spin 1s linear infinite" }}>⚔️</div>
                <p style={{
                    color: "#a855f7", marginTop: 16, fontFamily: "Cinzel",
                    letterSpacing: "0.2em"
                }}>FINDING OPPONENT...</p>
            </div>
        </Screen>
    );

    // ── Step: Pick questions for opponent ──────────
    if (step === "pick") return (
        <Screen>
            <BackBtn onClick={() => router.push("/multiplayer")} />
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{
                        fontSize: 11, color: "#a855f7", letterSpacing: "0.2em",
                        fontWeight: 700, marginBottom: 8
                    }}>STEP 1 OF 2</div>
                    <h2 style={{ fontFamily: "Cinzel", fontSize: 24, color: "#e9d5ff" }}>
                        Choose 3–5 Questions
                    </h2>
                    <p style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
                        for <span style={{ color: "#f87171", fontWeight: 700 }}>
                            {opponent?.username}
                        </span> to answer
                    </p>
                    <OpponentBadge opponent={opponent} />
                </div>

                {/* Question list */}
                <div style={{
                    display: "flex", flexDirection: "column", gap: 10,
                    marginBottom: 20
                }}>
                    {questions.map((q, i) => {
                        const sel = picked.includes(q.id);
                        return (
                            <button key={q.id} onClick={() => togglePick(q.id)} style={{
                                background: sel
                                    ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.02)",
                                border: `1px solid ${sel ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.06)"}`,
                                borderRadius: 12, padding: "14px 16px",
                                color: "#e2e8f0", cursor: "pointer",
                                textAlign: "left", fontSize: 14, fontFamily: "Rajdhani",
                                fontWeight: 500, transition: "all 0.2s",
                                transform: sel ? "scale(1.01)" : "scale(1)",
                            }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                    <div style={{
                                        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                                        background: sel ? "#ef4444" : "rgba(255,255,255,0.05)",
                                        border: `1px solid ${sel ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 12, fontWeight: 700, color: sel ? "#fff" : "#6b7280",
                                    }}>
                                        {sel ? "✓" : i + 1}
                                    </div>
                                    <span>{q.body}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Confirm */}
                <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 12 }}>
                        {picked.length}/5 questions selected
                        {picked.length < 3 && (
                            <span style={{ color: "#ef4444" }}> (min 3)</span>
                        )}
                    </div>
                    <button onClick={confirmPick}
                        disabled={picked.length < 3 || loading}
                        style={{
                            background: picked.length >= 3
                                ? "linear-gradient(135deg,#dc2626,#991b1b)"
                                : "rgba(255,255,255,0.05)",
                            border: "none", borderRadius: 12,
                            padding: "14px 40px", color: "#fff",
                            fontFamily: "Cinzel", fontSize: 15, fontWeight: 700,
                            cursor: picked.length >= 3 ? "pointer" : "not-allowed",
                            opacity: picked.length >= 3 ? 1 : 0.5,
                            letterSpacing: "0.1em",
                            boxShadow: picked.length >= 3 ? "0 0 20px rgba(220,38,38,0.4)" : "none",
                        }}>
                        💀 LAUNCH ATTACK →
                    </button>
                </div>
            </div>
        </Screen>
    );

    // ── Step: Answer your own questions ───────────
    if (step === "answer") return (
        <Screen>
            <BackBtn onClick={() => router.push("/multiplayer")} />
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{
                        fontSize: 11, color: "#22c55e", letterSpacing: "0.2em",
                        fontWeight: 700, marginBottom: 8
                    }}>STEP 2 OF 2</div>
                    <h2 style={{ fontFamily: "Cinzel", fontSize: 24, color: "#e9d5ff" }}>
                        Answer Your Questions
                    </h2>
                    <p style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
                        Score as high as possible to win
                    </p>
                </div>

                <div style={{
                    display: "flex", flexDirection: "column", gap: 20,
                    marginBottom: 24
                }}>
                    {myQuestions.map((q, qi) => (
                        <div key={q.id} style={{
                            background: "rgba(0,0,0,0.4)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 14, padding: 20,
                        }}>
                            <div style={{
                                fontSize: 12, color: "#6b7280",
                                marginBottom: 8, fontWeight: 700
                            }}>
                                Q{qi + 1} of {myQuestions.length}
                            </div>
                            <p style={{
                                fontSize: 15, marginBottom: 14,
                                lineHeight: 1.5, color: "#e2e8f0"
                            }}>{q.body}</p>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr", gap: 8
                            }}>
                                {q.options.map((opt: string, oi: number) => {
                                    const sel = answers[q.id] === oi;
                                    return (
                                        <button key={oi}
                                            onClick={() => setAnswers(a => ({ ...a, [q.id]: oi }))}
                                            style={{
                                                background: sel
                                                    ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.03)",
                                                border: `1px solid ${sel ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.07)"}`,
                                                borderRadius: 10, padding: "10px 14px",
                                                color: sel ? "#86efac" : "#d1d5db",
                                                cursor: "pointer", textAlign: "left",
                                                fontSize: 13, fontFamily: "Rajdhani",
                                                fontWeight: 500, transition: "all 0.15s",
                                                transform: sel ? "scale(1.02)" : "scale(1)",
                                            }}>
                                            <span style={{
                                                color: sel ? "#4ade80" : "#6b7280",
                                                fontWeight: 700, marginRight: 6
                                            }}>
                                                {["A", "B", "C", "D"][oi]}.
                                            </span>
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
                        {Object.keys(answers).length}/{myQuestions.length} answered
                    </div>
                    <button onClick={submitAnswers}
                        disabled={Object.keys(answers).length < myQuestions.length || loading}
                        style={{
                            background: "linear-gradient(135deg,#7c3aed,#be185d)",
                            border: "none", borderRadius: 12,
                            padding: "14px 48px", color: "#fff",
                            fontFamily: "Cinzel", fontSize: 15, fontWeight: 700,
                            cursor: "pointer", letterSpacing: "0.1em",
                            opacity: Object.keys(answers).length < myQuestions.length ? 0.5 : 1,
                            boxShadow: "0 0 20px rgba(124,58,237,0.4)",
                        }}>
                        ⚔️ SUBMIT ATTACK
                    </button>
                </div>
            </div>
        </Screen>
    );

    // ── Waiting for opponent ────────────────────────
    if (step === "waiting") return (
        <Screen>
            <div style={{ textAlign: "center", maxWidth: 400, margin: "0 auto" }}>
                <div style={{
                    fontSize: 64, marginBottom: 16,
                    animation: "spin 3s linear infinite"
                }}>⏳</div>
                <h2 style={{
                    fontFamily: "Cinzel", fontSize: 22,
                    color: "#c084fc", marginBottom: 8
                }}>ATTACK SENT!</h2>
                <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 8 }}>
                    You scored <span style={{
                        color: "#22c55e",
                        fontWeight: 700
                    }}>{score}/{myQuestions.length}</span>
                </p>
                <p style={{ color: "#4b5563", fontSize: 13 }}>
                    Waiting for {opponent?.username} to defend...
                    <br />They have 24 hours to respond.
                </p>
                <button onClick={() => router.push("/multiplayer")}
                    style={{
                        marginTop: 24, background: "rgba(124,58,237,0.3)",
                        border: "1px solid rgba(168,85,247,0.3)",
                        borderRadius: 12, padding: "12px 32px",
                        color: "#c084fc", cursor: "pointer",
                        fontFamily: "Cinzel", fontSize: 13
                    }}>
                    🏠 BACK TO HUB
                </button>
            </div>
        </Screen>
    );

    return null;
}

// ── Helpers ────────────────────────────────────────────────
function Screen({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            minHeight: "100vh", background: "#030712",
            color: "#fff", fontFamily: "'Rajdhani',sans-serif",
            padding: "24px 16px",
            display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <div style={{ width: "100%" }}>{children}</div>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Rajdhani:wght@500;600;700&display=swap');
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
      `}</style>
        </div>
    );
}

function BackBtn({ onClick }: { onClick: () => void }) {
    return (
        <button onClick={onClick} style={{
            background: "none", border: "none",
            cursor: "pointer", color: "#6b7280", fontSize: 13,
            marginBottom: 20, display: "block"
        }}>
            ← Back
        </button>
    );
}

function OpponentBadge({ opponent }: { opponent: any }) {
    if (!opponent) return null;
    return (
        <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 50, padding: "6px 16px", marginTop: 12
        }}>
            <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg,#dc2626,#991b1b)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700
            }}>
                {opponent.username?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{opponent.username}</span>
            <span style={{ fontSize: 11, color: "#f87171" }}>
                {opponent.trophies}🏆 · Lv.{opponent.level}
            </span>
        </div>
    );
}