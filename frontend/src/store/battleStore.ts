// store/battleStore.ts
import { create } from 'zustand';

interface LastEvent {
    is_correct: boolean;
    correct_index: number;
    selected_index: number;
    damage: number;
    is_critical: boolean;
    explanation: string;
    xp_gained: number;
    action: string;
    battle_over: boolean;
    result: string;
}

interface BattleState {
    playerHP: number;
    monsterHP: number;
    currentQuestion: any | null;
    lastEvent: LastEvent | null;

    setPlayerHP: (hp: number) => void;
    setMonsterHP: (hp: number) => void;
    setCurrentQuestion: (q: any | null) => void;
    setLastEvent: (e: LastEvent | null) => void;
    reset: () => void;
}

export const useBattleStore = create<BattleState>((set) => ({
    playerHP: 100,
    monsterHP: 100,
    currentQuestion: null,
    lastEvent: null,

    setPlayerHP: (hp) => set({ playerHP: hp }),
    setMonsterHP: (hp) => set({ monsterHP: hp }),
    setCurrentQuestion: (q) => set({ currentQuestion: q }),
    setLastEvent: (e) => set({ lastEvent: e }),
    reset: () => set({
        playerHP: 100,
        monsterHP: 100,
        currentQuestion: null,
        lastEvent: null,
    }),
}));
