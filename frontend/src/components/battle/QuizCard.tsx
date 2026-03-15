interface Question {
    id: string;
    body: string;
    options: string[];
    correct_index: number;
    explanation: string;
}

interface Props {
    question: Question;
    onAnswer: (index: number) => void;
    answered: boolean;
    lastResult: any;
}

export function QuizCard({ question, onAnswer, answered, lastResult }: Props) {
    return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <p className="text-xs text-purple-400 uppercase tracking-wider mb-3">
                ⚔️ Answer to Attack
            </p>
            <p className="text-white text-base mb-5 leading-relaxed">
                {question.body}
            </p>
            <div className="grid grid-cols-1 gap-3">
                {question.options.map((opt, i) => {
                    let style = "bg-gray-800 border-gray-600 text-gray-200 hover:border-purple-500";
                    if (answered) {
                        if (i === question.correct_index)
                            style = "bg-green-900/50 border-green-500 text-green-300";
                        else if (lastResult && !lastResult.is_correct &&
                            i === lastResult.selected_index)
                            style = "bg-red-900/50 border-red-500 text-red-300";
                        else
                            style = "bg-gray-800 border-gray-700 text-gray-500 opacity-50";
                    }
                    return (
                        <button
                            key={i}
                            onClick={() => !answered && onAnswer(i)}
                            disabled={answered}
                            className={`w-full text-left px-4 py-3 rounded-lg border
                transition-all text-sm ${style}`}
                        >
                            <span className="font-bold mr-2 text-gray-400">
                                {["A", "B", "C", "D"][i]}.
                            </span>
                            {opt}
                        </button>
                    );
                })}
            </div>
            {answered && lastResult && !lastResult.is_correct &&
                question.explanation && (
                    <p className="mt-4 text-xs text-yellow-300 bg-yellow-900/20
          border border-yellow-800 rounded-lg p-3">
                        💡 {question.explanation}
                    </p>
                )}
        </div>
    );
}