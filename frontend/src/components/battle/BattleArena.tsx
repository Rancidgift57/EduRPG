import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HPBar } from './HPBar';
import { QuizCard } from './QuizCard';
import { useBattle } from '../../hooks/useBattle';
import { useBattleStore } from '../../store/battleStore';

export function BattleArena({ sessionId }: { sessionId: string }) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const { submitAnswer } = useBattle(sessionId);
    const { playerHP, monsterHP, currentQuestion, lastEvent } = useBattleStore();

    // Initialize Three.js scene
    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(800, 450);
        canvasRef.current?.appendChild(renderer.domElement);

        // Load hero + monster sprites
        // ... Three.js setup
        camera.position.z = 5;
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
        return () => renderer.dispose();
    }, []);

    return (
        <div className='battle-arena'>
            <div className='hud-top'>
                <HPBar label='Hero' current={playerHP} max={100} color='green' />
                <HPBar label='Monster' current={monsterHP} max={100} color='red' />
            </div>
            <div ref={canvasRef} className='battle-canvas' />
            <QuizCard question={currentQuestion} onAnswer={submitAnswer} />
        </div>
    );
}
