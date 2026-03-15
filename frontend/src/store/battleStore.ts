import { create } from 'zustand';

interface BattleEvent {
    action: string;
    damage: number;
    isCrit: boolean;
}

interface BattleState {
    playerHP: number;
    monsterHP: number;
    currentQuestion: any | null;
    lastEvent: BattleEvent | null;
    setBattleState: (state: Partial<BattleState>) => void;
    addBattleEvent: (event: BattleEvent) => void;
}

export const useBattleStore = create<BattleState>((set) => ({
    playerHP: 100,
    monsterHP: 100,
    currentQuestion: null,
    lastEvent: null,
    setBattleState: (newState) => set((state) => ({ ...state, ...newState })),
    addBattleEvent: (event) => set({ lastEvent: event }),
}));