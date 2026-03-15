"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

const LEAGUE_DATA: Record<string, { color: string; glow: string; emoji: string; bg: string; min: number }> = {
    Bronze: { color: "#cd7f32", glow: "rgba(205,127,50,0.5)", emoji: "🥉", bg: "rgba(205,127,50,0.1)", min: 0 },
    Silver: { color: "#c0c0c0", glow: "rgba(192,192,192,0.5)", emoji: "🥈", bg: "rgba(192,192,192,0.1)", min: 500 },
    Gold: { color: "#ffd700", glow: "rgba(255,215,0,0.5)", emoji: "🥇", bg: "rgba(255,215,0,0.1)", min: 1000 },
    Diamond: { color: "#b9f2ff", glow: "rgba(185,242,255,0.5)", emoji: "💎", bg: "rgba(185,242,255,0.1)", min: 2000 },
    Legend: { color: "#ff6b9d", glow: "rgba(255,107,157,0.6)", emoji: "👑", bg: "rgba(255,107,157,0.12)", min: 3000 },
};

const RANK_ICONS: Record<number, string> = { 1: "👑", 2: "🥈", 3: "🥉" };

export default function LeaderboardPage() {
    const router = useRouter();
    const [tab, setTab] = useState<"global" | "weekly">("global");
    const [data, setData] = useState<any[]>([]);
    const [myRank, setMyRank] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;

    useEffect(() => { fetchData(); if (token) fetchMyRank(); }, [tab]);

    const fetchData = async () => {
        setLoading(true);
        try { const res = await axios.get(`${API}/leaderboard/${tab}`); setData(res.data); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchMyRank = async () => {
        try { const res = await axios.get(`${API}/leaderboard/my-rank`, { headers: { Authorization: `Bearer ${token}` } }); setMyRank(res.data); }
        catch { }
    };

    const getLeague = (xp: number) => {
        const leagues = Object.entries(LEAGUE_DATA).reverse();
        for (const [name, d] of leagues) { if (xp >= d.min) return { name, ...d }; }
        return { name: "Bronze", ...LEAGUE_DATA.Bronze };
    };

    return (
        <div style={{ minHeight: "100vh", background: "#030712", color: "#fff", fontFamily: "Rajdhani" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideFromLeft{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}
        @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        @keyframes glowPulse{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes vsFlash{0%,100%{text-shadow:0 0 10px #ef4444}50%{text-shadow:0 0 20px #fbbf24,0 0 40px #fbbf24}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes scoreCount{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}
      `}</style>

            {/* Nav */}
            <nav style={{
                background: "rgba(0,0,0,0.75)", borderBottom: "1px solid rgba(251,191,36,0.2)",
                padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center",
                position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(16px)"
            }}>
                <button onClick={() => router.push("/")} style={{
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "7px 16px",
                    cursor: "pointer", color: "#9ca3af", fontSize: 13, fontFamily: "Rajdhani", fontWeight: 600,
                    transition: "all 0.2s"
                }}
                    onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                    onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}>← HOME</button>

                <div style={{
                    fontFamily: "Cinzel", fontSize: 20, fontWeight: 700,
                    background: "linear-gradient(135deg,#fbbf24,#f97316,#fbbf24)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    letterSpacing: "0.12em"
                }}>
                    🏆 HALL OF LEGENDS
                </div>

                <button onClick={() => router.push("/multiplayer")} style={{
                    backgroundImage: "linear-gradient(135deg,#dc2626,#991b1b)",
                    border: "none", borderRadius: 10, padding: "9px 22px",
                    color: "#fff", fontFamily: "Cinzel", fontSize: 12, cursor: "pointer", fontWeight: 700,
                    letterSpacing: "0.1em", boxShadow: "0 0 20px rgba(220,38,38,0.4)", transition: "all 0.2s"
                }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                    ⚔️ MULTIPLAYER
                </button>
            </nav>

            <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 20px" }}>

                {/* My Rank Card */}
                {myRank && (() => {
                    const league = getLeague(myRank.xp || 0);
                    return (
                        <div style={{
                            backgroundImage: `linear-gradient(135deg,${league.bg},rgba(0,0,0,0.5))`,
                            border: `2px solid ${league.color}40`, borderRadius: 20, padding: "22px 28px",
                            marginBottom: 28, display: "flex", alignItems: "center", gap: 24,
                            boxShadow: `0 0 50px ${league.glow}`, animation: "bounceIn 0.6s ease-out"
                        }}>
                            <div style={{ textAlign: "center", flexShrink: 0 }}>
                                <div style={{ fontSize: 64, filter: `drop-shadow(0 0 16px ${league.glow})` }}>{league.emoji}</div>
                                <div style={{ fontFamily: "Cinzel", fontSize: 12, color: league.color, fontWeight: 700, letterSpacing: "0.1em" }}>{league.name}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, color: "#6b7280", letterSpacing: "0.15em", fontWeight: 600, marginBottom: 6 }}>YOUR RANKING</div>
                                <div style={{
                                    fontFamily: "Cinzel", fontSize: 36, fontWeight: 900, color: league.color,
                                    textShadow: `0 0 20px ${league.color}`, marginBottom: 4
                                }}>
                                    #{myRank.rank}
                                </div>
                                <div style={{ fontSize: 14, color: "#9ca3af", fontWeight: 600 }}>
                                    {myRank.username} · Lv.{myRank.level}
                                    {myRank.streak > 1 && <span style={{ color: "#f97316", marginLeft: 8 }}>🔥 {myRank.streak} streak</span>}
                                </div>
                                {/* Trophy progress bar */}
                                <div style={{ marginTop: 10 }}>
                                    <div style={{
                                        display: "flex", justifyContent: "space-between", fontSize: 10,
                                        color: "#6b7280", marginBottom: 4
                                    }}>
                                        <span>XP Progress</span>
                                        <span style={{ color: league.color, fontFamily: "Cinzel" }}>{(myRank.xp || 0).toLocaleString()} XP</span>
                                    </div>
                                    <div style={{ height: 8, background: "rgba(0,0,0,0.5)", borderRadius: 4, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                                        <div style={{
                                            height: "100%", borderRadius: 4,
                                            backgroundImage: `linear-gradient(90deg,${league.color}88,${league.color})`,
                                            boxShadow: `0 0 10px ${league.color}`,
                                            width: `${Math.min(100, ((myRank.xp || 0) % 500) / 5)}%`,
                                            transition: "width 1.2s ease"
                                        }} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flexShrink: 0 }}>
                                {[["XP", `${(myRank.xp || 0).toLocaleString()}`, league.color],
                                ["RANK", `#${myRank.rank}`, "#9ca3af"],
                                ["LEVEL", `${myRank.level}`, "#c084fc"],
                                ["STREAK", `${myRank.streak}🔥`, "#f97316"]
                                ].map(([l, v, c]) => (
                                    <div key={l} style={{
                                        background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)",
                                        borderRadius: 10, padding: "8px 12px", textAlign: "center"
                                    }}>
                                        <div style={{ fontFamily: "Cinzel", fontSize: 16, fontWeight: 700, color: c as string }}>{v}</div>
                                        <div style={{ fontSize: 9, color: "#6b7280", letterSpacing: "0.1em", fontWeight: 600 }}>{l}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}

                {/* Tab switcher */}
                <div style={{
                    display: "flex", gap: 4, marginBottom: 24,
                    background: "rgba(0,0,0,0.4)", borderRadius: 14, padding: 5,
                    border: "1px solid rgba(255,255,255,0.05)"
                }}>
                    {(["global", "weekly"] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            flex: 1, padding: "11px 8px", border: "none", borderRadius: 10,
                            backgroundImage: tab === t ? "linear-gradient(135deg,rgba(124,58,237,0.5),rgba(190,24,93,0.4))" : "none",
                            background: tab === t ? undefined : "transparent",
                            color: tab === t ? "#e9d5ff" : "#6b7280",
                            fontFamily: "Cinzel", fontSize: 12, fontWeight: 700, cursor: "pointer",
                            letterSpacing: "0.1em", transition: "all 0.25s",
                            boxShadow: tab === t ? "0 0 20px rgba(124,58,237,0.3)" : "none"
                        }}>
                            {t === "global" ? "🌍 GLOBAL ALL-TIME" : "📅 THIS WEEK"}
                        </button>
                    ))}
                </div>

                {/* Leaderboard List */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: 60 }}>
                        <div style={{ fontSize: 48, animation: "spin 1s linear infinite", display: "inline-block" }}>🏆</div>
                        <div style={{ color: "#6b7280", marginTop: 12, fontFamily: "Cinzel", fontSize: 13 }}>LOADING RANKINGS...</div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {data.map((entry, i) => {
                            const isMe = entry.user_id === user?.id;
                            const league = getLeague(entry.xp || 0);
                            const rankIcon = RANK_ICONS[entry.rank];
                            return (
                                <div key={entry.user_id} style={{
                                    backgroundImage: isMe
                                        ? "linear-gradient(135deg,rgba(124,58,237,0.14),rgba(190,24,93,0.08))"
                                        : i < 3 ? "linear-gradient(135deg,rgba(255,255,255,0.03),rgba(0,0,0,0.4))"
                                            : "rgba(255,255,255,0.015)",
                                    background: !isMe && i >= 3 ? "rgba(255,255,255,0.015)" : undefined,
                                    border: `1px solid ${isMe ? "rgba(168,85,247,0.35)" : i < 3 ? `${league.color}22` : "rgba(255,255,255,0.05)"}`,
                                    borderRadius: 14, padding: "14px 18px",
                                    display: "flex", alignItems: "center", gap: 14,
                                    transition: "all 0.2s", cursor: "default",
                                    animation: `slideFromLeft 0.3s ease-out ${i * 0.05}s both`,
                                    boxShadow: i === 0 ? "0 0 30px rgba(255,215,0,0.1)" : i === 1 ? "0 0 20px rgba(192,192,192,0.08)" : i === 2 ? "0 0 15px rgba(205,127,50,0.08)" : "none",
                                }}
                                    onMouseEnter={e => e.currentTarget.style.transform = "translateX(3px)"}
                                    onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}>

                                    {/* Rank */}
                                    <div style={{
                                        fontFamily: "Cinzel", fontSize: rankIcon ? 22 : 16,
                                        fontWeight: 700, width: 32, textAlign: "center", flexShrink: 0,
                                        color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "#4b5563",
                                        textShadow: i < 3 ? `0 0 10px ${i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : "#cd7f32"}` : "none",
                                        animation: i === 0 ? "glowPulse 2s infinite" : "none"
                                    }}>
                                        {rankIcon || `#${entry.rank}`}
                                    </div>

                                    {/* League badge */}
                                    <div style={{ fontSize: 22, flexShrink: 0, filter: `drop-shadow(0 0 6px ${league.glow})` }}>
                                        {league.emoji}
                                    </div>

                                    {/* Avatar */}
                                    <div style={{
                                        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                                        backgroundImage: isMe
                                            ? "linear-gradient(135deg,#7c3aed,#db2777)"
                                            : `linear-gradient(135deg,${league.color}88,${league.color}44)`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 15, fontWeight: 700, fontFamily: "Cinzel",
                                        border: `2px solid ${isMe ? "rgba(168,85,247,0.5)" : league.color + "33"}`,
                                        boxShadow: i < 3 ? `0 0 12px ${league.glow}` : "none"
                                    }}>
                                        {entry.username?.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontWeight: 700, fontSize: 15,
                                            color: isMe ? "#c084fc" : "#e2e8f0", fontFamily: "Cinzel"
                                        }}>
                                            {entry.username}
                                            {isMe && <span style={{ fontSize: 10, color: "#7c3aed", marginLeft: 8, fontFamily: "Rajdhani", letterSpacing: "0.1em" }}>(YOU)</span>}
                                        </div>
                                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                                            Lv.{entry.level} · {league.name}
                                            {entry.streak > 0 && <span style={{ marginLeft: 8, color: "#f97316" }}>🔥 {entry.streak}</span>}
                                        </div>
                                    </div>

                                    {/* XP + mini bar */}
                                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                                        <div style={{
                                            fontFamily: "Cinzel", fontWeight: 700,
                                            fontSize: i < 3 ? 20 : 16,
                                            color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : league.color,
                                            textShadow: i < 3 ? `0 0 10px ${i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : "#cd7f32"}` : "none",
                                            animation: `scoreCount 0.5s ease-out ${i * 0.05}s both`
                                        }}>
                                            {(tab === "weekly" ? entry.weekly_xp : entry.xp)?.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: 9, color: "#374151", letterSpacing: "0.1em", fontWeight: 700 }}>XP</div>
                                        {/* Mini xp bar */}
                                        {i < 10 && (
                                            <div style={{
                                                width: 80, height: 3, background: "rgba(0,0,0,0.5)", borderRadius: 2,
                                                marginTop: 4, overflow: "hidden"
                                            }}>
                                                <div style={{
                                                    height: "100%", borderRadius: 2,
                                                    backgroundImage: `linear-gradient(90deg,${league.color}66,${league.color})`,
                                                    width: `${Math.min(100, ((entry.xp || 0) / ((data[0]?.xp || 1))) * 100)}%`,
                                                    transition: "width 1s ease"
                                                }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {data.length === 0 && (
                            <div style={{ textAlign: "center", padding: "60px 0", color: "#374151" }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                                <div style={{ fontFamily: "Cinzel", fontSize: 16 }}>No warriors yet.</div>
                                <div style={{ fontSize: 13, marginTop: 6 }}>Be the first to battle!</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}