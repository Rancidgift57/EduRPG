"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Full Body Character SVGs ──────────────────────────────────────────

function SamuraiSVG({ size = 120, color = "#60a5fa" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
            <rect x="36" y="5" width="8" height="4" rx="1" fill={color} opacity="0.7" />
            <path d="M28 14 Q28 6 40 6 Q52 6 52 14 L52 22 Q52 28 40 28 Q28 28 28 22Z" fill={color} opacity="0.9" />
            <path d="M28 14 Q40 8 52 14" fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
            <ellipse cx="36" cy="18" rx="3" ry="2.5" fill="#fff" />
            <ellipse cx="44" cy="18" rx="3" ry="2.5" fill="#fff" />
            <ellipse cx="37" cy="18" rx="1.8" ry="1.8" fill="#0f172a" />
            <ellipse cx="45" cy="18" rx="1.8" ry="1.8" fill="#0f172a" />
            <ellipse cx="37.5" cy="17.5" rx="0.8" ry="0.8" fill={color} opacity="0.9" />
            <ellipse cx="45.5" cy="17.5" rx="0.8" ry="0.8" fill={color} opacity="0.9" />
            <rect x="37" y="27" width="6" height="5" fill={color} opacity="0.7" />
            <path d="M26 32 L32 30 L40 31 L48 30 L54 32 L54 60 L26 60Z" fill={color} opacity="0.85" />
            <path d="M30 32 L40 31 L50 32 L50 58 L30 58Z" fill={color} opacity="0.35" />
            <rect x="38" y="32" width="4" height="26" rx="1" fill={color} opacity="0.25" />
            <rect x="14" y="33" width="12" height="22" rx="5" fill={color} opacity="0.8" />
            <rect x="54" y="33" width="12" height="22" rx="5" fill={color} opacity="0.8" />
            <rect x="63" y="15" width="4" height="50" rx="1.5" fill="#94a3b8" />
            <rect x="60" y="32" width="10" height="3" rx="1" fill="#fbbf24" />
            <rect x="64" y="8" width="2" height="9" rx="0.5" fill="#e2e8f0" />
            <rect x="28" y="59" width="11" height="28" rx="5" fill={color} opacity="0.85" />
            <rect x="41" y="59" width="11" height="28" rx="5" fill={color} opacity="0.85" />
            <rect x="26" y="83" width="15" height="8" rx="4" fill={color} opacity="0.65" />
            <rect x="39" y="83" width="15" height="8" rx="4" fill={color} opacity="0.65" />
            <ellipse cx="40" cy="97" rx="22" ry="5" fill={color} opacity="0.12" />
        </svg>
    );
}

function WizardSVG({ size = 120, color = "#c084fc" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
            <path d="M40 2 L55 26 L25 26Z" fill={color} opacity="0.9" />
            <rect x="22" y="24" width="36" height="5" rx="2" fill={color} opacity="0.7" />
            <circle cx="40" cy="12" r="4" fill="#fbbf24" opacity="0.9" />
            <ellipse cx="40" cy="36" rx="12" ry="13" fill={color} opacity="0.85" />
            <ellipse cx="36" cy="35" rx="3" ry="3" fill="#fff" />
            <ellipse cx="44" cy="35" rx="3" ry="3" fill="#fff" />
            <ellipse cx="36" cy="35" rx="2" ry="2" fill="#4c1d95" />
            <ellipse cx="44" cy="35" rx="2" ry="2" fill="#4c1d95" />
            <ellipse cx="36" cy="34.2" rx="0.9" ry="0.9" fill="#e9d5ff" />
            <ellipse cx="44" cy="34.2" rx="0.9" ry="0.9" fill="#e9d5ff" />
            <path d="M34 44 Q40 50 46 44 Q43 52 40 53 Q37 52 34 44Z" fill={color} opacity="0.4" />
            <path d="M23 48 L30 46 L40 47 L50 46 L57 48 L58 84 L22 84Z" fill={color} opacity="0.75" />
            <path d="M29 49 L40 48 L51 49 L52 82 L28 82Z" fill={color} opacity="0.3" />
            <rect x="13" y="48" width="10" height="22" rx="4" fill={color} opacity="0.8" />
            <rect x="8" y="18" width="5" height="56" rx="2" fill="#6b21a8" />
            <circle cx="10.5" cy="18" r="8" fill={color} opacity="0.5" />
            <circle cx="10.5" cy="18" r="5" fill="#a855f7" />
            <circle cx="10.5" cy="18" r="3" fill="#e9d5ff" opacity="0.95" />
            <rect x="57" y="48" width="10" height="22" rx="4" fill={color} opacity="0.8" />
            <path d="M28 84 L26 104 L38 104 L40 92 L42 104 L54 104 L52 84Z" fill={color} opacity="0.75" />
            <circle cx="18" cy="42" r="2.5" fill="#fbbf24" opacity="0.7" />
            <circle cx="62" cy="40" r="2" fill="#fbbf24" opacity="0.6" />
            <ellipse cx="40" cy="104" rx="20" ry="4.5" fill={color} opacity="0.12" />
        </svg>
    );
}

function NinjaSVG({ size = 120, color = "#4ade80" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
            <ellipse cx="40" cy="18" rx="13" ry="13" fill="#0f172a" />
            <rect x="27" y="13" width="26" height="9" rx="2" fill={color} opacity="0.85" />
            <rect x="27" y="20" width="26" height="4" fill="#0a0a0f" />
            <ellipse cx="36" cy="18" rx="2.8" ry="2.2" fill={color} opacity="0.9" />
            <ellipse cx="44" cy="18" rx="2.8" ry="2.2" fill={color} opacity="0.9" />
            <ellipse cx="36" cy="18" rx="1.4" ry="1.4" fill="#fff" />
            <ellipse cx="44" cy="18" rx="1.4" ry="1.4" fill="#fff" />
            <rect x="34" y="30" width="12" height="5" rx="2" fill={color} opacity="0.6" />
            <rect x="27" y="35" width="26" height="28" rx="4" fill="#0f172a" />
            <rect x="29" y="37" width="22" height="24" rx="3" fill={color} opacity="0.15" />
            <rect x="27" y="46" width="26" height="5" fill={color} opacity="0.7" />
            <rect x="14" y="36" width="13" height="22" rx="5" fill="#0f172a" />
            <rect x="53" y="36" width="13" height="22" rx="5" fill="#0f172a" />
            <path d="M60 43 L72 38 L69 44 L74 48 L66 46 L63 52 L58 46 L52 48 L56 43 L52 38Z" fill={color} opacity="0.95" />
            <rect x="28" y="62" width="11" height="28" rx="5" fill="#0f172a" />
            <rect x="41" y="62" width="11" height="28" rx="5" fill="#0f172a" />
            <rect x="26" y="85" width="15" height="8" rx="4" fill={color} opacity="0.7" />
            <rect x="39" y="85" width="15" height="8" rx="4" fill={color} opacity="0.7" />
            <ellipse cx="40" cy="96" rx="18" ry="4" fill={color} opacity="0.1" />
        </svg>
    );
}

function KnightSVG({ size = 120, color = "#fbbf24" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
            <path d="M25 22 Q25 7 40 7 Q55 7 55 22 L55 33 L25 33Z" fill={color} opacity="0.88" />
            <rect x="25" y="31" width="30" height="6" rx="1" fill={color} opacity="0.6" />
            <rect x="29" y="17" width="9" height="3.5" rx="1" fill="#0f172a" opacity="0.85" />
            <rect x="42" y="17" width="9" height="3.5" rx="1" fill="#0f172a" opacity="0.85" />
            <rect x="32" y="36" width="16" height="7" rx="2" fill={color} opacity="0.7" />
            <path d="M21 43 L38 41 L40 42 L42 41 L59 43 L59 74 L21 74Z" fill={color} opacity="0.88" />
            <path d="M27 45 L40 43 L53 45 L53 72 L27 72Z" fill={color} opacity="0.35" />
            <rect x="37" y="43" width="6" height="28" rx="1" fill={color} opacity="0.2" />
            <ellipse cx="19" cy="46" rx="10" ry="9" fill={color} opacity="0.85" />
            <ellipse cx="61" cy="46" rx="10" ry="9" fill={color} opacity="0.85" />
            <rect x="12" y="52" width="12" height="22" rx="5" fill={color} opacity="0.8" />
            <rect x="56" y="52" width="12" height="22" rx="5" fill={color} opacity="0.8" />
            <path d="M6 46 L20 44 L20 68 L13 75 L6 68Z" fill={color} opacity="0.92" />
            <path d="M9 48 L18 47 L18 67 L13 72 L9 67Z" fill={color} opacity="0.45" />
            <circle cx="13" cy="57" r="3.5" fill="#ffd700" opacity="0.95" />
            <rect x="59" y="28" width="5" height="48" rx="1.5" fill="#94a3b8" />
            <rect x="56" y="50" width="12" height="4" rx="1.5" fill={color} />
            <rect x="61" y="18" width="2.5" height="12" rx="1" fill="#e2e8f0" />
            <rect x="27" y="73" width="12" height="26" rx="5" fill={color} opacity="0.82" />
            <rect x="41" y="73" width="12" height="26" rx="5" fill={color} opacity="0.82" />
            <path d="M24 95 L40 95 L42 104 L22 104Z" fill={color} opacity="0.7" />
            <path d="M40 95 L56 95 L58 104 L38 104Z" fill={color} opacity="0.7" />
            <ellipse cx="40" cy="106" rx="22" ry="5" fill={color} opacity="0.12" />
        </svg>
    );
}

function RobotSVG({ size = 120, color = "#f87171" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
            <rect x="38" y="2" width="4" height="10" fill={color} opacity="0.8" />
            <circle cx="40" cy="2" r="3.5" fill={color} />
            <rect x="25" y="11" width="30" height="22" rx="5" fill="#1e293b" />
            <rect x="27" y="13" width="26" height="18" rx="4" fill="#0f172a" />
            <rect x="29" y="15" width="9" height="7" rx="2.5" fill={color} opacity="0.9" />
            <rect x="42" y="15" width="9" height="7" rx="2.5" fill={color} opacity="0.9" />
            <rect x="30" y="16" width="7" height="5" rx="1.5" fill="#fff" opacity="0.85" />
            <rect x="43" y="16" width="7" height="5" rx="1.5" fill="#fff" opacity="0.85" />
            <rect x="31" y="26" width="18" height="4" rx="1.5" fill="#0f172a" />
            {[0, 1, 2, 3].map(i => <rect key={i} x={33 + i * 4} y={27} width="2.5" height="2" rx="0.5" fill={color} opacity="0.65" />)}
            <rect x="34" y="33" width="12" height="6" rx="2" fill={color} opacity="0.5" />
            <rect x="21" y="39" width="38" height="32" rx="5" fill="#1e293b" />
            <rect x="23" y="41" width="34" height="28" rx="4" fill="#0f172a" />
            <rect x="27" y="44" width="26" height="18" rx="3" fill={color} opacity="0.12" />
            <rect x="29" y="46" width="22" height="4" rx="1.5" fill={color} opacity="0.5" />
            <rect x="29" y="52" width="16" height="3" rx="1" fill={color} opacity="0.4" />
            <rect x="29" y="57" width="19" height="2" rx="1" fill={color} opacity="0.3" />
            <rect x="9" y="40" width="12" height="28" rx="5" fill="#1e293b" />
            <rect x="59" y="40" width="12" height="28" rx="5" fill="#1e293b" />
            <rect x="64" y="52" width="20" height="6" rx="3" fill={color} opacity="0.92" />
            <circle cx="84" cy="55" r="3.5" fill={color} />
            <circle cx="84" cy="55" r="1.8" fill="#fff" opacity="0.92" />
            <circle cx="15" cy="54" r="3.5" fill={color} opacity="0.6" />
            <circle cx="65" cy="54" r="3.5" fill={color} opacity="0.6" />
            <rect x="25" y="70" width="13" height="28" rx="5" fill="#1e293b" />
            <rect x="42" y="70" width="13" height="28" rx="5" fill="#1e293b" />
            <rect x="24" y="81" width="15" height="5" rx="2.5" fill={color} opacity="0.5" />
            <rect x="41" y="81" width="15" height="5" rx="2.5" fill={color} opacity="0.5" />
            <rect x="22" y="94" width="17" height="8" rx="3" fill="#1e293b" />
            <rect x="41" y="94" width="17" height="8" rx="3" fill="#1e293b" />
            <ellipse cx="40" cy="104" rx="22" ry="5" fill={color} opacity="0.12" />
        </svg>
    );
}

// ── Monster SVGs ─────────────────────────────────────────────────────

function DragonMonster({ size = 130 }: { size?: number }) {
    return (
        <svg width={size} height={size * 1.3} viewBox="0 0 90 117" fill="none">
            <path d="M14 30 Q2 18 5 56 Q11 50 20 44Z" fill="#7f1d1d" opacity="0.8" />
            <path d="M76 30 Q88 18 85 56 Q79 50 70 44Z" fill="#7f1d1d" opacity="0.8" />
            <ellipse cx="45" cy="60" rx="27" ry="31" fill="#dc2626" opacity="0.9" />
            <ellipse cx="45" cy="57" rx="20" ry="24" fill="#ef4444" opacity="0.45" />
            {[0, 1, 2].map(i => <ellipse key={i} cx="45" cy={47 + i * 10} rx="14" ry="4.5" fill="#fca5a5" opacity="0.25" />)}
            <ellipse cx="45" cy="24" rx="19" ry="17" fill="#dc2626" opacity="0.95" />
            <path d="M31 13 L27 1 L33 11Z" fill="#7f1d1d" />
            <path d="M59 13 L63 1 L57 11Z" fill="#7f1d1d" />
            <ellipse cx="37" cy="22" rx="5.5" ry="5.5" fill="#fbbf24" />
            <ellipse cx="53" cy="22" rx="5.5" ry="5.5" fill="#fbbf24" />
            <ellipse cx="37" cy="22" rx="3.5" ry="4.5" fill="#7f1d1d" />
            <ellipse cx="53" cy="22" rx="3.5" ry="4.5" fill="#7f1d1d" />
            <ellipse cx="37.5" cy="21" rx="1.5" ry="1.8" fill="#fbbf24" opacity="0.9" />
            <ellipse cx="53.5" cy="21" rx="1.5" ry="1.8" fill="#fbbf24" opacity="0.9" />
            <circle cx="41" cy="30" r="2.5" fill="#7f1d1d" />
            <circle cx="49" cy="30" r="2.5" fill="#7f1d1d" />
            <path d="M34 35 L37 32 L40 35 L44 32 L48 35 L51 32 L55 35 L56 32 L56 37 L34 37Z" fill="#7f1d1d" />
            {[35, 38, 41, 44, 47, 50].map((x, i) => <path key={i} d={`M${x} 35 L${x + 1.5} 39 L${x + 3} 35Z`} fill="#fef2f2" opacity="0.9" />)}
            <path d="M46 37 Q62 41 73 35 Q68 43 73 52 Q57 46 46 43Z" fill="#f97316" opacity="0.7" />
            <path d="M48 38 Q60 42 69 37 Q66 44 68 50 Q56 45 48 41Z" fill="#fbbf24" opacity="0.55" />
            <path d="M19 55 Q9 66 13 79 L21 73 Q18 65 23 58Z" fill="#dc2626" opacity="0.9" />
            <path d="M71 55 Q81 66 77 79 L69 73 Q72 65 67 58Z" fill="#dc2626" opacity="0.9" />
            {[-3, 0, 3].map((o, i) => <path key={i} d={`M${12 + o} 77 L${10 + o} 85 L${13 + o} 81Z`} fill="#fca5a5" />)}
            {[-3, 0, 3].map((o, i) => <path key={i} d={`M${68 + o} 77 L${66 + o} 85 L${69 + o} 81Z`} fill="#fca5a5" />)}
            <path d="M66 76 Q82 92 76 112 Q66 110 61 97 Q63 89 66 76Z" fill="#dc2626" opacity="0.8" />
            <path d="M73 109 L82 119 L71 115Z" fill="#7f1d1d" />
            <rect x="32" y="87" width="13" height="18" rx="5" fill="#dc2626" opacity="0.9" />
            <rect x="47" y="87" width="13" height="18" rx="5" fill="#dc2626" opacity="0.9" />
            <ellipse cx="45" cy="108" rx="24" ry="6" fill="#dc2626" opacity="0.12" />
        </svg>
    );
}

function SkullMonster({ size = 130 }: { size?: number }) {
    return (
        <svg width={size} height={size * 1.3} viewBox="0 0 90 117" fill="none">
            <circle cx="45" cy="22" r="21" fill="#1e293b" opacity="0.9" />
            <ellipse cx="45" cy="22" rx="19" ry="18" fill="#334155" />
            <ellipse cx="34" cy="20" rx="8" ry="9" fill="#0f172a" />
            <ellipse cx="56" cy="20" rx="8" ry="9" fill="#0f172a" />
            <ellipse cx="34" cy="20" rx="5.5" ry="6" fill="#7c3aed" opacity="0.85" />
            <ellipse cx="56" cy="20" rx="5.5" ry="6" fill="#7c3aed" opacity="0.85" />
            <ellipse cx="34" cy="20" rx="3" ry="3.5" fill="#c084fc" />
            <ellipse cx="56" cy="20" rx="3" ry="3.5" fill="#c084fc" />
            <ellipse cx="34" cy="18.8" rx="1.2" ry="1.4" fill="#fff" opacity="0.9" />
            <ellipse cx="56" cy="18.8" rx="1.2" ry="1.4" fill="#fff" opacity="0.9" />
            <path d="M42 28 L45 31 L48 28 L45 26Z" fill="#0f172a" />
            <rect x="31" y="35" width="28" height="9" rx="2.5" fill="#1e293b" />
            {[32, 36, 40, 44, 48, 52].map((x, i) => <rect key={i} x={x} y={37} width="3.5" height="6" rx="1" fill="#f8fafc" opacity="0.9" />)}
            <path d="M37 9 L41 17 L39 20" stroke="#7c3aed" strokeWidth="1.5" fill="none" opacity="0.6" />
            <path d="M56 11 L53 18" stroke="#7c3aed" strokeWidth="1.2" fill="none" opacity="0.4" />
            <path d="M19 44 Q17 37 24 37 L66 37 Q73 37 71 44 L71 92 Q66 100 61 92 Q56 84 51 92 Q46 100 41 92 Q36 84 31 92 Q26 100 21 92Z" fill="#1e293b" opacity="0.88" />
            <path d="M24 42 L66 42 L66 87 Q61 95 56 87 Q51 79 46 87 Q41 95 36 87 Q31 79 26 87Z" fill="#334155" opacity="0.45" />
            <path d="M19 56 Q7 53 5 66 Q10 69 18 63Z" fill="#1e293b" opacity="0.82" />
            <path d="M71 56 Q83 53 85 66 Q80 69 72 63Z" fill="#1e293b" opacity="0.82" />
            {[-2, 1, 4].map((o, i) => <path key={i} d={`M${4 + o} 64 L${3 + o} 73 L${6 + o} 68Z`} fill="#94a3b8" />)}
            {[-2, 1, 4].map((o, i) => <path key={i} d={`M${79 + o} 64 L${78 + o} 73 L${81 + o} 68Z`} fill="#94a3b8" />)}
            <circle cx="14" cy="46" r="4.5" fill="#7c3aed" opacity="0.6" />
            <circle cx="76" cy="52" r="3.5" fill="#7c3aed" opacity="0.5" />
            <circle cx="19" cy="76" r="3" fill="#a855f7" opacity="0.5" />
            <circle cx="71" cy="72" r="2.5" fill="#a855f7" opacity="0.4" />
            <ellipse cx="45" cy="106" rx="23" ry="7" fill="#7c3aed" opacity="0.1" />
        </svg>
    );
}

function GolemMonster({ size = 130 }: { size?: number }) {
    return (
        <svg width={size} height={size * 1.3} viewBox="0 0 90 117" fill="none">
            <ellipse cx="45" cy="66" rx="31" ry="39" fill="#44403c" opacity="0.92" />
            <ellipse cx="45" cy="63" rx="25" ry="32" fill="#57534e" opacity="0.55" />
            <path d="M31 48 L34 59 L29 66" stroke="#1c1917" strokeWidth="2.5" fill="none" opacity="0.7" />
            <path d="M56 50 L53 63 L58 71" stroke="#1c1917" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M37 80 L43 73 L51 80" stroke="#1c1917" strokeWidth="2" fill="none" opacity="0.5" />
            <circle cx="45" cy="66" r="13" fill="#f97316" opacity="0.28" />
            <circle cx="45" cy="66" r="9" fill="#fb923c" opacity="0.48" />
            <circle cx="45" cy="66" r="5.5" fill="#fed7aa" opacity="0.7" />
            <ellipse cx="45" cy="24" rx="21" ry="19" fill="#44403c" opacity="0.96" />
            <ellipse cx="45" cy="22" rx="17" ry="15" fill="#57534e" opacity="0.5" />
            <circle cx="29" cy="16" r="7" fill="#44403c" opacity="0.9" />
            <circle cx="61" cy="16" r="7" fill="#44403c" opacity="0.9" />
            <circle cx="34" cy="10" r="5" fill="#57534e" />
            <circle cx="56" cy="10" r="5" fill="#57534e" />
            <ellipse cx="36" cy="23" rx="6" ry="6" fill="#1c1917" />
            <ellipse cx="54" cy="23" rx="6" ry="6" fill="#1c1917" />
            <ellipse cx="36" cy="23" rx="4" ry="4" fill="#f97316" />
            <ellipse cx="54" cy="23" rx="4" ry="4" fill="#f97316" />
            <ellipse cx="36" cy="23" rx="2.2" ry="2.2" fill="#fbbf24" />
            <ellipse cx="54" cy="23" rx="2.2" ry="2.2" fill="#fbbf24" />
            <path d="M33 34 L36 31 L39 34 L44 31 L50 34 L53 31 L57 34" stroke="#1c1917" strokeWidth="2.8" fill="none" />
            <ellipse cx="13" cy="60" rx="13" ry="22" fill="#44403c" opacity="0.9" />
            <ellipse cx="77" cy="60" rx="13" ry="22" fill="#44403c" opacity="0.9" />
            {[0, 1, 2].map(i => <circle key={i} cx={6 + i * 4} cy={78} r="3.5" fill="#57534e" />)}
            {[0, 1, 2].map(i => <circle key={i} cx={70 + i * 4} cy={78} r="3.5" fill="#57534e" />)}
            <ellipse cx="33" cy="99" rx="14" ry="17" fill="#44403c" opacity="0.92" />
            <ellipse cx="57" cy="99" rx="14" ry="17" fill="#44403c" opacity="0.92" />
            <path d="M27 88 L31 95 L27 102" stroke="#f97316" strokeWidth="1.8" fill="none" opacity="0.6" />
            <path d="M63 90 L59 97 L63 104" stroke="#f97316" strokeWidth="1.8" fill="none" opacity="0.6" />
            <ellipse cx="45" cy="116" rx="27" ry="7" fill="#44403c" opacity="0.14" />
        </svg>
    );
}

function AlienMonster({ size = 130 }: { size?: number }) {
    return (
        <svg width={size} height={size * 1.3} viewBox="0 0 90 117" fill="none">
            {[-20, -10, 0, 10, 20].map((ox, i) => (
                <path key={i} d={`M${40 + ox} 96 Q${35 + ox} 112 ${38 + ox} 120`} stroke="#a855f7" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            ))}
            <ellipse cx="45" cy="66" rx="29" ry="36" fill="#581c87" opacity="0.92" />
            <ellipse cx="45" cy="63" rx="22" ry="29" fill="#7c3aed" opacity="0.45" />
            {[24, 34, 56, 66, 29, 61, 40, 50].map((x, i) => (
                <circle key={i} cx={x} cy={50 + i * 5} r="2.2" fill="#e9d5ff" opacity="0.55" />
            ))}
            <ellipse cx="45" cy="22" rx="23" ry="21" fill="#581c87" opacity="0.96" />
            <ellipse cx="45" cy="20" rx="19" ry="17" fill="#7c3aed" opacity="0.45" />
            <ellipse cx="33" cy="20" rx="10" ry="12" fill="#1e1b4b" />
            <ellipse cx="57" cy="20" rx="10" ry="12" fill="#1e1b4b" />
            <ellipse cx="33" cy="20" rx="7.5" ry="9.5" fill="#4f46e5" />
            <ellipse cx="57" cy="20" rx="7.5" ry="9.5" fill="#4f46e5" />
            <ellipse cx="33" cy="20" rx="4.5" ry="5.5" fill="#a5b4fc" />
            <ellipse cx="57" cy="20" rx="4.5" ry="5.5" fill="#a5b4fc" />
            <ellipse cx="32.5" cy="18.5" rx="1.8" ry="2.2" fill="#fff" opacity="0.92" />
            <ellipse cx="56.5" cy="18.5" rx="1.8" ry="2.2" fill="#fff" opacity="0.92" />
            <ellipse cx="42" cy="33" rx="2.2" ry="1.2" fill="#3730a3" opacity="0.8" />
            <ellipse cx="48" cy="33" rx="2.2" ry="1.2" fill="#3730a3" opacity="0.8" />
            <path d="M32 39 Q38 43 45 41 Q52 43 58 39" stroke="#c4b5fd" strokeWidth="2.2" fill="none" />
            <circle cx="37" cy="8" r="4.5" fill="#1e1b4b" />
            <circle cx="53" cy="8" r="4.5" fill="#1e1b4b" />
            <circle cx="37" cy="8" r="3" fill="#818cf8" />
            <circle cx="53" cy="8" r="3" fill="#818cf8" />
            <path d="M16 56 Q7 66 5 82 Q10 84 15 78 Q14 70 20 60Z" fill="#581c87" opacity="0.9" />
            <path d="M74 56 Q83 66 85 82 Q80 84 75 78 Q76 70 70 60Z" fill="#581c87" opacity="0.9" />
            {[-3, 1, 5].map((o, i) => <circle key={i} cx={5 + o} cy={82} r="3.5" fill="#7c3aed" opacity="0.8" />)}
            {[-3, 1, 5].map((o, i) => <circle key={i} cx={79 + o} cy={82} r="3.5" fill="#7c3aed" opacity="0.8" />)}
            <ellipse cx="45" cy="110" rx="23" ry="6" fill="#7c3aed" opacity="0.12" />
        </svg>
    );
}

function BugMonster({ size = 130 }: { size?: number }) {
    return (
        <svg width={size} height={size * 1.3} viewBox="0 0 90 117" fill="none">
            <line x1="35" y1="12" x2="18" y2="2" stroke="#22c55e" strokeWidth="2.5" />
            <line x1="55" y1="12" x2="72" y2="2" stroke="#22c55e" strokeWidth="2.5" />
            <circle cx="18" cy="2" r="3.5" fill="#22c55e" />
            <circle cx="72" cy="2" r="3.5" fill="#22c55e" />
            <ellipse cx="45" cy="20" rx="19" ry="17" fill="#15803d" opacity="0.92" />
            {[-1, 0, 1, -1, 0, 1].map((ox, i) => (
                <circle key={i} cx={(i < 3 ? 32 : 53) + ox * 4} cy={18 + (i % 3 - 1) * 3} r="4" fill="#86efac" opacity="0.9" />
            ))}
            {[-1, 0, 1, -1, 0, 1].map((ox, i) => (
                <circle key={i} cx={(i < 3 ? 32 : 53) + ox * 4} cy={18 + (i % 3 - 1) * 3} r="2.3" fill="#052e16" />
            ))}
            <path d="M29 30 L18 39 L25 37 L27 32Z" fill="#166534" />
            <path d="M61 30 L72 39 L65 37 L63 32Z" fill="#166534" />
            <ellipse cx="45" cy="52" rx="23" ry="21" fill="#16a34a" opacity="0.92" />
            <ellipse cx="45" cy="50" rx="17" ry="15" fill="#22c55e" opacity="0.38" />
            <ellipse cx="45" cy="76" rx="19" ry="17" fill="#15803d" opacity="0.92" />
            <ellipse cx="45" cy="101" rx="13" ry="11" fill="#166534" opacity="0.92" />
            <path d="M22 68 Q45 72 68 68" stroke="#22c55e" strokeWidth="1.8" fill="none" opacity="0.5" />
            <path d="M26 90 Q45 94 64 90" stroke="#22c55e" strokeWidth="1.8" fill="none" opacity="0.5" />
            {[40, 51, 62].map((y, i) => [
                <line key={`l${i}`} x1="22" y1={y} x2="4" y2={y + 12} stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />,
                <line key={`r${i}`} x1="68" y1={y} x2="86" y2={y + 12} stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
            ])}
            <path d="M45 110 Q40 120 42 126 L45 122 L48 126 Q50 120 45 110Z" fill="#166534" />
            <ellipse cx="45" cy="112" rx="17" ry="5" fill="#22c55e" opacity="0.1" />
        </svg>
    );
}

const HERO_COMPONENTS: Record<string, React.FC<{ size?: number, color?: string }>> = {
    samurai: SamuraiSVG, wizard: WizardSVG, ninja: NinjaSVG, knight: KnightSVG, robot: RobotSVG,
};
const MONSTER_COMPONENTS: Record<string, React.FC<{ size?: number }>> = {
    "python-basics": BugMonster, "python-loops": DragonMonster, "python-functions": AlienMonster,
    "python-oop": SkullMonster, "algebra-basics": GolemMonster, "calculus": DragonMonster,
    "physics-mechanics": GolemMonster, "chemistry": BugMonster,
    "machine-learning": AlienMonster, "neural-networks": SkullMonster,
};
const HERO_COLORS: Record<string, string> = {
    samurai: "#60a5fa", wizard: "#c084fc", ninja: "#4ade80", knight: "#fbbf24", robot: "#f87171",
};

function HPBar({ current, max, color, label }: { current: number; max: number; color: string; label: string }) {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    const c = pct > 60 ? "#22c55e" : pct > 30 ? "#f59e0b" : "#ef4444";
    return (
        <div style={{ width: "100%" }}>
            <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 11, color: "#9ca3af", marginBottom: 5,
                fontWeight: 700, letterSpacing: "0.08em"
            }}>
                <span>{label}</span>
                <span style={{ color: c, fontFamily: "Cinzel" }}>{current}/{max}</span>
            </div>
            <div style={{
                height: 12, background: "rgba(0,0,0,0.6)",
                borderRadius: 6, overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)"
            }}>
                <div style={{
                    height: "100%", width: `${pct}%`,
                    backgroundImage: `linear-gradient(90deg,${c}66,${c},${c}bb)`,
                    borderRadius: 6, boxShadow: `0 0 14px ${c}`,
                    transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                    position: "relative"
                }}>
                    <div style={{
                        position: "absolute", inset: 0,
                        backgroundImage: "linear-gradient(90deg,transparent 30%,rgba(255,255,255,0.35) 50%,transparent 70%)",
                        animation: "shimmer 2.5s infinite"
                    }} />
                </div>
            </div>
        </div>
    );
}

export default function BattlePage() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [hero, setHero] = useState<any>(null);
    const [monster, setMonster] = useState<any>(null);
    const [playerHP, setPlayerHP] = useState(100);
    const [monsterHP, setMonsterHP] = useState(100);
    const [monsterMaxHP, setMonsterMaxHP] = useState(100);
    const [question, setQuestion] = useState<any>(null);
    const [answered, setAnswered] = useState(false);
    const [lastResult, setLastResult] = useState<any>(null);
    const [battleOver, setBattleOver] = useState(false);
    const [battleResult, setBattleResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [totalXP, setTotalXP] = useState(0);
    const [xpPop, setXpPop] = useState(0);
    const [heroAnim, setHeroAnim] = useState("idle");
    const [monsterAnim, setMonsterAnim] = useState("idle");
    const [showCrit, setShowCrit] = useState(false);
    const [dmgFloat, setDmgFloat] = useState<any>(null);
    const [arenaShake, setArenaShake] = useState(false);
    const [logMsg, setLogMsg] = useState("⚔️ Battle begins!");
    const [spellActive, setSpellActive] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const topic = typeof window !== "undefined" ? localStorage.getItem("selectedTopic") || "" : "";

    useEffect(() => { if (!topic || !token) { router.push("/"); return; } startBattle(topic); }, []);

    const startBattle = async (t: string) => {
        try {
            const res = await axios.post(`${API}/battle/start`, { topic: t }, { headers: { Authorization: `Bearer ${token}` } });
            const d = res.data;
            setSession({ id: d.session_id }); setHero(d.hero); setMonster(d.monster);
            setPlayerHP(d.player_hp); setMonsterHP(d.monster_hp); setMonsterMaxHP(d.monster.max_hp);
            setQuestion(d.question);
        } catch { router.push("/"); }
        finally { setLoading(false); }
    };

    const handleAnswer = async (idx: number) => {
        if (answered || !session || !question) return;
        setAnswered(true);
        try {
            const res = await axios.post(`${API}/battle/answer`,
                { session_id: session.id, selected_index: idx, question_id: question.id },
                { headers: { Authorization: `Bearer ${token}` } });
            const r = res.data;
            setLastResult({
                ...r,
                selected_index: idx,
                correct_index: r.correct_index,   // ← from backend
                explanation: r.explanation,      // ← from backend
            });
            setPlayerHP(r.player_hp); setMonsterHP(r.monster_hp);

            if (r.action === "hero_attack") {
                setHeroAnim("attack"); setSpellActive(true);
                setTimeout(() => {
                    setMonsterAnim("hit"); setSpellActive(false); setArenaShake(true);
                    setDmgFloat({ val: r.damage, isHero: true });
                    if (r.is_critical) { setShowCrit(true); setTimeout(() => setShowCrit(false), 1400); }
                    setTimeout(() => { setMonsterAnim("idle"); setArenaShake(false); setDmgFloat(null); }, 600);
                }, 400);
                setTimeout(() => setHeroAnim("idle"), 800);
                setLogMsg(r.is_critical ? `⚡ CRITICAL HIT! ${r.damage} damage!` : `⚔️ Correct! ${r.damage} damage!`);
            } else {
                setMonsterAnim("attack");
                setTimeout(() => {
                    setHeroAnim("hit"); setArenaShake(true);
                    setDmgFloat({ val: r.damage, isHero: false });
                    setTimeout(() => { setHeroAnim("idle"); setArenaShake(false); setDmgFloat(null); }, 600);
                }, 400);
                setTimeout(() => setMonsterAnim("idle"), 800);
                setLogMsg(`💥 Wrong! Monster hits for ${r.damage}!`);
            }

            if (r.xp_gained > 0) { setTotalXP(p => p + r.xp_gained); setXpPop(r.xp_gained); setTimeout(() => setXpPop(0), 1800); }

            if (r.battle_over) {
                if (r.monster_defeated) { setMonsterAnim("death"); setLogMsg("🏆 MONSTER DEFEATED!"); }
                setTimeout(() => { setBattleOver(true); setBattleResult(r); }, 1600); return;
            }
            setTimeout(() => {
                if (r.next_question) setQuestion(r.next_question);
                setAnswered(false); setLastResult(null); setLogMsg("⚔️ Next attack! Choose wisely...");
            }, r.is_correct ? 1400 : 2800);
        } catch { setAnswered(false); }
    };

    const heroColor = hero ? (HERO_COLORS[hero.sprite_key] || "#a855f7") : "#a855f7";
    const HeroChar = hero ? (HERO_COMPONENTS[hero.sprite_key] || WizardSVG) : WizardSVG;
    const MonsterChar = MONSTER_COMPONENTS[topic] || DragonMonster;

    const heroStyle = () => {
        if (heroAnim === "attack") return { animation: "heroAttackForward 0.75s cubic-bezier(0.4,0,0.2,1)" };
        if (heroAnim === "hit") return { animation: "heroHit 0.5s ease-in-out" };
        return { animation: "heroIdle 3.5s ease-in-out infinite" };
    };
    const monsterStyle = () => {
        if (monsterAnim === "attack") return { animation: "monsterAttackForward 0.75s cubic-bezier(0.4,0,0.2,1)", transform: "scaleX(-1)" };
        if (monsterAnim === "hit") return { animation: "monsterHit 0.5s ease-in-out" };
        if (monsterAnim === "death") return { animation: "deathAnim 1.5s ease-out forwards" };
        return { animation: "monsterIdle 3.5s ease-in-out infinite", transform: "scaleX(-1)" };
    };

    if (loading) return (
        <div style={{ minHeight: "100vh", background: "#030712", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 88, animation: "spin 1.5s linear infinite", display: "inline-block", filter: "drop-shadow(0 0 40px rgba(168,85,247,0.9))" }}>⚔️</div>
                <div style={{ fontFamily: "Cinzel", fontSize: 22, color: "#a855f7", marginTop: 24, letterSpacing: "0.3em", animation: "vsFlash 1.5s infinite" }}>ENTERING BATTLE...</div>
            </div>
        </div>
    );

    if (battleOver) return (
        <div style={{ minHeight: "100vh", background: "#030712", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Rajdhani" }}>
            <div style={{
                backgroundImage: "linear-gradient(135deg,#0a0518,#150a28,#0a0518)",
                border: `3px solid ${battleResult?.result === "victory" ? "#fbbf24" : "#ef4444"}`,
                borderRadius: 28, padding: 52, textAlign: "center", maxWidth: 480, width: "100%", margin: 16,
                animation: battleResult?.result === "victory" ? "victoryPulse 2s infinite" : "defeatPulse 2s infinite",
                boxShadow: battleResult?.result === "victory" ? "0 0 100px rgba(251,191,36,0.4)" : "0 0 100px rgba(239,68,68,0.4)"
            }}>
                <div style={{ fontSize: 100, marginBottom: 16, animation: "bounceIn 0.6s ease-out" }}>{battleResult?.result === "victory" ? "🏆" : "💀"}</div>
                <div style={{
                    fontFamily: "Cinzel", fontSize: 44, fontWeight: 900,
                    color: battleResult?.result === "victory" ? "#fbbf24" : "#ef4444", marginBottom: 8,
                    textShadow: battleResult?.result === "victory" ? "0 0 30px rgba(251,191,36,0.9)" : "0 0 30px rgba(239,68,68,0.9)"
                }}>
                    {battleResult?.result === "victory" ? "VICTORY!" : "DEFEAT"}
                </div>
                <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20, margin: "20px 0" }}>
                    {[["⭐ XP Earned", `+${battleResult?.stats?.total_xp || totalXP}`],
                    ["📝 Questions", battleResult?.stats?.questions_asked || 0],
                    ["🎯 Accuracy", `${Math.round((battleResult?.stats?.accuracy || 0) * 100)}%`]
                    ].map(([l, v]) => (
                        <div key={l as string} style={{
                            display: "flex", justifyContent: "space-between", padding: "10px 0",
                            borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 15, fontWeight: 600
                        }}>
                            <span style={{ color: "#9ca3af" }}>{l}</span>
                            <span style={{ color: "#e2e8f0", fontFamily: "Cinzel" }}>{v}</span>
                        </div>
                    ))}
                    {battleResult?.leveled_up && <div style={{ marginTop: 16, color: "#fbbf24", fontFamily: "Cinzel", fontSize: 22, fontWeight: 700, animation: "bounceIn 0.6s ease-out" }}>🌟 LEVEL UP! → Level {battleResult.new_level}</div>}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => router.push("/")} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px", color: "#9ca3af", fontFamily: "Cinzel", fontSize: 13, cursor: "pointer" }}>🏠 HOME</button>
                    <button onClick={() => { setBattleOver(false); setBattleResult(null); setLoading(true); setTotalXP(0); setMonsterAnim("idle"); setHeroAnim("idle"); startBattle(topic); }}
                        style={{ flex: 1, backgroundImage: "linear-gradient(135deg,#7c3aed,#be185d)", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontFamily: "Cinzel", fontSize: 13, cursor: "pointer", fontWeight: 700, boxShadow: "0 0 25px rgba(124,58,237,0.5)" }}>⚔️ RETRY</button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#030712", color: "#fff", fontFamily: "Rajdhani", animation: arenaShake ? "groundShake 0.4s ease" : "none" }}>
            {/* HUD */}
            <div style={{
                background: "rgba(0,0,0,0.75)", borderBottom: "1px solid rgba(168,85,247,0.2)",
                padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
                position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(16px)"
            }}>
                <button onClick={() => router.push("/")} style={{
                    background: "none", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: "#6b7280", fontSize: 13,
                    fontFamily: "Rajdhani", fontWeight: 600, transition: "all 0.2s"
                }}
                    onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                    onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}>← EXIT</button>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontFamily: "Cinzel", fontSize: 16, color: "#fbbf24", fontWeight: 700, textShadow: "0 0 12px rgba(251,191,36,0.7)" }}>⭐ {totalXP} XP</span>
                    {xpPop > 0 && <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 16, fontFamily: "Cinzel", animation: "floatUp 1.8s ease-out", textShadow: "0 0 10px #22c55e" }}>+{xpPop}</span>}
                </div>
                <button onClick={async () => { if (session) { try { await axios.post(`${API}/battle/forfeit/${session.id}`, {}, { headers: { Authorization: `Bearer ${token}` } }); } catch { } } router.push("/"); }}
                    style={{
                        background: "none", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "6px 14px",
                        cursor: "pointer", color: "#6b7280", fontSize: 13, fontFamily: "Rajdhani", fontWeight: 600, transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}>FORFEIT</button>
            </div>

            <div style={{ maxWidth: 740, margin: "0 auto", padding: "20px 16px" }}>
                {/* Arena */}
                <div style={{
                    position: "relative", overflow: "hidden",
                    backgroundImage: "linear-gradient(180deg,#04001a 0%,#08002a 30%,#120004 70%,#04001a 100%)",
                    border: "1px solid rgba(168,85,247,0.22)", borderRadius: 22, marginBottom: 20,
                    boxShadow: "0 0 100px rgba(0,0,0,0.95), inset 0 0 100px rgba(88,28,135,0.04)"
                }}>

                    {/* Scanlines */}
                    <div style={{
                        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
                        backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)"
                    }} />

                    {/* Ground light */}
                    <div style={{
                        position: "absolute", bottom: 0, left: "10%", right: "10%", height: 3,
                        backgroundImage: "linear-gradient(90deg,transparent,rgba(168,85,247,0.6),rgba(239,68,68,0.6),rgba(168,85,247,0.6),transparent)",
                        filter: "blur(2px)"
                    }} />

                    {/* Header */}
                    <div style={{
                        background: "rgba(0,0,0,0.55)", borderBottom: "1px solid rgba(168,85,247,0.12)",
                        padding: "10px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2
                    }}>
                        <span style={{ fontSize: 10, color: "#7c3aed", fontFamily: "Cinzel", letterSpacing: "0.28em", fontWeight: 700 }}>⚔ BATTLE ARENA</span>
                        <span style={{ fontSize: 11, color: "#4b5563", fontWeight: 600 }}>{topic.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} Dungeon</span>
                        <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, animation: "glowPulse 1.5s infinite" }}>● LIVE</span>
                    </div>

                    <div style={{ padding: "28px 36px 36px", position: "relative", zIndex: 2 }}>
                        {/* CRIT */}
                        {showCrit && (
                            <div style={{
                                position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)",
                                fontFamily: "Cinzel", fontSize: 36, fontWeight: 900, color: "#fbbf24",
                                textShadow: "0 0 30px #fbbf24,0 0 60px #fbbf24,0 0 90px #fbbf24",
                                animation: "critFlash 1.3s ease-out forwards", zIndex: 30, whiteSpace: "nowrap", pointerEvents: "none"
                            }}>
                                ⚡ CRITICAL HIT!
                            </div>
                        )}

                        {/* Spell */}
                        {spellActive && (
                            <div style={{
                                position: "absolute", left: "36%", top: "32%", fontSize: 42, zIndex: 20, pointerEvents: "none",
                                animation: "spellShot 0.5s ease-out forwards",
                                filter: `drop-shadow(0 0 16px ${heroColor})`
                            }}>
                                {hero?.sprite_key === "wizard" ? "✨" : hero?.sprite_key === "ninja" ? "🌀" : hero?.sprite_key === "robot" ? "🔴" : "💥"}
                            </div>
                        )}

                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>

                            {/* HERO */}
                            <div style={{ width: "40%", textAlign: "center" }}>
                                <div style={{
                                    backgroundImage: `linear-gradient(90deg,transparent,${heroColor}22,transparent)`,
                                    border: `1px solid ${heroColor}32`, borderRadius: 10, padding: "6px 12px", marginBottom: 18,
                                    fontSize: 12, fontFamily: "Cinzel", fontWeight: 700, color: heroColor, letterSpacing: "0.08em"
                                }}>
                                    {hero?.name}
                                </div>
                                <div style={{ position: "relative", display: "inline-block" }}>
                                    <div style={{
                                        position: "absolute", bottom: -12, left: "50%", transform: "translateX(-50%)",
                                        width: 90, height: 22, borderRadius: "50%",
                                        backgroundImage: `radial-gradient(ellipse,${heroColor}55,transparent 70%)`, filter: "blur(5px)"
                                    }} />
                                    {dmgFloat && !dmgFloat.isHero && (
                                        <div style={{
                                            position: "absolute", top: -24, left: "50%", transform: "translateX(-50%)",
                                            fontSize: 26, fontWeight: 900, fontFamily: "Cinzel", color: "#f87171",
                                            textShadow: "0 0 14px #ef4444", animation: "floatUp 1s ease-out forwards",
                                            pointerEvents: "none", zIndex: 10, whiteSpace: "nowrap"
                                        }}>💔 -{dmgFloat.val}</div>
                                    )}
                                    <div style={{ display: "inline-block", filter: `drop-shadow(0 0 24px ${heroColor}) drop-shadow(0 6px 12px rgba(0,0,0,0.9))`, ...heroStyle() }}>
                                        <HeroChar size={115} color={heroColor} />
                                    </div>
                                </div>
                                <div style={{ marginTop: 18 }}><HPBar current={playerHP} max={hero?.max_hp || 100} color={heroColor} label="HERO HP" /></div>
                                <div style={{
                                    marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4,
                                    background: `${heroColor}12`, border: `1px solid ${heroColor}28`,
                                    borderRadius: 20, padding: "3px 10px", fontSize: 9, color: heroColor, fontWeight: 700, letterSpacing: "0.1em"
                                }}>
                                    ⚡ {hero?.skill_name?.replace(/_/g, " ").toUpperCase()}
                                </div>
                            </div>

                            {/* VS */}
                            <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                                <div style={{ fontFamily: "Cinzel", fontSize: 48, fontWeight: 900, lineHeight: 1, animation: "vsFlash 2s ease infinite" }}>VS</div>
                                <div style={{
                                    background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.06)",
                                    borderRadius: 12, padding: "10px 14px", fontSize: 11, color: "#9ca3af", lineHeight: 1.6,
                                    maxWidth: 150, textAlign: "center", minHeight: 44
                                }}>
                                    {logMsg}
                                </div>
                                {lastResult && (
                                    <div style={{
                                        fontSize: 12, fontWeight: 700, fontFamily: "Cinzel",
                                        padding: "5px 16px", borderRadius: 20, animation: "bounceIn 0.4s ease-out",
                                        backgroundImage: lastResult.is_correct
                                            ? "linear-gradient(135deg,rgba(34,197,94,0.28),rgba(21,128,61,0.22))"
                                            : "linear-gradient(135deg,rgba(239,68,68,0.28),rgba(185,28,28,0.22))",
                                        border: `1px solid ${lastResult.is_correct ? "rgba(74,222,128,0.55)" : "rgba(248,113,113,0.55)"}`,
                                        color: lastResult.is_correct ? "#4ade80" : "#f87171"
                                    }}>
                                        {lastResult.is_correct ? lastResult.is_critical ? "⚡ CRIT!" : "✓ HIT!" : "✗ MISS!"}
                                    </div>
                                )}
                            </div>

                            {/* MONSTER */}
                            <div style={{ width: "40%", textAlign: "center" }}>
                                <div style={{
                                    backgroundImage: "linear-gradient(90deg,transparent,rgba(239,68,68,0.18),transparent)",
                                    border: "1px solid rgba(239,68,68,0.28)", borderRadius: 10, padding: "6px 12px", marginBottom: 18,
                                    fontSize: 12, fontFamily: "Cinzel", fontWeight: 700, color: "#f87171", letterSpacing: "0.08em",
                                    animation: monster?.is_boss ? "bossGlow 2s ease infinite" : "none"
                                }}>
                                    {monster?.is_boss ? "👑 BOSS" : "ENEMY"}
                                </div>
                                <div style={{ position: "relative", display: "inline-block" }}>
                                    <div style={{
                                        position: "absolute", bottom: -12, left: "50%", transform: "translateX(-50%)",
                                        width: 90, height: 22, borderRadius: "50%",
                                        backgroundImage: "radial-gradient(ellipse,rgba(239,68,68,0.55),transparent 70%)", filter: "blur(5px)"
                                    }} />
                                    {dmgFloat && dmgFloat.isHero && (
                                        <div style={{
                                            position: "absolute", top: -24, left: "50%", transform: "translateX(-50%)",
                                            fontSize: 26, fontWeight: 900, fontFamily: "Cinzel", color: "#fbbf24",
                                            textShadow: "0 0 14px #f59e0b", animation: "floatUp 1s ease-out forwards",
                                            pointerEvents: "none", zIndex: 10, whiteSpace: "nowrap"
                                        }}>⚔️ -{dmgFloat.val}</div>
                                    )}
                                    <div style={{ display: "inline-block", filter: "drop-shadow(0 0 24px rgba(239,68,68,0.85)) drop-shadow(0 6px 12px rgba(0,0,0,0.9))", ...monsterStyle() }}>
                                        <MonsterChar size={115} />
                                    </div>
                                </div>
                                <div style={{ marginTop: 18 }}><HPBar current={monsterHP} max={monsterMaxHP} color="#ef4444" label="MONSTER HP" /></div>
                                {monster?.is_boss && (
                                    <div style={{
                                        marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4,
                                        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.28)",
                                        borderRadius: 20, padding: "3px 10px", fontSize: 9, color: "#f87171", fontWeight: 700, letterSpacing: "0.1em"
                                    }}>
                                        💀 BOSS MONSTER
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ground line */}
                        <div style={{ height: 2, marginTop: 24, backgroundImage: "linear-gradient(90deg,transparent,rgba(168,85,247,0.55),rgba(239,68,68,0.55),rgba(168,85,247,0.55),transparent)", borderRadius: 1 }} />
                    </div>
                </div>

                {/* Quiz */}
                {question && !battleOver && (
                    <div style={{
                        backgroundImage: "linear-gradient(135deg,rgba(8,0,24,0.95),rgba(16,0,8,0.95))",
                        border: "1px solid rgba(168,85,247,0.22)", borderRadius: 18, padding: 26, marginBottom: 16,
                        boxShadow: "0 0 50px rgba(0,0,0,0.7)", animation: "fadeSlideIn 0.4s ease-out"
                    }}>
                        <div style={{ fontSize: 10, color: "#7c3aed", letterSpacing: "0.28em", fontWeight: 700, marginBottom: 16, fontFamily: "Cinzel", display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 18 }}>⚔️</span>ANSWER TO ATTACK
                        </div>
                        <p style={{ fontSize: 16, lineHeight: 1.7, color: "#e2e8f0", marginBottom: 20, fontWeight: 500 }}>{question.body}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                            {question.options?.map((opt: string, i: number) => {
                                let bg = "rgba(255,255,255,0.025)";
                                let border = "rgba(255,255,255,0.07)";
                                let col = "#d1d5db";
                                let shadow = "none";
                                if (answered) {
                                    if (i === lastResult.correct_index) { bg = "rgba(34,197,94,0.14)"; border = "rgba(74,222,128,0.52)"; col = "#86efac"; shadow = "0 0 14px rgba(34,197,94,0.3)"; }
                                    else if (lastResult && !lastResult.is_correct && i === lastResult.selected_index) { bg = "rgba(239,68,68,0.14)"; border = "rgba(248,113,113,0.52)"; col = "#fca5a5"; shadow = "0 0 14px rgba(239,68,68,0.3)"; }
                                    else { bg = "rgba(0,0,0,0.18)"; border = "rgba(255,255,255,0.03)"; col = "#374151"; }
                                }
                                return (
                                    <button key={i} onClick={() => !answered && handleAnswer(i)} disabled={answered}
                                        onMouseEnter={e => { if (!answered) { e.currentTarget.style.background = "rgba(124,58,237,0.1)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.45)"; e.currentTarget.style.transform = "scale(1.02)translateY(-1px)"; } }}
                                        onMouseLeave={e => { if (!answered) { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = border; e.currentTarget.style.transform = "scale(1)"; } }}
                                        style={{
                                            background: bg, border: `1px solid ${border}`, borderRadius: 13, padding: "15px 16px",
                                            color: col, cursor: answered ? "not-allowed" : "pointer", textAlign: "left", fontSize: 13,
                                            fontFamily: "Rajdhani", fontWeight: 600, transition: "all 0.2s", boxShadow: shadow
                                        }}>
                                        <span style={{ color: answered && i === question.correct_index ? "#4ade80" : "#6b7280", fontWeight: 800, marginRight: 8, fontFamily: "Cinzel", fontSize: 12 }}>{["A", "B", "C", "D"][i]}</span>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                        {answered && lastResult && !lastResult.is_correct && question.explanation && (
                            <div style={{
                                marginTop: 14, padding: "13px 16px",
                                backgroundImage: "linear-gradient(135deg,rgba(234,179,8,0.07),rgba(217,119,6,0.05))",
                                border: "1px solid rgba(234,179,8,0.24)", borderRadius: 12,
                                fontSize: 13, color: "#fde68a", lineHeight: 1.65, animation: "fadeSlideIn 0.3s ease-out"
                            }}>
                                💡 <strong>Tip:</strong> {question.explanation}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
