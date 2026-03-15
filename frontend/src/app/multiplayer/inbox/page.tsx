"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function InboxPage() {
    const router = useRouter();
    const [battles, setBattles] = useState<any[]>([]);
    const [active, setActive] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const user = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null") : null;
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        loadInbox();
    }, []);

    const loadInbox = async () => {
        try {
            const res = await axios.get(`${API}/multiplayer/inbox`, { headers });
            setBattles(res.data.pending_battles || []);
        } finally {
            setLoading(false);
        }
    };

    const submitDefense = async () => {
        if (!active) return;
        setSubmitting(true);
        const answerList = active.questions.map((q: any) => ({
            question_id: q.id,
            selected_index: answers[q.id] ?? -1,
        }));
        try {
            const res = await axios.post(`${API}/multiplayer/submit-defense`, {
                battle_id: active.id,
                answers: answerList,
            }, { headers });
            setResult(res.data);
        } catch (e: any) {
            alert(e.response?.data?.detail || "Error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{
            minHeight: "100vh", background: "#030712",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontFamily: "Rajdhani"
        }}>
            Loading...
        </div>
    );

    // ── Result screen ───────────────────────────────
    if (result) return (
        <div style={{
            minHeight: "100vh", background: "#030712",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Rajdhani',sans-serif", color: "#fff"
        }}>
            <div style={{ textAlign: "center", maxWidth: 400 }}>
                <div style={{ fontSize: 80, marginBottom: 16 }}>
                    {result.is_winner ? "🏆" : result.winner_id === null ? "🤝" : "💀"}
                </div>
                <h2 style={{
                    fontFamily: "Cinzel", fontSize: 28,
                    color: result.is_winner ? "#fbbf24" : result.winner_id === null ? "#9ca3af" : "#ef4444",
                    marginBottom: 12
                }}>
                    {result.is_winner ? "VICTORY!" : result.winner_id === null ? "DRAW" : "DEFEAT"}
                </h2>
                <div style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16, padding: 20, marginBottom: 20
                }}>
                    <div style={{ display: "flex", justifyContent: "space-around" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{
                                fontSize: 28, fontFamily: "Cinzel",
                                fontWeight: 700, color: "#c084fc"
                            }}>{result.attacker_score}</div>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>ATTACKER</div>
                        </div>
                        <div style={{ fontSize: 20, alignSelf: "center", color: "#6b7280" }}>vs</div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{
                                fontSize: 28, fontFamily: "Cinzel",
                                fontWeight: 700, color: "#60a5fa"
                            }}>{result.your_score}</div>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>YOU</div>
                        </div>
                    </div>
                    <div style={{
                        marginTop: 16, paddingTop: 16,
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        fontFamily: "Cinzel", fontSize: 18,
                        color: result.is_winner ? "#22c55e" : "#ef4444"
                    }}>
                        {result.is_winner
                            ? `+${result.trophies_wagered} 🏆`
                            : `-${result.trophies_wagered} 🏆`}
                    </div>
                    <div style={{ fontSize: 13, color: "#22c55e", marginTop: 8 }}>
                        +{result.xp_gained} XP earned
                    </div>
                </div>
                <button onClick={() => router.push("/multiplayer")}
                    style={{
                        background: "linear-gradient(135deg,#7c3aed,#be185d)",
                        border: "none", borderRadius: 12, padding: "12px 40px",
                        color: "#fff", fontFamily: "Cinzel", fontSize: 14,
                        cursor: "pointer", letterSpacing: "0.1em"
                    }}>
                    🏠 BACK TO HUB
                </button>
            </div>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Rajdhani:wght@500;600;700&display=swap');`}</style>
        </div>
    );

    // ── Active battle answer screen ─────────────────
    if (active) return (
        <div style={{
            minHeight: "100vh", background: "#030712",
            fontFamily: "'Rajdhani',sans-serif", color: "#fff",
            padding: "24px 16px"
        }}>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
                <button onClick={() => setActive(null)}
                    style={{
                        background: "none", border: "none",
                        cursor: "pointer", color: "#6b7280",
                        fontSize: 13, marginBottom: 20, display: "block"
                    }}>
                    ← Back to inbox
                </button>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{
                        fontSize: 11, color: "#ef4444",
                        letterSpacing: "0.2em", fontWeight: 700, marginBottom: 8
                    }}>
                        🛡️ DEFENDING YOUR HONOR
                    </div>
                    <h2 style={{ fontFamily: "Cinzel", fontSize: 22 }}>
                        Answer {active.attacker_name}'s Questions
                    </h2>
                    <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
                        {active.trophies_wagered} trophies at stake 🏆
                    </p>
                </div>

                <div style={{
                    display: "flex", flexDirection: "column",
                    gap: 20, marginBottom: 24
                }}>
                    {active.questions.map((q: any, qi: number) => (
                        <div key={q.id} style={{
                            background: "rgba(0,0,0,0.4)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 14, padding: 20,
                        }}>
                            <div style={{
                                fontSize: 12, color: "#6b7280",
                                marginBottom: 8, fontWeight: 700
                            }}>
                                Q{qi + 1}
                            </div>
                            <p style={{
                                fontSize: 15, marginBottom: 14,
                                lineHeight: 1.5
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
                                                    ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.03)",
                                                border: `1px solid ${sel ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.07)"}`,
                                                borderRadius: 10, padding: "10px 14px",
                                                color: sel ? "#bfdbfe" : "#d1d5db",
                                                cursor: "pointer", textAlign: "left",
                                                fontSize: 13, fontFamily: "Rajdhani",
                                                fontWeight: 500, transition: "all 0.15s",
                                            }}>
                                            <span style={{
                                                color: sel ? "#60a5fa" : "#6b7280",
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
                    <button onClick={submitDefense}
                        disabled={submitting || Object.keys(answers).length < active.questions.length}
                        style={{
                            background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
                            border: "none", borderRadius: 12,
                            padding: "14px 48px", color: "#fff",
                            fontFamily: "Cinzel", fontSize: 15, fontWeight: 700,
                            cursor: "pointer", letterSpacing: "0.1em",
                            opacity: Object.keys(answers).length < active.questions.length ? 0.5 : 1,
                            boxShadow: "0 0 20px rgba(29,78,216,0.4)",
                        }}>
                        🛡️ SUBMIT DEFENSE
                    </button>
                </div>
            </div>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Rajdhani:wght@500;600;700&display=swap');`}</style>
        </div>
    );

    // ── Inbox list ──────────────────────────────────
    return (
        <div style={{
            minHeight: "100vh", background: "#030712",
            fontFamily: "'Rajdhani',sans-serif", color: "#fff",
            padding: "24px 16px"
        }}>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
                <button onClick={() => router.push("/multiplayer")}
                    style={{
                        background: "none", border: "none",
                        cursor: "pointer", color: "#6b7280",
                        fontSize: 13, marginBottom: 20, display: "block"
                    }}>
                    ← Back to hub
                </button>
                <h2 style={{
                    fontFamily: "Cinzel", fontSize: 22,
                    color: "#ef4444", marginBottom: 20
                }}>
                    🛡️ Defense Inbox ({battles.length})
                </h2>

                {battles.length === 0 && (
                    <div style={{
                        textAlign: "center", padding: 48,
                        color: "#374151", fontSize: 14
                    }}>
                        No pending battles. You're safe... for now.
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {battles.map(b => (
                        <div key={b.id} style={{
                            background: "rgba(239,68,68,0.05)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            borderRadius: 14, padding: 20,
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between", gap: 16,
                        }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>
                                    ⚔️ {b.attacker_name} is attacking you!
                                </div>
                                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                                    {b.questions?.length || 0} questions ·
                                    {b.trophies_wagered} trophies at stake
                                </div>
                                <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
                                    Expires: {new Date(b.expires_at).toLocaleString()}
                                </div>
                            </div>
                            <button onClick={() => setActive(b)} style={{
                                background: "linear-gradient(135deg,#dc2626,#991b1b)",
                                border: "none", borderRadius: 10,
                                padding: "10px 20px", color: "#fff",
                                fontFamily: "Cinzel", fontSize: 12,
                                fontWeight: 700, cursor: "pointer",
                                letterSpacing: "0.1em", whiteSpace: "nowrap",
                                boxShadow: "0 0 15px rgba(220,38,38,0.3)",
                            }}>
                                🛡️ DEFEND
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Rajdhani:wght@500;600;700&display=swap');`}</style>
        </div>
    );
}