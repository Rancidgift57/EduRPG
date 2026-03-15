"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const TOPICS = [
    { key: "python-basics", label: "Python Basics", emoji: "🐍", color: "#4ade80", monster: "Bug Monster" },
    { key: "python-loops", label: "Python Loops", emoji: "🔄", color: "#60a5fa", monster: "Loop Dragon" },
    { key: "python-functions", label: "Functions", emoji: "⚙️", color: "#c084fc", monster: "Alien Phantom" },
    { key: "python-oop", label: "OOP Concepts", emoji: "🏗️", color: "#f87171", monster: "OOP Overlord" },
    { key: "algebra-basics", label: "Algebra", emoji: "📐", color: "#fbbf24", monster: "Algebra Golem" },
    { key: "calculus", label: "Calculus", emoji: "∫", color: "#f97316", monster: "Calculus Dragon" },
    { key: "physics-mechanics", label: "Physics", emoji: "⚡", color: "#94a3b8", monster: "Physics Golem" },
    { key: "chemistry", label: "Chemistry", emoji: "🧪", color: "#a78bfa", monster: "Chemistry Bug" },
    { key: "machine-learning", label: "Machine Learning", emoji: "🤖", color: "#fb923c", monster: "Data Alien" },
    { key: "neural-networks", label: "Neural Networks", emoji: "🧠", color: "#e879f9", monster: "Neural Skull" },
];

const VIDEO_DB: Record<string, { videoId: string; title: string; channel: string; duration: string }[]> = {
    "python-basics": [{ videoId: "_uQrJ0TkZlc", title: "Python Full Course for Beginners", channel: "Programming with Mosh", duration: "6h" }],
    "python-loops": [{ videoId: "OnDr4J2UXSA", title: "Python For Loops - Full Tutorial", channel: "Corey Schafer", duration: "18m" }],
    "python-functions": [{ videoId: "9Os0o3wzS_I", title: "Python Functions Tutorial", channel: "Corey Schafer", duration: "24m" }],
    "python-oop": [{ videoId: "ZDa-Z5JzLYM", title: "Python OOP - Classes and Instances", channel: "Corey Schafer", duration: "15m" }],
    "algebra-basics": [{ videoId: "NybHckSEQBI", title: "Algebra - Basic Algebra Lessons", channel: "TabletClass Math", duration: "45m" }],
    "calculus": [{ videoId: "WUvTyaaNkzM", title: "The Essence of Calculus", channel: "3Blue1Brown", duration: "17m" }],
    "physics-mechanics": [{ videoId: "b1t41Q3xRM8", title: "Physics - Basic Introduction", channel: "The Organic Chemistry Tutor", duration: "35m" }],
    "chemistry": [{ videoId: "FSyAehMdpyI", title: "Chemistry for Beginners", channel: "Professor Dave Explains", duration: "28m" }],
    "machine-learning": [{ videoId: "GwIo3gDZCVQ", title: "Machine Learning for Everybody", channel: "freeCodeCamp", duration: "3h 48m" }],
    "neural-networks": [{ videoId: "aircAruvnKk", title: "But what is a neural network?", channel: "3Blue1Brown", duration: "19m" }],
};

const TIPS: Record<string, string[]> = {
    "python-basics": ["Python uses indentation instead of braces", "Variables don't need type declarations", "print() is the basic output function"],
    "python-loops": ["range(n) generates 0 to n-1", "Use break to exit a loop early", "while loops run as long as condition is True"],
    "python-functions": ["def keyword defines a function", "return sends a value back", "Default parameters must come last"],
    "python-oop": ["class defines a blueprint", "__init__ is the constructor", "self refers to the instance"],
    "algebra-basics": ["PEMDAS — order of operations", "Isolate the variable to solve", "Like terms can be combined"],
    "calculus": ["Derivative = rate of change", "Integral = area under curve", "Chain rule for composite functions"],
    "physics-mechanics": ["F = ma (Newton's 2nd Law)", "Energy is conserved in closed systems", "Velocity is speed with direction"],
    "chemistry": ["Protons = atomic number", "Valence electrons determine bonding", "pH < 7 is acidic"],
    "machine-learning": ["Features are input variables", "Training data teaches the model", "Overfitting = memorizing not learning"],
    "neural-networks": ["Neurons are computational units", "Layers transform data step by step", "Backpropagation updates weights"],
};

export default function TrainingPage() {
    const router = useRouter();
    const [selectedTopic, setSelectedTopic] = useState(TOPICS[0].key);
    const current = TOPICS.find(t => t.key === selectedTopic)!;
    const videos = VIDEO_DB[selectedTopic] || [];
    const tips = TIPS[selectedTopic] || [];

    return (
        <div style={{ minHeight: "100vh", background: "#030712", color: "#fff", fontFamily: "Rajdhani" }}>

            {/* Inject fonts */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glowPulse{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes shimmer{from{transform:translateX(-150%)}to{transform:translateX(150%)}}
        @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>

            {/* Nav */}
            <nav style={{
                background: "rgba(0,0,0,0.75)", borderBottom: "1px solid rgba(168,85,247,0.2)",
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
                    background: "linear-gradient(135deg,#60a5fa,#a855f7,#ec4899)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    letterSpacing: "0.12em"
                }}>
                    📚 TRAINING ROOM
                </div>

                <button onClick={() => { localStorage.setItem("selectedTopic", selectedTopic); router.push("/"); }}
                    style={{
                        backgroundImage: "linear-gradient(135deg,#7c3aed,#be185d)",
                        border: "none", borderRadius: 10, padding: "9px 22px", color: "#fff",
                        fontFamily: "Cinzel", fontSize: 12, cursor: "pointer", fontWeight: 700,
                        letterSpacing: "0.1em", boxShadow: "0 0 20px rgba(124,58,237,0.45)",
                        transition: "all 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                    ⚔️ BATTLE NOW
                </button>
            </nav>

            <div style={{ display: "flex", maxWidth: 1100, margin: "0 auto", padding: "28px 20px", gap: 24 }}>

                {/* ── Sidebar ─────────────────────────── */}
                <div style={{ width: 210, flexShrink: 0 }}>
                    <div style={{
                        fontFamily: "Cinzel", fontSize: 10, color: "#7c3aed",
                        letterSpacing: "0.25em", fontWeight: 700, marginBottom: 14,
                        paddingBottom: 8, borderBottom: "1px solid rgba(168,85,247,0.15)"
                    }}>
                        DUNGEONS
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {TOPICS.map((t, i) => {
                            const isSel = selectedTopic === t.key;
                            return (
                                <button key={t.key} onClick={() => setSelectedTopic(t.key)} style={{
                                    background: isSel ? `${t.color}14` : "transparent",
                                    border: `1px solid ${isSel ? t.color + "35" : "transparent"}`,
                                    borderRadius: 10, padding: "9px 12px",
                                    color: isSel ? t.color : "#6b7280",
                                    cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: isSel ? 700 : 500,
                                    display: "flex", alignItems: "center", gap: 10,
                                    transition: "all 0.2s",
                                    fontFamily: "Rajdhani",
                                    boxShadow: isSel ? `0 0 12px ${t.color}20` : "none",
                                    animation: `fadeSlideIn 0.3s ease-out ${i * 0.04}s both`,
                                }}
                                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.color = "#9ca3af"; }}
                                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.color = "#6b7280"; }}>
                                    <span style={{ fontSize: 18, filter: isSel ? `drop-shadow(0 0 6px ${t.color})` : "none", transition: "all 0.2s" }}>{t.emoji}</span>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 700 }}>{t.label}</div>
                                        <div style={{ fontSize: 9, color: isSel ? t.color + "90" : "#374151", letterSpacing: "0.05em" }}>vs {t.monster}</div>
                                    </div>
                                    {isSel && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: t.color, animation: "glowPulse 1.5s infinite" }} />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Main Content ─────────────────────── */}
                <div style={{ flex: 1, animation: "fadeSlideIn 0.4s ease-out" }}>

                    {/* Topic Header */}
                    <div style={{
                        backgroundImage: `linear-gradient(135deg,${current.color}12,rgba(0,0,0,0.4))`,
                        border: `1px solid ${current.color}28`,
                        borderRadius: 18, padding: "22px 28px", marginBottom: 24,
                        display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                        <div>
                            <div style={{
                                fontFamily: "Cinzel", fontSize: 28, fontWeight: 900,
                                color: current.color, textShadow: `0 0 20px ${current.color}60`
                            }}>
                                {current.emoji} {current.label}
                            </div>
                            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4, fontWeight: 500 }}>
                                Defeat the <span style={{ color: current.color, fontWeight: 700 }}>{current.monster}</span> by mastering this topic
                            </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 52, filter: `drop-shadow(0 0 16px ${current.color})` }}>{current.emoji}</div>
                        </div>
                    </div>

                    {/* Video player */}
                    {videos.map(v => (
                        <div key={v.videoId} style={{
                            background: "rgba(0,0,0,0.5)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 18, overflow: "hidden", marginBottom: 22
                        }}>
                            <div style={{ aspectRatio: "16/9", position: "relative" }}>
                                <iframe width="100%" height="100%"
                                    src={`https://www.youtube.com/embed/${v.videoId}?rel=0&modestbranding=1`}
                                    title={v.title} allowFullScreen
                                    style={{ border: "none", display: "block", borderRadius: "16px 16px 0 0" }} />
                            </div>
                            <div style={{
                                padding: "16px 20px", display: "flex",
                                justifyContent: "space-between", alignItems: "center"
                            }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{v.title}</div>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>{v.channel} · {v.duration}</div>
                                </div>
                                <div style={{
                                    backgroundImage: `linear-gradient(135deg,${current.color}22,rgba(0,0,0,0.3))`,
                                    border: `1px solid ${current.color}35`,
                                    borderRadius: 10, padding: "8px 16px",
                                    fontSize: 11, color: current.color, fontFamily: "Cinzel", fontWeight: 700
                                }}>
                                    📺 STUDY
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Tips */}
                    <div style={{
                        background: "rgba(0,0,0,0.4)",
                        border: `1px solid ${current.color}22`,
                        borderRadius: 16, padding: "20px 24px", marginBottom: 22
                    }}>
                        <div style={{
                            fontFamily: "Cinzel", fontSize: 13, fontWeight: 700,
                            color: current.color, marginBottom: 14, letterSpacing: "0.12em"
                        }}>
                            💡 BATTLE TIPS — {current.label.toUpperCase()}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {tips.map((tip, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "flex-start", gap: 12,
                                    animation: `fadeSlideIn 0.3s ease-out ${i * 0.08}s both`
                                }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                                        backgroundImage: `linear-gradient(135deg,${current.color},${current.color}88)`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 11, fontWeight: 900, color: "#000", fontFamily: "Cinzel"
                                    }}>
                                        {i + 1}
                                    </div>
                                    <div style={{ fontSize: 14, color: "#d1d5db", lineHeight: 1.5, fontWeight: 500 }}>
                                        {tip}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Battle CTA */}
                    <div style={{
                        backgroundImage: "linear-gradient(135deg,rgba(88,28,135,0.3),rgba(185,28,28,0.3))",
                        border: "1px solid rgba(168,85,247,0.25)",
                        borderRadius: 18, padding: "28px", textAlign: "center"
                    }}>
                        <div style={{
                            fontFamily: "Cinzel", fontSize: 22, fontWeight: 900, marginBottom: 8,
                            background: "linear-gradient(135deg,#c084fc,#f472b6,#fb923c)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                        }}>
                            Ready for Battle?
                        </div>
                        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24, fontWeight: 500 }}>
                            You've studied {current.label}. Now defeat the <span style={{ color: current.color, fontWeight: 700 }}>{current.monster}</span>!
                        </p>
                        <button onClick={() => { localStorage.setItem("selectedTopic", selectedTopic); router.push("/"); }}
                            style={{
                                backgroundImage: "linear-gradient(135deg,#7c3aed,#be185d,#dc2626)",
                                backgroundSize: "200% 200%",
                                border: "none", borderRadius: 14, padding: "16px 52px",
                                color: "#fff", fontFamily: "Cinzel", fontSize: 18, cursor: "pointer",
                                fontWeight: 700, letterSpacing: "0.12em",
                                boxShadow: "0 0 40px rgba(124,58,237,0.5),0 0 80px rgba(124,58,237,0.2)",
                                transition: "all 0.3s", position: "relative", overflow: "hidden"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05) translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 60px rgba(124,58,237,0.8)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(124,58,237,0.5)"; }}>
                            ⚔️  ENTER BATTLE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}