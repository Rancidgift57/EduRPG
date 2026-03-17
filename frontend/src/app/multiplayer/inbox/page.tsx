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
import {
    HERO_COMPONENTS,
    MONSTER_COMPONENTS,
    HERO_COLORS,
    HERO_EMOJI,
} from "@/components/battle/Characters";

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Mini SVG characters for battle animation ─────────────────────────
function MiniHero({ color = "#60a5fa" }: { color?: string }) {
    return (
        <svg width="72" height="100" viewBox="0 0 80 112" fill="none">
            <path d="M28 14 Q28 6 40 6 Q52 6 52 14 L52 22 Q52 28 40 28 Q28 28 28 22Z"
                fill={color} opacity="0.9" />
            <ellipse cx="36" cy="18" rx="3" ry="2.5" fill="#fff" />
            <ellipse cx="44" cy="18" rx="3" ry="2.5" fill="#fff" />
            <ellipse cx="37" cy="18" rx="1.8" ry="1.8" fill="#0f172a" />
            <ellipse cx="45" cy="18" rx="1.8" ry="1.8" fill="#0f172a" />
            <rect x="37" y="27" width="6" height="5" fill={color} opacity="0.7" />
            <path d="M26 32 L32 30 L40 31 L48 30 L54 32 L54 60 L26 60Z"
                fill={color} opacity="0.85" />
            <rect x="14" y="33" width="12" height="22" rx="5" fill={color} opacity="0.8" />
            <rect x="54" y="33" width="12" height="22" rx="5" fill={color} opacity="0.8" />
            <rect x="63" y="15" width="4" height="50" rx="1.5" fill="#94a3b8" />
            <rect x="60" y="32" width="10" height="3" rx="1" fill="#fbbf24" />
            <rect x="28" y="59" width="11" height="28" rx="5" fill={color} opacity="0.85" />
            <rect x="41" y="59" width="11" height="28" rx="5" fill={color} opacity="0.85" />
            <rect x="26" y="83" width="15" height="8" rx="4" fill={color} opacity="0.65" />
            <rect x="39" y="83" width="15" height="8" rx="4" fill={color} opacity="0.65" />
        </svg>
    );
}

function MiniMonster({ color = "#ef4444" }: { color?: string }) {
    return (
        <svg width="72" height="100" viewBox="0 0 90 117" fill="none">
            <path d="M14 30 Q2 18 5 56 Q11 50 20 44Z" fill="#7f1d1d" opacity="0.8" />
            <path d="M76 30 Q88 18 85 56 Q79 50 70 44Z" fill="#7f1d1d" opacity="0.8" />
            <ellipse cx="45" cy="60" rx="27" ry="31" fill={color} opacity="0.9" />
            <ellipse cx="45" cy="24" rx="19" ry="17" fill={color} opacity="0.95" />
            <path d="M31 13 L27 1 L33 11Z" fill="#7f1d1d" />
            <path d="M59 13 L63 1 L57 11Z" fill="#7f1d1d" />
            <ellipse cx="37" cy="22" rx="5.5" ry="5.5" fill="#fbbf24" />
            <ellipse cx="53" cy="22" rx="5.5" ry="5.5" fill="#fbbf24" />
            <ellipse cx="37" cy="22" rx="3.5" ry="4.5" fill="#7f1d1d" />
            <ellipse cx="53" cy="22" rx="3.5" ry="4.5" fill="#7f1d1d" />
            <path d="M34 35 L37 32 L40 35 L44 32 L48 35 L51 32 L55 35 L56 37 L34 37Z"
                fill="#7f1d1d" />
            <path d="M46 37 Q62 41 73 35 Q68 43 73 52 Q57 46 46 43Z"
                fill="#f97316" opacity="0.7" />
            <rect x="32" y="87" width="13" height="18" rx="5" fill={color} opacity="0.9" />
            <rect x="47" y="87" width="13" height="18" rx="5" fill={color} opacity="0.9" />
        </svg>
    );
}

// ── Battle Animation Arena ────────────────────────────────────────────
function BattleAnimArena({
    heroColor,
    playerHP,
    maxPlayerHP,
    monsterHP,
    maxMonsterHP,
    heroAnim,
    monsterAnim,
    dmgFloat,
    showCrit,
    logMsg,
    lastResult,
}: {
    heroColor: string;
    playerHP: number;
    maxPlayerHP: number;
    monsterHP: number;
    maxMonsterHP: number;
    heroAnim: string;
    monsterAnim: string;
    dmgFloat: any;
    showCrit: boolean;
    logMsg: string;
    lastResult: any;
}) {
    const heroStyle = () => {
        if (heroAnim === "attack") return { animation: "mpHeroAttack .7s ease-in-out" };
        if (heroAnim === "hit") return { animation: "mpHeroHit .5s ease-in-out" };
        return { animation: "mpHeroIdle 3s ease-in-out infinite" };
    };
    const monsterStyle = () => {
        if (monsterAnim === "attack") return { animation: "mpMonsterAttack .7s ease-in-out", transform: "scaleX(-1)" };
        if (monsterAnim === "hit") return { animation: "mpMonsterHit .5s ease-in-out" };
        if (monsterAnim === "death") return { animation: "mpDeath 1.5s ease-out forwards" };
        return { animation: "mpMonsterIdle 3.5s ease-in-out infinite", transform: "scaleX(-1)" };
    };

    const hpPct = (hp: number, max: number) => Math.max(0, Math.min(100, (hp / max) * 100));
    const hpColor = (pct: number) => pct > 60 ? "#22c55e" : pct > 30 ? "#f59e0b" : "#ef4444";

    const heroPct = hpPct(playerHP, maxPlayerHP);
    const monsterPct = hpPct(monsterHP, maxMonsterHP);

    return (
        <div style={{
            position: "relative",
            backgroundImage: "linear-gradient(180deg,#04001a 0%,#08002a 35%,#120004 70%,#04001a 100%)",
            border: "1px solid rgba(168,85,247,.2)",
            borderRadius: "clamp(14px,3vw,20px)",
            overflow: "hidden",
            marginBottom: 16,
        }}>
            {/* Scanlines */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
                backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.025) 2px,rgba(0,0,0,.025) 4px)",
            }} />

            {/* Header */}
            <div style={{
                background: "rgba(0,0,0,.55)",
                borderBottom: "1px solid rgba(168,85,247,.12)",
                padding: "8px 20px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                position: "relative", zIndex: 2,
            }}>
                <span style={{ fontSize: 10, color: "#7c3aed", fontFamily: "Cinzel", letterSpacing: ".22em", fontWeight: 700 }}>⚔ PvP ARENA</span>
                <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, animation: "mpGlowPulse 1.5s infinite" }}>● LIVE</span>
            </div>

            <div style={{ padding: "20px clamp(16px,4vw,32px) 28px", position: "relative", zIndex: 2 }}>

                {/* CRIT */}
                {showCrit && (
                    <div style={{
                        position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)",
                        fontFamily: "Cinzel", fontSize: "clamp(18px,4vw,30px)", fontWeight: 900,
                        color: "#fbbf24", textShadow: "0 0 24px #fbbf24,0 0 48px #fbbf24",
                        animation: "mpCritFlash 1.2s ease-out forwards",
                        zIndex: 20, whiteSpace: "nowrap", pointerEvents: "none",
                    }}>⚡ CRIT!</div>
                )}

                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>

                    {/* Hero side */}
                    <div style={{ width: "38%", textAlign: "center" }}>
                        <div style={{
                            backgroundImage: `linear-gradient(90deg,transparent,${heroColor}22,transparent)`,
                            border: `1px solid ${heroColor}30`,
                            borderRadius: 9, padding: "4px 8px", marginBottom: 12,
                            fontSize: "clamp(9px,2.5vw,11px)", fontFamily: "Cinzel",
                            fontWeight: 700, color: heroColor,
                        }}>YOU</div>

                        <div style={{ position: "relative", display: "inline-block" }}>
                            <div style={{
                                position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
                                width: "clamp(50px,12vw,70px)", height: 14, borderRadius: "50%",
                                backgroundImage: `radial-gradient(ellipse,${heroColor}55,transparent 70%)`,
                                filter: "blur(4px)",
                            }} />
                            {dmgFloat && !dmgFloat.isHero && (
                                <div style={{
                                    position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)",
                                    fontSize: "clamp(16px,4vw,22px)", fontWeight: 900, fontFamily: "Cinzel",
                                    color: "#f87171", textShadow: "0 0 10px #ef4444",
                                    animation: "mpFloatUp 1s ease-out forwards",
                                    zIndex: 10, whiteSpace: "nowrap", pointerEvents: "none",
                                }}>💔-{dmgFloat.val}</div>
                            )}
                            <div style={{
                                display: "inline-block",
                                filter: `drop-shadow(0 0 16px ${heroColor}) drop-shadow(0 4px 8px rgba(0,0,0,.9))`,
                                ...heroStyle(),
                            }}>
                                <MiniHero color={heroColor} />
                            </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af", marginBottom: 3, fontWeight: 700 }}>
                                <span>HP</span><span style={{ color: hpColor(heroPct), fontFamily: "Cinzel" }}>{playerHP}/{maxPlayerHP}</span>
                            </div>
                            <div style={{ height: 9, background: "rgba(0,0,0,.6)", borderRadius: 5, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
                                <div style={{ height: "100%", width: `${heroPct}%`, backgroundImage: `linear-gradient(90deg,${hpColor(heroPct)}66,${hpColor(heroPct)})`, borderRadius: 5, boxShadow: `0 0 8px ${hpColor(heroPct)}`, transition: "width .6s ease" }} />
                            </div>
                        </div>
                    </div>

                    {/* VS center */}
                    <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <div style={{ fontFamily: "Cinzel", fontSize: "clamp(24px,6vw,40px)", fontWeight: 900, lineHeight: 1, animation: "mpVsFlash 2s ease infinite" }}>VS</div>
                        <div style={{
                            background: "rgba(0,0,0,.55)", border: "1px solid rgba(255,255,255,.06)",
                            borderRadius: 9, padding: "6px 10px", fontSize: "clamp(9px,2.5vw,11px)",
                            color: "#9ca3af", lineHeight: 1.5, maxWidth: 120, textAlign: "center", minHeight: 36,
                        }}>{logMsg}</div>
                        {lastResult && (
                            <div style={{
                                fontSize: "clamp(10px,2.5vw,12px)", fontWeight: 700, fontFamily: "Cinzel",
                                padding: "4px 12px", borderRadius: 20, animation: "mpBounceIn .4s ease-out",
                                backgroundImage: lastResult.is_correct ? "linear-gradient(135deg,rgba(34,197,94,.28),rgba(21,128,61,.22))" : "linear-gradient(135deg,rgba(239,68,68,.28),rgba(185,28,28,.22))",
                                border: `1px solid ${lastResult.is_correct ? "rgba(74,222,128,.5)" : "rgba(248,113,113,.5)"}`,
                                color: lastResult.is_correct ? "#4ade80" : "#f87171",
                            }}>
                                {lastResult.is_correct ? lastResult.is_critical ? "⚡ CRIT!" : "✓ HIT!" : "✗ MISS!"}
                            </div>
                        )}
                    </div>

                    {/* Monster side */}
                    <div style={{ width: "38%", textAlign: "center" }}>
                        <div style={{
                            backgroundImage: "linear-gradient(90deg,transparent,rgba(239,68,68,.18),transparent)",
                            border: "1px solid rgba(239,68,68,.28)", borderRadius: 9,
                            padding: "4px 8px", marginBottom: 12,
                            fontSize: "clamp(9px,2.5vw,11px)", fontFamily: "Cinzel", fontWeight: 700, color: "#f87171",
                        }}>ENEMY</div>

                        <div style={{ position: "relative", display: "inline-block" }}>
                            <div style={{
                                position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
                                width: "clamp(50px,12vw,70px)", height: 14, borderRadius: "50%",
                                backgroundImage: "radial-gradient(ellipse,rgba(239,68,68,.55),transparent 70%)",
                                filter: "blur(4px)",
                            }} />
                            {dmgFloat && dmgFloat.isHero && (
                                <div style={{
                                    position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)",
                                    fontSize: "clamp(16px,4vw,22px)", fontWeight: 900, fontFamily: "Cinzel",
                                    color: "#fbbf24", textShadow: "0 0 10px #f59e0b",
                                    animation: "mpFloatUp 1s ease-out forwards",
                                    zIndex: 10, whiteSpace: "nowrap", pointerEvents: "none",
                                }}>⚔️-{dmgFloat.val}</div>
                            )}
                            <div style={{
                                display: "inline-block",
                                filter: "drop-shadow(0 0 16px rgba(239,68,68,.85)) drop-shadow(0 4px 8px rgba(0,0,0,.9))",
                                ...monsterStyle(),
                            }}>
                                <MiniMonster />
                            </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af", marginBottom: 3, fontWeight: 700 }}>
                                <span>HP</span><span style={{ color: hpColor(monsterPct), fontFamily: "Cinzel" }}>{monsterHP}/{maxMonsterHP}</span>
                            </div>
                            <div style={{ height: 9, background: "rgba(0,0,0,.6)", borderRadius: 5, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
                                <div style={{ height: "100%", width: `${monsterPct}%`, backgroundImage: `linear-gradient(90deg,${hpColor(monsterPct)}66,${hpColor(monsterPct)})`, borderRadius: 5, boxShadow: `0 0 8px ${hpColor(monsterPct)}`, transition: "width .6s ease" }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ground line */}
                <div style={{ height: 2, marginTop: 18, backgroundImage: "linear-gradient(90deg,transparent,rgba(168,85,247,.5),rgba(239,68,68,.5),rgba(168,85,247,.5),transparent)", borderRadius: 1 }} />
            </div>

            {/* Animations */}
            <style>{`
        @keyframes mpHeroIdle   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes mpMonsterIdle{ 0%,100%{transform:translateY(0) scaleX(1)} 50%{transform:translateY(-7px) scaleX(1.01)} }
        @keyframes mpHeroAttack { 0%{transform:translateX(0) scaleX(1)} 20%{transform:translateX(-8px) scaleX(.92)} 50%{transform:translateX(50px) scaleX(1.2)} 70%{transform:translateX(44px)} 100%{transform:translateX(0) scaleX(1)} }
        @keyframes mpMonsterAttack{ 0%{transform:translateX(0) scaleX(-1)} 20%{transform:translateX(8px) scaleX(-.92)} 50%{transform:translateX(-50px) scaleX(-1.2)} 70%{transform:translateX(-44px) scaleX(-1.1)} 100%{transform:translateX(0) scaleX(-1)} }
        @keyframes mpHeroHit    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(14px);filter:brightness(3) saturate(0)} 40%{transform:translateX(-10px)} 60%{transform:translateX(6px)} 80%{transform:translateX(-3px)} }
        @keyframes mpMonsterHit { 0%,100%{transform:scaleX(-1) translateX(0)} 20%{transform:scaleX(-1) translateX(-14px);filter:brightness(3) saturate(0)} 40%{transform:scaleX(-1) translateX(10px)} 80%{transform:scaleX(-1) translateX(3px)} }
        @keyframes mpDeath      { 0%{opacity:1;transform:scale(1) rotate(0)} 50%{opacity:.5;transform:scale(.8) rotate(-30deg)} 100%{opacity:0;transform:scale(.3) rotate(-90deg) translateY(36px)} }
        @keyframes mpCritFlash  { 0%{opacity:0;transform:scale(.2) rotate(-18deg)} 30%{opacity:1;transform:scale(1.3) rotate(8deg)} 60%{opacity:1} 100%{opacity:0;transform:scale(.8) translateY(-44px)} }
        @keyframes mpFloatUp    { 0%{opacity:1;transform:translateY(0) translateX(-50%) scale(1)} 100%{opacity:0;transform:translateY(-60px) translateX(-50%) scale(1.4)} }
        @keyframes mpVsFlash    { 0%,100%{color:#ef4444;text-shadow:0 0 10px #ef4444} 50%{color:#fbbf24;text-shadow:0 0 20px #fbbf24} }
        @keyframes mpBounceIn   { 0%{transform:scale(.3);opacity:0} 50%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes mpGlowPulse  { 0%,100%{opacity:.4} 50%{opacity:1} }
      `}</style>
        </div>
    );
}

// ── Main Inbox Page ───────────────────────────────────────────────────
export default function InboxPage() {
    const router = useRouter();

    const [battles, setBattles] = useState<any[]>([]);
    const [active, setActive] = useState<any>(null);   // battle being defended
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // ── Battle animation state ────────────────────────────────────────
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [playerHP, setPlayerHP] = useState(100);
    const [monsterHP, setMonsterHP] = useState(100);
    const [heroAnim, setHeroAnim] = useState("idle");
    const [monsterAnim, setMonsterAnim] = useState("idle");
    const [showCrit, setShowCrit] = useState(false);
    const [dmgFloat, setDmgFloat] = useState<any>(null);
    const [logMsg, setLogMsg] = useState("⚔️ Defend your honor!");
    const [lastResult, setLastResult] = useState<any>(null);
    const [showQExpired, setShowQExpired] = useState(false);
    const [showBExpired, setShowBExpired] = useState(false);

    const answeredRef = useRef(false);
    const currentQIdxRef = useRef(0);
    const questionsRef = useRef<any[]>([]);
    const answersRef = useRef<Record<string, number>>({});
    const totalTimeRef = useRef(0);
    const battleIdRef = useRef("");

    useEffect(() => { currentQIdxRef.current = currentQIdx; }, [currentQIdx]);
    useEffect(() => { answersRef.current = answers; }, [answers]);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;
    const headers = { Authorization: `Bearer ${token}` };

    // ── Auto advance after answering ─────────────────────────────────
    const advanceQuestion = useCallback(() => {
        const next = currentQIdxRef.current + 1;
        if (next < questionsRef.current.length) {
            answeredRef.current = false;
            setCurrentQIdx(next);
            setLastResult(null);
            resetQuestionTimer();
        }
    }, []);

    // ── Timer callbacks ───────────────────────────────────────────────
    const handleQuestionExpire = useCallback(() => {
        if (answeredRef.current) return;
        const q = questionsRef.current[currentQIdxRef.current];
        if (!q) return;

        // Timeout — monster attacks
        const newAns = { ...answersRef.current, [q.id]: -1 };
        answersRef.current = newAns;
        setAnswers(newAns);
        totalTimeRef.current += 30;
        answeredRef.current = true;

        // Animate monster attack
        setMonsterAnim("attack");
        setPlayerHP(prev => {
            const dmg = Math.floor(Math.random() * 15) + 8;
            setDmgFloat({ val: dmg, isHero: false });
            setTimeout(() => { setHeroAnim("hit"); setDmgFloat(null); }, 400);
            setTimeout(() => { setHeroAnim("idle"); setMonsterAnim("idle"); }, 900);
            return Math.max(0, prev - dmg);
        });
        setLogMsg("⏰ Time's up! Monster attacks!");
        setShowQExpired(true);
        setTimeout(() => {
            setShowQExpired(false);
            advanceQuestion();
        }, 2200);
    }, [advanceQuestion]);

    const handleBattleExpire = useCallback(() => {
        stopTimers();
        setShowBExpired(true);
        setTimeout(() => autoSubmitDefense(), 2500);
    }, []);

    // ── Timer hook ────────────────────────────────────────────────────
    const {
        questionTimeLeft,
        battleTimeLeft,
        isPaused,
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

    // ── Load inbox ────────────────────────────────────────────────────
    useEffect(() => { loadInbox(); }, []);

    const loadInbox = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${API}/multiplayer/inbox`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setBattles(res.data.pending_battles || []);
  } finally {
    setLoading(false);
  }
};

    // ── Start defending a battle ──────────────────────────────────────
    // THIS is the fix for "Defend Now button not working"
    const startDefending = useCallback((battle: any) => {
        if (!battle.questions || battle.questions.length === 0) {
            setError("No questions found for this battle. Please try again.");
            return;
        }

        // Reset all state
        questionsRef.current = battle.questions;
        battleIdRef.current = battle.id;
        answeredRef.current = false;
        answersRef.current = {};
        totalTimeRef.current = 0;

        setActive(battle);
        setAnswers({});
        setCurrentQIdx(0);
        setLastResult(null);
        setPlayerHP(100);
        setMonsterHP(100);
        setHeroAnim("idle");
        setMonsterAnim("idle");
        setLogMsg("⚔️ Defend your honor!");
        setError("");

        // ✅ Start timers when defense begins
        startTimers();
    }, [startTimers]);

    // ── Handle answer ─────────────────────────────────────────────────
    const handleAnswer = useCallback((qId: string, idx: number) => {
        if (answeredRef.current) return;

        const timeUsed = 30 - questionTimeLeft;
        totalTimeRef.current += timeUsed;
        answeredRef.current = true;
        pauseTimer();

        const newAns = { ...answersRef.current, [qId]: idx };
        answersRef.current = newAns;
        setAnswers(newAns);

        // Animate — we don't know if correct (no correct_index client side)
        // So show hero attacking optimistically, then advance
        setHeroAnim("attack");
        setTimeout(() => {
            setMonsterAnim("hit");
            setDmgFloat({ val: Math.floor(Math.random() * 20) + 10, isHero: true });
            setMonsterHP(prev => Math.max(0, prev - Math.floor(Math.random() * 20) - 10));
            setTimeout(() => {
                setMonsterAnim("idle");
                setDmgFloat(null);
                setHeroAnim("idle");
            }, 600);
        }, 400);
        setLogMsg("⚔️ Answer submitted!");
        setLastResult({ is_correct: true, selected_index: idx });

        setTimeout(() => {
            setLastResult(null);
            answeredRef.current = false;
            resumeTimer();
            advanceQuestion();
        }, 700);
    }, [questionTimeLeft, pauseTimer, resumeTimer, advanceQuestion]);

    // ── Auto submit remaining ─────────────────────────────────────────
    const autoSubmitDefense = useCallback(() => {
        const finalAns: Record<string, number> = { ...answersRef.current };
        questionsRef.current.forEach(q => {
            if (!(q.id in finalAns)) finalAns[q.id] = -1;
        });
        setAnswers(finalAns);
        doSubmitDefense(finalAns);
    }, []);

    // ── Submit defense to backend ─────────────────────────────────────
    const doSubmitDefense = async (finalAnswers?: Record<string, number>) => {
        const ans = finalAnswers || answers;
        setSubmitting(true);
        stopTimers();

        const answerList = questionsRef.current.map(q => ({
            question_id: q.id,
            selected_index: ans[q.id] ?? -1,
        }));

        try {
            const res = await axios.post(
                `${API}/multiplayer/submit-defense`,
                {
                    battle_id: battleIdRef.current,
                    answers: answerList,
                    time_used_seconds: totalTimeRef.current,
                },
                { headers }
            );
            setResult(res.data);
        } catch (e: any) {
            setError(e.response?.data?.detail || "Submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    const allAnswered = active && questionsRef.current.length > 0 &&
        questionsRef.current.every(q => q.id in answers);
    const currentQ = active ? questionsRef.current[currentQIdx] : null;

    // ─────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────

    const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box} body{background:#030712;color:#fff;font-family:'Rajdhani',sans-serif;margin:0}
    button{-webkit-tap-highlight-color:transparent;touch-action:manipulation}
    input{font-size:16px!important}
    @keyframes mpFadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes mpBorderPulse{0%,100%{border-color:rgba(239,68,68,.2)}50%{border-color:rgba(239,68,68,.7);box-shadow:0 0 20px rgba(239,68,68,.3)}}
    @keyframes mpSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @keyframes mpBounceIn{0%{transform:scale(.3);opacity:0}50%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
    @keyframes mpVictoryPulse{0%,100%{box-shadow:0 0 20px rgba(251,191,36,.3)}50%{box-shadow:0 0 60px rgba(251,191,36,.8)}}
    @keyframes mpDefeatPulse{0%,100%{box-shadow:0 0 20px rgba(239,68,68,.3)}50%{box-shadow:0 0 60px rgba(239,68,68,.8)}}
    .mp-answer-grid{display:grid;grid-template-columns:1fr;gap:9px}
    @media(min-width:480px){.mp-answer-grid{grid-template-columns:1fr 1fr}}
  `;

    // ── Result screen ─────────────────────────────────────────────────
    if (result) return (
        <div style={{ minHeight: "100vh", background: "#030712", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Rajdhani", padding: 16 }}>
            <style>{STYLES}</style>
            <div style={{
                backgroundImage: "linear-gradient(135deg,#0a0518,#150a28,#0a0518)",
                border: `3px solid ${result.is_winner ? "#fbbf24" : "#ef4444"}`,
                borderRadius: 24, padding: "clamp(28px,6vw,48px)",
                textAlign: "center", maxWidth: 440, width: "100%",
                animation: result.is_winner ? "mpVictoryPulse 2s infinite" : "mpDefeatPulse 2s infinite",
            }}>
                <div style={{ fontSize: "clamp(60px,16vw,90px)", marginBottom: 12, animation: "mpBounceIn .6s ease-out" }}>
                    {result.is_winner ? "🏆" : result.winner_id === null ? "🤝" : "💀"}
                </div>
                <div style={{
                    fontFamily: "Cinzel", fontSize: "clamp(26px,7vw,40px)", fontWeight: 900,
                    color: result.is_winner ? "#fbbf24" : result.winner_id === null ? "#9ca3af" : "#ef4444",
                    marginBottom: 8,
                }}>
                    {result.is_winner ? "VICTORY!" : result.winner_id === null ? "DRAW" : "DEFEAT"}
                </div>
                <div style={{ background: "rgba(0,0,0,.4)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: 18, margin: "16px 0" }}>
                    {[
                        ["⚔️ Attacker", result.attacker_score],
                        ["🛡️ You", result.your_score],
                        ["🏆 Trophies", result.is_winner ? `+${result.trophies_wagered}` : `-${result.trophies_wagered}`],
                        ["⭐ XP", `+${result.xp_gained}`],
                    ].map(([l, v]) => (
                        <div key={l as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.04)", fontSize: "clamp(13px,3.5vw,15px)", fontWeight: 600 }}>
                            <span style={{ color: "#9ca3af" }}>{l}</span>
                            <span style={{ color: "#e2e8f0", fontFamily: "Cinzel" }}>{v}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => router.push("/multiplayer")} style={{ backgroundImage: "linear-gradient(135deg,#7c3aed,#be185d)", border: "none", borderRadius: 12, padding: "13px 40px", color: "#fff", fontFamily: "Cinzel", fontSize: 14, cursor: "pointer", fontWeight: 700, letterSpacing: ".1em" }}>
                    🏠 BACK TO HUB
                </button>
            </div>
        </div>
    );

    // ── Active defense with animation + timer ─────────────────────────
    if (active) return (
        <div style={{ minHeight: "100vh", background: "#030712", color: "#fff", fontFamily: "Rajdhani" }}>
            <style>{STYLES}</style>

            {/* Timer overlays */}
            {showQExpired && <TimeoutOverlay type="question" onClose={() => setShowQExpired(false)} />}
            {showBExpired && <TimeoutOverlay type="battle" onClose={() => setShowBExpired(false)} />}

            {/* Nav */}
            <div style={{ background: "rgba(0,0,0,.78)", borderBottom: "1px solid rgba(168,85,247,.18)", padding: "0 clamp(14px,3vw,24px)", height: 52, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(16px)" }}>
                <button onClick={() => { stopTimers(); setActive(null); }} style={{ background: "none", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#9ca3af", fontSize: 13, fontFamily: "Rajdhani", fontWeight: 600 }}>← Inbox</button>
                <div style={{ fontFamily: "Cinzel", fontSize: "clamp(12px,3vw,15px)", fontWeight: 700, background: "linear-gradient(135deg,#f87171,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🛡️ DEFEND</div>
                {/* ✅ Battle clock in nav */}
                <BattleClock timeLeft={battleTimeLeft} isPaused={isPaused} />
            </div>

            <div style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(14px,3vw,20px) clamp(12px,3vw,16px)" }}>

                {/* Attacker info */}
                <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 12, padding: "10px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontSize: 12, color: "#f87171", fontWeight: 700 }}>⚔️ {active.attacker_name} is attacking you!</div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                            {active.questions?.length} questions · {active.trophies_wagered} trophies at stake
                        </div>
                    </div>
                    <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 700, animation: "mpBorderPulse 2s infinite" }}>
                        vs {user?.username}
                    </div>
                </div>

                {/* ✅ Battle animation arena */}
                <BattleAnimArena
                    heroColor="#60a5fa"
                    playerHP={playerHP}
                    maxPlayerHP={100}
                    monsterHP={monsterHP}
                    maxMonsterHP={100}
                    heroAnim={heroAnim}
                    monsterAnim={monsterAnim}
                    dmgFloat={dmgFloat}
                    showCrit={showCrit}
                    logMsg={logMsg}
                    lastResult={lastResult}
                />

                {/* Progress dots */}
                <div style={{ display: "flex", gap: 6, marginBottom: 16, justifyContent: "center", flexWrap: "wrap" }}>
                    {questionsRef.current.map((q, i) => {
                        const isDone = q.id in answers;
                        const isTimeout = answers[q.id] === -1;
                        const isCurrent = i === currentQIdx;
                        return (
                            <div key={q.id} style={{
                                width: isCurrent ? 26 : 10,
                                height: 10, borderRadius: 5,
                                background: isDone ? (isTimeout ? "#ef4444" : "#22c55e") : isCurrent ? "#a855f7" : "rgba(255,255,255,.1)",
                                transition: "all .3s",
                                boxShadow: isCurrent ? "0 0 8px rgba(168,85,247,.6)" : "none",
                            }} />
                        );
                    })}
                </div>

                {/* Question */}
                {currentQ && !allAnswered && (
                    <div style={{ background: "rgba(0,0,0,.5)", border: "1px solid rgba(168,85,247,.2)", borderRadius: 16, padding: 20, marginBottom: 16, animation: "mpFadeIn .3s ease-out" }}>

                        {/* ✅ Question timer bar */}
                        <QuestionTimerBar
                            timeLeft={questionTimeLeft}
                            maxTime={30}
                            isPaused={isPaused}
                        />

                        <div style={{ fontSize: 10, color: "#7c3aed", letterSpacing: ".2em", fontWeight: 700, marginBottom: 12, fontFamily: "Cinzel" }}>
                            🛡️ DEFEND — Q{currentQIdx + 1}/{questionsRef.current.length}
                        </div>
                        <p style={{ fontSize: "clamp(13px,3.5vw,15px)", lineHeight: 1.65, color: "#e2e8f0", marginBottom: 16, fontWeight: 500 }}>
                            {currentQ.body}
                        </p>

                        <div className="mp-answer-grid">
                            {currentQ.options?.map((opt: string, i: number) => (
                                <button key={i}
                                    onClick={() => !answeredRef.current && handleAnswer(currentQ.id, i)}
                                    disabled={answeredRef.current}
                                    style={{
                                        background: "rgba(96,165,250,.06)", border: "1px solid rgba(96,165,250,.18)",
                                        borderRadius: 12, padding: "clamp(11px,3vw,14px) 14px",
                                        color: "#bfdbfe", cursor: answeredRef.current ? "not-allowed" : "pointer",
                                        textAlign: "left", fontSize: "clamp(12px,3vw,14px)",
                                        fontFamily: "Rajdhani", fontWeight: 600, transition: "all .15s", minHeight: 48,
                                    }}
                                    onMouseEnter={e => { if (!answeredRef.current) { e.currentTarget.style.background = "rgba(96,165,250,.14)"; e.currentTarget.style.borderColor = "rgba(96,165,250,.45)"; e.currentTarget.style.transform = "scale(1.02)"; } }}
                                    onMouseLeave={e => { if (!answeredRef.current) { e.currentTarget.style.background = "rgba(96,165,250,.06)"; e.currentTarget.style.borderColor = "rgba(96,165,250,.18)"; e.currentTarget.style.transform = "scale(1)"; } }}
                                >
                                    <span style={{ color: "#6b7280", fontWeight: 800, marginRight: 7, fontFamily: "Cinzel", fontSize: "clamp(10px,2.5vw,12px)" }}>
                                        {["A", "B", "C", "D"][i]}
                                    </span>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* All answered */}
                {allAnswered && !submitting && (
                    <div style={{ textAlign: "center", animation: "mpFadeIn .3s ease-out" }}>
                        <div style={{ color: "#22c55e", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>✅ All questions answered!</div>
                        <button onClick={() => doSubmitDefense()} style={{
                            backgroundImage: "linear-gradient(135deg,#1d4ed8,#1e40af)",
                            border: "none", borderRadius: 12, padding: "14px 48px",
                            color: "#fff", fontFamily: "Cinzel", fontSize: 15,
                            fontWeight: 700, cursor: "pointer", letterSpacing: ".1em",
                            boxShadow: "0 0 24px rgba(29,78,216,.4)",
                        }}>🛡️ SUBMIT DEFENSE</button>
                    </div>
                )}

                {submitting && (
                    <div style={{ textAlign: "center", padding: 24 }}>
                        <div style={{ fontSize: 40, animation: "mpSpin 1s linear infinite", display: "inline-block" }}>⚔️</div>
                        <div style={{ color: "#9ca3af", marginTop: 8, fontSize: 13 }}>Calculating results...</div>
                    </div>
                )}

                {error && (
                    <div style={{ background: "rgba(127,29,29,.3)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#fca5a5", textAlign: "center", marginTop: 12 }}>
                        ⚠️ {error}
                    </div>
                )}
            </div>
        </div>
    );

    // ── Inbox list ────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: "100vh", background: "#030712", color: "#fff", fontFamily: "Rajdhani" }}>
            <style>{STYLES}</style>

            <nav style={{ background: "rgba(0,0,0,.78)", borderBottom: "1px solid rgba(239,68,68,.18)", padding: "0 clamp(14px,3vw,24px)", height: 52, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(16px)" }}>
                <button onClick={() => router.push("/multiplayer")} style={{ background: "none", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#9ca3af", fontSize: 13, fontFamily: "Rajdhani", fontWeight: 600 }}>← HUB</button>
                <div style={{ fontFamily: "Cinzel", fontSize: "clamp(13px,3.5vw,16px)", fontWeight: 700, color: "#ef4444" }}>🛡️ DEFENSE INBOX ({battles.length})</div>
                <button onClick={loadInbox} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 20 }}>↻</button>
            </nav>

            <div style={{ maxWidth: 700, margin: "0 auto", padding: "clamp(16px,4vw,24px) clamp(14px,3vw,20px)" }}>

                {loading ? (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        <div style={{ fontSize: 40, animation: "mpSpin 1s linear infinite", display: "inline-block" }}>🛡️</div>
                    </div>
                ) : battles.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <div style={{ fontSize: 56, marginBottom: 12 }}>🛡️</div>
                        <div style={{ fontFamily: "Cinzel", fontSize: 16, color: "#4b5563" }}>No pending battles</div>
                        <div style={{ fontSize: 13, color: "#374151", marginTop: 6 }}>You are safe... for now.</div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {battles.map((b, i) => (
                            <div key={b.id} style={{
                                background: "rgba(239,68,68,.05)",
                                border: "1px solid rgba(239,68,68,.22)",
                                borderRadius: 14, padding: "clamp(14px,3vw,20px)",
                                display: "flex", alignItems: "center",
                                justifyContent: "space-between", gap: 14,
                                flexWrap: "wrap",
                                animation: `mpFadeIn .3s ease-out ${i * .06}s both`,
                                // ✅ Urgent pulse for battles expiring soon
                                ...(new Date(b.expires_at).getTime() - Date.now() < 3600000
                                    ? { animation: "mpBorderPulse 2s ease infinite" } : {}),
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: "clamp(13px,3.5vw,15px)" }}>
                                        ⚔️ <span style={{ color: "#f87171" }}>{b.attacker_name}</span> is attacking you!
                                    </div>
                                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                                        {b.questions?.length || 0} questions ·{" "}
                                        <span style={{ color: "#fbbf24", fontWeight: 700 }}>{b.trophies_wagered}🏆</span> at stake
                                    </div>
                                    <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>
                                        Expires: {new Date(b.expires_at).toLocaleString()}
                                    </div>
                                </div>
                                {/* ✅ DEFEND NOW button — calls startDefending */}
                                <button
                                    onClick={() => startDefending(b)}
                                    style={{
                                        backgroundImage: "linear-gradient(135deg,#dc2626,#991b1b)",
                                        border: "none", borderRadius: 10,
                                        padding: "clamp(10px,2.5vw,12px) clamp(16px,4vw,24px)",
                                        color: "#fff", fontFamily: "Cinzel",
                                        fontSize: "clamp(11px,2.5vw,13px)", fontWeight: 700,
                                        cursor: "pointer", letterSpacing: ".08em",
                                        whiteSpace: "nowrap",
                                        boxShadow: "0 0 18px rgba(220,38,38,.4)",
                                        transition: "all .2s",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 0 28px rgba(220,38,38,.7)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(220,38,38,.4)"; }}
                                >
                                    🛡️ DEFEND NOW
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
