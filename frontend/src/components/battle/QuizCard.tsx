// src/components/battle/QuizCard.tsx

interface Props {
    question: {
        id: string;
        body: string;
        options: string[];
        explanation?: string;
        // ← NO correct_index here anymore
    };
    onAnswer: (index: number) => void;
    answered: boolean;
    lastResult: {
        is_correct: boolean;
        selected_index?: number;
        correct_index?: number;   // ← comes from backend AFTER answering
        is_critical?: boolean;
        explanation?: string;
    } | null;
}

export function QuizCard({ question, onAnswer, answered, lastResult }: Props) {
    return (
        <div style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(168,85,247,0.2)",
            borderRadius: 16, padding: 20
        }}>
            <div style={{
                fontSize: 10, color: "#7c3aed",
                letterSpacing: "0.2em", fontWeight: 700,
                marginBottom: 12, fontFamily: "Cinzel"
            }}>
                ⚔️ ANSWER TO ATTACK
            </div>
            <p style={{
                fontSize: 15, lineHeight: 1.6,
                color: "#e2e8f0", marginBottom: 16
            }}>
                {question.body}
            </p>
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr", gap: 9
            }}>
                {question.options?.map((opt, i) => {
                    let bg = "rgba(255,255,255,0.03)";
                    let border = "rgba(255,255,255,0.08)";
                    let color = "#d1d5db";
                    let shadow = "none";

                    // Find the options map inside page_battle.tsx and update:
                    if (answered && lastResult) {
                        const ci = lastResult.correct_index;   // ← read from lastResult NOT question

                        if (ci !== undefined && i === ci) {
                            bg = "rgba(34,197,94,.14)";
                            border = "rgba(74,222,128,.5)";
                            color = "#86efac";
                            shadow = "0 0 12px rgba(34,197,94,.3)";
                        } else if (!lastResult.is_correct && i === lastResult.selected_index) {
                            bg = "rgba(239,68,68,.14)";
                            border = "rgba(248,113,113,.5)";
                            color = "#fca5a5";
                            shadow = "0 0 12px rgba(239,68,68,.3)";
                        } else {
                            bg = "rgba(0,0,0,.18)";
                            border = "rgba(255,255,255,.03)";
                            color = "#374151";
                        }
                    }

                    return (
                        <button key={i}
                            onClick={() => !answered && onAnswer(i)}
                            disabled={answered}
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
                                transition: "all 0.15s",
                                boxShadow: shadow,
                                minHeight: 48,
                            }}>
                            <span style={{
                                color: answered && lastResult?.correct_index === i
                                    ? "#4ade80" : "#6b7280",
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

            {/* Explanation — shown after wrong answer */}
            {answered && lastResult && !lastResult.is_correct
                && lastResult.explanation && (
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
                        💡 <strong>Tip:</strong> {lastResult.explanation}
                    </div>
                )}
        </div>
    );
}
