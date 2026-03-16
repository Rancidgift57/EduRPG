"use client";
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HPBar } from './HPBar';
import { QuizCard } from './QuizCard';
import { useBattle } from '../../hooks/useBattle';
import { useBattleStore } from '../../store/battleStore';

export function BattleArena({ sessionId }: { sessionId: string }) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const { submitAnswer } = useBattle(sessionId);
    const { playerHP, monsterHP, currentQuestion, lastEvent } = useBattleStore();


    useEffect(() => {

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(800, 450);
        canvasRef.current?.appendChild(renderer.domElement);
        camera.position.z = 5;

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        return () => renderer.dispose();
    }, []);



    useEffect(() => {
        setAnswered(false);
    }, [currentQuestion?.id]);


    const [answered, setAnswered] = useState(false);
    const handleAnswer = (index: number) => {
        setAnswered(true);
        submitAnswer(index);
    };
    // ✅ Bridge function — converts number index to what submitAnswer expects

    return (
        <div className='battle-arena'>
            <div className='hud-top'>
                <HPBar label='Hero' current={playerHP} max={100} color='green' />
                <HPBar label='Monster' current={monsterHP} max={100} color='red' />
            </div>
            <div ref={canvasRef} className='battle-canvas' />
            <QuizCard
                question={currentQuestion}
                onAnswer={handleAnswer}
                answered={answered}
                lastEvent={lastEvent}
            />
        </div>
    );
}
