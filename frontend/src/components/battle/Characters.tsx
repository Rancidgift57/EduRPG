// frontend/src/components/battle/Characters.tsx
// All hero and monster SVG components

// ── HEROES ───────────────────────────────────────────────────────────

export function SamuraiSVG({ size = 120, color = "#60a5fa" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
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
            <rect x="14" y="33" width="12" height="22" rx="5" fill={color} opacity="0.8" />
            <rect x="54" y="33" width="12" height="22" rx="5" fill={color} opacity="0.8" />
            <rect x="63" y="15" width="4" height="50" rx="1.5" fill="#94a3b8" />
            <rect x="60" y="32" width="10" height="3" rx="1" fill="#fbbf24" />
            <rect x="64" y="8" width="2" height="9" rx="0.5" fill="#e2e8f0" />
            <rect x="28" y="59" width="11" height="28" rx="5" fill={color} opacity="0.85" />
            <rect x="41" y="59" width="11" height="28" rx="5" fill={color} opacity="0.85" />
            <rect x="26" y="83" width="15" height="8" rx="4" fill={color} opacity="0.65" />
            <rect x="39" y="83" width="15" height="8" rx="4" fill={color} opacity="0.65" />
        </svg>
    );
}

export function WizardSVG({ size = 120, color = "#c084fc" }: { size?: number; color?: string }) {
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
            <path d="M34 44 Q40 50 46 44 Q43 52 40 53 Q37 52 34 44Z" fill={color} opacity="0.4" />
            <path d="M23 48 L30 46 L40 47 L50 46 L57 48 L58 84 L22 84Z" fill={color} opacity="0.75" />
            <rect x="13" y="48" width="10" height="22" rx="4" fill={color} opacity="0.8" />
            <rect x="8" y="18" width="5" height="56" rx="2" fill="#6b21a8" />
            <circle cx="10.5" cy="18" r="8" fill={color} opacity="0.5" />
            <circle cx="10.5" cy="18" r="5" fill="#a855f7" />
            <circle cx="10.5" cy="18" r="3" fill="#e9d5ff" opacity="0.95" />
            <rect x="57" y="48" width="10" height="22" rx="4" fill={color} opacity="0.8" />
            <path d="M28 84 L26 104 L38 104 L40 92 L42 104 L54 104 L52 84Z" fill={color} opacity="0.75" />
        </svg>
    );
}

export function ArcherSVG({ size = 120, color = "#34d399" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
            {/* Hood */}
            <path d="M28 20 Q28 6 40 6 Q52 6 52 20 L52 26 Q52 30 40 30 Q28 30 28 26Z" fill="#1e3a2f" opacity="0.95" />
            <path d="M30 22 Q40 16 50 22" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
            <ellipse cx="36" cy="20" rx="2.8" ry="2.4" fill={color} opacity="0.9" />
            <ellipse cx="44" cy="20" rx="2.8" ry="2.4" fill={color} opacity="0.9" />
            <ellipse cx="36" cy="20" rx="1.5" ry="1.5" fill="#fff" />
            <ellipse cx="44" cy="20" rx="1.5" ry="1.5" fill="#fff" />
            {/* Cloak body */}
            <path d="M24 30 L30 28 L40 29 L50 28 L56 30 L58 82 L22 82Z" fill="#1e3a2f" opacity="0.9" />
            <path d="M28 30 L40 29 L52 30 L52 80 L28 80Z" fill={color} opacity="0.15" />
            {/* Leaf motif */}
            <ellipse cx="40" cy="54" rx="6" ry="12" fill={color} opacity="0.2" transform="rotate(-10,40,54)" />
            {/* Arms */}
            <rect x="12" y="31" width="12" height="20" rx="5" fill="#1e3a2f" opacity="0.9" />
            <rect x="56" y="31" width="12" height="20" rx="5" fill="#1e3a2f" opacity="0.9" />
            {/* Bow */}
            <path d="M66 20 Q76 36 66 52" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <line x1="66" y1="20" x2="66" y2="52" stroke={color} strokeWidth="1" opacity="0.5" />
            {/* Arrow */}
            <line x1="40" y1="36" x2="68" y2="36" stroke="#fbbf24" strokeWidth="1.5" />
            <path d="M68 33 L74 36 L68 39Z" fill="#fbbf24" />
            <path d="M40 33 L36 36 L40 39Z" fill={color} opacity="0.7" />
            {/* Legs */}
            <rect x="28" y="80" width="10" height="24" rx="4" fill="#1e3a2f" opacity="0.9" />
            <rect x="42" y="80" width="10" height="24" rx="4" fill="#1e3a2f" opacity="0.9" />
            <rect x="26" y="99" width="14" height="7" rx="3" fill={color} opacity="0.7" />
            <rect x="40" y="99" width="14" height="7" rx="3" fill={color} opacity="0.7" />
        </svg>
    );
}

export function NinjaSVG({ size = 120, color = "#4ade80" }: { size?: number; color?: string }) {
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
            <rect x="27" y="46" width="26" height="5" fill={color} opacity="0.7" />
            <rect x="14" y="36" width="13" height="22" rx="5" fill="#0f172a" />
            <rect x="53" y="36" width="13" height="22" rx="5" fill="#0f172a" />
            <path d="M60 43 L72 38 L69 44 L74 48 L66 46 L63 52 L58 46 L52 48 L56 43 L52 38Z" fill={color} opacity="0.95" />
            <rect x="28" y="62" width="11" height="28" rx="5" fill="#0f172a" />
            <rect x="41" y="62" width="11" height="28" rx="5" fill="#0f172a" />
            <rect x="26" y="85" width="15" height="8" rx="4" fill={color} opacity="0.7" />
            <rect x="39" y="85" width="15" height="8" rx="4" fill={color} opacity="0.7" />
        </svg>
    );
}

export function KnightSVG({ size = 120, color = "#fbbf24" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
            <path d="M25 22 Q25 7 40 7 Q55 7 55 22 L55 33 L25 33Z" fill={color} opacity="0.88" />
            <rect x="25" y="31" width="30" height="6" rx="1" fill={color} opacity="0.6" />
            <rect x="29" y="17" width="9" height="3.5" rx="1" fill="#0f172a" opacity="0.85" />
            <rect x="42" y="17" width="9" height="3.5" rx="1" fill="#0f172a" opacity="0.85" />
            <rect x="32" y="36" width="16" height="7" rx="2" fill={color} opacity="0.7" />
            <path d="M21 43 L38 41 L40 42 L42 41 L59 43 L59 74 L21 74Z" fill={color} opacity="0.88" />
            <ellipse cx="19" cy="46" rx="10" ry="9" fill={color} opacity="0.85" />
            <ellipse cx="61" cy="46" rx="10" ry="9" fill={color} opacity="0.85" />
            <rect x="12" y="52" width="12" height="22" rx="5" fill={color} opacity="0.8" />
            <rect x="56" y="52" width="12" height="22" rx="5" fill={color} opacity="0.8" />
            <path d="M6 46 L20 44 L20 68 L13 75 L6 68Z" fill={color} opacity="0.92" />
            <circle cx="13" cy="57" r="3.5" fill="#ffd700" opacity="0.95" />
            <rect x="59" y="28" width="5" height="48" rx="1.5" fill="#94a3b8" />
            <rect x="56" y="50" width="12" height="4" rx="1.5" fill={color} />
            <rect x="61" y="18" width="2.5" height="12" rx="1" fill="#e2e8f0" />
            <rect x="27" y="73" width="12" height="26" rx="5" fill={color} opacity="0.82" />
            <rect x="41" y="73" width="12" height="26" rx="5" fill={color} opacity="0.82" />
        </svg>
    );
}

export function RobotSVG({ size = 120, color = "#f87171" }: { size?: number; color?: string }) {
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
            <rect x="34" y="33" width="12" height="6" rx="2" fill={color} opacity="0.5" />
            <rect x="21" y="39" width="38" height="32" rx="5" fill="#1e293b" />
            <rect x="23" y="41" width="34" height="28" rx="4" fill="#0f172a" />
            <rect x="9" y="40" width="12" height="28" rx="5" fill="#1e293b" />
            <rect x="59" y="40" width="12" height="28" rx="5" fill="#1e293b" />
            <rect x="64" y="52" width="20" height="6" rx="3" fill={color} opacity="0.92" />
            <circle cx="84" cy="55" r="3.5" fill={color} />
            <rect x="25" y="70" width="13" height="28" rx="5" fill="#1e293b" />
            <rect x="42" y="70" width="13" height="28" rx="5" fill="#1e293b" />
            <rect x="22" y="94" width="17" height="8" rx="3" fill="#1e293b" />
            <rect x="41" y="94" width="17" height="8" rx="3" fill="#1e293b" />
        </svg>
    );
}

export function DruidSVG({ size = 120, color = "#86efac" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
            {/* Flower crown */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <circle key={i}
                    cx={40 + 9 * Math.cos(deg * Math.PI / 180)}
                    cy={10 + 9 * Math.sin(deg * Math.PI / 180)}
                    r="3" fill={i % 2 === 0 ? "#f9a8d4" : "#fde68a"} opacity="0.9" />
            ))}
            <circle cx="40" cy="10" r="4" fill={color} opacity="0.8" />
            {/* Head */}
            <ellipse cx="40" cy="22" rx="12" ry="13" fill="#d4b483" opacity="0.9" />
            <ellipse cx="36" cy="21" rx="2.8" ry="2.5" fill="#1a3020" />
            <ellipse cx="44" cy="21" rx="2.8" ry="2.5" fill="#1a3020" />
            <ellipse cx="36.5" cy="20.5" rx="1.2" ry="1.2" fill={color} opacity="0.8" />
            <ellipse cx="44.5" cy="20.5" rx="1.2" ry="1.2" fill={color} opacity="0.8" />
            <path d="M36 29 Q40 33 44 29" stroke={color} strokeWidth="1.5" fill="none" />
            {/* Robes */}
            <path d="M22 34 L30 32 L40 33 L50 32 L58 34 L60 88 L20 88Z" fill="#2d4a2d" opacity="0.9" />
            <path d="M28 34 L40 33 L52 34 L52 86 L28 86Z" fill={color} opacity="0.2" />
            {/* Leaf patterns */}
            <ellipse cx="34" cy="55" rx="4" ry="8" fill={color} opacity="0.25" transform="rotate(20,34,55)" />
            <ellipse cx="46" cy="55" rx="4" ry="8" fill={color} opacity="0.25" transform="rotate(-20,46,55)" />
            {/* Staff arm */}
            <rect x="12" y="35" width="10" height="20" rx="4" fill="#2d4a2d" opacity="0.9" />
            {/* Nature staff */}
            <rect x="7" y="15" width="5" height="55" rx="2" fill="#5c3d11" />
            {/* Vine wrap */}
            <path d="M7 20 Q14 25 7 35 Q14 40 7 50" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
            <circle cx="9.5" cy="18" r="6" fill="#1a3a1a" opacity="0.8" />
            <circle cx="9.5" cy="18" r="4" fill={color} opacity="0.7" />
            {/* Healing orbs */}
            <circle cx="14" cy="35" r="3" fill="#f9a8d4" opacity="0.6" />
            <circle cx="65" cy="40" r="2.5" fill={color} opacity="0.5" />
            {/* Other arm */}
            <rect x="58" y="35" width="10" height="20" rx="4" fill="#2d4a2d" opacity="0.9" />
            {/* Legs */}
            <path d="M26 86 L24 104 L36 104 L40 94 L44 104 L56 104 L54 86Z" fill="#2d4a2d" opacity="0.9" />
            <rect x="24" y="99" width="13" height="7" rx="3" fill={color} opacity="0.6" />
            <rect x="43" y="99" width="13" height="7" rx="3" fill={color} opacity="0.6" />
        </svg>
    );
}

export function BerserkerSVG({ size = 120, color = "#fb923c" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
            {/* Horned helmet */}
            <path d="M22 22 Q22 6 40 6 Q58 6 58 22 L58 30 L22 30Z" fill="#374151" opacity="0.95" />
            <path d="M22 20 L14 8 L20 16Z" fill="#6b7280" />
            <path d="M58 20 L66 8 L60 16Z" fill="#6b7280" />
            {/* Helmet detail */}
            <rect x="22" y="28" width="36" height="5" rx="1" fill={color} opacity="0.6" />
            {/* Face */}
            <ellipse cx="40" cy="36" rx="14" ry="12" fill="#d4a880" opacity="0.9" />
            {/* Angry eyes */}
            <rect x="30" y="32" width="10" height="7" rx="2" fill="#0f172a" />
            <rect x="40" y="32" width="10" height="7" rx="2" fill="#0f172a" />
            <ellipse cx="35" cy="35.5" rx="3" ry="3" fill={color} />
            <ellipse cx="45" cy="35.5" rx="3" ry="3" fill={color} />
            <ellipse cx="35" cy="35.5" rx="1.5" ry="1.5" fill="#fff" opacity="0.9" />
            <ellipse cx="45" cy="35.5" rx="1.5" ry="1.5" fill="#fff" opacity="0.9" />
            {/* Furrowed brows */}
            <path d="M30 30 L40 33" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M50 30 L40 33" stroke={color} strokeWidth="2" strokeLinecap="round" />
            {/* Scar */}
            <path d="M44 30 L46 38" stroke="#7f1d1d" strokeWidth="1.5" opacity="0.7" />
            {/* Beard */}
            <path d="M28 44 Q40 52 52 44 Q48 54 40 56 Q32 54 28 44Z" fill="#1c1917" opacity="0.7" />
            {/* Massive armored body */}
            <path d="M16 46 L28 44 L40 45 L52 44 L64 46 L66 80 L14 80Z" fill="#374151" opacity="0.95" />
            <path d="M24 46 L40 45 L56 46 L56 78 L24 78Z" fill={color} opacity="0.2" />
            {/* Chest rune */}
            <path d="M36 55 L40 50 L44 55 L40 60Z" fill={color} opacity="0.7" />
            {/* Rage aura */}
            <circle cx="40" cy="62" r="18" fill={color} opacity="0.05" />
            {/* Giant shoulder pads */}
            <ellipse cx="14" cy="48" rx="13" ry="10" fill="#4b5563" opacity="0.95" />
            <ellipse cx="66" cy="48" rx="13" ry="10" fill="#4b5563" opacity="0.95" />
            {/* Massive arms */}
            <rect x="5" y="55" width="14" height="26" rx="6" fill="#374151" opacity="0.95" />
            <rect x="61" y="55" width="14" height="26" rx="6" fill="#374151" opacity="0.95" />
            {/* Battle axe */}
            <rect x="71" y="28" width="5" height="58" rx="2" fill="#94a3b8" />
            <path d="M68 22 Q82 28 76 40 Q70 36 68 22Z" fill={color} opacity="0.9" />
            <path d="M68 50 Q82 44 76 56 Q70 52 68 50Z" fill={color} opacity="0.7" />
            {/* Fists */}
            <rect x="4" y="76" width="14" height="10" rx="4" fill="#4b5563" />
            <rect x="62" y="76" width="14" height="10" rx="4" fill="#4b5563" />
            {/* Legs */}
            <rect x="22" y="79" width="14" height="24" rx="5" fill="#374151" opacity="0.95" />
            <rect x="44" y="79" width="14" height="24" rx="5" fill="#374151" opacity="0.95" />
            <rect x="20" y="99" width="18" height="8" rx="4" fill="#4b5563" />
            <rect x="42" y="99" width="18" height="8" rx="4" fill="#4b5563" />
        </svg>
    );
}

export function OracleSVG({ size = 120, color = "#e879f9" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
            {/* Floating third eye crown */}
            <ellipse cx="40" cy="6" rx="8" ry="5" fill={color} opacity="0.4" />
            <ellipse cx="40" cy="6" rx="5" ry="3" fill={color} opacity="0.7" />
            <ellipse cx="40" cy="6" rx="2.5" ry="1.5" fill="#fff" opacity="0.9" />
            <line x1="40" y1="9" x2="40" y2="14" stroke={color} strokeWidth="1" opacity="0.6" />
            {/* Head */}
            <ellipse cx="40" cy="22" rx="12" ry="13" fill="#2d1b4e" opacity="0.95" />
            {/* Veil/hood */}
            <path d="M28 18 Q40 12 52 18 L54 30 L26 30Z" fill={color} opacity="0.25" />
            {/* Eyes */}
            <ellipse cx="36" cy="20" rx="3.5" ry="3.5" fill="#fff" />
            <ellipse cx="44" cy="20" rx="3.5" ry="3.5" fill="#fff" />
            <ellipse cx="36" cy="20" rx="2.5" ry="2.5" fill={color} />
            <ellipse cx="44" cy="20" rx="2.5" ry="2.5" fill={color} />
            <ellipse cx="36" cy="20" rx="1.2" ry="1.2" fill="#1a0533" />
            <ellipse cx="44" cy="20" rx="1.2" ry="1.2" fill="#1a0533" />
            <ellipse cx="35.5" cy="19.5" rx="0.6" ry="0.6" fill="#fff" opacity="0.9" />
            <ellipse cx="43.5" cy="19.5" rx="0.6" ry="0.6" fill="#fff" opacity="0.9" />
            {/* Mystical marks */}
            <path d="M34 28 L36 32" stroke={color} strokeWidth="1" opacity="0.5" />
            <path d="M46 28 L44 32" stroke={color} strokeWidth="1" opacity="0.5" />
            {/* Flowing robes */}
            <path d="M20 32 L28 30 L40 31 L52 30 L60 32 L64 90 L16 90Z" fill="#2d1b4e" opacity="0.9" />
            <path d="M26 32 L40 31 L54 32 L56 88 L24 88Z" fill={color} opacity="0.15" />
            {/* Star patterns on robe */}
            {[[34, 50], [46, 50], [40, 64], [34, 70], [46, 70]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="1.5" fill={color} opacity="0.5" />
            ))}
            {/* Crystal ball arm */}
            <rect x="12" y="33" width="10" height="22" rx="4" fill="#2d1b4e" opacity="0.9" />
            <circle cx="10" cy="28" r="10" fill="#1a0533" opacity="0.8" />
            <circle cx="10" cy="28" r="7" fill={color} opacity="0.3" />
            <circle cx="10" cy="28" r="4" fill={color} opacity="0.5" />
            <circle cx="8" cy="26" r="2" fill="#fff" opacity="0.4" />
            {/* Wand arm */}
            <rect x="58" y="33" width="10" height="22" rx="4" fill="#2d1b4e" opacity="0.9" />
            <rect x="66" y="12" width="4" height="44" rx="2" fill="#4c1d95" />
            <circle cx="68" cy="10" r="5" fill={color} opacity="0.9" />
            <circle cx="68" cy="10" r="3" fill="#fff" opacity="0.7" />
            {/* Floating orbs */}
            <circle cx="18" cy="56" r="3.5" fill={color} opacity="0.5" />
            <circle cx="62" cy="52" r="3" fill={color} opacity="0.4" />
            <circle cx="20" cy="72" r="2" fill="#a78bfa" opacity="0.5" />
            {/* Skirt */}
            <path d="M22 88 L18 104 L36 104 L40 96 L44 104 L62 104 L58 88Z" fill="#2d1b4e" opacity="0.9" />
            <rect x="17" y="98" width="20" height="8" rx="3" fill={color} opacity="0.5" />
            <rect x="43" y="98" width="20" height="8" rx="3" fill={color} opacity="0.5" />
        </svg>
    );
}

export function TitanSVG({ size = 120, color = "#ffd700" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size * 1.4} viewBox="0 0 80 112" fill="none">
            {/* Crown of power */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <line key={i}
                    x1={40 + 8 * Math.cos(deg * Math.PI / 180)}
                    y1={8 + 8 * Math.sin(deg * Math.PI / 180)}
                    x2={40 + 14 * Math.cos(deg * Math.PI / 180)}
                    y2={8 + 14 * Math.sin(deg * Math.PI / 180)}
                    stroke={color} strokeWidth="2.5" opacity="0.8" />
            ))}
            <circle cx="40" cy="8" r="8" fill="#1a1a2e" opacity="0.9" />
            <circle cx="40" cy="8" r="5" fill={color} opacity="0.7" />
            <circle cx="40" cy="8" r="3" fill="#fff" opacity="0.9" />
            {/* Imposing head */}
            <ellipse cx="40" cy="24" rx="15" ry="14" fill="#1e1b4b" opacity="0.95" />
            <rect x="27" y="18" width="26" height="12" rx="3" fill="#0f0a2a" opacity="0.9" />
            {/* Glowing eyes */}
            <ellipse cx="35" cy="22" rx="4.5" ry="4.5" fill={color} opacity="0.9" />
            <ellipse cx="45" cy="22" rx="4.5" ry="4.5" fill={color} opacity="0.9" />
            <ellipse cx="35" cy="22" rx="2.8" ry="2.8" fill="#fff" opacity="0.9" />
            <ellipse cx="45" cy="22" rx="2.8" ry="2.8" fill="#fff" opacity="0.9" />
            <ellipse cx="35" cy="22" rx="1.4" ry="1.4" fill="#1e1b4b" />
            <ellipse cx="45" cy="22" rx="1.4" ry="1.4" fill="#1e1b4b" />
            {/* Jaw */}
            <path d="M27 30 L35 27 L40 28 L45 27 L53 30 Q50 38 40 38 Q30 38 27 30Z" fill="#2e2b52" opacity="0.9" />
            <path d="M32 34 L36 30 L40 32 L44 30 L48 34" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
            {/* Massive armored body */}
            <path d="M10 42 L24 40 L40 41 L56 40 L70 42 L72 84 L8 84Z" fill="#1e1b4b" opacity="0.95" />
            <path d="M18 42 L40 41 L62 42 L62 82 L18 82Z" fill={color} opacity="0.12" />
            {/* Chest emblem */}
            <path d="M32 56 L40 48 L48 56 L44 64 L36 64Z" fill={color} opacity="0.6" />
            <circle cx="40" cy="56" r="5" fill={color} opacity="0.4" />
            <circle cx="40" cy="56" r="3" fill="#fff" opacity="0.5" />
            {/* Power aura */}
            <circle cx="40" cy="62" r="25" fill={color} opacity="0.04" />
            {/* Titan shoulders */}
            <path d="M6 40 Q-4 50 4 62 L14 58 Q8 50 10 44Z" fill="#2e2b52" opacity="0.95" />
            <path d="M74 40 Q84 50 76 62 L66 58 Q72 50 70 44Z" fill="#2e2b52" opacity="0.95" />
            <ellipse cx="8" cy="51" rx="10" ry="14" fill="#312e81" opacity="0.9" />
            <ellipse cx="72" cy="51" rx="10" ry="14" fill="#312e81" opacity="0.9" />
            {/* Power fists */}
            <rect x="-2" y="60" width="18" height="28" rx="7" fill="#1e1b4b" opacity="0.95" />
            <rect x="64" y="60" width="18" height="28" rx="7" fill="#1e1b4b" opacity="0.95" />
            <rect x="-4" y="82" width="22" height="10" rx="5" fill={color} opacity="0.7" />
            <rect x="62" y="82" width="22" height="10" rx="5" fill={color} opacity="0.7" />
            {/* Energy knuckles */}
            {[-1, 4, 9].map((o, i) => (
                <circle key={i} cx={o + 1} cy={74} r="2.5" fill={color} opacity="0.8" />
            ))}
            {[65, 70, 75].map((x, i) => (
                <circle key={i} cx={x} cy={74} r="2.5" fill={color} opacity="0.8" />
            ))}
            {/* Titan legs */}
            <rect x="18" y="83" width="18" height="24" rx="7" fill="#1e1b4b" opacity="0.95" />
            <rect x="44" y="83" width="18" height="24" rx="7" fill="#1e1b4b" opacity="0.95" />
            <rect x="15" y="101" width="24" height="10" rx="5" fill="#312e81" />
            <rect x="41" y="101" width="24" height="10" rx="5" fill="#312e81" />
        </svg>
    );
}

// ── MONSTERS ─────────────────────────────────────────────────────────

export function DragonMonster({ size = 130 }: { size?: number }) {
    return (
        <svg width={size} height={size * 1.3} viewBox="0 0 90 117" fill="none">
            <path d="M14 30 Q2 18 5 56 Q11 50 20 44Z" fill="#7f1d1d" opacity="0.8" />
            <path d="M76 30 Q88 18 85 56 Q79 50 70 44Z" fill="#7f1d1d" opacity="0.8" />
            <ellipse cx="45" cy="60" rx="27" ry="31" fill="#dc2626" opacity="0.9" />
            <ellipse cx="45" cy="24" rx="19" ry="17" fill="#dc2626" opacity="0.95" />
            <path d="M31 13 L27 1 L33 11Z" fill="#7f1d1d" />
            <path d="M59 13 L63 1 L57 11Z" fill="#7f1d1d" />
            <ellipse cx="37" cy="22" rx="5.5" ry="5.5" fill="#fbbf24" />
            <ellipse cx="53" cy="22" rx="5.5" ry="5.5" fill="#fbbf24" />
            <ellipse cx="37" cy="22" rx="3.5" ry="4.5" fill="#7f1d1d" />
            <ellipse cx="53" cy="22" rx="3.5" ry="4.5" fill="#7f1d1d" />
            <path d="M34 35 L37 32 L40 35 L44 32 L48 35 L51 32 L55 35 L56 37 L34 37Z" fill="#7f1d1d" />
            <path d="M46 37 Q62 41 73 35 Q68 43 73 52 Q57 46 46 43Z" fill="#f97316" opacity="0.7" />
            <path d="M19 55 Q9 66 13 79 L21 73 Q18 65 23 58Z" fill="#dc2626" opacity="0.9" />
            <path d="M71 55 Q81 66 77 79 L69 73 Q72 65 67 58Z" fill="#dc2626" opacity="0.9" />
            <path d="M66 76 Q82 92 76 112 Q66 110 61 97 Q63 89 66 76Z" fill="#dc2626" opacity="0.8" />
            <rect x="32" y="87" width="13" height="18" rx="5" fill="#dc2626" opacity="0.9" />
            <rect x="47" y="87" width="13" height="18" rx="5" fill="#dc2626" opacity="0.9" />
        </svg>
    );
}

export function SkullMonster({ size = 130 }: { size?: number }) {
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
            <rect x="31" y="35" width="28" height="9" rx="2.5" fill="#1e293b" />
            <path d="M19 44 Q17 37 24 37 L66 37 Q73 37 71 44 L71 92 Q66 100 61 92 Q56 84 51 92 Q46 100 41 92 Q36 84 31 92 Q26 100 21 92Z" fill="#1e293b" opacity="0.88" />
            <path d="M19 56 Q7 53 5 66 Q10 69 18 63Z" fill="#1e293b" opacity="0.82" />
            <path d="M71 56 Q83 53 85 66 Q80 69 72 63Z" fill="#1e293b" opacity="0.82" />
        </svg>
    );
}

export function GolemMonster({ size = 130 }: { size?: number }) {
    return (
        <svg width={size} height={size * 1.3} viewBox="0 0 90 117" fill="none">
            <ellipse cx="45" cy="66" rx="31" ry="39" fill="#44403c" opacity="0.92" />
            <circle cx="45" cy="66" r="13" fill="#f97316" opacity="0.28" />
            <circle cx="45" cy="66" r="9" fill="#fb923c" opacity="0.48" />
            <circle cx="45" cy="66" r="5.5" fill="#fed7aa" opacity="0.7" />
            <ellipse cx="45" cy="24" rx="21" ry="19" fill="#44403c" opacity="0.96" />
            <circle cx="29" cy="16" r="7" fill="#44403c" opacity="0.9" />
            <circle cx="61" cy="16" r="7" fill="#44403c" opacity="0.9" />
            <ellipse cx="36" cy="23" rx="6" ry="6" fill="#1c1917" />
            <ellipse cx="54" cy="23" rx="6" ry="6" fill="#1c1917" />
            <ellipse cx="36" cy="23" rx="4" ry="4" fill="#f97316" />
            <ellipse cx="54" cy="23" rx="4" ry="4" fill="#f97316" />
            <ellipse cx="13" cy="60" rx="13" ry="22" fill="#44403c" opacity="0.9" />
            <ellipse cx="77" cy="60" rx="13" ry="22" fill="#44403c" opacity="0.9" />
            <ellipse cx="33" cy="99" rx="14" ry="17" fill="#44403c" opacity="0.92" />
            <ellipse cx="57" cy="99" rx="14" ry="17" fill="#44403c" opacity="0.92" />
        </svg>
    );
}

export function AlienMonster({ size = 130 }: { size?: number }) {
    return (
        <svg width={size} height={size * 1.3} viewBox="0 0 90 117" fill="none">
            {[-20, -10, 0, 10, 20].map((ox, i) => (
                <path key={i} d={`M${40 + ox} 96 Q${35 + ox} 112 ${38 + ox} 120`}
                    stroke="#a855f7" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            ))}
            <ellipse cx="45" cy="66" rx="29" ry="36" fill="#581c87" opacity="0.92" />
            <ellipse cx="45" cy="22" rx="23" ry="21" fill="#581c87" opacity="0.96" />
            <ellipse cx="33" cy="20" rx="10" ry="12" fill="#1e1b4b" />
            <ellipse cx="57" cy="20" rx="10" ry="12" fill="#1e1b4b" />
            <ellipse cx="33" cy="20" rx="7.5" ry="9.5" fill="#4f46e5" />
            <ellipse cx="57" cy="20" rx="7.5" ry="9.5" fill="#4f46e5" />
            <ellipse cx="33" cy="20" rx="4.5" ry="5.5" fill="#a5b4fc" />
            <ellipse cx="57" cy="20" rx="4.5" ry="5.5" fill="#a5b4fc" />
            <path d="M16 56 Q7 66 5 82 Q10 84 15 78 Q14 70 20 60Z" fill="#581c87" opacity="0.9" />
            <path d="M74 56 Q83 66 85 82 Q80 84 75 78 Q76 70 70 60Z" fill="#581c87" opacity="0.9" />
        </svg>
    );
}

export function BugMonster({ size = 130 }: { size?: number }) {
    return (
        <svg width={size} height={size * 1.3} viewBox="0 0 90 117" fill="none">
            <line x1="35" y1="12" x2="18" y2="2" stroke="#22c55e" strokeWidth="2.5" />
            <line x1="55" y1="12" x2="72" y2="2" stroke="#22c55e" strokeWidth="2.5" />
            <circle cx="18" cy="2" r="3.5" fill="#22c55e" />
            <circle cx="72" cy="2" r="3.5" fill="#22c55e" />
            <ellipse cx="45" cy="20" rx="19" ry="17" fill="#15803d" opacity="0.92" />
            <ellipse cx="45" cy="52" rx="23" ry="21" fill="#16a34a" opacity="0.92" />
            <ellipse cx="45" cy="76" rx="19" ry="17" fill="#15803d" opacity="0.92" />
            <ellipse cx="45" cy="101" rx="13" ry="11" fill="#166534" opacity="0.92" />
            <line x1="22" y1="40" x2="4" y2="52" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="68" y1="40" x2="86" y2="52" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="22" y1="51" x2="4" y2="63" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="68" y1="51" x2="86" y2="63" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="22" y1="62" x2="4" y2="74" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="68" y1="62" x2="86" y2="74" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
    );
}

export function HydraMonster({ size = 130 }: { size?: number }) {
    return (
        <svg width={size} height={size * 1.3} viewBox="0 0 90 117" fill="none">
            {/* Three heads */}
            <ellipse cx="25" cy="16" rx="12" ry="10" fill="#166534" opacity="0.95" />
            <ellipse cx="45" cy="10" rx="12" ry="10" fill="#15803d" opacity="0.95" />
            <ellipse cx="65" cy="16" rx="12" ry="10" fill="#166534" opacity="0.95" />
            {/* Eyes on each head */}
            <circle cx="22" cy="14" r="3" fill="#fbbf24" />
            <circle cx="28" cy="14" r="3" fill="#fbbf24" />
            <circle cx="42" cy="8" r="3" fill="#fbbf24" />
            <circle cx="48" cy="8" r="3" fill="#fbbf24" />
            <circle cx="62" cy="14" r="3" fill="#fbbf24" />
            <circle cx="68" cy="14" r="3" fill="#fbbf24" />
            {/* Pupils */}
            {[[22, 14], [28, 14], [42, 8], [48, 8], [62, 14], [68, 14]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="1.5" fill="#1a1a1a" />
            ))}
            {/* Necks */}
            <path d="M25 26 Q20 40 28 50" stroke="#15803d" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M45 20 Q45 35 45 50" stroke="#16a34a" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M65 26 Q70 40 62 50" stroke="#15803d" strokeWidth="10" fill="none" strokeLinecap="round" />
            {/* Body */}
            <ellipse cx="45" cy="72" rx="28" ry="32" fill="#15803d" opacity="0.9" />
            <ellipse cx="45" cy="70" rx="20" ry="24" fill="#16a34a" opacity="0.4" />
            {/* Scale pattern */}
            {[35, 45, 55, 38, 48, 58, 32, 42, 52, 62].map((x, i) => (
                <ellipse key={i} cx={x} cy={58 + Math.floor(i / 3) * 10}
                    rx="4" ry="3" fill="#166534" opacity="0.4" />
            ))}
            {/* Arms */}
            <path d="M17 62 Q6 72 10 84 L18 78 Q16 70 22 66Z" fill="#15803d" opacity="0.9" />
            <path d="M73 62 Q84 72 80 84 L72 78 Q74 70 68 66Z" fill="#15803d" opacity="0.9" />
            {/* Tail */}
            <path d="M50 98 Q68 110 64 120 L54 116 Q56 108 48 102Z" fill="#15803d" opacity="0.8" />
            {/* Legs */}
            <rect x="30" y="96" width="12" height="18" rx="5" fill="#15803d" opacity="0.9" />
            <rect x="48" y="96" width="12" height="18" rx="5" fill="#15803d" opacity="0.9" />
        </svg>
    );
}

export function WraithMonster({ size = 130 }: { size?: number }) {
    return (
        <svg width={size} height={size * 1.3} viewBox="0 0 90 117" fill="none">
            {/* Ethereal glow */}
            <ellipse cx="45" cy="58" rx="32" ry="40" fill="#4c1d95" opacity="0.2" />
            {/* Main body — ghostly */}
            <path d="M15 38 Q15 20 45 18 Q75 20 75 38 L78 95 Q70 108 62 95 Q54 82 45 95 Q36 108 28 95 Q20 82 12 95Z" fill="#2e1065" opacity="0.88" />
            <path d="M20 40 Q20 24 45 22 Q70 24 70 40 L72 90 Q64 100 56 90 Q50 82 45 90 Q40 82 34 90 Q28 100 18 90Z" fill="#4c1d95" opacity="0.5" />
            {/* Hollow skull face */}
            <ellipse cx="45" cy="34" rx="18" ry="18" fill="#1e1b4b" opacity="0.9" />
            <ellipse cx="45" cy="32" rx="16" ry="16" fill="#0f0a2e" opacity="0.8" />
            {/* Hollow eyes */}
            <ellipse cx="38" cy="30" rx="6" ry="7" fill="#1e1b4b" />
            <ellipse cx="52" cy="30" rx="6" ry="7" fill="#1e1b4b" />
            <ellipse cx="38" cy="30" rx="4" ry="5" fill="#7c3aed" opacity="0.9" />
            <ellipse cx="52" cy="30" rx="4" ry="5" fill="#7c3aed" opacity="0.9" />
            <ellipse cx="38" cy="30" rx="2" ry="2.5" fill="#c4b5fd" />
            <ellipse cx="52" cy="30" rx="2" ry="2.5" fill="#c4b5fd" />
            {/* Screaming mouth */}
            <ellipse cx="45" cy="42" rx="7" ry="5" fill="#1e1b4b" />
            <ellipse cx="45" cy="42" rx="5" ry="3.5" fill="#0f0a2e" />
            {/* Chains */}
            {[20, 30, 40, 50, 60, 70].map((y, i) => (
                <circle key={i} cx={i % 2 === 0 ? 22 : 68} cy={y} r="2.5"
                    fill="#4b5563" opacity="0.7" />
            ))}
            {/* Claw arms */}
            <path d="M15 52 Q4 60 6 74 L14 68 Q12 62 18 56Z" fill="#2e1065" opacity="0.9" />
            <path d="M75 52 Q86 60 84 74 L76 68 Q78 62 72 56Z" fill="#2e1065" opacity="0.9" />
            {/* Bony claws */}
            {[-3, 0, 3].map((o, i) => (
                <path key={i} d={`M${6 + o} 72 L${5 + o} 80 L${8 + o} 76Z`} fill="#94a3b8" />
            ))}
            {[-3, 0, 3].map((o, i) => (
                <path key={i} d={`M${82 + o} 72 L${81 + o} 80 L${84 + o} 76Z`} fill="#94a3b8" />
            ))}
            {/* Soul orbs */}
            <circle cx="28" cy="62" r="4" fill="#7c3aed" opacity="0.5" />
            <circle cx="62" cy="58" r="3.5" fill="#a855f7" opacity="0.4" />
            <circle cx="22" cy="78" r="3" fill="#c084fc" opacity="0.4" />
            <circle cx="68" cy="74" r="2.5" fill="#c084fc" opacity="0.35" />
        </svg>
    );
}

// ── Export maps ───────────────────────────────────────────────────────

export const HERO_COMPONENTS: Record<string, React.FC<{ size?: number; color?: string }>> = {
    samurai: SamuraiSVG,
    wizard: WizardSVG,
    archer: ArcherSVG,
    ninja: NinjaSVG,
    knight: KnightSVG,
    robot: RobotSVG,
    druid: DruidSVG,
    berserker: BerserkerSVG,
    oracle: OracleSVG,
    titan: TitanSVG,
};

export const MONSTER_COMPONENTS: Record<string, React.FC<{ size?: number }>> = {
    "python-basics": BugMonster,
    "python-loops": DragonMonster,
    "python-functions": AlienMonster,
    "python-oop": SkullMonster,
    "algebra-basics": GolemMonster,
    "calculus": DragonMonster,
    "trigonometry": WraithMonster,
    "statistics": SkullMonster,
    "physics-mechanics": GolemMonster,
    "chemistry": BugMonster,
    "biology": HydraMonster,
    "machine-learning": AlienMonster,
    "neural-networks": SkullMonster,
    "algorithms": GolemMonster,
    "data-structures": BugMonster,
    // fallback keys
    "dragon": DragonMonster,
    "skull": SkullMonster,
    "golem": GolemMonster,
    "alien": AlienMonster,
    "bug": BugMonster,
    "hydra": HydraMonster,
    "wraith": WraithMonster,
};

export const HERO_COLORS: Record<string, string> = {
    samurai: "#60a5fa",
    wizard: "#c084fc",
    archer: "#34d399",
    ninja: "#4ade80",
    knight: "#fbbf24",
    robot: "#f87171",
    druid: "#86efac",
    berserker: "#fb923c",
    oracle: "#e879f9",
    titan: "#ffd700",
};

export const HERO_EMOJI: Record<string, string> = {
    samurai: "⚔️",
    wizard: "🔮",
    archer: "🏹",
    ninja: "🥷",
    knight: "🛡️",
    robot: "🤖",
    druid: "🌿",
    berserker: "🪓",
    oracle: "🔯",
    titan: "👑",
};
