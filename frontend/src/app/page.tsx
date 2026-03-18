"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

// ─── Types ────────────────────────────────────────────────────────────
interface Hero {
  id: string;
  name: string;
  subject: string;
  attack_power: number;
  defense: number;
  max_hp: number;
  skill_name: string;
  sprite_key: string;
  unlock_level: number;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

// ─── Hero config ──────────────────────────────────────────────────────

const HERO_CONFIG: Record<string, {
  emoji: string;
  color: string;
  glow: string;
  bg: string;
  accent: string;
  attackEmoji: string;
}> = {
  samurai: {
    emoji: "🗡️",
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.6)",
    bg: "linear-gradient(135deg,#0c1a2e,#1e3a5f)",
    accent: "#3b82f6",
    attackEmoji: "⚔️",
  },
  wizard: {
    emoji: "🔮",
    color: "#c084fc",
    glow: "rgba(192,132,252,0.6)",
    bg: "linear-gradient(135deg,#1a0c2e,#3b1f5f)",
    accent: "#a855f7",
    attackEmoji: "✨",
  },
  archer: {
    emoji: "🏹",
    color: "#34d399",
    glow: "rgba(52,211,153,0.6)",
    bg: "linear-gradient(135deg,#062318,#0d3d26)",
    accent: "#10b981",
    attackEmoji: "🎯",
  },
  ninja: {
    emoji: "🥷",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.6)",
    bg: "linear-gradient(135deg,#0c2e14,#1a5f22)",
    accent: "#22c55e",
    attackEmoji: "🌀",
  },
  knight: {
    emoji: "🛡️",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.6)",
    bg: "linear-gradient(135deg,#2e1c0c,#5f3a0a)",
    accent: "#f59e0b",
    attackEmoji: "💥",
  },
  robot: {
    emoji: "🤖",
    color: "#f87171",
    glow: "rgba(248,113,113,0.6)",
    bg: "linear-gradient(135deg,#2e0c0c,#5f1a1a)",
    accent: "#ef4444",
    attackEmoji: "⚡",
  },
  druid: {
    emoji: "🌿",
    color: "#86efac",
    glow: "rgba(134,239,172,0.6)",
    bg: "linear-gradient(135deg,#0c2a12,#164b1e)",
    accent: "#22c55e",
    attackEmoji: "🍃",
  },
  berserker: {
    emoji: "🪓",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.6)",
    bg: "linear-gradient(135deg,#2e1200,#5c2800)",
    accent: "#ea580c",
    attackEmoji: "💢",
  },
  oracle: {
    emoji: "🔯",
    color: "#e879f9",
    glow: "rgba(232,121,249,0.6)",
    bg: "linear-gradient(135deg,#2a0c3a,#4a1460)",
    accent: "#d946ef",
    attackEmoji: "🌙",
  },
  titan: {
    emoji: "👑",
    color: "#ffd700",
    glow: "rgba(255,215,0,0.7)",
    bg: "linear-gradient(135deg,#1a1500,#3a2e00)",
    accent: "#eab308",
    attackEmoji: "☄️",
  },
};

const TOPIC_ICONS: Record<string, string> = {
  "python-basics": "🐍",
  "python-loops": "🔄",
  "python-functions": "⚙️",
  "python-oop": "🏗️",
  "algebra-basics": "📐",
  "calculus": "∫",
  "physics-mechanics": "⚡",
  "chemistry": "🧪",
  "machine-learning": "🤖",
  "neural-networks": "🧠",
};

const MONSTER_EMOJIS: Record<string, string> = {
  "python-basics": "🐍",
  "python-loops": "🐉",
  "python-functions": "👻",
  "python-oop": "💀",
  "algebra-basics": "👹",
  "calculus": "🧟",
  "physics-mechanics": "🗿",
  "chemistry": "🧌",
  "machine-learning": "👾",
  "neural-networks": "🦾",
};

// ─── Global CSS injected once ─────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #030712;
    color: #fff;
    font-family: 'Rajdhani', sans-serif;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0a0a0f; }
  ::-webkit-scrollbar-thumb { background: #4c1d95; border-radius: 2px; }

  @keyframes twinkle {
    0%,100% { opacity:0.1; transform:scale(0.7); }
    50% { opacity:0.9; transform:scale(1.3); }
  }
  @keyframes floatUp {
    0% { opacity:1; transform:translateY(0) scale(1); }
    100% { opacity:0; transform:translateY(-80px) scale(1.4); }
  }
  @keyframes shake {
    0%,100% { transform:translateX(0); }
    20% { transform:translateX(-12px); }
    40% { transform:translateX(12px); }
    60% { transform:translateX(-8px); }
    80% { transform:translateX(8px); }
  }
  @keyframes heroAttack {
    0% { transform:translateX(0) scale(1); }
    40% { transform:translateX(60px) scale(1.2); }
    60% { transform:translateX(50px) scale(1.15); }
    100% { transform:translateX(0) scale(1); }
  }
  @keyframes monsterAttack {
    0% { transform:translateX(0) scale(1); }
    40% { transform:translateX(-60px) scale(1.2); }
    60% { transform:translateX(-50px) scale(1.15); }
    100% { transform:translateX(0) scale(1); }
  }
  @keyframes heroFloat {
    0%,100% { transform:translateY(0px); }
    50% { transform:translateY(-10px); }
  }
  @keyframes monsterFloat {
    0%,100% { transform:translateY(0px) scaleX(-1); }
    50% { transform:translateY(-8px) scaleX(-1); }
  }
  @keyframes pulseGlow {
    0%,100% { opacity:0.4; transform:scale(1); }
    50% { opacity:0.8; transform:scale(1.1); }
  }
  @keyframes scanLine {
    0% { transform:translateY(-100%); }
    100% { transform:translateY(100vh); }
  }
  @keyframes fadeSlideIn {
    from { opacity:0; transform:translateY(30px); }
    to { opacity:1; transform:translateY(0); }
  }
  @keyframes slideRight {
    from { width:0%; }
    to { width:100%; }
  }
  @keyframes borderPulse {
    0%,100% { border-color: rgba(168,85,247,0.3); box-shadow: 0 0 0 rgba(168,85,247,0); }
    50% { border-color: rgba(168,85,247,0.8); box-shadow: 0 0 20px rgba(168,85,247,0.3); }
  }
  @keyframes spin {
    from { transform:rotate(0deg); }
    to { transform:rotate(360deg); }
  }
  @keyframes bossGlow {
    0%,100% { text-shadow: 0 0 10px #ef4444, 0 0 20px #ef4444; }
    50% { text-shadow: 0 0 20px #ef4444, 0 0 40px #ef4444, 0 0 60px #ef4444; }
  }
  @keyframes xpPop {
    0% { opacity:0; transform:scale(0.5) translateY(0); }
    50% { opacity:1; transform:scale(1.3) translateY(-20px); }
    100% { opacity:0; transform:scale(1) translateY(-50px); }
  }
  @keyframes groundShake {
    0%,100% { transform:translateX(0); }
    25% { transform:translateX(-3px); }
    75% { transform:translateX(3px); }
  }
  @keyframes hitFlash {
    0%,100% { filter:brightness(1); }
    50% { filter:brightness(3) saturate(0); }
  }
  @keyframes critFlash {
    0% { opacity:0; transform:scale(0.3) rotate(-15deg); }
    40% { opacity:1; transform:scale(1.2) rotate(5deg); }
    100% { opacity:0; transform:scale(0.8) rotate(-5deg) translateY(-60px); }
  }
  @keyframes modalIn {
    from { opacity:0; transform:scale(0.85) translateY(20px); }
    to { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes gradientShift {
    0% { background-position:0% 50%; }
    50% { background-position:100% 50%; }
    100% { background-position:0% 50%; }
  }
  @keyframes topicReveal {
    from { opacity:0; transform:translateY(20px) scale(0.95); }
    to { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes vsFlash {
    0%,100% { color:#ef4444; text-shadow:0 0 10px #ef4444; transform:scale(1); }
    50% { color:#fbbf24; text-shadow:0 0 20px #fbbf24, 0 0 40px #fbbf24; transform:scale(1.1); }
  }
  @keyframes battleEntry {
    from { opacity:0; transform:scale(0.5) rotate(-10deg); }
    to { opacity:1; transform:scale(1) rotate(0deg); }
  }
`;

// ─── Inject styles ────────────────────────────────────────────────────
function StyleInjector() {
  useEffect(() => {
    if (document.getElementById("edurpg-styles")) return;
    const style = document.createElement("style");
    style.id = "edurpg-styles";
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => { document.getElementById("edurpg-styles")?.remove(); };
  }, []);
  return null;
}

// ─── HP Bar ───────────────────────────────────────────────────────────
function HPBar({ current, max, color, label }: {
  current: number; max: number; color: string; label: string;
}) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const barColor = pct > 60 ? "#22c55e" : pct > 30 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ width: "100%" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 11, color: "#9ca3af", marginBottom: 4, fontFamily: "Rajdhani",
        fontWeight: 600, letterSpacing: "0.05em"
      }}>
        <span>{label}</span>
        <span style={{ color: barColor }}>{current}/{max}</span>
      </div>
      <div style={{
        height: 10, background: "rgba(0,0,0,0.5)",
        borderRadius: 5, overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
          borderRadius: 5,
          boxShadow: `0 0 8px ${barColor}`,
          transition: "width 0.5s ease",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0,
            width: 20,
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.4))",
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const [isActive, setIsActive] = useState(true);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selected, setSelected] = useState<Hero | null>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [token, setToken] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authData, setAuthData] = useState({ username: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [stars, setStars] = useState<Star[]>([]);

  // Battle preview state
  const [previewAttack, setPreviewAttack] = useState<"hero" | "monster" | null>(null);
  const [dmgFloat, setDmgFloat] = useState<{ val: number; isHero: boolean } | null>(null);
  const [showCrit, setShowCrit] = useState(false);
  const [heroHP, setHeroHP] = useState(100);
  const [monsterHP, setMonsterHP] = useState(100);
  const [battleLog, setBattleLog] = useState("Choose your hero and topic to begin...");

  const TOPICS = Object.keys(TOPIC_ICONS);

  // Stars
  useEffect(() => {
    setStars(Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.7 + 0.1,
    })));
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    fetchHeroes();
  }, []);

  // Demo battle animation loop when hero + topic selected
  useEffect(() => {
    if (!selected || !topic) return;
    setHeroHP(100);
    setMonsterHP(100);

    const interval = setInterval(() => {
      const isHeroTurn = Math.random() > 0.4;
      const dmg = Math.floor(Math.random() * 25) + 10;
      const isCrit = Math.random() < 0.2;

      if (isHeroTurn) {
        setPreviewAttack("hero");
        setMonsterHP(prev => Math.max(10, prev - dmg));
        setBattleLog(isCrit
          ? `🌟 CRITICAL HIT! ${selected.name} deals ${dmg * 2} damage!`
          : `⚔️ ${selected.name} attacks for ${dmg} damage!`);
        if (isCrit) {
          setShowCrit(true);
          setTimeout(() => setShowCrit(false), 1200);
        }
      } else {
        setPreviewAttack("monster");
        setHeroHP(prev => Math.max(10, prev - Math.floor(dmg * 0.6)));
        setBattleLog(`👹 Monster retaliates for ${Math.floor(dmg * 0.6)} damage!`);
      }

      setDmgFloat({ val: isHeroTurn ? (isCrit ? dmg * 2 : dmg) : Math.floor(dmg * 0.6), isHero: isHeroTurn });
      setTimeout(() => {
        setPreviewAttack(null);
        setDmgFloat(null);
      }, 600);
    }, 2200);

    return () => clearInterval(interval);
  }, [selected?.id, topic]);

  const fetchHeroes = async () => {
    try {
      const res = await axios.get(`${API}/heroes/`);
      setHeroes(res.data);
    } catch {
      // Fallback demo heroes if API fails
      setHeroes([
        { id: "1", name: "Samurai", subject: "Mathematics", attack_power: 25, defense: 12, max_hp: 110, skill_name: "double_strike", sprite_key: "samurai", unlock_level: 1 },
        { id: "2", name: "Wizard", subject: "Programming", attack_power: 30, defense: 8, max_hp: 90, skill_name: "hint_spell", sprite_key: "wizard", unlock_level: 1 },
        { id: "3", name: "Archer", subject: "Science", attack_power: 22, defense: 11, max_hp: 105, skill_name: "precise_shot", sprite_key: "archer", unlock_level: 1 },
        { id: "4", name: "Ninja", subject: "Chemistry", attack_power: 28, defense: 15, max_hp: 100, skill_name: "shadow_dodge", sprite_key: "ninja", unlock_level: 4 },
        { id: "5", name: "Knight", subject: "History", attack_power: 18, defense: 22, max_hp: 140, skill_name: "iron_shield", sprite_key: "knight", unlock_level: 6 },
        { id: "6", name: "Robot", subject: "AI Tech", attack_power: 32, defense: 10, max_hp: 95, skill_name: "data_scan", sprite_key: "robot", unlock_level: 9 },
        { id: "7", name: "Druid", subject: "Biology", attack_power: 20, defense: 14, max_hp: 120, skill_name: "nature_heal", sprite_key: "druid", unlock_level: 11 },
        { id: "8", name: "Berserker", subject: "Physics", attack_power: 40, defense: 5, max_hp: 85, skill_name: "rage_mode", sprite_key: "berserker", unlock_level: 14 },
        { id: "9", name: "Oracle", subject: "Philosophy", attack_power: 24, defense: 16, max_hp: 115, skill_name: "foresight", sprite_key: "oracle", unlock_level: 17 },
        { id: "10", name: "Titan", subject: "All Subjects", attack_power: 35, defense: 20, max_hp: 160, skill_name: "titan_force", sprite_key: "titan", unlock_level: 20 },
      ]);
    } finally {
      setPageLoading(false);
    }
  };

  const handleAuth = async () => {
    setAuthError("");
    try {
      const ep = authMode === "login" ? `${API}/auth/login` : `${API}/auth/register`;
      const payload = authMode === "login"
        ? { email: authData.email, password: authData.password }
        : { username: authData.username, email: authData.email, password: authData.password };
      const res = await axios.post(ep, payload);
      const data = res.data;
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify({ id: data.user_id, username: data.username, level: data.level, xp: data.xp }));
      setToken(data.access_token);
      setUser({ id: data.user_id, username: data.username, level: data.level, xp: data.xp });
      setShowAuth(false);
    } catch (e: any) {
      setAuthError(e.response?.data?.detail || "Something went wrong");
    }
  };

  const handleStartBattle = async () => {
    if (!selected || !topic) return;
    if (!token) { setShowAuth(true); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/heroes/select/${selected.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem("selectedTopic", topic);
      localStorage.setItem("selectedHero", JSON.stringify(selected));
      router.push("/battle");
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to start");
      setLoading(false);
    }
  };

  // Replace your existing cfg function with this:
  const cfg = (hero: any) =>
    HERO_CONFIG[hero?.sprite_key] ?? HERO_CONFIG.wizard;
  const monsterEmoji = topic ? (MONSTER_EMOJIS[topic] || "👹") : "👹";

  if (pageLoading) return (
    <div style={{ minHeight: "100vh", background: "#030712", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <StyleInjector />
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 80, animation: "spin 2s linear infinite", display: "inline-block",
          filter: "drop-shadow(0 0 30px rgba(168,85,247,0.9))"
        }}>⚔️</div>
        <div style={{
          fontFamily: "Cinzel", fontSize: 28, color: "#a855f7",
          marginTop: 24, letterSpacing: "0.3em", animation: "vsFlash 1.5s ease infinite"
        }}>
          LOADING...
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "#a855f7", animation: `heroFloat ${0.6 + i * 0.15}s ease infinite`
            }} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <StyleInjector />
      <div style={{
        minHeight: "100vh", background: "#030712", color: "#fff",
        fontFamily: "Rajdhani", overflowX: "hidden", position: "relative"
      }}>

        {/* ── Star Field ───────────────────────────── */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          {stars.map(s => (
            <div key={s.id} style={{
              position: "absolute",
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.size, height: s.size,
              borderRadius: "50%", background: "#fff",
              animation: `twinkle ${s.duration}s ease-in-out infinite`,
              animationDelay: `${s.delay}s`,
              opacity: s.opacity,
            }} />
          ))}
          {/* Nebula orbs */}
          <div style={{
            position: "absolute", top: "10%", left: "5%",
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(88,28,135,0.15),transparent 70%)",
            animation: "pulseGlow 5s ease infinite"
          }} />
          <div style={{
            position: "absolute", bottom: "10%", right: "5%",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(30,58,138,0.15),transparent 70%)",
            animation: "pulseGlow 7s ease infinite", animationDelay: "2s"
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(127,29,29,0.08),transparent 70%)",
            animation: "pulseGlow 9s ease infinite", animationDelay: "4s"
          }} />
          {/* Scan line */}
          <div style={{
            position: "absolute", left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.08),transparent)",
            animation: "scanLine 12s linear infinite", pointerEvents: "none"
          }} />
        </div>

        {/* ── Navigation ──────────────────────────── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(3,7,18,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(168,85,247,0.2)",
          padding: "14px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              fontSize: 28, animation: "spin 6s linear infinite",
              filter: "drop-shadow(0 0 12px rgba(168,85,247,0.9))", display: "inline-block"
            }}>⚔️</div>
            <div>
              <div style={{
                fontFamily: "Cinzel", fontSize: 22, fontWeight: 900,
                background: "linear-gradient(135deg,#c084fc,#f472b6,#fb923c)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                letterSpacing: "0.1em"
              }}>
                EduRPG
              </div>
              <div style={{
                fontSize: 9, color: "#6b7280", letterSpacing: "0.3em",
                fontWeight: 600
              }}>LEARN · BATTLE · CONQUER</div>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {user && <>
              <NavBtn label="🏆 Leaderboard" onClick={() => router.push("/leaderboard")} />
              <NavBtn label="📚 Training" onClick={() => router.push("/training")} />
              <NavBtn label="⚔️ Multiplayer" onClick={() => router.push("/multiplayer")} />
              <NavBtn label="🛡️ Clan" onClick={() => router.push("/clan")} />
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(88,28,135,0.3)",
                border: "1px solid rgba(168,85,247,0.3)",
                borderRadius: 50, padding: "6px 16px",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg,#7c3aed,#db2777)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                }}>
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{user.username}</span>
                <span style={{
                  fontSize: 11, background: "rgba(234,179,8,0.2)",
                  color: "#fbbf24", border: "1px solid rgba(234,179,8,0.3)",
                  borderRadius: 50, padding: "2px 8px", fontWeight: 700,
                }}>Lv.{user.level}</span>
              </div>
              <button onClick={() => { localStorage.clear(); setToken(""); setUser(null); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#6b7280", fontSize: 12, transition: "color 0.2s"
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>
                Logout
              </button>
            </>}
            {!user && (
              <button onClick={() => setShowAuth(true)} style={{
                background: "linear-gradient(135deg,#7c3aed,#be185d)",
                border: "none", borderRadius: 50, padding: "10px 24px",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 0 20px rgba(124,58,237,0.4)",
                transition: "all 0.3s", letterSpacing: "0.05em",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(124,58,237,0.7)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(124,58,237,0.4)"; }}>
                ⚡ Login / Register
              </button>
            )}
          </div>
        </nav>

        {/* ── Main Content ─────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px", position: "relative", zIndex: 1 }}>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: 60, animation: "fadeSlideIn 0.6s ease-out" }}>
            <div style={{
              display: "inline-block", marginBottom: 16,
              background: "rgba(88,28,135,0.2)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderRadius: 50, padding: "8px 20px",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", color: "#c084fc",
            }}>
              ⚔️ SELECT YOUR CHAMPION
            </div>
            <h1 style={{
              fontFamily: "Cinzel", fontSize: "clamp(40px,7vw,72px)",
              fontWeight: 900, lineHeight: 1.1, marginBottom: 16,
            }}>
              <span style={{ color: "#e2e8f0" }}>Choose </span>
              <span style={{
                backgroundImage: isActive
                  ? "linear-gradient(red, blue)"
                  : "linear-gradient(black, black)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "gradientShift 4s ease infinite",
                filter: "drop-shadow(0 0 20px rgba(192,132,252,0.5))",
              }}>Your Hero</span>
            </h1>
            <p style={{ color: "#6b7280", fontSize: 18, fontWeight: 500 }}>
              Each champion masters a different domain of knowledge
            </p>
          </div>

          {/* ── Hero Grid ─────────────────────────── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            gap: 16, marginBottom: 60,
          }}>
            {heroes.map((hero, idx) => {
              const hcfg = HERO_CONFIG[hero.sprite_key] || HERO_CONFIG.wizard;
              const locked = hero.unlock_level > (user?.level || 1);
              const isActive = selected?.id === hero.id;
              return (
                <HeroCard
                  key={hero.id}
                  hero={hero}
                  cfg={hcfg}
                  locked={locked}
                  isActive={isActive}
                  idx={idx}
                  onClick={() => !locked && setSelected(hero)}
                />
              );
            })}
          </div>

          {/* ── BATTLE PREVIEW ─────────────────────── */}
          {selected && topic && (
            <div style={{ marginBottom: 48, animation: "fadeSlideIn 0.5s ease-out" }}>
              <BattleArena
                hero={selected}
                cfg={HERO_CONFIG[selected.sprite_key] ?? HERO_CONFIG.wizard}
                monsterEmoji={monsterEmoji}
                topic={topic}
                heroHP={heroHP}
                monsterHP={monsterHP}
                previewAttack={previewAttack}
                dmgFloat={dmgFloat}
                showCrit={showCrit}
                battleLog={battleLog}
              />
            </div>
          )}

          {/* ── Topic Select ──────────────────────── */}
          {selected && (
            <div style={{ marginBottom: 48, animation: "topicReveal 0.4s ease-out" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{
                  display: "inline-block",
                  background: "rgba(161,98,7,0.2)", border: "1px solid rgba(234,179,8,0.3)",
                  borderRadius: 50, padding: "8px 20px",
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", color: "#fbbf24",
                }}>
                  🎯 SELECT BATTLE TOPIC
                </div>
                <p style={{ color: "#6b7280", marginTop: 10, fontSize: 14 }}>
                  Who will <span style={{ color: cfg(selected)?.color, fontWeight: 700 }}>{selected.name}</span> face in combat?
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
                {TOPICS.map((t, i) => (
                  <TopicCard
                    key={t}
                    t={t}
                    i={i}
                    selected={topic === t}
                    onClick={() => setTopic(t)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Start Battle CTA ─────────────────── */}
          {selected && topic && (
            <div style={{ textAlign: "center", animation: "fadeSlideIn 0.4s ease-out" }}>
              <button
                onClick={handleStartBattle}
                disabled={loading}
                style={{
                  position: "relative", overflow: "hidden",
                  background: loading
                    ? "rgba(88,28,135,0.4)"
                    : "linear-gradient(135deg,#7c3aed,#be185d,#dc2626)",
                  backgroundSize: "200% 200%",
                  animation: loading ? "none" : "gradientShift 3s ease infinite",
                  border: "2px solid rgba(168,85,247,0.4)",
                  borderRadius: 16, padding: "20px 64px",
                  color: "#fff", fontSize: 22, fontFamily: "Cinzel",
                  fontWeight: 700, letterSpacing: "0.15em",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(124,58,237,0.2)",
                  transition: "all 0.3s",
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 0 60px rgba(124,58,237,0.8), 0 0 120px rgba(124,58,237,0.3)";
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "scale(1) translateY(0)";
                  e.currentTarget.style.boxShadow = "0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(124,58,237,0.2)";
                }}
              >
                {/* Shine sweep */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)",
                  transform: "translateX(-100%)",
                  animation: loading ? "none" : "shimmer 2s infinite",
                }} />
                {loading
                  ? <span>⏳ ENTERING BATTLE...</span>
                  : <span>⚔️ &nbsp;ENTER BATTLE</span>
                }
              </button>
              <p style={{
                color: "#374151", fontSize: 12, marginTop: 12,
                letterSpacing: "0.1em", fontWeight: 600
              }}>
                {selected.name} vs {topic.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} Monster
              </p>
            </div>
          )}

          {/* Empty prompt */}
          {!selected && (
            <div style={{
              textAlign: "center", marginTop: 20, color: "#374151",
              fontSize: 14, fontWeight: 600, letterSpacing: "0.1em",
              animation: "heroFloat 3s ease infinite"
            }}>
              ↑ Select a champion to begin your quest
            </div>
          )}
        </div>

        {/* ── Auth Modal ──────────────────────────── */}
        {showAuth && (
          <AuthModal
            authMode={authMode}
            authData={authData}
            authError={authError}
            setAuthMode={setAuthMode}
            setAuthData={setAuthData}
            setAuthError={setAuthError}
            onAuth={handleAuth}
            onClose={() => setShowAuth(false)}
          />
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to   { transform: translateX(200%); }
        }
      `}</style>
    </>
  );
}

// ─── Hero Card ────────────────────────────────────────────────────────
function HeroCard({ hero, cfg, locked, isActive, idx, onClick }: {
  hero: Hero; cfg: typeof HERO_CONFIG.samurai;
  locked: boolean; isActive: boolean; idx: number; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = isActive || hovered;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => !locked && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", overflow: "hidden",
        background: isActive ? cfg.bg : "linear-gradient(135deg,#0f0f1a,#1a1a2e)",
        border: `2px solid ${isActive ? cfg.color : hovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 16, padding: "20px 14px",
        cursor: locked ? "not-allowed" : "pointer",
        transition: "all 0.3s",
        transform: isActive ? "scale(1.06) translateY(-6px)" : hovered ? "scale(1.03) translateY(-3px)" : "scale(1)",
        boxShadow: isActive ? `0 0 30px ${cfg.glow}, 0 0 60px ${cfg.glow.replace("0.6", "0.2")}` : "none",
        opacity: locked ? 0.3 : 1,
        filter: locked ? "grayscale(1)" : "none",
        animation: `fadeSlideIn 0.5s ease-out ${idx * 0.08}s both`,
        textAlign: "center",
        fontFamily: "Rajdhani",
      }}
    >
      {hero.unlock_level <= 1
        ? <div style={{
          position: "absolute", top: 6, left: 6, background: "rgba(34,197,94,.25)",
          borderRadius: 6, padding: "2px 7px", fontSize: 9, color: "#4ade80",
          border: "1px solid rgba(34,197,94,.4)", fontWeight: 700
        }}>FREE</div>
        : locked && <div style={{
          position: "absolute", top: 6, right: 6,
          background: "rgba(0,0,0,.7)", borderRadius: 6, padding: "2px 6px",
          fontSize: 9, color: "#6b7280", border: "1px solid rgba(255,255,255,.1)"
        }}>
          🔒 Lv.{hero.unlock_level}</div>
      }
      {/* Glow bg */}
      {isActive && (
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(circle at 50% 0%,${cfg.color}15,transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}
      {/* Shine */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg,rgba(255,255,255,0.05),transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* Lock */}
      {locked && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: "rgba(0,0,0,0.7)", borderRadius: 6,
          padding: "2px 6px", fontSize: 10, color: "#6b7280",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>🔒 {hero.unlock_level}</div>
      )}

      {/* Check */}
      {isActive && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          width: 22, height: 22, borderRadius: "50%",
          background: cfg.color, color: "#000",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 900, animation: "battleEntry 0.3s ease-out",
        }}>✓</div>
      )}

      {/* Emoji */}
      <div style={{
        fontSize: 44, marginBottom: 10,
        animation: isActive ? "heroFloat 2.5s ease infinite" : "none",
        filter: isActive ? `drop-shadow(0 0 12px ${cfg.color})` : "none",
        transition: "all 0.3s",
        display: "block",
      }}>
        {cfg.emoji}
      </div>

      {/* Name */}
      <div style={{
        fontFamily: "Cinzel", fontSize: 13, fontWeight: 700,
        color: isActive ? cfg.color : "#e2e8f0", marginBottom: 4,
        letterSpacing: "0.05em"
      }}>
        {hero.name}
      </div>

      {/* Subject */}
      <div style={{
        fontSize: 10, color: "#6b7280", marginBottom: 10,
        fontWeight: 600, letterSpacing: "0.05em"
      }}>
        {hero.subject}
      </div>

      {/* Skill badge */}
      <div style={{
        background: "rgba(0,0,0,0.4)",
        border: `1px solid ${isActive ? cfg.color + "40" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 6, padding: "4px 6px",
        fontSize: 9, color: "#fbbf24", marginBottom: 10,
        fontWeight: 700, letterSpacing: "0.05em",
      }}>
        ⚡ {hero.skill_name?.replace(/_/g, " ")}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
        <div style={{
          background: "rgba(0,0,0,0.4)", borderRadius: 6, padding: "5px 4px",
          border: "1px solid rgba(239,68,68,0.2)", fontSize: 11,
        }}>
          <div style={{ color: "#f87171", fontWeight: 700 }}>⚔ {hero.attack_power}</div>
          <div style={{ color: "#4b5563", fontSize: 9, fontWeight: 600 }}>ATK</div>
        </div>
        <div style={{
          background: "rgba(0,0,0,0.4)", borderRadius: 6, padding: "5px 4px",
          border: "1px solid rgba(96,165,250,0.2)", fontSize: 11,
        }}>
          <div style={{ color: "#60a5fa", fontWeight: 700 }}>🛡 {hero.defense}</div>
          <div style={{ color: "#4b5563", fontSize: 9, fontWeight: 600 }}>DEF</div>
        </div>
      </div>

      {/* HP bar */}
      <HPBar current={hero.max_hp} max={hero.max_hp} color={cfg.color} label="HP" />
    </button>
  );
}

// ─── Battle Arena Preview ─────────────────────────────────────────────
function BattleArena({ hero, cfg, monsterEmoji, topic, heroHP, monsterHP,
  previewAttack, dmgFloat, showCrit, battleLog }: {
    hero: Hero; cfg: typeof HERO_CONFIG.samurai; monsterEmoji: string;
    topic: string; heroHP: number; monsterHP: number;
    previewAttack: "hero" | "monster" | null;
    dmgFloat: { val: number; isHero: boolean } | null;
    showCrit: boolean; battleLog: string;
  }) {
  return (
    <div style={{
      background: "linear-gradient(180deg,#0a0014 0%,#0d0020 40%,#1a000a 100%)",
      border: "1px solid rgba(168,85,247,0.2)",
      borderRadius: 20, overflow: "hidden",
      boxShadow: "0 0 60px rgba(0,0,0,0.8), inset 0 0 60px rgba(88,28,135,0.05)",
      position: "relative",
      animation: "fadeSlideIn 0.5s ease-out",
    }}>
      {/* Arena floor glow */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "80%", height: 100,
        background: "radial-gradient(ellipse,rgba(88,28,135,0.15),transparent 70%)",
      }} />

      {/* Header */}
      <div style={{
        background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(168,85,247,0.15)",
        padding: "12px 24px", display: "flex", justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{
          fontSize: 11, color: "#7c3aed", fontWeight: 700,
          letterSpacing: "0.2em", fontFamily: "Cinzel"
        }}>
          ⚔ BATTLE PREVIEW
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>
          {topic.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} Dungeon
        </div>
        <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>
          ● LIVE
        </div>
      </div>

      {/* Battle Stage */}
      <div style={{ padding: "32px 40px", position: "relative" }}>

        {/* CRIT text */}
        {showCrit && (
          <div style={{
            position: "absolute", top: "20%", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "Cinzel", fontSize: 36, fontWeight: 900,
            color: "#fbbf24",
            textShadow: "0 0 20px #fbbf24, 0 0 40px #fbbf24",
            animation: "critFlash 1.2s ease-out forwards",
            zIndex: 10, whiteSpace: "nowrap", pointerEvents: "none",
          }}>
            ⚡ CRITICAL HIT!
          </div>
        )}

        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between"
        }}>

          {/* ── Hero Side ─────────────────── */}
          <div style={{ width: "36%", textAlign: "center" }}>
            {/* Name plate */}
            <div style={{
              background: `linear-gradient(90deg,transparent,${cfg.color}20,transparent)`,
              border: `1px solid ${cfg.color}30`,
              borderRadius: 8, padding: "6px 12px", marginBottom: 16,
              fontSize: 12, fontFamily: "Cinzel", fontWeight: 700,
              color: cfg.color, letterSpacing: "0.1em",
            }}>
              {hero.name}
            </div>

            {/* Hero sprite */}
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* Glow under */}
              <div style={{
                position: "absolute", bottom: -10, left: "50%",
                transform: "translateX(-50%)",
                width: 80, height: 20, borderRadius: "50%",
                background: `radial-gradient(ellipse,${cfg.color}40,transparent 70%)`,
              }} />

              {/* Damage float on hero */}
              {dmgFloat && !dmgFloat.isHero && (
                <div style={{
                  position: "absolute", top: -10, left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 22, fontWeight: 900, color: "#f87171",
                  fontFamily: "Cinzel",
                  textShadow: "0 0 10px #ef4444",
                  animation: "floatUp 0.8s ease-out forwards",
                  pointerEvents: "none", zIndex: 5, whiteSpace: "nowrap",
                }}>-{dmgFloat.val}</div>
              )}

              <div style={{
                fontSize: 88,
                animation: previewAttack === "hero"
                  ? "heroAttack 0.6s ease-in-out"
                  : previewAttack === "monster"
                    ? `shake 0.5s ease-in-out, ${previewAttack === "monster" ? "hitFlash 0.4s ease" : "none"}`
                    : "heroFloat 3s ease-in-out infinite",
                filter: `drop-shadow(0 0 20px ${cfg.color})`,
                display: "inline-block",
              }}>
                {cfg.emoji}
              </div>
            </div>

            {/* HP */}
            <div style={{ marginTop: 16 }}>
              <HPBar current={heroHP} max={hero.max_hp} color={cfg.color} label="HP" />
            </div>

            {/* Skill badge */}
            <div style={{
              marginTop: 10, display: "inline-block",
              background: "rgba(0,0,0,0.4)",
              border: `1px solid ${cfg.color}30`,
              borderRadius: 50, padding: "4px 12px",
              fontSize: 10, color: cfg.color, fontWeight: 700,
            }}>
              ⚡ {hero.skill_name?.replace(/_/g, " ")}
            </div>
          </div>

          {/* ── VS Center ─────────────────── */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{
              fontFamily: "Cinzel", fontSize: 48, fontWeight: 900,
              animation: "vsFlash 1.5s ease infinite",
              lineHeight: 1,
            }}>
              VS
            </div>
            <div style={{
              marginTop: 12,
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: 8, padding: "6px 12px",
              fontSize: 11, color: "#9ca3af",
              maxWidth: 160, margin: "12px auto 0",
              fontStyle: "italic",
            }}>
              {battleLog}
            </div>
          </div>

          {/* ── Monster Side ──────────────── */}
          <div style={{ width: "36%", textAlign: "center" }}>
            {/* Name plate */}
            <div style={{
              background: "linear-gradient(90deg,transparent,rgba(239,68,68,0.15),transparent)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 8, padding: "6px 12px", marginBottom: 16,
              fontSize: 12, fontFamily: "Cinzel", fontWeight: 700,
              color: "#f87171", letterSpacing: "0.1em",
              animation: "bossGlow 2s ease infinite",
            }}>
              {topic.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} Monster
            </div>

            {/* Monster sprite */}
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* Glow under */}
              <div style={{
                position: "absolute", bottom: -10, left: "50%",
                transform: "translateX(-50%)",
                width: 80, height: 20, borderRadius: "50%",
                background: "radial-gradient(ellipse,rgba(239,68,68,0.4),transparent 70%)",
              }} />

              {/* Damage float on monster */}
              {dmgFloat && dmgFloat.isHero && (
                <div style={{
                  position: "absolute", top: -10, left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 22, fontWeight: 900, color: "#fbbf24",
                  fontFamily: "Cinzel",
                  textShadow: "0 0 10px #f59e0b",
                  animation: "floatUp 0.8s ease-out forwards",
                  pointerEvents: "none", zIndex: 5, whiteSpace: "nowrap",
                }}>-{dmgFloat.val}</div>
              )}

              <div style={{
                fontSize: 88,
                animation: previewAttack === "monster"
                  ? "monsterAttack 0.6s ease-in-out"
                  : previewAttack === "hero"
                    ? "shake 0.5s ease-in-out"
                    : "monsterFloat 3s ease-in-out infinite",
                filter: "drop-shadow(0 0 20px rgba(239,68,68,0.8))",
                display: "inline-block",
              }}>
                {monsterEmoji}
              </div>
            </div>

            {/* HP */}
            <div style={{ marginTop: 16 }}>
              <HPBar current={monsterHP} max={100} color="#ef4444" label="HP" />
            </div>

            {/* Difficulty */}
            <div style={{
              marginTop: 10, display: "inline-block",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 50, padding: "4px 12px",
              fontSize: 10, color: "#f87171", fontWeight: 700,
            }}>
              💀 ENEMY
            </div>
          </div>
        </div>

        {/* Ground line */}
        <div style={{
          height: 1, marginTop: 24,
          background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.3),rgba(239,68,68,0.3),transparent)",
        }} />

        {/* Attack effect bar */}
        {previewAttack && (
          <div style={{
            height: 3, marginTop: 4,
            background: previewAttack === "hero"
              ? `linear-gradient(90deg,${cfg.color},transparent)`
              : "linear-gradient(270deg,#ef4444,transparent)",
            animation: "slideRight 0.5s ease-out",
            borderRadius: 2,
          }} />
        )}
      </div>
    </div>
  );
}

// ─── Topic Card ───────────────────────────────────────────────────────
function TopicCard({ t, i, selected, onClick }: {
  t: string; i: number; selected: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected
          ? "linear-gradient(135deg,rgba(88,28,135,0.5),rgba(109,40,217,0.4))"
          : hovered
            ? "rgba(255,255,255,0.04)"
            : "rgba(255,255,255,0.02)",
        border: `1px solid ${selected ? "rgba(168,85,247,0.6)" : hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
        borderRadius: 12, padding: "16px 10px",
        cursor: "pointer", textAlign: "center",
        transition: "all 0.2s",
        transform: selected ? "scale(1.04) translateY(-3px)" : hovered ? "scale(1.02) translateY(-1px)" : "scale(1)",
        boxShadow: selected ? "0 0 20px rgba(168,85,247,0.3)" : "none",
        animation: `topicReveal 0.35s ease-out ${i * 0.04}s both`,
        fontFamily: "Rajdhani",
      }}
    >
      {selected && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 12,
          background: "rgba(168,85,247,0.05)",
          animation: "pulseGlow 2s ease infinite",
          pointerEvents: "none",
        }} />
      )}
      <div style={{
        fontSize: 26, marginBottom: 8,
        transition: "transform 0.2s",
        transform: hovered ? "scale(1.15)" : "scale(1)",
        display: "block",
      }}>
        {TOPIC_ICONS[t]}
      </div>
      <div style={{
        fontSize: 11, fontWeight: 700,
        color: selected ? "#e9d5ff" : hovered ? "#d1d5db" : "#6b7280",
        lineHeight: 1.3, letterSpacing: "0.03em",
      }}>
        {t.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
      </div>
    </button>
  );
}

// ─── Nav Button ───────────────────────────────────────────────────────
function NavBtn({ label, onClick }: { label: string; onClick: () => void }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: h ? "#fff" : "#9ca3af", fontSize: 13, fontWeight: 600,
        transition: "color 0.2s", fontFamily: "Rajdhani",
      }}>
      {label}
    </button>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────
function AuthModal({ authMode, authData, authError, setAuthMode, setAuthData,
  setAuthError, onAuth, onClose }: any) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "linear-gradient(135deg,#0f0a1e,#1a0f2e)",
        border: "1px solid rgba(168,85,247,0.3)",
        borderRadius: 20, padding: 40, width: "100%", maxWidth: 420,
        position: "relative", overflow: "hidden",
        animation: "modalIn 0.3s ease-out",
        boxShadow: "0 0 60px rgba(88,28,135,0.4), 0 0 120px rgba(88,28,135,0.15)",
      }}>
        {/* BG glow */}
        <div style={{
          position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(88,28,135,0.3),transparent 70%)",
          pointerEvents: "none",
        }} />

        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", cursor: "pointer",
          color: "#6b7280", fontSize: 20, lineHeight: 1,
          transition: "color 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>
          ✕
        </button>

        <div style={{ textAlign: "center", marginBottom: 28, position: "relative" }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>
            {authMode === "login" ? "⚔️" : "📜"}
          </div>
          <div style={{
            fontFamily: "Cinzel", fontSize: 22, fontWeight: 700,
            letterSpacing: "0.1em", color: "#e9d5ff"
          }}>
            {authMode === "login" ? "WELCOME BACK" : "JOIN THE BATTLE"}
          </div>
          <div style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
            {authMode === "login" ? "Continue your quest" : "Create your warrior account"}
          </div>
        </div>

        {authError && (
          <div style={{
            background: "rgba(127,29,29,0.4)", border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: 10, padding: "10px 16px", marginBottom: 16,
            fontSize: 13, color: "#fca5a5", textAlign: "center",
          }}>
            ⚠️ {authError}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
          {authMode === "register" && (
            <AuthInput placeholder="Username" value={authData.username}
              onChange={v => setAuthData({ ...authData, username: v })} />
          )}
          <AuthInput placeholder="Email" type="email" value={authData.email}
            onChange={v => setAuthData({ ...authData, email: v })} />
          <AuthInput placeholder="Password" type="password" value={authData.password}
            onChange={v => setAuthData({ ...authData, password: v })}
            onEnter={onAuth} />

          <button onClick={onAuth} style={{
            background: "linear-gradient(135deg,#7c3aed,#be185d)",
            border: "none", borderRadius: 12, padding: "14px",
            color: "#fff", fontSize: 14, fontFamily: "Cinzel",
            fontWeight: 700, letterSpacing: "0.1em",
            cursor: "pointer", marginTop: 4,
            boxShadow: "0 0 20px rgba(124,58,237,0.4)",
            transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(124,58,237,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(124,58,237,0.4)"; }}>
            {authMode === "login" ? "⚔️  ENTER BATTLE" : "📜  CREATE ACCOUNT"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#6b7280" }}>
          {authMode === "login" ? "New warrior? " : "Have an account? "}
          <button onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#a855f7", fontWeight: 700, fontSize: 13,
              transition: "color 0.2s"
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#c084fc")}
            onMouseLeave={e => (e.currentTarget.style.color = "#a855f7")}>
            {authMode === "login" ? "Register here" : "Login here"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Auth Input ───────────────────────────────────────────────────────
function AuthInput({ placeholder, value, onChange, type = "text", onEnter }: {
  placeholder: string; value: string;
  onChange: (v: string) => void;
  type?: string; onEnter?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={e => e.key === "Enter" && onEnter?.()}
      style={{
        background: "rgba(0,0,0,0.4)",
        border: `1px solid ${focused ? "rgba(168,85,247,0.6)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 10, padding: "13px 16px",
        color: "#e2e8f0", fontSize: 14,
        width: "100%", outline: "none",
        fontFamily: "Rajdhani", fontWeight: 500,
        transition: "all 0.2s",
        boxShadow: focused ? "0 0 0 3px rgba(168,85,247,0.15)" : "none",
      }}
    />
  );
}
