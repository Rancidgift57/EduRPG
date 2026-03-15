import { useEffect, useRef, useCallback } from 'react';
import { useBattleStore } from '../store/battleStore';

export function useBattle(sessionId: string) {
    const wsRef = useRef<WebSocket | null>(null);
    const { setBattleState, addBattleEvent } = useBattleStore();

    useEffect(() => {
        wsRef.current = new WebSocket(
            `ws://localhost:8000/battle/ws/${sessionId}`
        );

        wsRef.current.onmessage = (e) => {
            const result = JSON.parse(e.data);
            setBattleState(result);
            addBattleEvent(result);  // triggers animation
        };

        return () => wsRef.current?.close();
    }, [sessionId]);

    const submitAnswer = useCallback((optionId: string, skill?: string) => {
        wsRef.current?.send(JSON.stringify({ optionId, skill }));
    }, []);

    return { submitAnswer };
}
