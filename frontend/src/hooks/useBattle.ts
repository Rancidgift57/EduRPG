// hooks/useBattle.ts
import { useCallback } from 'react';
import axios from 'axios';
import { useBattleStore } from '../store/battleStore';

const API = process.env.NEXT_PUBLIC_API_URL;

export function useBattle(sessionId: string) {
    const { setPlayerHP, setMonsterHP, setCurrentQuestion, setLastEvent } = useBattleStore();

    const token = typeof window !== 'undefined'
        ? localStorage.getItem('token') || ''
        : '';

    // ✅ Accept number — matches QuizCard's onAnswer signature
    const submitAnswer = useCallback(async (
        selectedIndex: number,
        skill?: string
    ) => {
        if (!sessionId) return;

        const store = useBattleStore.getState();
        const question = store.currentQuestion;
        if (!question) return;

        try {
            const res = await axios.post(
                `${API}/battle/answer`,
                {
                    session_id: sessionId,
                    selected_index: selectedIndex,   // ← number, matches backend
                    question_id: question.id,
                    skill: skill ?? null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const r = res.data;
            setPlayerHP(r.player_hp);
            setMonsterHP(r.monster_hp);

            if (r.next_question) {
                setCurrentQuestion(r.next_question);
            }

            setLastEvent({
                is_correct: r.is_correct,
                correct_index: r.correct_index ?? -1,
                selected_index: selectedIndex,
                damage: r.damage ?? 0,
                is_critical: r.is_critical ?? false,
                explanation: r.explanation ?? '',
                xp_gained: r.xp_gained ?? 0,
                action: r.action ?? '',
                battle_over: r.battle_over ?? false,
                result: r.result ?? '',
            });

        } catch (e) {
            console.error('submitAnswer error:', e);
        }
    }, [sessionId, token]);

    return { submitAnswer };
}
