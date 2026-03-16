"use client";
import { useState } from 'react';
import axios from 'axios';

interface Props {
    question: string;
    wrongAnswer: string;
    correctAnswer: string;
    subject: string;
    userLevel: number;
}

export function AITutorPanel({
    question, wrongAnswer, correctAnswer, subject, userLevel
}: Props) {
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchExplanation = async () => {
        setLoading(true);
        try {
            const res = await axios.post('/api/ai/explain', {
                question, student_answer: wrongAnswer,
                correct_answer: correctAnswer, subject,
                user_level: userLevel
            });
            setExplanation(res.data.explanation);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='bg-purple-950 border border-purple-700 rounded-xl p-4'>
            <div className='flex items-center gap-2 mb-3'>
                <span className='text-2xl'>🤖</span>
                <span className='text-purple-300 font-semibold text-sm'>
                    AI TUTOR — Powered by Gemini
                </span>
            </div>
            {!explanation ? (
                <button
                    onClick={fetchExplanation}
                    disabled={loading}
                    className='w-full py-2 bg-purple-700 hover:bg-purple-600 text-white
            rounded-lg text-sm transition-colors'
                >
                    {loading ? '✨ Gemini is thinking...' : '🔍 Explain my mistake'}
                </button>
            ) : (
                <p className='text-purple-100 text-sm leading-relaxed'>
                    {explanation}
                </p>
            )}
        </div>
    );
}
