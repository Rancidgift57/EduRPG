"use client";

interface Question {
    id: string;
    body: string;
    options: string[];
    explanation?: string;
    // ✅ No correct_index here — never sent from backend before answering
}

interface LastEvent {
    is_correct: boolean;
    correct_index: number;   // ← revealed AFTER answering
    selected_index: number;
    is_critical?: boolean;
    explanation?: string;
}

interface QuizCardProps {
    question: Question | null;
    onAnswer: (index: number) => void;   // ✅ number, not string
    answered?: boolean;
    lastEvent?: LastEvent | null;
    lastResult?: LastEvent | null;          // ✅ support both names
}

export function QuizCard({
    question,
    onAnswer,
    answered = false,
    lastEvent = null,
    lastResult = null,
}: QuizCardProps) {

    // Support both prop names
    const result = lastEvent ?? lastResult;

    if (!question) return null;

    return (
        <div style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(168,85,247,0.2)",
            borderRadius: 16,
            padding: 20,
        }}>
            <div style={{
                fontSize: 10,
                color: "#7c3aed",
                letterSpacing: "0.2em",
                fontWeight: 700,
                marginBottom: 12,
                fontFamily: "Cinzel",
            }}>
                ⚔️ ANSWER TO ATTACK
            </div>

            <p style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: "#e2e8f0",
                marginBottom: 16,
            }}>
                {question.body}
            </p>

            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 9,
            }}>
                {question.options?.map((opt, i) => {
                    // ── Colour logic ────────────────────────────────────────
                    let bg = "rgba(255,255,255,0.03)";
                    let border = "rgba(255,255,255,0.08)";
                    let color = "#d1d5db";
                    let shadow = "none";

                    // ✅ Safe — only runs when answered AND result exists
                    if (answered && result !== null && result !== undefined) {
                        const ci = result.correct_index ?? -1;

                        if (ci !== -1 && i === ci) {
                            // Correct answer → green
                            bg = "rgba(34,197,94,0.15)";
                            border = "rgba(74,222,128,0.5)";
                            color = "#86efac";
                            shadow = "0 0 12px rgba(34,197,94,0.3)";
                        } else if (!result.is_correct && i === result.selected_index) {
                            // Wrong chosen answer → red
                            bg = "rgba(239,68,68,0.15)";
                            border = "rgba(248,113,113,0.5)";
                            color = "#fca5a5";
                            shadow = "0 0 12px rgba(239,68,68,0.3)";
                        } else {
                            // Other options → dim
                            bg = "rgba(0,0,0,0.2)";
                            border = "rgba(255,255,255,0.03)";
                            color = "#374151";
                            shadow = "none";
                        }
                    }
                    // ────────────────────────────────────────────────────────

                    return (
                        <button
                            key={i}
                            onClick={() => !answered && onAnswer(i)}  // ✅ passes number
                            disabled={answered}
                            onMouseEnter={e => {
                                if (!answered) {
                                    e.currentTarget.style.background = "rgba(124,58,237,0.1)";
                                    e.currentTarget.style.borderColor = "rgba(168,85,247,0.45)";
                                    e.currentTarget.style.transform = "scale(1.02)";
                                }
                            }}
                            onMouseLeave={e => {
                                if (!answered) {
                                    e.currentTarget.style.background = bg;
                                    e.currentTarget.style.borderColor = border;
                                    e.currentTarget.style.transform = "scale(1)";
                                }
                            }}
                            style={{
                                background: bg,
                                border: `1px solid ${border}`,
                                borderRadius: 11,
                                padding: "12px 14px",
                                color,
                                cursor: answered ? "not-allowed" : "pointer",
                                textAlign: "left",
                                fontSize: "clamp(12px,3.2vw,14px)",
                                fontFamily: "Rajdhani",
                                fontWeight: 600,
                                transition: "all 0.2s",
                                boxShadow: shadow,
                                minHeight: 48,
                            }}
                        >
                            <span style={{
                                color: answered && (result?.correct_index ?? -1) === i
                                    ? "#4ade80"
                                    : "#6b7280",
                                fontWeight: 800,
                                marginRight: 7,
                                fontFamily: "Cinzel",
                                fontSize: "clamp(10px,2.5vw,12px)",
                            }}>
                                {["A", "B", "C", "D"][i]}
                            </span>
                            {opt}
                        </button>
                    );
                })}
            </div>

            {/* Explanation — only shown after wrong answer */}
            {answered
                && result !== null
                && result !== undefined
                && !result.is_correct
                && result.explanation
                && (
                    <div style={{
                        marginTop: 12,
                        padding: "11px 14px",
                        backgroundImage: "linear-gradient(135deg,rgba(234,179,8,0.08),rgba(217,119,6,0.04))",
                        border: "1px solid rgba(234,179,8,0.22)",
                        borderRadius: 11,
                        fontSize: "clamp(11px,3vw,13px)",
                        color: "#fde68a",
                        lineHeight: 1.65,
                    }}>
                        💡 <strong>Tip:</strong> {result.explanation}
                    </div>
                )}
        </div>
    );
}
