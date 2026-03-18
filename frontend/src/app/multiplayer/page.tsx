"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

const LEAGUE_DATA: Record<string, { color: string; emoji: string; bg: string }> = {
    Bronze: { color: "#cd7f32", emoji: "🥉", bg: "rgba(205,127,50,0.15)" },
    Silver: { color: "#c0c0c0", emoji: "🥈", bg: "rgba(192,192,192,0.15)" },
    Gold: { color: "#ffd700", emoji: "🥇", bg: "rgba(255,215,0,0.15)" },
    Diamond: { color: "#b9f2ff", emoji: "💎", bg: "rgba(185,242,255,0.15)" },
    Legend: { color: "#ff6b9d", emoji: "👑", bg: "rgba(255,107,157,0.15)" },
};

export default function MultiplayerPage() {
    const router = useRouter();
    const [ranking, setRanking] = useState<any>(null);
    const [inbox, setInbox] = useState<any[]>([]);
    const [battles, setBattles] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [tab, setTab] = useState<"home" | "inbox" | "history" | "board">("home");
    const [loading, setLoading] = useState(true);
    const [findLoading, setFindLoading] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const user = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null") : null;

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (!token) { router.push("/"); return; }
        loadAll();
    }, []);

    const loadAll = async () => {
        try {
            const [rankRes, inboxRes, battlesRes, boardRes] = await Promise.all([
                axios.get(`${API}/multiplayer/my-ranking`, { headers }),
                axios.get(`${API}/multiplayer/inbox`, { headers }),
                axios.get(`${API}/multiplayer/my-battles`, { headers }),
                axios.get(`${API}/multiplayer/leaderboard`),
            ]);
            setRanking(rankRes.data);
            setInbox(inboxRes.data.pending_battles || []);
            setBattles(battlesRes.data || []);
            setLeaderboard(boardRes.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFindOpponent = async () => {
        setFindLoading(true);
        try {
            localStorage.setItem("mp_topic", "python-basics");
            router.push("/multiplayer/attack");
        } finally {
            setFindLoading(false);
        }
    };

    const league = ranking?.league || "Bronze";
    const ld = LEAGUE_DATA[league] || LEAGUE_DATA.Bronze;

    if (loading) return (
        <div style={{
            minHeight: "100vh", background: "#030712",
            display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <div style={{ fontSize: 60, animation: "spin 2s linear infinite" }}>🏆</div>
        </div>
    );

    return (
        <div style={{
            minHeight: "100vh", background: "#030712",
            fontFamily: "'Rajdhani',sans-serif", color: "#fff"
        }}>

            {/* Header */}
            <div style={{
                background: "rgba(0,0,0,0.6)",
                borderBottom: "1px solid rgba(168,85,247,0.2)",
                padding: "16px 24px", display: "flex",
                justifyContent: "space-between", alignItems: "center"
            }}>
                <button onClick={() => router.push("/")}
                    style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#6b7280", fontSize: 14
                    }}>← Back</button>
                <div style={{
                    fontFamily: "Cinzel", fontSize: 20,
                    color: "#c084fc", letterSpacing: "0.1em"
                }}>
                    ⚔️ MULTIPLAYER ARENA
                </div>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>{user?.username}</div>
            </div>

            <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

                {/* Ranking Card */}
                {ranking && (
                    <div style={{
                        background: `linear-gradient(135deg,${ld.bg},rgba(0,0,0,0.4))`,
                        border: `1px solid ${ld.color}40`,
                        borderRadius: 20, padding: 24, marginBottom: 24,
                        display: "flex", alignItems: "center", gap: 24,
                        boxShadow: `0 0 40px ${ld.color}20`,
                    }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 64 }}>{ld.emoji}</div>
                            <div style={{
                                fontFamily: "Cinzel", fontSize: 14,
                                color: ld.color, fontWeight: 700
                            }}>{league}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontFamily: "Cinzel", fontSize: 28,
                                fontWeight: 900, color: ld.color
                            }}>
                                {ranking.trophies} 🏆
                            </div>
                            <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
                                {ranking.wins}W · {ranking.losses}L
                                {ranking.win_streak > 1 && (
                                    <span style={{ color: "#f59e0b", marginLeft: 8 }}>
                                        🔥 {ranking.win_streak} streak
                                    </span>
                                )}
                            </div>
                            {/* Trophy bar */}
                            <div style={{
                                marginTop: 12, height: 8,
                                background: "rgba(0,0,0,0.4)", borderRadius: 4
                            }}>
                                <div style={{
                                    height: "100%", borderRadius: 4,
                                    background: `linear-gradient(90deg,${ld.color}80,${ld.color})`,
                                    width: `${Math.min(100, (ranking.trophies % 500) / 5)}%`,
                                    boxShadow: `0 0 8px ${ld.color}`,
                                    transition: "width 1s ease",
                                }} />
                            </div>
                        </div>

                        {/* Attack button */}
                        <button onClick={handleFindOpponent} disabled={findLoading}
                            style={{
                                background: "linear-gradient(135deg,#7c3aed,#be185d)",
                                border: "none", borderRadius: 12,
                                padding: "14px 28px", color: "#fff",
                                fontFamily: "Cinzel", fontSize: 14, fontWeight: 700,
                                cursor: "pointer", letterSpacing: "0.1em",
                                boxShadow: "0 0 20px rgba(124,58,237,0.4)",
                                transition: "all 0.3s",
                            }}>
                            {findLoading ? "⏳" : "⚔️ ATTACK"}
                        </button>
                    </div>
                )}

                {/* Inbox alert */}
                {inbox.length > 0 && (
                    <div style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: 12, padding: "12px 20px", marginBottom: 16,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        cursor: "pointer", animation: "borderPulse 2s ease infinite",
                    }} onClick={() => router.push("/multiplayer/inbox")}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 20 }}>⚠️</span>
                            <span style={{ fontWeight: 700, color: "#fca5a5" }}>
                                {inbox.length} battle{inbox.length > 1 ? "s" : ""} awaiting your response!
                            </span>
                        </div>
                        <span style={{ color: "#ef4444", fontWeight: 700 }}>
                            DEFEND NOW →
                        </span>
                    </div>
                )}

                {/* Tabs */}
                <div style={{
                    display: "flex", gap: 4, marginBottom: 20,
                    background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 4,
                    border: "1px solid rgba(255,255,255,0.05)"
                }}>
                    {(["home", "history", "board"] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            flex: 1, padding: "10px 8px", border: "none", borderRadius: 8,
                            background: tab === t ? "rgba(124,58,237,0.4)" : "transparent",
                            color: tab === t ? "#c084fc" : "#6b7280",
                            fontFamily: "Rajdhani", fontSize: 13, fontWeight: 700,
                            cursor: "pointer", letterSpacing: "0.05em",
                            transition: "all 0.2s",
                        }}>
                            {t === "home" ? "🏠 Home" : t === "history" ? "📜 Battles" : "🏆 Leaderboard"}
                        </button>
                    ))}
                </div>

                {/* Home tab */}
                {tab === "home" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <StatCard icon="⚔️" label="Total Attacks" value={ranking?.wins + ranking?.losses || 0} color="#a855f7" />
                        <StatCard icon="🏆" label="Trophies" value={ranking?.trophies || 0} color="#fbbf24" />
                        <StatCard icon="✅" label="Attack Wins" value={ranking?.attack_wins || 0} color="#22c55e" />
                        <StatCard icon="🛡️" label="Defense Wins" value={ranking?.defense_wins || 0} color="#3b82f6" />
                    </div>
                )}

                {/* Battle History */}
                {tab === "history" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {battles.length === 0 && (
                            <div style={{
                                textAlign: "center", padding: 40,
                                color: "#374151", fontSize: 14
                            }}>
                                No battles yet. Attack someone!
                            </div>
                        )}
                        {battles.map(b => (
                            <BattleHistoryCard
                                key={b.id} battle={b}
                                userId={user?.id} />
                        ))}
                    </div>
                )}

                {/* Trophy Leaderboard */}
                {tab === "board" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {leaderboard.map((entry, i) => {
                            const eld = LEAGUE_DATA[entry.league] || LEAGUE_DATA.Bronze;
                            const isMe = entry.user_id === user?.id;
                            return (
                                <div key={entry.user_id} style={{
                                    background: isMe
                                        ? "rgba(124,58,237,0.15)"
                                        : "rgba(255,255,255,0.02)",
                                    border: `1px solid ${isMe ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.05)"}`,
                                    borderRadius: 12, padding: "12px 16px",
                                    display: "flex", alignItems: "center", gap: 12,
                                }}>
                                    <div style={{
                                        fontFamily: "Cinzel", fontSize: 16,
                                        fontWeight: 700, width: 32, textAlign: "center",
                                        color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "#6b7280"
                                    }}>
                                        {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                                    </div>
                                    <div style={{ fontSize: 20 }}>{eld.emoji}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontWeight: 700, fontSize: 14,
                                            color: isMe ? "#c084fc" : "#e2e8f0"
                                        }}>
                                            {entry.username}
                                            {isMe && <span style={{
                                                color: "#a855f7",
                                                fontSize: 11, marginLeft: 6
                                            }}>(you)</span>}
                                        </div>
                                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                                            {entry.wins}W · {entry.losses}L · Lv.{entry.level}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontFamily: "Cinzel", fontWeight: 700,
                                        color: eld.color, fontSize: 16
                                    }}>
                                        {entry.trophies} 🏆
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Rajdhani:wght@500;600;700&display=swap');
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes borderPulse {
          0%,100%{border-color:rgba(239,68,68,0.3)}
          50%{border-color:rgba(239,68,68,0.7);box-shadow:0 0 15px rgba(239,68,68,0.2)}
        }
      `}</style>
        </div>
    );
}

function StatCard({ icon, label, value, color }: any) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 12, padding: "20px 16px", textAlign: "center"
        }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
            <div style={{
                fontFamily: "Cinzel", fontSize: 28,
                fontWeight: 700, color
            }}>{value}</div>
            <div style={{
                fontSize: 11, color: "#6b7280",
                fontWeight: 600, letterSpacing: "0.05em"
            }}>{label}</div>
        </div>
    );
}

function BattleHistoryCard({ battle, userId }: any) {
    const isAttacker = battle.attacker_id === userId;
    const opponent = isAttacker ? battle.defender_name : battle.attacker_name;
    const myScore = isAttacker ? battle.attacker_score : battle.defender_score;
    const theirScore = isAttacker ? battle.defender_score : battle.attacker_score;
    const won = battle.winner_id === userId;
    const draw = !battle.winner_id && battle.status === "completed";
    const pending = battle.status !== "completed";

    return (
        <div style={{
            background: pending ? "rgba(255,255,255,0.02)"
                : won ? "rgba(34,197,94,0.08)" : draw ? "rgba(234,179,8,0.08)"
                    : "rgba(239,68,68,0.08)",
            border: `1px solid ${pending ? "rgba(255,255,255,0.05)"
                : won ? "rgba(34,197,94,0.2)" : draw ? "rgba(234,179,8,0.2)"
                    : "rgba(239,68,68,0.2)"}`,
            borderRadius: 12, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12,
        }}>
            <div style={{ fontSize: 24 }}>
                {pending ? "⏳" : won ? "🏆" : draw ? "🤝" : "💀"}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                    vs {opponent}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                    {pending ? battle.status.replace(/_/g, " ").toUpperCase()
                        : `${myScore} - ${theirScore}`}
                </div>
            </div>
            {!pending && (
                <div style={{
                    fontFamily: "Cinzel", fontWeight: 700, fontSize: 14,
                    color: won ? "#22c55e" : draw ? "#f59e0b" : "#ef4444",
                }}>
                    {won ? `+${battle.trophies_wagered} 🏆`
                        : draw ? `+5 🏆`
                            : `-${battle.trophies_wagered} 🏆`}
                </div>
            )}
        </div>
    );
}
