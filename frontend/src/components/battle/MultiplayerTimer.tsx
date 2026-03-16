"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────

interface MultiplayerTimerConfig {
    questionSeconds: number;   // 30s per question
    battleMinutes: number;   // 3 min total battle
    onQuestionExpire: () => void;
    onBattleExpire: () => void;
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useMultiplayerTimer({
    questionSeconds = 30,
    battleMinutes = 3,
    onQuestionExpire,
    onBattleExpire,
}: MultiplayerTimerConfig) {

    const [questionTimeLeft, setQuestionTimeLeft] = useState(questionSeconds);
    const [battleTimeLeft, setBattleTimeLeft] = useState(battleMinutes * 60);
    const [isPaused, setIsPaused] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    // ✅ Store callbacks in refs — timer always calls LATEST version
    // This prevents the stale closure bug where timer fires old callback
    const onQuestionExpireRef = useRef(onQuestionExpire);
    const onBattleExpireRef = useRef(onBattleExpire);
    useEffect(() => { onQuestionExpireRef.current = onQuestionExpire; }, [onQuestionExpire]);
    useEffect(() => { onBattleExpireRef.current = onBattleExpire; }, [onBattleExpire]);

    // Internal refs — readable by timer intervals without stale closures
    const pausedRef = useRef(false);
    const activeRef = useRef(false);
    const questionFiredRef = useRef(false);  // prevent double-firing
    const battleFiredRef = useRef(false);

    const questionIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // ── Clear all intervals ───────────────────────────────────────────
    const clearAll = useCallback(() => {
        if (questionIntervalRef.current) {
            clearInterval(questionIntervalRef.current);
            questionIntervalRef.current = null;
        }
        if (battleIntervalRef.current) {
            clearInterval(battleIntervalRef.current);
            battleIntervalRef.current = null;
        }
    }, []);

    // ── Pause — call BEFORE API request ──────────────────────────────
    const pauseTimer = useCallback(() => {
        pausedRef.current = true;
        setIsPaused(true);
    }, []);

    // ── Resume — call AFTER API response ─────────────────────────────
    const resumeTimer = useCallback(() => {
        pausedRef.current = false;
        setIsPaused(false);
    }, []);

    // ── Reset question timer — call when new question arrives ─────────
    const resetQuestionTimer = useCallback(() => {
        // Stop old question interval
        if (questionIntervalRef.current) {
            clearInterval(questionIntervalRef.current);
            questionIntervalRef.current = null;
        }

        questionFiredRef.current = false;
        pausedRef.current = false;
        setIsPaused(false);
        setQuestionTimeLeft(questionSeconds);

        // Only restart if battle is still active
        if (!activeRef.current) return;

        questionIntervalRef.current = setInterval(() => {
            if (pausedRef.current) return;  // ⏸ frozen — do nothing

            setQuestionTimeLeft(prev => {
                if (prev <= 1) {
                    // ✅ setTimeout(0) — runs outside React setState batch
                    if (!questionFiredRef.current) {
                        questionFiredRef.current = true;
                        setTimeout(() => onQuestionExpireRef.current(), 0);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [questionSeconds]);

    // ── Start both timers ─────────────────────────────────────────────
    const startTimers = useCallback(() => {
        clearAll();
        activeRef.current = true;
        questionFiredRef.current = false;
        battleFiredRef.current = false;
        pausedRef.current = false;

        setQuestionTimeLeft(questionSeconds);
        setBattleTimeLeft(battleMinutes * 60);
        setIsPaused(false);
        setIsRunning(true);

        // ── 30s question countdown ────────────────────────────────────
        questionIntervalRef.current = setInterval(() => {
            if (pausedRef.current) return;

            setQuestionTimeLeft(prev => {
                if (prev <= 1) {
                    if (!questionFiredRef.current) {
                        questionFiredRef.current = true;
                        setTimeout(() => onQuestionExpireRef.current(), 0);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // ── 3-min battle countdown ────────────────────────────────────
        battleIntervalRef.current = setInterval(() => {
            if (pausedRef.current) return;

            setBattleTimeLeft(prev => {
                if (prev <= 1) {
                    if (!battleFiredRef.current) {
                        battleFiredRef.current = true;
                        setTimeout(() => onBattleExpireRef.current(), 0);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [questionSeconds, battleMinutes, clearAll]);

    // ── Stop everything ───────────────────────────────────────────────
    const stopTimers = useCallback(() => {
        activeRef.current = false;
        setIsRunning(false);
        clearAll();
    }, [clearAll]);

    // Cleanup on unmount
    useEffect(() => () => clearAll(), [clearAll]);

    return {
        questionTimeLeft,
        battleTimeLeft,
        isPaused,
        isRunning,
        startTimers,
        stopTimers,
        pauseTimer,
        resumeTimer,
        resetQuestionTimer,
    };
}

// ── Question Timer Bar ────────────────────────────────────────────────

interface QuestionTimerBarProps {
    timeLeft: number;
    maxTime: number;
    isPaused: boolean;
}

export function QuestionTimerBar({
    timeLeft,
    maxTime,
    isPaused,
}: QuestionTimerBarProps) {
    const pct = Math.max(0, (timeLeft / maxTime) * 100);
    const isUrgent = timeLeft <= 10 && !isPaused;
    const color = timeLeft > 15
        ? "#22c55e"
        : timeLeft > 8
            ? "#f59e0b"
            : "#ef4444";

    return (
        <div style={{ width: "100%", marginBottom: 14 }}>

            {/* Label row */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 5,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
            }}>
                <span style={{ color: "#6b7280" }}>
                    {isPaused ? "⏳ Checking answer..." : "⏱ Time to answer"}
                </span>
                <span style={{
                    color: isPaused ? "#6b7280" : isUrgent ? "#ef4444" : color,
                    fontFamily: "Cinzel",
                    fontSize: isUrgent ? 15 : 12,
                    animation: isUrgent ? "mpTimerPulse 0.5s ease infinite" : "none",
                    textShadow: isUrgent ? "0 0 8px #ef4444" : "none",
                    transition: "all 0.3s",
                }}>
                    {isPaused ? "—" : `${timeLeft}s`}
                </span>
            </div>

            {/* Bar track */}
            <div style={{
                height: 9,
                background: "rgba(0,0,0,0.5)",
                borderRadius: 5,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.07)",
                position: "relative",
            }}>
                {/* Fill */}
                <div style={{
                    height: "100%",
                    width: `${isPaused ? pct : pct}%`,
                    backgroundImage: isPaused
                        ? "linear-gradient(90deg,rgba(107,114,128,0.4),rgba(107,114,128,0.7))"
                        : `linear-gradient(90deg,${color}55,${color})`,
                    borderRadius: 5,
                    boxShadow: isPaused ? "none" : `0 0 8px ${color}`,
                    transition: isPaused
                        ? "background-image 0.3s ease"
                        : "width 0.95s linear, background-image 0.3s ease",
                }} />

                {/* Shimmer while paused */}
                {isPaused && (
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: "linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)",
                        animation: "mpShimmer 1.5s infinite",
                    }} />
                )}
            </div>

            {/* Urgent warning */}
            {isUrgent && timeLeft > 0 && (
                <div style={{
                    textAlign: "center",
                    marginTop: 5,
                    fontSize: 10,
                    color: "#ef4444",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    animation: "mpTimerPulse 0.5s ease infinite",
                }}>
                    ⚠️ ANSWER NOW!
                </div>
            )}

            <style>{`
        @keyframes mpTimerPulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.35; }
        }
        @keyframes mpShimmer {
          from { transform:translateX(-100%); }
          to   { transform:translateX(200%); }
        }
      `}</style>
        </div>
    );
}

// ── Battle Clock (3-min countdown) ───────────────────────────────────

interface BattleClockProps {
    timeLeft: number;
    isPaused: boolean;
}

export function BattleClock({ timeLeft, isPaused }: BattleClockProps) {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const isUrgent = timeLeft <= 30 && !isPaused;
    const pct = (timeLeft / 180) * 100;  // 180 = 3 min in seconds

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            background: isUrgent
                ? "rgba(239,68,68,0.12)"
                : "rgba(0,0,0,0.4)",
            border: `1px solid ${isUrgent
                ? "rgba(239,68,68,0.45)"
                : "rgba(255,255,255,0.08)"}`,
            borderRadius: 12,
            padding: "8px 16px",
            minWidth: 90,
            transition: "all 0.3s",
            animation: isUrgent ? "mpBorderPulse 1s ease infinite" : "none",
        }}>
            {/* Clock digits */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11 }}>
                    {isPaused ? "⏳" : isUrgent ? "🔴" : "⏱"}
                </span>
                <span style={{
                    fontFamily: "Cinzel",
                    fontSize: 18,
                    fontWeight: 700,
                    color: isPaused ? "#6b7280" : isUrgent ? "#ef4444" : "#fbbf24",
                    textShadow: isUrgent ? "0 0 8px #ef4444" : "none",
                    letterSpacing: "0.1em",
                    minWidth: 48,
                    textAlign: "center",
                    lineHeight: 1,
                }}>
                    {isPaused
                        ? "--:--"
                        : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
                    }
                </span>
            </div>

            {/* Mini progress bar */}
            <div style={{
                width: 70,
                height: 3,
                background: "rgba(0,0,0,0.5)",
                borderRadius: 2,
                overflow: "hidden",
            }}>
                <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    backgroundImage: isUrgent
                        ? "linear-gradient(90deg,#ef444466,#ef4444)"
                        : "linear-gradient(90deg,#fbbf2466,#fbbf24)",
                    borderRadius: 2,
                    transition: "width 1s linear",
                }} />
            </div>

            <span style={{
                fontSize: 9,
                color: "#6b7280",
                fontWeight: 700,
                letterSpacing: "0.12em",
            }}>
                {isPaused ? "WAIT" : "BATTLE TIME"}
            </span>

            <style>{`
        @keyframes mpBorderPulse {
          0%,100% { border-color:rgba(239,68,68,0.3); }
          50%      {
            border-color:rgba(239,68,68,0.8);
            box-shadow:0 0 14px rgba(239,68,68,0.4);
          }
        }
      `}</style>
        </div>
    );
}

// ── Timeout Overlay ───────────────────────────────────────────────────

interface TimeoutOverlayProps {
    type: "question" | "battle";
    onClose: () => void;
}

export function TimeoutOverlay({ type, onClose }: TimeoutOverlayProps) {
    useEffect(() => {
        if (type === "question") {
            const t = setTimeout(onClose, 2200);
            return () => clearTimeout(t);
        }
    }, [type, onClose]);

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}>
            <div style={{
                textAlign: "center",
                background: "linear-gradient(135deg,#1a0505,#2a0808)",
                border: "2px solid rgba(239,68,68,0.5)",
                borderRadius: 24,
                padding: "40px 48px",
                maxWidth: 340,
                animation: "mpBounceIn 0.4s ease-out",
                boxShadow: "0 0 60px rgba(239,68,68,0.3)",
            }}>
                <div style={{ fontSize: 68, marginBottom: 14 }}>
                    {type === "question" ? "⌛" : "🏁"}
                </div>
                <div style={{
                    fontFamily: "Cinzel",
                    fontSize: 26,
                    fontWeight: 900,
                    color: "#ef4444",
                    marginBottom: 8,
                    textShadow: "0 0 20px rgba(239,68,68,0.8)",
                }}>
                    {type === "question" ? "TIME'S UP!" : "BATTLE OVER!"}
                </div>
                <p style={{
                    color: "#9ca3af",
                    fontSize: 13,
                    lineHeight: 1.6,
                    marginBottom: type === "battle" ? 20 : 0,
                }}>
                    {type === "question"
                        ? "You ran out of time. The monster attacks!"
                        : "The 3-minute battle has ended. Calculating results..."
                    }
                </p>
                {type === "battle" && (
                    <button onClick={onClose} style={{
                        backgroundImage: "linear-gradient(135deg,#7c3aed,#be185d)",
                        border: "none",
                        borderRadius: 12,
                        padding: "12px 32px",
                        color: "#fff",
                        fontFamily: "Cinzel",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        letterSpacing: "0.1em",
                    }}>
                        SEE RESULTS →
                    </button>
                )}
            </div>
            <style>{`
        @keyframes mpBounceIn {
          0%   { transform:scale(0.3); opacity:0; }
          50%  { transform:scale(1.08); }
          100% { transform:scale(1); opacity:1; }
        }
      `}</style>
        </div>
    );
}
