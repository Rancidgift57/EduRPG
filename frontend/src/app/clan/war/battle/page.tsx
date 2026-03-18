"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

const BADGE_EMOJIS = ["🔥", "⚡", "🌟", "💎", "🏆", "🛡️", "⚔️", "🧠", "🚀", "🎯",
    "🌊", "🌙", "☀️", "🦁", "🐉", "🦅", "🌸", "❄️", "💜", "🔮"];
const BADGE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
    "#6366f1", "#a855f7", "#ec4899", "#14b8a6", "#f59e0b"];

const MSG_TYPE_COLORS: Record<string, string> = {
    text: "#9ca3af", question: "#60a5fa", resource: "#34d399", announcement: "#fbbf24"
};
const MSG_TYPE_ICONS: Record<string, string> = {
    text: "💬", question: "❓", resource: "📎", announcement: "📣"
};
const ROLE_COLORS: Record<string, string> = {
    leader: "#fbbf24", co_leader: "#c084fc", member: "#6b7280"
};
const ROLE_LABELS: Record<string, string> = {
    leader: "👑 Leader", co_leader: "⭐ Co-Leader", member: "🗡️ Member"
};



const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box}body{background:#030712;color:#fff;font-family:'Rajdhani',sans-serif;margin:0}
  button{-webkit-tap-highlight-color:transparent;touch-action:manipulation}
  input,textarea{font-size:16px!important}
  @keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
  @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes borderPulse{0%,100%{border-color:rgba(239,68,68,.2)}50%{border-color:rgba(239,68,68,.7);box-shadow:0 0 20px rgba(239,68,68,.3)}}
  @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes bounceIn{0%{transform:scale(.3);opacity:0}50%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
  .tabs{display:flex;gap:4px;background:rgba(0,0,0,.4);border-radius:13px;padding:4px;border:1px solid rgba(255,255,255,.05);overflow-x:auto}
  .tab{flex:1;min-width:fit-content;padding:clamp(9px,2.5vw,11px) clamp(10px,3vw,16px);border:none;border-radius:10px;font-family:Cinzel,serif;font-size:clamp(10px,2.5vw,12px);font-weight:700;cursor:pointer;transition:all .25s;white-space:nowrap;letter-spacing:.06em}
  .members-grid{display:grid;grid-template-columns:1fr;gap:8px}
  @media(min-width:640px){.members-grid{grid-template-columns:1fr 1fr}}
  @media(min-width:1024px){.members-grid{grid-template-columns:1fr 1fr 1fr}}
  .war-matchups{display:flex;flex-direction:column;gap:10px}
`;

export default function ClanPage() {
    const router = useRouter();
    const [tab, setTab] = useState<"home" | "room" | "war" | "search" | "create">("home");
    const [clanData, setClanData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);
    const [msgInput, setMsgInput] = useState("");
    const [msgType, setMsgType] = useState("text");
    const [searchQ, setSearchQ] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [warData, setWarData] = useState<any>(null);
    const [createForm, setCreateForm] = useState({
        name: "", description: "", badge_emoji: "🔥", badge_color: "#ef4444", is_open: true
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const chatRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const user = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null") : null;
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (!token) { router.push("/"); return; }
        loadAll();
        // Poll messages every 10 seconds when on room tab
        pollRef.current = setInterval(() => {
            if (tab === "room") loadMessages();
        }, 10000);
        return () => clearInterval(pollRef.current);
    }, []);

    useEffect(() => {
        if (tab === "room") loadMessages();
        if (tab === "war") loadWar();
        if (tab === "search") handleSearch();
    }, [tab]);

    useEffect(() => {
        // Auto-scroll chat to bottom
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const loadAll = async () => {
        setLoading(true);
        try {
            const r = await axios.get(`${API}/clan/mine`, { headers });
            setClanData(r.data);
        } catch { }
        finally { setLoading(false); }
    };

    const loadMessages = async () => {
        try {
            const r = await axios.get(`${API}/clan/room/messages`, { headers });
            setMessages(r.data.messages || []);
        } catch { }
    };

    const loadWar = async () => {
        try {
            const r = await axios.get(`${API}/clan/war/active/mine`, { headers });
            setWarData(r.data);
        } catch { }
    };

    const handleSearch = async () => {
        try {
            const r = await axios.get(`${API}/clan/search?q=${searchQ}`);
            setSearchResults(r.data);
        } catch { }
    };

    const handleJoin = async (clan_id: string) => {
        try {
            await axios.post(`${API}/clan/join/${clan_id}`, {}, { headers });
            setSuccess("Joined clan! Welcome!");
            loadAll();
            setTab("home");
        } catch (e: any) {
            setError(e.response?.data?.detail || "Could not join");
        }
    };

    const handleCreate = async () => {
        setError("");
        try {
            await axios.post(`${API}/clan/create`, createForm, { headers });
            setSuccess("Clan created! You are the leader!");
            loadAll();
            setTab("home");
        } catch (e: any) {
            setError(e.response?.data?.detail || "Could not create clan");
        }
    };

    const handleSendMessage = async () => {
        if (!msgInput.trim()) return;
        try {
            const r = await axios.post(`${API}/clan/room/post`,
                { body: msgInput.trim(), msg_type: msgType }, { headers });
            setMessages(prev => [...prev, r.data]);
            setMsgInput("");
        } catch (e: any) {
            setError(e.response?.data?.detail || "Could not send");
        }
    };

    const inClan = clanData?.in_clan;
    const clan = clanData?.clan;
    const members = clanData?.members || [];
    const myRole = clan?.my_role || "member";
    const isLeader = myRole === "leader" || myRole === "co_leader";

    if (loading) return (
        <div style={{
            minHeight: "100vh", background: "#030712",
            display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <style>{STYLES}</style>
            <div style={{ textAlign: "center" }}>
                <div style={{
                    fontSize: 64, animation: "spin 1.5s linear infinite",
                    display: "inline-block", filter: "drop-shadow(0 0 24px rgba(168,85,247,.9))"
                }}>🛡️</div>
                <div style={{
                    fontFamily: "Cinzel", fontSize: 18, color: "#a855f7",
                    marginTop: 16, letterSpacing: ".2em"
                }}>LOADING CLAN...</div>
            </div>
        </div>
    );

    return (
        <div style={{
            minHeight: "100vh", background: "#030712",
            color: "#fff", fontFamily: "Rajdhani"
        }}>
            <style>{STYLES}</style>

            {/* War Disclaimer Banner */}
            <div style={{
                background: "linear-gradient(135deg,rgba(30,58,138,.6),rgba(88,28,135,.6))",
                borderBottom: "1px solid rgba(99,102,241,.3)",
                padding: "clamp(8px,2vw,10px) clamp(14px,3vw,24px)",
                textAlign: "center", fontSize: "clamp(10px,2.5vw,12px)",
                color: "#a5b4fc", fontWeight: 600
            }}>
                ☮️ <strong style={{ color: "#6366f1" }}>EduRPG Stands Against War</strong> —
                Clan Wars are friendly academic competitions only. We promote learning,
                collaboration and peaceful rivalry. Study together, grow together.
            </div>

            {/* Nav */}
            <nav style={{
                background: "rgba(0,0,0,.78)",
                borderBottom: "1px solid rgba(168,85,247,.18)",
                padding: "0 clamp(14px,3vw,24px)", height: 56,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(16px)"
            }}>
                <button onClick={() => router.push("/")}
                    style={{
                        background: "none", border: "1px solid rgba(255,255,255,.08)",
                        borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                        color: "#9ca3af", fontSize: 13, fontFamily: "Rajdhani", fontWeight: 600
                    }}>
                    ← HOME
                </button>
                <div style={{
                    fontFamily: "Cinzel", fontSize: "clamp(13px,3.5vw,18px)",
                    fontWeight: 700, letterSpacing: ".1em",
                    backgroundImage: "linear-gradient(135deg,#a855f7,#6366f1,#06b6d4)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>
                    🛡️ CLAN HALL
                </div>
                {inClan && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{clan.badge_emoji}</span>
                        <span style={{
                            fontSize: "clamp(10px,2.5vw,13px)", fontWeight: 700,
                            color: clan.badge_color
                        }}>{clan.name}</span>
                    </div>
                )}
                {!inClan && <div style={{ width: 80 }} />}
            </nav>

            {/* Alert banners */}
            {error && (
                <div style={{
                    background: "rgba(127,29,29,.4)", borderBottom: "1px solid rgba(239,68,68,.4)",
                    padding: "10px 20px", textAlign: "center", fontSize: 13,
                    color: "#fca5a5", cursor: "pointer"
                }} onClick={() => setError("")}>
                    ⚠️ {error} — tap to dismiss
                </div>
            )}
            {success && (
                <div style={{
                    background: "rgba(21,128,61,.3)", borderBottom: "1px solid rgba(34,197,94,.4)",
                    padding: "10px 20px", textAlign: "center", fontSize: 13,
                    color: "#86efac", cursor: "pointer"
                }} onClick={() => setSuccess("")}>
                    ✅ {success}
                </div>
            )}

            <div style={{
                maxWidth: 900, margin: "0 auto",
                padding: "clamp(16px,4vw,28px) clamp(14px,3vw,20px)"
            }}>

                {/* ── NOT IN CLAN — Show join/create ────────────────────────── */}
                {!inClan && (
                    <div style={{ animation: "fadeIn .5s ease-out" }}>
                        <div style={{ textAlign: "center", marginBottom: 32 }}>
                            <div style={{
                                fontSize: "clamp(40px,12vw,72px)", marginBottom: 12,
                                filter: "drop-shadow(0 0 20px rgba(168,85,247,.8))"
                            }}>🛡️</div>
                            <div style={{
                                fontFamily: "Cinzel", fontSize: "clamp(18px,5vw,28px)",
                                fontWeight: 700, color: "#e9d5ff", marginBottom: 8
                            }}>
                                Join a Clan
                            </div>
                            <p style={{ color: "#6b7280", fontSize: "clamp(12px,3vw,14px)" }}>
                                Study with friends, compete in wars, climb the clan leaderboard
                            </p>
                        </div>

                        <div className="tabs" style={{ marginBottom: 20 }}>
                            {(["search", "create"] as const).map(t => (
                                <button key={t} className="tab" onClick={() => setTab(t)} style={{
                                    backgroundImage: tab === t
                                        ? "linear-gradient(135deg,rgba(124,58,237,.5),rgba(190,24,93,.4))"
                                        : "none",
                                    background: tab === t ? undefined : "transparent",
                                    color: tab === t ? "#e9d5ff" : "#6b7280",
                                    boxShadow: tab === t ? "0 0 16px rgba(124,58,237,.3)" : "none",
                                }}>
                                    {t === "search" ? "🔍 Find Clan" : "➕ Create Clan"}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        {tab === "search" && (
                            <div style={{ animation: "fadeIn .3s ease-out" }}>
                                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                                    <input value={searchQ}
                                        onChange={e => setSearchQ(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleSearch()}
                                        placeholder="Search by name or #TAG..."
                                        style={{
                                            flex: 1, background: "rgba(0,0,0,.5)",
                                            border: "1px solid rgba(255,255,255,.1)", borderRadius: 12,
                                            padding: "12px 16px", color: "#e2e8f0", fontSize: 14,
                                            fontFamily: "Rajdhani", fontWeight: 500, outline: "none"
                                        }} />
                                    <button onClick={handleSearch} style={{
                                        backgroundImage: "linear-gradient(135deg,#7c3aed,#be185d)",
                                        border: "none", borderRadius: 12, padding: "12px 20px",
                                        color: "#fff", fontFamily: "Cinzel", fontSize: 12,
                                        fontWeight: 700, cursor: "pointer"
                                    }}>
                                        🔍
                                    </button>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {searchResults.map((c, i) => (
                                        <ClanCard key={c.id} clan={c} i={i}
                                            onJoin={() => handleJoin(c.id)} />
                                    ))}
                                    {searchResults.length === 0 && (
                                        <div style={{
                                            textAlign: "center", padding: 40,
                                            color: "#374151", fontSize: 14
                                        }}>
                                            No clans found. Try a different search or create your own!
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Create */}
                        {tab === "create" && (
                            <div style={{
                                background: "rgba(0,0,0,.4)",
                                border: "1px solid rgba(168,85,247,.2)",
                                borderRadius: 18, padding: "clamp(20px,5vw,32px)",
                                animation: "fadeIn .3s ease-out"
                            }}>
                                <div style={{
                                    fontFamily: "Cinzel", fontSize: 16, fontWeight: 700,
                                    color: "#c084fc", marginBottom: 20, letterSpacing: ".1em"
                                }}>
                                    ➕ CREATE YOUR CLAN
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    <label style={{ fontSize: 11, color: "#6b7280", letterSpacing: ".12em", fontWeight: 700 }}>CLAN NAME *</label>
                                    <input value={createForm.name}
                                        onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                                        placeholder="Enter clan name (3-30 chars)"
                                        style={{
                                            background: "rgba(0,0,0,.5)",
                                            border: "1px solid rgba(255,255,255,.1)", borderRadius: 12,
                                            padding: "13px 16px", color: "#e2e8f0", fontSize: 14,
                                            fontFamily: "Rajdhani", fontWeight: 500, outline: "none"
                                        }} />

                                    <label style={{ fontSize: 11, color: "#6b7280", letterSpacing: ".12em", fontWeight: 700 }}>DESCRIPTION</label>
                                    <textarea value={createForm.description}
                                        onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                                        placeholder="What does your clan study?"
                                        rows={2}
                                        style={{
                                            background: "rgba(0,0,0,.5)",
                                            border: "1px solid rgba(255,255,255,.1)", borderRadius: 12,
                                            padding: "13px 16px", color: "#e2e8f0", fontSize: 14,
                                            fontFamily: "Rajdhani", fontWeight: 500, outline: "none",
                                            resize: "vertical"
                                        }} />

                                    <label style={{ fontSize: 11, color: "#6b7280", letterSpacing: ".12em", fontWeight: 700 }}>CLAN BADGE EMOJI</label>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {BADGE_EMOJIS.map(e => (
                                            <button key={e} onClick={() => setCreateForm({ ...createForm, badge_emoji: e })}
                                                style={{
                                                    fontSize: 24, background: createForm.badge_emoji === e
                                                        ? "rgba(168,85,247,.3)" : "rgba(255,255,255,.04)",
                                                    border: `1px solid ${createForm.badge_emoji === e
                                                        ? "rgba(168,85,247,.6)" : "rgba(255,255,255,.06)"}`,
                                                    borderRadius: 10, padding: "6px 10px", cursor: "pointer",
                                                    transition: "all .15s"
                                                }}>
                                                {e}
                                            </button>
                                        ))}
                                    </div>

                                    <label style={{ fontSize: 11, color: "#6b7280", letterSpacing: ".12em", fontWeight: 700 }}>CLAN COLOR</label>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {BADGE_COLORS.map(c => (
                                            <button key={c} onClick={() => setCreateForm({ ...createForm, badge_color: c })}
                                                style={{
                                                    width: 32, height: 32, borderRadius: "50%",
                                                    background: c, cursor: "pointer",
                                                    border: `3px solid ${createForm.badge_color === c
                                                        ? "#fff" : "transparent"}`,
                                                    boxShadow: createForm.badge_color === c
                                                        ? `0 0 10px ${c}` : "none",
                                                    transition: "all .15s"
                                                }} />
                                        ))}
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                                        <label style={{ fontSize: 11, color: "#6b7280", letterSpacing: ".12em", fontWeight: 700 }}>OPEN TO JOIN</label>
                                        <button onClick={() => setCreateForm({ ...createForm, is_open: !createForm.is_open })}
                                            style={{
                                                background: createForm.is_open
                                                    ? "rgba(34,197,94,.25)" : "rgba(239,68,68,.2)",
                                                border: `1px solid ${createForm.is_open
                                                    ? "rgba(34,197,94,.5)" : "rgba(239,68,68,.4)"}`,
                                                borderRadius: 20, padding: "6px 16px", cursor: "pointer",
                                                color: createForm.is_open ? "#4ade80" : "#f87171",
                                                fontSize: 12, fontWeight: 700
                                            }}>
                                            {createForm.is_open ? "✅ Open" : "🔒 Invite Only"}
                                        </button>
                                    </div>

                                    {/* Preview */}
                                    <div style={{
                                        background: `${createForm.badge_color}12`,
                                        border: `1px solid ${createForm.badge_color}35`,
                                        borderRadius: 12, padding: "12px 16px",
                                        display: "flex", alignItems: "center", gap: 12
                                    }}>
                                        <span style={{
                                            fontSize: 32,
                                            filter: `drop-shadow(0 0 8px ${createForm.badge_color})`
                                        }}>
                                            {createForm.badge_emoji}
                                        </span>
                                        <div>
                                            <div style={{
                                                fontFamily: "Cinzel", fontWeight: 700,
                                                color: createForm.badge_color, fontSize: 16
                                            }}>
                                                {createForm.name || "Clan Name"}
                                            </div>
                                            <div style={{ fontSize: 11, color: "#6b7280" }}>
                                                Preview
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={handleCreate}
                                        disabled={createForm.name.length < 3}
                                        style={{
                                            backgroundImage: "linear-gradient(135deg,#7c3aed,#be185d)",
                                            border: "none", borderRadius: 12, padding: "14px",
                                            color: "#fff", fontFamily: "Cinzel", fontSize: 14,
                                            fontWeight: 700, cursor: "pointer", letterSpacing: ".1em",
                                            opacity: createForm.name.length < 3 ? .5 : 1,
                                            boxShadow: "0 0 20px rgba(124,58,237,.4)", marginTop: 4
                                        }}>
                                        🛡️ CREATE CLAN
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── IN CLAN ───────────────────────────────────────────────── */}
                {inClan && (
                    <div>
                        {/* Clan header */}
                        <div style={{
                            backgroundImage: `linear-gradient(135deg,${clan.badge_color}14,rgba(0,0,0,.5))`,
                            border: `2px solid ${clan.badge_color}35`,
                            borderRadius: 18, padding: "clamp(16px,4vw,24px)",
                            marginBottom: 20, display: "flex",
                            justifyContent: "space-between", alignItems: "center", gap: 16,
                            flexWrap: "wrap"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{
                                    fontSize: "clamp(40px,10vw,56px)",
                                    filter: `drop-shadow(0 0 16px ${clan.badge_color})`
                                }}>
                                    {clan.badge_emoji}
                                </div>
                                <div>
                                    <div style={{
                                        fontFamily: "Cinzel",
                                        fontSize: "clamp(18px,5vw,26px)", fontWeight: 900,
                                        color: clan.badge_color
                                    }}>
                                        {clan.name}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                                        {clan.tag} · Level {clan.level} ·{" "}
                                        {clan.member_count}/{clan.max_members} members
                                    </div>
                                    <div style={{
                                        fontSize: 11, marginTop: 4,
                                        color: ROLE_COLORS[myRole] || "#6b7280", fontWeight: 700
                                    }}>
                                        {ROLE_LABELS[myRole] || myRole}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{
                                    fontFamily: "Cinzel", fontSize: "clamp(20px,5vw,28px)",
                                    fontWeight: 700, color: "#fbbf24"
                                }}>
                                    {(clan.total_xp || 0).toLocaleString()} XP
                                </div>
                                <div style={{
                                    fontSize: 10, color: "#6b7280",
                                    letterSpacing: ".12em", fontWeight: 700
                                }}>
                                    CLAN XP
                                </div>
                            </div>
                        </div>

                        {/* War alert */}
                        {clanData?.active_war && (
                            <div style={{
                                backgroundImage: "linear-gradient(135deg,rgba(220,38,38,.15),rgba(0,0,0,.4))",
                                border: "1px solid rgba(239,68,68,.35)",
                                borderRadius: 14, padding: "12px 18px", marginBottom: 18,
                                display: "flex", justifyContent: "space-between",
                                alignItems: "center", cursor: "pointer",
                                animation: "borderPulse 2s ease infinite"
                            }}
                                onClick={() => setTab("war")}>
                                <div>
                                    <span style={{ fontSize: 16, marginRight: 8 }}>⚔️</span>
                                    <strong style={{ color: "#fca5a5" }}>
                                        WAR IN PROGRESS
                                    </strong>
                                    <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 8 }}>
                                        vs {clanData.active_war.clan_a_id === clan.id
                                            ? clanData.active_war.clan_b_name
                                            : clanData.active_war.clan_a_name}
                                    </span>
                                </div>
                                <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 13 }}>
                                    VIEW WAR →
                                </span>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="tabs" style={{ marginBottom: 20 }}>
                            {[
                                ["home", "🏠 Clan"],
                                ["room", "💬 Study Room"],
                                ["war", "⚔️ War"],
                                ...(isLeader ? [["search", "🔍 Recruit"]] as const : []),
                            ].map(([t, l]) => (
                                <button key={t} className="tab"
                                    onClick={() => setTab(t as any)} style={{
                                        backgroundImage: tab === t
                                            ? "linear-gradient(135deg,rgba(124,58,237,.5),rgba(190,24,93,.4))"
                                            : "none",
                                        background: tab === t ? undefined : "transparent",
                                        color: tab === t ? "#e9d5ff" : "#6b7280",
                                        boxShadow: tab === t ? "0 0 16px rgba(124,58,237,.3)" : "none",
                                    }}>
                                    {l}
                                </button>
                            ))}
                        </div>

                        {/* ── HOME TAB ──────────────────────────────────────────── */}
                        {tab === "home" && (
                            <div style={{ animation: "fadeIn .3s ease-out" }}>
                                {clan.description && (
                                    <div style={{
                                        background: "rgba(0,0,0,.35)",
                                        border: "1px solid rgba(255,255,255,.07)",
                                        borderRadius: 12, padding: "14px 18px", marginBottom: 18,
                                        fontSize: 14, color: "#d1d5db", lineHeight: 1.6
                                    }}>
                                        📜 {clan.description}
                                    </div>
                                )}

                                <div style={{
                                    fontFamily: "Cinzel", fontSize: 13, fontWeight: 700,
                                    color: "#9ca3af", letterSpacing: ".15em", marginBottom: 14
                                }}>
                                    MEMBERS ({members.length})
                                </div>
                                <div className="members-grid">
                                    {members.map((m: any, i: number) => (
                                        <div key={m.user_id} style={{
                                            background: m.user_id === user?.id
                                                ? "rgba(124,58,237,.12)" : "rgba(255,255,255,.025)",
                                            border: `1px solid ${m.user_id === user?.id
                                                ? "rgba(168,85,247,.3)" : "rgba(255,255,255,.06)"}`,
                                            borderRadius: 12, padding: "12px 14px",
                                            display: "flex", alignItems: "center", gap: 12,
                                            animation: `fadeIn .3s ease-out ${i * .05}s both`
                                        }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: "50%",
                                                backgroundImage: `linear-gradient(135deg,${clan.badge_color}88,${clan.badge_color}44)`,
                                                display: "flex", alignItems: "center",
                                                justifyContent: "center", fontSize: 14,
                                                fontWeight: 700, fontFamily: "Cinzel",
                                                flexShrink: 0
                                            }}>
                                                {m.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: 700, fontSize: 13,
                                                    overflow: "hidden", textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    color: m.user_id === user?.id ? "#c084fc" : "#e2e8f0"
                                                }}>
                                                    {m.username}
                                                    {m.user_id === user?.id && (
                                                        <span style={{
                                                            fontSize: 9, color: "#7c3aed",
                                                            marginLeft: 6
                                                        }}>(you)</span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>
                                                    Lv.{m.level} · {(m.xp || 0).toLocaleString()} XP
                                                </div>
                                            </div>
                                            <div style={{
                                                fontSize: 10, color: ROLE_COLORS[m.role] || "#6b7280",
                                                fontWeight: 700, flexShrink: 0
                                            }}>
                                                {m.role === "leader" ? "👑" : m.role === "co_leader" ? "⭐" : ""}
                                                {m.role === "leader" ? "L" : m.role === "co_leader" ? "CL" : ""}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── STUDY ROOM TAB ────────────────────────────────────── */}
                        {tab === "room" && (
                            <div style={{ animation: "fadeIn .3s ease-out" }}>
                                <div style={{
                                    backgroundImage: "linear-gradient(135deg,rgba(6,182,212,.08),rgba(0,0,0,.5))",
                                    border: "1px solid rgba(6,182,212,.18)",
                                    borderRadius: 18, overflow: "hidden"
                                }}>
                                    {/* Chat header */}
                                    <div style={{
                                        background: "rgba(0,0,0,.5)",
                                        borderBottom: "1px solid rgba(6,182,212,.12)",
                                        padding: "12px 18px", display: "flex",
                                        justifyContent: "space-between", alignItems: "center"
                                    }}>
                                        <div style={{
                                            fontFamily: "Cinzel", fontSize: 12,
                                            fontWeight: 700, color: "#22d3ee",
                                            letterSpacing: ".15em"
                                        }}>
                                            💬 STUDY ROOM — {clan.name}
                                        </div>
                                        <div style={{
                                            fontSize: 10, color: "#22c55e",
                                            fontWeight: 700, animation: "pulse 1.5s infinite"
                                        }}>
                                            ● LIVE
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div ref={chatRef} style={{
                                        height: "clamp(300px,45vh,460px)",
                                        overflowY: "auto", padding: "14px 18px",
                                        display: "flex", flexDirection: "column", gap: 12
                                    }}>
                                        {messages.length === 0 && (
                                            <div style={{
                                                textAlign: "center", padding: 40,
                                                color: "#374151", fontSize: 13
                                            }}>
                                                No messages yet. Start the study session!
                                            </div>
                                        )}
                                        {messages.map((msg, i) => (
                                            <div key={msg.id} style={{
                                                display: "flex", gap: 10, alignItems: "flex-start",
                                                animation: `fadeIn .2s ease-out ${i * .02}s both`,
                                                flexDirection: msg.user_id === user?.id ? "row-reverse" : "row"
                                            }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: "50%",
                                                    backgroundImage: msg.user_id === user?.id
                                                        ? "linear-gradient(135deg,#7c3aed,#db2777)"
                                                        : `linear-gradient(135deg,${clan.badge_color}88,${clan.badge_color}44)`,
                                                    display: "flex", alignItems: "center",
                                                    justifyContent: "center", fontSize: 12,
                                                    fontWeight: 700, flexShrink: 0
                                                }}>
                                                    {msg.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{
                                                    maxWidth: "72%",
                                                    textAlign: msg.user_id === user?.id ? "right" : "left"
                                                }}>
                                                    <div style={{
                                                        fontSize: 10, color: "#6b7280",
                                                        marginBottom: 3, display: "flex", alignItems: "center",
                                                        gap: 5,
                                                        justifyContent: msg.user_id === user?.id
                                                            ? "flex-end" : "flex-start"
                                                    }}>
                                                        <span>{MSG_TYPE_ICONS[msg.msg_type] || "💬"}</span>
                                                        <strong style={{ color: MSG_TYPE_COLORS[msg.msg_type] || "#9ca3af" }}>
                                                            {msg.username}
                                                        </strong>
                                                        <span>·</span>
                                                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                    </div>
                                                    <div style={{
                                                        background: msg.user_id === user?.id
                                                            ? "rgba(124,58,237,.25)"
                                                            : msg.msg_type === "question"
                                                                ? "rgba(96,165,250,.12)"
                                                                : msg.msg_type === "announcement"
                                                                    ? "rgba(251,191,36,.12)"
                                                                    : "rgba(255,255,255,.06)",
                                                        border: `1px solid ${msg.user_id === user?.id
                                                            ? "rgba(168,85,247,.3)"
                                                            : msg.msg_type === "question"
                                                                ? "rgba(96,165,250,.3)"
                                                                : msg.msg_type === "announcement"
                                                                    ? "rgba(251,191,36,.3)"
                                                                    : "rgba(255,255,255,.08)"}`,
                                                        borderRadius: msg.user_id === user?.id
                                                            ? "14px 14px 4px 14px"
                                                            : "14px 14px 14px 4px",
                                                        padding: "9px 13px", fontSize: 13,
                                                        color: "#e2e8f0", lineHeight: 1.55,
                                                        wordBreak: "break-word"
                                                    }}>
                                                        {msg.body}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Message type selector */}
                                    <div style={{
                                        borderTop: "1px solid rgba(255,255,255,.05)",
                                        padding: "10px 18px 0",
                                        display: "flex", gap: 6
                                    }}>
                                        {Object.entries(MSG_TYPE_ICONS).map(([type, icon]) => (
                                            <button key={type} onClick={() => setMsgType(type)} style={{
                                                background: msgType === type
                                                    ? `${MSG_TYPE_COLORS[type]}22` : "transparent",
                                                border: `1px solid ${msgType === type
                                                    ? MSG_TYPE_COLORS[type] + "44" : "rgba(255,255,255,.06)"}`,
                                                borderRadius: 20, padding: "4px 10px",
                                                fontSize: 11, cursor: "pointer",
                                                color: msgType === type
                                                    ? MSG_TYPE_COLORS[type] : "#6b7280",
                                                fontWeight: 600, transition: "all .15s"
                                            }}>
                                                {icon} {type}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Input */}
                                    <div style={{
                                        padding: "10px 18px 18px",
                                        display: "flex", gap: 8
                                    }}>
                                        <input value={msgInput}
                                            onChange={e => setMsgInput(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                                            placeholder={`Send a ${msgType}... (Enter to send)`}
                                            style={{
                                                flex: 1, background: "rgba(0,0,0,.5)",
                                                border: "1px solid rgba(255,255,255,.1)",
                                                borderRadius: 12, padding: "11px 14px",
                                                color: "#e2e8f0", fontSize: 13,
                                                fontFamily: "Rajdhani", fontWeight: 500, outline: "none"
                                            }} />
                                        <button onClick={handleSendMessage}
                                            disabled={!msgInput.trim()}
                                            style={{
                                                backgroundImage: "linear-gradient(135deg,#06b6d4,#0891b2)",
                                                border: "none", borderRadius: 12, padding: "11px 18px",
                                                color: "#fff", cursor: "pointer", fontSize: 16,
                                                opacity: msgInput.trim() ? 1 : .4
                                            }}>
                                            ➤
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── WAR TAB ───────────────────────────────────────────── */}
                        {tab === "war" && (
                            <div style={{ animation: "fadeIn .3s ease-out" }}>

                                {/* Disclaimer */}
                                <div style={{
                                    backgroundImage: "linear-gradient(135deg,rgba(30,58,138,.3),rgba(88,28,135,.3))",
                                    border: "1px solid rgba(99,102,241,.3)",
                                    borderRadius: 14, padding: "16px 20px", marginBottom: 20
                                }}>
                                    <div style={{
                                        fontFamily: "Cinzel", fontSize: 12,
                                        fontWeight: 700, color: "#818cf8",
                                        letterSpacing: ".15em", marginBottom: 8
                                    }}>
                                        ☮️ ABOUT CLAN WARS
                                    </div>
                                    <p style={{ fontSize: 13, color: "#a5b4fc", lineHeight: 1.7, margin: 0 }}>
                                        <strong>EduRPG is firmly against real-world conflict.</strong> Clan Wars
                                        are a <strong>purely academic competition</strong> — students battle by
                                        answering quiz questions, not through any form of aggression. The goal
                                        is learning together, testing knowledge and celebrating academic
                                        excellence. Win with wisdom, not weapons. 📚
                                    </p>
                                </div>

                                {warData?.has_war ? (
                                    <WarView
                                        warData={warData}
                                        clan={clan}
                                        userId={user?.id}
                                        isLeader={isLeader}
                                        members={members}
                                        onRefresh={loadWar}
                                        token={token || ""}
                                    />
                                ) : (
                                    <NoClanWar
                                        isLeader={isLeader}
                                        clanId={clan.id}
                                        token={token || ""}
                                        onDeclared={loadWar}
                                    />
                                )}
                            </div>
                        )}

                        {/* ── RECRUIT TAB (leaders only) ────────────────────────── */}
                        {tab === "search" && isLeader && (
                            <div style={{ animation: "fadeIn .3s ease-out" }}>
                                <div style={{
                                    fontFamily: "Cinzel", fontSize: 12,
                                    color: "#6b7280", letterSpacing: ".15em",
                                    fontWeight: 700, marginBottom: 16
                                }}>
                                    BROWSE & RECRUIT PLAYERS
                                </div>
                                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                                    <input value={searchQ}
                                        onChange={e => setSearchQ(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleSearch()}
                                        placeholder="Search clans..."
                                        style={{
                                            flex: 1, background: "rgba(0,0,0,.5)",
                                            border: "1px solid rgba(255,255,255,.1)",
                                            borderRadius: 12, padding: "12px 16px",
                                            color: "#e2e8f0", fontSize: 14,
                                            fontFamily: "Rajdhani", fontWeight: 500, outline: "none"
                                        }} />
                                    <button onClick={handleSearch} style={{
                                        backgroundImage: "linear-gradient(135deg,#7c3aed,#be185d)",
                                        border: "none", borderRadius: 12, padding: "12px 20px",
                                        color: "#fff", fontFamily: "Cinzel",
                                        fontSize: 12, fontWeight: 700, cursor: "pointer"
                                    }}>
                                        🔍
                                    </button>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {searchResults.map((c, i) => (
                                        <ClanCard key={c.id} clan={c} i={i} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Sub-components ──────────────────────────────────────────────────

function ClanCard({ clan, i, onJoin }: { clan: any; i: number; onJoin?: () => void }) {
    return (
        <div style={{
            backgroundImage: `linear-gradient(135deg,${clan.badge_color}10,rgba(0,0,0,.4))`,
            border: `1px solid ${clan.badge_color}28`,
            borderRadius: 14, padding: "14px 18px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 12,
            animation: `fadeIn .3s ease-out ${i * .06}s both`,
            flexWrap: "wrap"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                    fontSize: 32,
                    filter: `drop-shadow(0 0 8px ${clan.badge_color})`
                }}>
                    {clan.badge_emoji}
                </span>
                <div>
                    <div style={{
                        fontFamily: "Cinzel", fontSize: 15,
                        fontWeight: 700, color: clan.badge_color
                    }}>
                        {clan.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                        {clan.tag} · {clan.member_count} members · Level {clan.level}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                        Leader: {clan.leader_name} · {(clan.total_xp || 0).toLocaleString()} XP
                    </div>
                </div>
            </div>
            {onJoin && (
                <button onClick={onJoin} style={{
                    backgroundImage: "linear-gradient(135deg,#7c3aed,#be185d)",
                    border: "none", borderRadius: 10, padding: "9px 18px",
                    color: "#fff", fontFamily: "Cinzel",
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 0 14px rgba(124,58,237,.35)",
                    whiteSpace: "nowrap"
                }}>
                    JOIN →
                </button>
            )}
        </div>
    );
}

function NoClanWar({ isLeader, clanId, token, onDeclared }:
    { isLeader: boolean; clanId: string; token: string; onDeclared: () => void }) {
    const [targetId, setTargetId] = useState("");
    const [topic, setTopic] = useState("python-basics");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const headers = { Authorization: `Bearer ${token}` };

    const declare = async () => {
        if (!targetId.trim()) return;
        setLoading(true); setError("");
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/clan/war/declare`,
                { target_clan_id: targetId, topic }, { headers });
            onDeclared();
        } catch (e: any) {
            setError(e.response?.data?.detail || "Could not declare war");
        } finally { setLoading(false); }
    };

    return (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{
                fontSize: 64, marginBottom: 16,
                filter: "drop-shadow(0 0 16px rgba(239,68,68,.6))"
            }}>⚔️</div>
            <div style={{
                fontFamily: "Cinzel", fontSize: 22,
                fontWeight: 700, color: "#9ca3af", marginBottom: 8
            }}>
                NO ACTIVE WAR
            </div>
            <p style={{ color: "#4b5563", fontSize: 14, marginBottom: 28 }}>
                Your clan is at peace. Challenge another clan to a knowledge battle!
            </p>
            {isLeader && (
                <div style={{
                    background: "rgba(0,0,0,.4)",
                    border: "1px solid rgba(239,68,68,.2)",
                    borderRadius: 16, padding: "24px",
                    maxWidth: 400, margin: "0 auto",
                    textAlign: "left"
                }}>
                    <div style={{
                        fontFamily: "Cinzel", fontSize: 12,
                        fontWeight: 700, color: "#f87171",
                        letterSpacing: ".15em", marginBottom: 16
                    }}>
                        🚨 DECLARE ACADEMIC WAR
                    </div>
                    {error && (
                        <div style={{
                            background: "rgba(127,29,29,.3)",
                            border: "1px solid rgba(239,68,68,.3)",
                            borderRadius: 8, padding: "8px 12px",
                            fontSize: 12, color: "#fca5a5",
                            marginBottom: 12
                        }}>
                            {error}
                        </div>
                    )}
                    <input value={targetId}
                        onChange={e => setTargetId(e.target.value)}
                        placeholder="Target Clan ID"
                        style={{
                            width: "100%", background: "rgba(0,0,0,.5)",
                            border: "1px solid rgba(255,255,255,.1)",
                            borderRadius: 10, padding: "11px 14px",
                            color: "#e2e8f0", fontSize: 13,
                            fontFamily: "Rajdhani", fontWeight: 500,
                            outline: "none", marginBottom: 10
                        }} />
                    <select value={topic}
                        onChange={e => setTopic(e.target.value)}
                        style={{
                            width: "100%", background: "#0a0a15",
                            border: "1px solid rgba(255,255,255,.1)",
                            borderRadius: 10, padding: "11px 14px",
                            color: "#e2e8f0", fontSize: 13,
                            fontFamily: "Rajdhani", outline: "none",
                            marginBottom: 14
                        }}>
                        {["python-basics", "python-loops", "algebra-basics", "calculus",
                            "physics-mechanics", "chemistry", "machine-learning"].map(t => (
                                <option key={t} value={t}>
                                    {t.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                            ))}
                    </select>
                    <button onClick={declare} disabled={loading || !targetId.trim()}
                        style={{
                            width: "100%",
                            backgroundImage: "linear-gradient(135deg,#dc2626,#991b1b)",
                            border: "none", borderRadius: 10, padding: "12px",
                            color: "#fff", fontFamily: "Cinzel",
                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                            opacity: (!targetId.trim() || loading) ? .5 : 1,
                            boxShadow: "0 0 20px rgba(220,38,38,.4)"
                        }}>
                        {loading ? "⏳ Declaring..." : "⚔️ DECLARE WAR"}
                    </button>
                    <p style={{
                        fontSize: 10, color: "#4b5563",
                        marginTop: 10, textAlign: "center"
                    }}>
                        24h preparation, then 24h war window
                    </p>
                </div>
            )}
        </div>
    );
}

function WarView({ warData, clan, userId, isLeader, members, onRefresh, token }:
    {
        warData: any; clan: any; userId: string; isLeader: boolean;
        members: any[]; onRefresh: () => void; token: string
    }) {
    const war = warData.war;
    const matchups = warData.matchups || [];
    const mine = warData.my_matchups || [];
    const [assigning, setAssigning] = useState(false);
    const [form, setForm] = useState({ attacker_id: "", defender_id: "", topic: "python-basics" });
    const [error, setError] = useState("");
    const headers = { Authorization: `Bearer ${token}` };

    const isA = war.clan_a_id === clan.id;
    const myScore = isA ? war.clan_a_score : war.clan_b_score;
    const theirScore = isA ? war.clan_b_score : war.clan_a_score;
    const enemyName = isA ? war.clan_b_name : war.clan_a_name;
    const winning = myScore > theirScore;
    const statusColor = war.status === "ended"
        ? (war.winner_clan_id === clan.id ? "#22c55e" : "#ef4444") : "#fbbf24";

    const assign = async () => {
        setError("");
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/clan/war/assign`,
                { war_id: war.id, ...form }, { headers });
            setAssigning(false);
            onRefresh();
        } catch (e: any) {
            setError(e.response?.data?.detail || "Error assigning matchup");
        }
    };

    return (
        <div>
            {/* Scoreboard */}
            <div style={{
                backgroundImage: "linear-gradient(135deg,rgba(220,38,38,.15),rgba(0,0,0,.5))",
                border: `2px solid ${statusColor}35`,
                borderRadius: 18, padding: "clamp(16px,4vw,24px)",
                marginBottom: 20, textAlign: "center"
            }}>
                <div style={{
                    fontSize: 10, color: statusColor,
                    fontFamily: "Cinzel", letterSpacing: ".2em",
                    fontWeight: 700, marginBottom: 12
                }}>
                    {war.status === "preparation" ? "⏳ PREPARATION PHASE"
                        : war.status === "active" ? "⚔️ WAR IN PROGRESS"
                            : war.winner_clan_id === clan.id ? "🏆 VICTORY!"
                                : war.winner_clan_id ? "💀 DEFEAT" : "🤝 DRAW"}
                </div>
                <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: "clamp(16px,5vw,40px)"
                }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{
                            fontSize: "clamp(22px,6vw,32px)",
                            fontFamily: "Cinzel", fontWeight: 900,
                            color: winning ? "#22c55e" : "#e2e8f0"
                        }}>
                            {myScore}
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                            {clan.badge_emoji} {clan.name}
                        </div>
                    </div>
                    <div style={{
                        fontFamily: "Cinzel",
                        fontSize: "clamp(20px,5vw,28px)", fontWeight: 900,
                        color: "#ef4444"
                    }}>VS</div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{
                            fontSize: "clamp(22px,6vw,32px)",
                            fontFamily: "Cinzel", fontWeight: 900,
                            color: !winning ? "#22c55e" : "#e2e8f0"
                        }}>
                            {theirScore}
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                            ⚔️ {enemyName}
                        </div>
                    </div>
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 12 }}>
                    Topic: <span style={{ color: "#c084fc", fontWeight: 700 }}>
                        {war.topic.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                    {" · "}Ends: {new Date(war.end_time).toLocaleString()}
                </div>
            </div>

            {/* Assign matchup (leader only) */}
            {isLeader && war.status !== "ended" && (
                <div style={{ marginBottom: 20 }}>
                    <button onClick={() => setAssigning(v => !v)} style={{
                        backgroundImage: "linear-gradient(135deg,#dc2626,#7c3aed)",
                        border: "none", borderRadius: 12, padding: "11px 24px",
                        color: "#fff", fontFamily: "Cinzel",
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                        letterSpacing: ".08em", marginBottom: assigning ? 14 : 0
                    }}>
                        {assigning ? "✕ Cancel" : "⚔️ ASSIGN MATCHUP"}
                    </button>
                    {assigning && (
                        <div style={{
                            background: "rgba(0,0,0,.4)",
                            border: "1px solid rgba(255,255,255,.08)",
                            borderRadius: 14, padding: "18px",
                            animation: "slideUp .25s ease-out"
                        }}>
                            {error && <div style={{
                                color: "#f87171",
                                fontSize: 12, marginBottom: 10
                            }}>{error}</div>}
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <select value={form.attacker_id}
                                    onChange={e => setForm({ ...form, attacker_id: e.target.value })}
                                    style={{
                                        background: "#0a0a15",
                                        border: "1px solid rgba(255,255,255,.1)",
                                        borderRadius: 10, padding: "10px 14px",
                                        color: "#e2e8f0", fontSize: 13,
                                        fontFamily: "Rajdhani", outline: "none"
                                    }}>
                                    <option value="">Select YOUR member (attacker)...</option>
                                    {members.map(m => (
                                        <option key={m.user_id} value={m.user_id}>
                                            {m.username} (Lv.{m.level})
                                        </option>
                                    ))}
                                </select>
                                <input value={form.defender_id}
                                    onChange={e => setForm({ ...form, defender_id: e.target.value })}
                                    placeholder="Enemy player ID to defend"
                                    style={{
                                        background: "rgba(0,0,0,.5)",
                                        border: "1px solid rgba(255,255,255,.1)",
                                        borderRadius: 10, padding: "10px 14px",
                                        color: "#e2e8f0", fontSize: 13,
                                        fontFamily: "Rajdhani", fontWeight: 500,
                                        outline: "none"
                                    }} />
                                <select value={form.topic}
                                    onChange={e => setForm({ ...form, topic: e.target.value })}
                                    style={{
                                        background: "#0a0a15",
                                        border: "1px solid rgba(255,255,255,.1)",
                                        borderRadius: 10, padding: "10px 14px",
                                        color: "#e2e8f0", fontSize: 13,
                                        fontFamily: "Rajdhani", outline: "none"
                                    }}>
                                    {["python-basics", "python-loops", "python-functions",
                                        "algebra-basics", "calculus", "physics-mechanics",
                                        "chemistry", "machine-learning", "neural-networks"].map(t => (
                                            <option key={t} value={t}>
                                                {t.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
                                        ))}
                                </select>
                                <button onClick={assign}
                                    disabled={!form.attacker_id || !form.defender_id}
                                    style={{
                                        backgroundImage: "linear-gradient(135deg,#dc2626,#991b1b)",
                                        border: "none", borderRadius: 10, padding: "11px",
                                        color: "#fff", fontFamily: "Cinzel",
                                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                                        opacity: (!form.attacker_id || !form.defender_id) ? .5 : 1
                                    }}>
                                    ⚔️ ASSIGN BATTLE
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Matchups list */}
            <div style={{
                fontFamily: "Cinzel", fontSize: 12, fontWeight: 700,
                color: "#9ca3af", letterSpacing: ".15em", marginBottom: 12
            }}>
                BATTLE MATCHUPS ({matchups.length})
            </div>
            <div className="war-matchups">
                {matchups.map((m: any, i: number) => (
                    <div key={m.id} style={{
                        background: m.result === "attacker_won"
                            ? "rgba(34,197,94,.08)" : m.result === "defender_won"
                                ? "rgba(239,68,68,.08)" : "rgba(255,255,255,.025)",
                        border: `1px solid ${m.result === "attacker_won"
                            ? "rgba(34,197,94,.25)" : m.result === "defender_won"
                                ? "rgba(239,68,68,.25)" : "rgba(255,255,255,.07)"}`,
                        borderRadius: 12, padding: "12px 16px",
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", gap: 10,
                        flexWrap: "wrap",
                        animation: `fadeIn .3s ease-out ${i * .06}s both`
                    }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>
                                <span style={{ color: "#60a5fa" }}>{m.attacker_name}</span>
                                <span style={{ color: "#6b7280", margin: "0 8px" }}>vs</span>
                                <span style={{ color: "#f87171" }}>{m.defender_name}</span>
                            </div>
                            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 3 }}>
                                {m.topic.replace(/-/g, " ")} ·{" "}
                                {m.status === "completed"
                                    ? `${m.attacker_score} - ${m.defender_score}`
                                    : "Pending"}
                            </div>
                        </div>
                        <div style={{
                            fontSize: 12, fontWeight: 700,
                            color: m.result === "attacker_won" ? "#22c55e"
                                : m.result === "defender_won" ? "#ef4444"
                                    : m.result === "draw" ? "#f59e0b" : "#6b7280"
                        }}>
                            {m.result === "attacker_won" ? "⚔️ Attacker Won"
                                : m.result === "defender_won" ? "🛡️ Defender Won"
                                    : m.result === "draw" ? "🤝 Draw"
                                        : "⏳ In Progress"}
                        </div>
                    </div>
                ))}
                {matchups.length === 0 && (
                    <div style={{
                        textAlign: "center", padding: 32,
                        color: "#374151", fontSize: 13
                    }}>
                        No matchups assigned yet.
                        {isLeader ? " Use 'Assign Matchup' to deploy your warriors." : ""}
                    </div>
                )}
            </div>
        </div>
    );
}
