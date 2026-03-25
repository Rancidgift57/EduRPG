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

// ── Types ─────────────────────────────────────────────────────────────────────
interface AIInsight {
    summary: string;
    tricks: string[];
    analogy: string;
    difficulty: string;
}

// ── AI Insight Panel ──────────────────────────────────────────────────────────
function AIInsightPanel({ topic, color, videoTitle }: { topic: typeof TOPICS[0]; color: string; videoTitle: string }) {
    const [insight, setInsight] = useState<AIInsight | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [asked, setAsked] = useState(false);

    // ✅ FIX 1: fetchInsight is a properly scoped async arrow function.
    //    In the original code, difficultyColor and the return() JSX were
    //    accidentally written INSIDE this function after the try/catch.
    const fetchInsight = async () => {
        setLoading(true);
        setError(null);
        setAsked(true);

        const prompt = `You are an expert tutor for a gamified learning app. The student is studying "${topic.label}" and watching: "${videoTitle}".

Generate a JSON object (no markdown, no backticks, pure JSON) with these fields:
{
  "summary": "A 2-3 sentence engaging summary of what this topic covers and why it matters for beginners",
  "tricks": ["trick 1", "trick 2", "trick 3", "trick 4"],
  "analogy": "One memorable real-world analogy that makes ${topic.label} click instantly",
  "difficulty": "Beginner | Intermediate | Advanced"
}

The tricks should be practical memory hacks, mnemonics, or shortcuts to master ${topic.label} faster. Keep everything concise and gamified in tone.`;

        try {
            const response = await fetch("https://edurpg-1.onrender.com/insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            // Case 1: backend returns already-parsed object in data.result
            if (data.result && typeof data.result === "object") {
                setInsight({
                    summary: data.result.summary ?? "No summary available.",
                    tricks: Array.isArray(data.result.tricks) ? data.result.tricks : [],
                    analogy: data.result.analogy ?? "",
                    difficulty: data.result.difficulty ?? "Intermediate",
                });
                return;
            }

            // Case 2: backend returns raw text string or content array
            let rawText = "";
            if (Array.isArray(data.content)) {
                rawText = data.content
                    .map((c: { type: string; text?: string }) => c.type === "text" ? c.text ?? "" : "")
                    .join("");
            } else if (typeof data.text === "string") {
                rawText = data.text;
            } else if (typeof data === "string") {
                rawText = data;
            }

            const clean = rawText.replace(/```json|```/g, "").trim();

            // ✅ FIX 2: fallback always produces a valid AIInsight shape.
            //    The original code did setInsight({ raw: clean }) which
            //    doesn't match the interface and crashes the render below.
            try {
                const parsed = JSON.parse(clean);
                setInsight({
                    summary: parsed.summary ?? "No summary available.",
                    tricks: Array.isArray(parsed.tricks) ? parsed.tricks : [],
                    analogy: parsed.analogy ?? "",
                    difficulty: parsed.difficulty ?? "Intermediate",
                });
            } catch {
                setInsight({
                    summary: clean || "Could not parse AI response.",
                    tricks: [],
                    analogy: "",
                    difficulty: "Intermediate",
                });
            }
        } catch (e) {
            console.error(e);
            setError("AI mentor is meditating… try again in a moment.");
        } finally {
            setLoading(false);
        }
    }; // ← fetchInsight ends HERE (the original was missing this closing brace)

    // ✅ FIX 1 (continued): difficultyColor is now a proper component-level
    //    helper, not buried inside the async function.
    const difficultyColor = (d: string) =>
        d === "Beginner" ? "#4ade80" : d === "Intermediate" ? "#fbbf24" : "#f87171";

    return (
        <div style={{
            background: "rgba(0,0,0,0.55)",
            border: `1px solid ${color}30`,
            borderRadius: 18,
            marginBottom: 22,
            overflow: "hidden",
        }}>
            {/* Panel Header */}
            <div style={{
                backgroundImage: `linear-gradient(135deg,${color}18,rgba(0,0,0,0.3))`,
                borderBottom: `1px solid ${color}20`,
                padding: "16px 22px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        backgroundImage: `linear-gradient(135deg,${color},${color}66)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, boxShadow: `0 0 14px ${color}40`
                    }}>🤖</div>
                    <div>
                        <div style={{ fontFamily: "Cinzel", fontSize: 13, fontWeight: 700, color, letterSpacing: "0.1em" }}>
                            AI MENTOR
                        </div>
                        <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 500 }}>
                            Powered by AI · Smart Insights
                        </div>
                    </div>
                </div>

                {!asked && (
                    <button onClick={fetchInsight} style={{
                        backgroundImage: `linear-gradient(135deg,${color},${color}88)`,
                        border: "none", borderRadius: 10, padding: "9px 20px",
                        color: "#000", fontFamily: "Cinzel", fontSize: 11,
                        cursor: "pointer", fontWeight: 700, letterSpacing: "0.08em",
                        boxShadow: `0 0 18px ${color}50`, transition: "all 0.2s"
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                        ✨ GET AI INSIGHTS
                    </button>
                )}
            </div>

            {/* Teaser (not yet asked) */}
            {!asked && (
                <div style={{ padding: "22px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 36, marginBottom: 10, filter: `drop-shadow(0 0 12px ${color})` }}>🧠</div>
                    <div style={{ fontFamily: "Cinzel", fontSize: 14, color: "#9ca3af", fontWeight: 600 }}>
                        Unlock AI-powered insights for <span style={{ color }}>{topic.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#4b5563", marginTop: 6 }}>
                        Video summary · Memory tricks · Real-world analogies
                    </div>
                </div>
            )}

            {/* Loading spinner */}
            {loading && (
                <div style={{ padding: "32px 24px", textAlign: "center" }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: "50%", margin: "0 auto 16px",
                        border: `3px solid ${color}30`, borderTopColor: color,
                        animation: "spin 0.9s linear infinite",
                    }} />
                    <div style={{ fontFamily: "Cinzel", fontSize: 13, color, letterSpacing: "0.1em" }}>
                        AI MENTOR ANALYZING…
                    </div>
                    <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>
                        Summoning battle wisdom for {topic.label}
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && !loading && (
                <div style={{ padding: "22px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
                    <div style={{ color: "#f87171", fontSize: 13, fontWeight: 600 }}>{error}</div>
                    <button onClick={fetchInsight} style={{
                        marginTop: 14, background: "transparent",
                        border: `1px solid ${color}40`, borderRadius: 8, padding: "8px 18px",
                        color, cursor: "pointer", fontSize: 12, fontFamily: "Cinzel", fontWeight: 700
                    }}>↻ RETRY</button>
                </div>
            )}

            {/* Result */}
            {insight && !loading && (
                <div style={{ padding: "22px 24px", animation: "fadeSlideIn 0.4s ease-out" }}>

                    {/* Difficulty badge */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                        <div style={{
                            background: `${difficultyColor(insight.difficulty)}15`,
                            border: `1px solid ${difficultyColor(insight.difficulty)}40`,
                            borderRadius: 20, padding: "4px 14px",
                            fontSize: 10, color: difficultyColor(insight.difficulty),
                            fontFamily: "Cinzel", fontWeight: 700, letterSpacing: "0.1em"
                        }}>⚔️ {insight.difficulty}</div>
                    </div>

                    {/* Summary */}
                    <div style={{
                        backgroundImage: `linear-gradient(135deg,${color}0e,rgba(0,0,0,0.2))`,
                        border: `1px solid ${color}20`,
                        borderRadius: 12, padding: "16px 18px", marginBottom: 18
                    }}>
                        <div style={{
                            fontFamily: "Cinzel", fontSize: 10, color,
                            letterSpacing: "0.2em", fontWeight: 700, marginBottom: 8
                        }}>📜 VIDEO SUMMARY</div>
                        <p style={{ color: "#d1d5db", fontSize: 13, lineHeight: 1.65, fontWeight: 500, margin: 0 }}>
                            {insight.summary}
                        </p>
                    </div>

                    {/* Analogy */}
                    {insight.analogy && (
                        <div style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 12, padding: "14px 18px", marginBottom: 18,
                            display: "flex", gap: 12, alignItems: "flex-start"
                        }}>
                            <div style={{ fontSize: 24, flexShrink: 0, filter: `drop-shadow(0 0 8px ${color})` }}>💡</div>
                            <div>
                                <div style={{
                                    fontFamily: "Cinzel", fontSize: 10, color: "#fbbf24",
                                    letterSpacing: "0.2em", fontWeight: 700, marginBottom: 6
                                }}>GOLDEN ANALOGY</div>
                                <p style={{ color: "#e5e7eb", fontSize: 13, lineHeight: 1.6, fontWeight: 500, margin: 0, fontStyle: "italic" }}>
                                    "{insight.analogy}"
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Memory Tricks — ✅ FIX 3: guarded against undefined/empty tricks array */}
                    {insight.tricks.length > 0 && (
                        <div>
                            <div style={{
                                fontFamily: "Cinzel", fontSize: 10, color,
                                letterSpacing: "0.2em", fontWeight: 700, marginBottom: 12
                            }}>🧪 MEMORY TRICKS TO WIN</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {insight.tricks.map((trick, i) => (
                                    <div key={i} style={{
                                        display: "flex", alignItems: "flex-start", gap: 12,
                                        animation: `fadeSlideIn 0.3s ease-out ${i * 0.07}s both`
                                    }}>
                                        <div style={{
                                            width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                                            backgroundImage: `linear-gradient(135deg,${color},${color}66)`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 10, fontWeight: 900, color: "#000", fontFamily: "Cinzel",
                                            boxShadow: `0 0 8px ${color}40`
                                        }}>{i + 1}</div>
                                        <div style={{
                                            flex: 1, background: `${color}08`,
                                            border: `1px solid ${color}15`,
                                            borderRadius: 8, padding: "8px 12px",
                                            fontSize: 13, color: "#d1d5db", lineHeight: 1.5, fontWeight: 500
                                        }}>{trick}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Regenerate */}
                    <div style={{ marginTop: 18, textAlign: "right" }}>
                        <button onClick={fetchInsight} style={{
                            background: "transparent", border: `1px solid ${color}30`,
                            borderRadius: 8, padding: "7px 16px", color: `${color}90`,
                            cursor: "pointer", fontSize: 11, fontFamily: "Cinzel", fontWeight: 700,
                            letterSpacing: "0.08em", transition: "all 0.2s"
                        }}
                            onMouseEnter={e => { e.currentTarget.style.color = color; e.currentTarget.style.borderColor = `${color}60`; }}
                            onMouseLeave={e => { e.currentTarget.style.color = `${color}90`; e.currentTarget.style.borderColor = `${color}30`; }}>
                            ↻ REGENERATE INSIGHTS
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TrainingPage() {
    const router = useRouter();
    const [selectedTopic, setSelectedTopic] = useState(TOPICS[0].key);
    const current = TOPICS.find(t => t.key === selectedTopic)!;
    const videos = VIDEO_DB[selectedTopic] || [];
    const tips = TIPS[selectedTopic] || [];

    return (
        <div style={{ minHeight: "100vh", background: "#030712", color: "#fff", fontFamily: "Rajdhani" }}>
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
                    background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
                    padding: "7px 16px", cursor: "pointer", color: "#9ca3af", fontSize: 13,
                    fontFamily: "Rajdhani", fontWeight: 600, transition: "all 0.2s"
                }}
                    onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                    onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}>← HOME</button>

                <div style={{
                    fontFamily: "Cinzel", fontSize: 20, fontWeight: 700,
                    background: "linear-gradient(135deg,#60a5fa,#a855f7,#ec4899)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    letterSpacing: "0.12em"
                }}>📚 TRAINING ROOM</div>

                <button onClick={() => { localStorage.setItem("selectedTopic", selectedTopic); router.push("/"); }}
                    style={{
                        backgroundImage: "linear-gradient(135deg,#7c3aed,#be185d)",
                        border: "none", borderRadius: 10, padding: "9px 22px", color: "#fff",
                        fontFamily: "Cinzel", fontSize: 12, cursor: "pointer", fontWeight: 700,
                        letterSpacing: "0.1em", boxShadow: "0 0 20px rgba(124,58,237,0.45)", transition: "all 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                    ⚔️ BATTLE NOW
                </button>
            </nav>

            <div style={{ display: "flex", maxWidth: 1100, margin: "0 auto", padding: "28px 20px", gap: 24 }}>

                {/* Sidebar */}
                <div style={{ width: 210, flexShrink: 0 }}>
                    <div style={{
                        fontFamily: "Cinzel", fontSize: 10, color: "#7c3aed",
                        letterSpacing: "0.25em", fontWeight: 700, marginBottom: 14,
                        paddingBottom: 8, borderBottom: "1px solid rgba(168,85,247,0.15)"
                    }}>DUNGEONS</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {TOPICS.map((t, i) => {
                            const isSel = selectedTopic === t.key;
                            return (
                                <button key={t.key} onClick={() => setSelectedTopic(t.key)} style={{
                                    background: isSel ? `${t.color}14` : "transparent",
                                    border: `1px solid ${isSel ? t.color + "35" : "transparent"}`,
                                    borderRadius: 10, padding: "9px 12px",
                                    color: isSel ? t.color : "#6b7280",
                                    cursor: "pointer", textAlign: "left", fontSize: 13,
                                    fontWeight: isSel ? 700 : 500,
                                    display: "flex", alignItems: "center", gap: 10,
                                    transition: "all 0.2s", fontFamily: "Rajdhani",
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

                {/* Main Content */}
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
                            }}>{current.emoji} {current.label}</div>
                            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4, fontWeight: 500 }}>
                                Defeat the <span style={{ color: current.color, fontWeight: 700 }}>{current.monster}</span> by mastering this topic
                            </div>
                        </div>
                        <div style={{ fontSize: 52, filter: `drop-shadow(0 0 16px ${current.color})` }}>{current.emoji}</div>
                    </div>

                    {/* Video Player */}
                    {videos.map(v => (
                        <div key={v.videoId} style={{
                            background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 18, overflow: "hidden", marginBottom: 22
                        }}>
                            <div style={{ aspectRatio: "16/9" }}>
                                <iframe width="100%" height="100%"
                                    src={`https://www.youtube.com/embed/${v.videoId}?rel=0&modestbranding=1`}
                                    title={v.title} allowFullScreen
                                    style={{ border: "none", display: "block" }} />
                            </div>
                            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{v.title}</div>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>{v.channel} · {v.duration}</div>
                                </div>
                                <div style={{
                                    backgroundImage: `linear-gradient(135deg,${current.color}22,rgba(0,0,0,0.3))`,
                                    border: `1px solid ${current.color}35`, borderRadius: 10, padding: "8px 16px",
                                    fontSize: 11, color: current.color, fontFamily: "Cinzel", fontWeight: 700
                                }}>📺 STUDY</div>
                            </div>
                        </div>
                    ))}

                    {/* AI Insight Panel */}
                    <AIInsightPanel
                        key={selectedTopic}
                        topic={current}
                        color={current.color}
                        videoTitle={videos[0]?.title ?? current.label}
                    />

                    {/* Battle Tips */}
                    <div style={{
                        background: "rgba(0,0,0,0.4)", border: `1px solid ${current.color}22`,
                        borderRadius: 16, padding: "20px 24px", marginBottom: 22
                    }}>
                        <div style={{
                            fontFamily: "Cinzel", fontSize: 13, fontWeight: 700,
                            color: current.color, marginBottom: 14, letterSpacing: "0.12em"
                        }}>💡 BATTLE TIPS — {current.label.toUpperCase()}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {tips.map((tip, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, animation: `fadeSlideIn 0.3s ease-out ${i * 0.08}s both` }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                                        backgroundImage: `linear-gradient(135deg,${current.color},${current.color}88)`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 11, fontWeight: 900, color: "#000", fontFamily: "Cinzel"
                                    }}>{i + 1}</div>
                                    <div style={{ fontSize: 14, color: "#d1d5db", lineHeight: 1.5, fontWeight: 500 }}>{tip}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Battle CTA */}
                    <div style={{
                        backgroundImage: "linear-gradient(135deg,rgba(88,28,135,0.3),rgba(185,28,28,0.3))",
                        border: "1px solid rgba(168,85,247,0.25)", borderRadius: 18, padding: "28px", textAlign: "center"
                    }}>
                        <div style={{
                            fontFamily: "Cinzel", fontSize: 22, fontWeight: 900, marginBottom: 8,
                            background: "linear-gradient(135deg,#c084fc,#f472b6,#fb923c)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                        }}>Ready for Battle?</div>
                        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24, fontWeight: 500 }}>
                            You've studied {current.label}. Now defeat the <span style={{ color: current.color, fontWeight: 700 }}>{current.monster}</span>!
                        </p>
                        <button onClick={() => { localStorage.setItem("selectedTopic", selectedTopic); router.push("/"); }}
                            style={{
                                backgroundImage: "linear-gradient(135deg,#7c3aed,#be185d,#dc2626)",
                                border: "none", borderRadius: 14, padding: "16px 52px",
                                color: "#fff", fontFamily: "Cinzel", fontSize: 18, cursor: "pointer",
                                fontWeight: 700, letterSpacing: "0.12em",
                                boxShadow: "0 0 40px rgba(124,58,237,0.5),0 0 80px rgba(124,58,237,0.2)",
                                transition: "all 0.3s"
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
