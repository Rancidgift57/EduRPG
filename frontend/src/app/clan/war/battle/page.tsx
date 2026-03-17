
"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  useMultiplayerTimer,
  QuestionTimerBar,
  BattleClock,
  TimeoutOverlay,
} from "@/components/battle/MultiplayerTimer";

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Inline mini characters (same as inbox) ────────────────────────────
function MiniWarrior({ color = "#60a5fa", flip = false }: { color?: string; flip?: boolean }) {
  return (
    <svg width="68" height="96" viewBox="0 0 80 112" fill="none"
      style={{ transform: flip ? "scaleX(-1)" : "none" }}>
      <path d="M28 14 Q28 6 40 6 Q52 6 52 14 L52 22 Q52 28 40 28 Q28 28 28 22Z" fill={color} opacity="0.9"/>
      <ellipse cx="36" cy="18" rx="3" ry="2.5" fill="#fff"/>
      <ellipse cx="44" cy="18" rx="3" ry="2.5" fill="#fff"/>
      <ellipse cx="37" cy="18" rx="1.8" ry="1.8" fill="#0f172a"/>
      <ellipse cx="45" cy="18" rx="1.8" ry="1.8" fill="#0f172a"/>
      <rect x="37" y="27" width="6" height="5" fill={color} opacity="0.7"/>
      <path d="M26 32 L32 30 L40 31 L48 30 L54 32 L54 60 L26 60Z" fill={color} opacity="0.85"/>
      <rect x="14" y="33" width="12" height="22" rx="5" fill={color} opacity="0.8"/>
      <rect x="54" y="33" width="12" height="22" rx="5" fill={color} opacity="0.8"/>
      <rect x="63" y="15" width="4" height="50" rx="1.5" fill="#94a3b8"/>
      <rect x="60" y="32" width="10" height="3" rx="1" fill="#fbbf24"/>
      <rect x="28" y="59" width="11" height="28" rx="5" fill={color} opacity="0.85"/>
      <rect x="41" y="59" width="11" height="28" rx="5" fill={color} opacity="0.85"/>
      <rect x="26" y="83" width="15" height="8" rx="4" fill={color} opacity="0.65"/>
      <rect x="39" y="83" width="15" height="8" rx="4" fill={color} opacity="0.65"/>
    </svg>
  );
}

// ── War PvP Arena ─────────────────────────────────────────────────────
function WarArena({
  attackerName, defenderName,
  attackerHP, defenderHP,
  maxHP,
  attackerAnim, defenderAnim,
  dmgFloat, showCrit, logMsg, lastResult,
  clanAColor, clanBColor,
}: any) {

  const hpPct   = (hp: number) => Math.max(0, Math.min(100, (hp / maxHP) * 100));
  const hpColor = (pct: number) => pct > 60 ? "#22c55e" : pct > 30 ? "#f59e0b" : "#ef4444";
  const aP = hpPct(attackerHP);
  const dP = hpPct(defenderHP);

  const aStyle = () => {
    if (attackerAnim === "attack") return { animation: "warAttack .7s ease-in-out" };
    if (attackerAnim === "hit")    return { animation: "warHit .5s ease-in-out" };
    return { animation: "warIdle 3s ease-in-out infinite" };
  };
  const dStyle = () => {
    if (defenderAnim === "attack") return { animation: "warAttackFlip .7s ease-in-out", transform: "scaleX(-1)" };
    if (defenderAnim === "hit")    return { animation: "warHitFlip .5s ease-in-out" };
    if (defenderAnim === "death")  return { animation: "warDeath 1.5s ease-out forwards", transform: "scaleX(-1)" };
    return { animation: "warIdleFlip 3.5s ease-in-out infinite", transform: "scaleX(-1)" };
  };

  return (
    <div style={{
      position:        "relative",
      backgroundImage: "linear-gradient(180deg,#0a0005 0%,#150010 35%,#0a0010 70%,#050010 100%)",
      border:          "1px solid rgba(239,68,68,.25)",
      borderRadius:    "clamp(14px,3vw,20px)",
      overflow:        "hidden", marginBottom: 16,
      boxShadow:       "0 0 60px rgba(0,0,0,.9), inset 0 0 60px rgba(185,28,28,.03)",
    }}>
      {/* War scanlines */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:1,
        backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.02) 2px,rgba(0,0,0,.02) 4px)" }}/>

      {/* Header */}
      <div style={{ background:"rgba(0,0,0,.6)", borderBottom:"1px solid rgba(239,68,68,.12)",
        padding:"8px 20px", display:"flex", justifyContent:"space-between",
        alignItems:"center", position:"relative", zIndex:2 }}>
        <span style={{ fontSize:10, color:"#ef4444", fontFamily:"Cinzel",
          letterSpacing:".22em", fontWeight:700 }}>⚔ CLAN WAR BATTLE</span>
        <span style={{ fontSize:10, color:"#f97316", fontWeight:700,
          animation:"warGlowPulse 1.5s infinite" }}>🔥 WAR</span>
      </div>

      <div style={{ padding:"20px clamp(14px,4vw,32px) 28px", position:"relative", zIndex:2 }}>

        {/* CRIT */}
        {showCrit && (
          <div style={{
            position:"absolute", top:"8%", left:"50%", transform:"translateX(-50%)",
            fontFamily:"Cinzel", fontSize:"clamp(18px,4vw,30px)", fontWeight:900,
            color:"#fbbf24", textShadow:"0 0 24px #fbbf24,0 0 48px #fbbf24",
            animation:"warCritFlash 1.2s ease-out forwards",
            zIndex:20, whiteSpace:"nowrap", pointerEvents:"none",
          }}>⚡ CRIT!</div>
        )}

        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:6 }}>

          {/* Attacker */}
          <div style={{ width:"40%", textAlign:"center" }}>
            <div style={{
              backgroundImage:`linear-gradient(90deg,transparent,${clanAColor}22,transparent)`,
              border:`1px solid ${clanAColor}30`, borderRadius:9,
              padding:"4px 6px", marginBottom:12,
              fontSize:"clamp(9px,2.5vw,11px)", fontFamily:"Cinzel",
              fontWeight:700, color:clanAColor, whiteSpace:"nowrap",
              overflow:"hidden", textOverflow:"ellipsis",
            }}>
              ⚔️ {attackerName}
            </div>
            <div style={{ position:"relative", display:"inline-block" }}>
              <div style={{ position:"absolute", bottom:-8, left:"50%", transform:"translateX(-50%)",
                width:"clamp(44px,10vw,62px)", height:12, borderRadius:"50%",
                backgroundImage:`radial-gradient(ellipse,${clanAColor}55,transparent 70%)`,
                filter:"blur(4px)" }}/>
              {dmgFloat && !dmgFloat.isAttacker && (
                <div style={{ position:"absolute", top:-16, left:"50%", transform:"translateX(-50%)",
                  fontSize:"clamp(14px,4vw,20px)", fontWeight:900, fontFamily:"Cinzel",
                  color:"#f87171", textShadow:"0 0 10px #ef4444",
                  animation:"warFloatUp 1s ease-out forwards",
                  zIndex:10, whiteSpace:"nowrap", pointerEvents:"none" }}>
                  💔-{dmgFloat.val}
                </div>
              )}
              <div style={{ display:"inline-block",
                filter:`drop-shadow(0 0 14px ${clanAColor}) drop-shadow(0 4px 8px rgba(0,0,0,.9))`,
                ...aStyle() }}>
                <MiniWarrior color={clanAColor} />
              </div>
            </div>
            <div style={{ marginTop:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                fontSize:9, color:"#9ca3af", marginBottom:3, fontWeight:700 }}>
                <span>HP</span>
                <span style={{ color:hpColor(aP), fontFamily:"Cinzel" }}>
                  {attackerHP}/{maxHP}
                </span>
              </div>
              <div style={{ height:8, background:"rgba(0,0,0,.6)", borderRadius:4,
                overflow:"hidden", border:"1px solid rgba(255,255,255,.07)" }}>
                <div style={{ height:"100%", width:`${aP}%`,
                  backgroundImage:`linear-gradient(90deg,${hpColor(aP)}55,${hpColor(aP)})`,
                  borderRadius:4, boxShadow:`0 0 6px ${hpColor(aP)}`,
                  transition:"width .6s ease" }}/>
              </div>
            </div>
          </div>

          {/* Center */}
          <div style={{ textAlign:"center", flex:1, display:"flex",
            flexDirection:"column", alignItems:"center", gap:6 }}>
            <div style={{ fontFamily:"Cinzel", fontSize:"clamp(22px,5vw,36px)",
              fontWeight:900, lineHeight:1,
              color:"#ef4444", textShadow:"0 0 12px #ef4444,0 0 24px #ef4444",
              animation:"warVsFlash 2s ease infinite" }}>VS</div>
            <div style={{ background:"rgba(0,0,0,.55)",
              border:"1px solid rgba(255,255,255,.06)", borderRadius:9,
              padding:"6px 8px", fontSize:"clamp(9px,2.5vw,11px)",
              color:"#9ca3af", lineHeight:1.5,
              maxWidth:110, textAlign:"center", minHeight:32 }}>
              {logMsg}
            </div>
            {lastResult && (
              <div style={{
                fontSize:"clamp(9px,2.5vw,11px)", fontWeight:700, fontFamily:"Cinzel",
                padding:"3px 10px", borderRadius:20, animation:"warBounceIn .4s ease-out",
                backgroundImage:lastResult.is_correct
                  ?"linear-gradient(135deg,rgba(34,197,94,.28),rgba(21,128,61,.22))"
                  :"linear-gradient(135deg,rgba(239,68,68,.28),rgba(185,28,28,.22))",
                border:`1px solid ${lastResult.is_correct?"rgba(74,222,128,.5)":"rgba(248,113,113,.5)"}`,
                color:lastResult.is_correct?"#4ade80":"#f87171",
              }}>
                {lastResult.is_correct?"✓ HIT!":"✗ MISS!"}
              </div>
            )}
          </div>

          {/* Defender */}
          <div style={{ width:"40%", textAlign:"center" }}>
            <div style={{
              backgroundImage:`linear-gradient(90deg,transparent,${clanBColor}22,transparent)`,
              border:`1px solid ${clanBColor}30`, borderRadius:9,
              padding:"4px 6px", marginBottom:12,
              fontSize:"clamp(9px,2.5vw,11px)", fontFamily:"Cinzel",
              fontWeight:700, color:clanBColor, whiteSpace:"nowrap",
              overflow:"hidden", textOverflow:"ellipsis",
            }}>
              🛡️ {defenderName}
            </div>
            <div style={{ position:"relative", display:"inline-block" }}>
              <div style={{ position:"absolute", bottom:-8, left:"50%", transform:"translateX(-50%)",
                width:"clamp(44px,10vw,62px)", height:12, borderRadius:"50%",
                backgroundImage:`radial-gradient(ellipse,${clanBColor}55,transparent 70%)`,
                filter:"blur(4px)" }}/>
              {dmgFloat && dmgFloat.isAttacker && (
                <div style={{ position:"absolute", top:-16, left:"50%", transform:"translateX(-50%)",
                  fontSize:"clamp(14px,4vw,20px)", fontWeight:900, fontFamily:"Cinzel",
                  color:"#fbbf24", textShadow:"0 0 10px #f59e0b",
                  animation:"warFloatUp 1s ease-out forwards",
                  zIndex:10, whiteSpace:"nowrap", pointerEvents:"none" }}>
                  ⚔️-{dmgFloat.val}
                </div>
              )}
              <div style={{ display:"inline-block",
                filter:`drop-shadow(0 0 14px ${clanBColor}) drop-shadow(0 4px 8px rgba(0,0,0,.9))`,
                ...dStyle() }}>
                <MiniWarrior color={clanBColor} flip />
              </div>
            </div>
            <div style={{ marginTop:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                fontSize:9, color:"#9ca3af", marginBottom:3, fontWeight:700 }}>
                <span>HP</span>
                <span style={{ color:hpColor(dP), fontFamily:"Cinzel" }}>
                  {defenderHP}/{maxHP}
                </span>
              </div>
              <div style={{ height:8, background:"rgba(0,0,0,.6)", borderRadius:4,
                overflow:"hidden", border:"1px solid rgba(255,255,255,.07)" }}>
                <div style={{ height:"100%", width:`${dP}%`,
                  backgroundImage:`linear-gradient(90deg,${hpColor(dP)}55,${hpColor(dP)})`,
                  borderRadius:4, boxShadow:`0 0 6px ${hpColor(dP)}`,
                  transition:"width .6s ease" }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Ground line */}
        <div style={{ height:2, marginTop:18,
          backgroundImage:`linear-gradient(90deg,transparent,${clanAColor}55,rgba(239,68,68,.6),${clanBColor}55,transparent)`,
          borderRadius:1 }}/>
      </div>

      <style>{`
        @keyframes warIdle      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes warIdleFlip  { 0%,100%{transform:translateY(0) scaleX(-1)} 50%{transform:translateY(-7px) scaleX(-1)} }
        @keyframes warAttack    { 0%{transform:translateX(0) scaleX(1)} 20%{transform:translateX(-8px) scaleX(.92)} 50%{transform:translateX(48px) scaleX(1.2)} 70%{transform:translateX(42px)} 100%{transform:translateX(0) scaleX(1)} }
        @keyframes warAttackFlip{ 0%{transform:translateX(0) scaleX(-1)} 20%{transform:translateX(8px) scaleX(-.92)} 50%{transform:translateX(-48px) scaleX(-1.2)} 70%{transform:translateX(-42px) scaleX(-1.1)} 100%{transform:translateX(0) scaleX(-1)} }
        @keyframes warHit       { 0%,100%{transform:translateX(0)} 20%{transform:translateX(12px);filter:brightness(3) saturate(0)} 40%{transform:translateX(-8px)} 60%{transform:translateX(5px)} 80%{transform:translateX(-3px)} }
        @keyframes warHitFlip   { 0%,100%{transform:scaleX(-1) translateX(0)} 20%{transform:scaleX(-1) translateX(-12px);filter:brightness(3) saturate(0)} 40%{transform:scaleX(-1) translateX(8px)} 80%{transform:scaleX(-1) translateX(3px)} }
        @keyframes warDeath     { 0%{opacity:1;transform:scaleX(-1) scale(1) rotate(0)} 50%{opacity:.5;transform:scaleX(-1) scale(.8) rotate(-30deg)} 100%{opacity:0;transform:scaleX(-1) scale(.3) rotate(-90deg) translateY(36px)} }
        @keyframes warCritFlash { 0%{opacity:0;transform:scale(.2) rotate(-18deg)} 30%{opacity:1;transform:scale(1.3) rotate(8deg)} 60%{opacity:1} 100%{opacity:0;transform:scale(.8) translateY(-44px)} }
        @keyframes warFloatUp   { 0%{opacity:1;transform:translateY(0) translateX(-50%) scale(1)} 100%{opacity:0;transform:translateY(-60px) translateX(-50%) scale(1.4)} }
        @keyframes warVsFlash   { 0%,100%{color:#ef4444;text-shadow:0 0 10px #ef4444} 50%{color:#f97316;text-shadow:0 0 20px #f97316} }
        @keyframes warBounceIn  { 0%{transform:scale(.3);opacity:0} 50%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes warGlowPulse { 0%,100%{opacity:.4} 50%{opacity:1} }
      `}</style>
    </div>
  );
}

// ── Main War Battle Page ──────────────────────────────────────────────
function WarBattlePageContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const matchupId    = searchParams.get("matchup") || "";
  const warId        = searchParams.get("war")     || "";

  const [matchup,      setMatchup]      = useState<any>(null);
  const [questions,    setQuestions]    = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [answers,      setAnswers]      = useState<Record<string,number>>({});
  const [currentQIdx,  setCurrentQIdx]  = useState(0);
  const [result,       setResult]       = useState<any>(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");
  const [showQExpired, setShowQExpired] = useState(false);
  const [showBExpired, setShowBExpired] = useState(false);

  // Animation state
  const [attackerHP,   setAttackerHP]  = useState(100);
  const [defenderHP,   setDefenderHP]  = useState(100);
  const [attackerAnim, setAttackerAnim] = useState("idle");
  const [defenderAnim, setDefenderAnim] = useState("idle");
  const [showCrit,     setShowCrit]    = useState(false);
  const [dmgFloat,     setDmgFloat]    = useState<any>(null);
  const [logMsg,       setLogMsg]      = useState("⚔️ Clan War Battle!");
  const [lastResult,   setLastResult]  = useState<any>(null);

  const answeredRef    = useRef(false);
  const currentQIdxRef = useRef(0);
  const questionsRef   = useRef<any[]>([]);
  const answersRef     = useRef<Record<string,number>>({});
  const totalTimeRef   = useRef(0);

  useEffect(() => { currentQIdxRef.current = currentQIdx; }, [currentQIdx]);
  useEffect(() => { answersRef.current     = answers;      }, [answers]);

  const token   = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const user    = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;
  const headers = { Authorization: `Bearer ${token}` };

  // ── Load matchup ──────────────────────────────────────────────────
  useEffect(() => {
    if (!matchupId || !warId) { router.push("/clan"); return; }
    loadMatchup();
  }, [matchupId]);

  const loadMatchup = async () => {
    try {
      const r = await axios.get(`${API}/clan/war/${warId}`, { headers });
      const m = r.data.matchups?.find((x: any) => x.id === matchupId);
      if (!m) { setError("Matchup not found"); return; }
      setMatchup(m);

      // Load questions for this matchup's topic
      const qr = await axios.get(
        `${API}/battle/question?topic=${m.topic}&difficulty=2`,
        { headers }
      );
      // Generate 5 questions
      const qs: any[] = [];
      for (let i = 0; i < 5; i++) {
        const qres = await axios.get(
          `${API}/battle/question?topic=${m.topic}&difficulty=${Math.min(3,i+1)}`,
          { headers }
        );
        if (qres.data) qs.push(qres.data);
      }
      questionsRef.current = qs;
      setQuestions(qs);
      startTimers();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to load matchup");
    } finally {
      setLoading(false);
    }
  };

  // ── Advance question ──────────────────────────────────────────────
  const advanceQuestion = useCallback(() => {
    const next = currentQIdxRef.current + 1;
    if (next < questionsRef.current.length) {
      answeredRef.current = false;
      setCurrentQIdx(next);
      setLastResult(null);
      resetQuestionTimer();
    }
  }, []);

  // ── Timer callbacks ───────────────────────────────────────────────
  const handleQuestionExpire = useCallback(() => {
    if (answeredRef.current) return;
    const q = questionsRef.current[currentQIdxRef.current];
    if (!q) return;

    const newAns = { ...answersRef.current, [q.id]: -1 };
    answersRef.current = newAns;
    setAnswers(newAns);
    totalTimeRef.current += 30;
    answeredRef.current = true;

    // Animate defender attack (they defended successfully by default)
    setDefenderAnim("attack");
    setTimeout(() => {
      setAttackerAnim("hit");
      const dmg = Math.floor(Math.random()*15)+8;
      setDmgFloat({ val:dmg, isAttacker:false });
      setAttackerHP(prev => Math.max(0, prev - dmg));
      setTimeout(() => { setAttackerAnim("idle"); setDefenderAnim("idle"); setDmgFloat(null); }, 600);
    }, 400);
    setLogMsg("⏰ Time's up!");
    setShowQExpired(true);
    setTimeout(() => { setShowQExpired(false); advanceQuestion(); }, 2200);
  }, [advanceQuestion]);

  const handleBattleExpire = useCallback(() => {
    stopTimers();
    setShowBExpired(true);
    setTimeout(() => autoSubmit(), 2500);
  }, []);

  const { questionTimeLeft, battleTimeLeft, isPaused, startTimers, stopTimers,
    pauseTimer, resumeTimer, resetQuestionTimer } = useMultiplayerTimer({
    questionSeconds:  30, battleMinutes: 3,
    onQuestionExpire: handleQuestionExpire,
    onBattleExpire:   handleBattleExpire,
  });

  // ── Handle answer ─────────────────────────────────────────────────
  const handleAnswer = useCallback((qId: string, idx: number) => {
    if (answeredRef.current) return;
    const timeUsed = 30 - questionTimeLeft;
    totalTimeRef.current += timeUsed;
    answeredRef.current = true;
    pauseTimer();

    const newAns = { ...answersRef.current, [qId]: idx };
    answersRef.current = newAns;
    setAnswers(newAns);

    // Animate attacker striking
    setAttackerAnim("attack");
    setTimeout(() => {
      setDefenderAnim("hit");
      const dmg = Math.floor(Math.random()*22)+12;
      setDmgFloat({ val:dmg, isAttacker:true });
      setDefenderHP(prev => Math.max(0, prev - dmg));
      setTimeout(() => { setDefenderAnim("idle"); setAttackerAnim("idle"); setDmgFloat(null); }, 600);
    }, 400);
    setLogMsg("⚔️ Answer submitted!");
    setLastResult({ is_correct: true, selected_index: idx });

    setTimeout(() => {
      setLastResult(null);
      answeredRef.current = false;
      resumeTimer();
      advanceQuestion();
    }, 700);
  }, [questionTimeLeft, pauseTimer, resumeTimer, advanceQuestion]);

  const autoSubmit = useCallback(() => {
    const finalAns: Record<string,number> = { ...answersRef.current };
    questionsRef.current.forEach(q => { if (!(q.id in finalAns)) finalAns[q.id] = -1; });
    setAnswers(finalAns);
    doSubmit(finalAns);
  }, []);

  const doSubmit = async (finalAnswers?: Record<string,number>) => {
    const ans = finalAnswers || answers;
    setSubmitting(true); stopTimers();

    // Count correct answers (we don't know without backend)
    const score = Object.values(ans).filter(v => v !== -1).length;

    try {
      const res = await axios.post(`${API}/clan/war/battle`, {
        matchup_id: matchupId,
        score,
      }, { headers });
      setResult(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Submission failed");
    } finally { setSubmitting(false); }
  };

  const allAnswered = questions.length > 0 && questions.every(q => q.id in answers);
  const currentQ   = questions[currentQIdx];

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box} body{background:#030712;color:#fff;font-family:'Rajdhani',sans-serif;margin:0}
    button{-webkit-tap-highlight-color:transparent;touch-action:manipulation}
    @keyframes wFadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes wSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @keyframes wBounceIn{0%{transform:scale(.3);opacity:0}50%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
    @keyframes wPulse{0%,100%{opacity:.5}50%{opacity:1}}
    @keyframes wVictoryPulse{0%,100%{box-shadow:0 0 20px rgba(251,191,36,.3)}50%{box-shadow:0 0 60px rgba(251,191,36,.8)}}
    @keyframes wDefeatPulse{0%,100%{box-shadow:0 0 20px rgba(239,68,68,.3)}50%{box-shadow:0 0 60px rgba(239,68,68,.8)}}
    .war-answer-grid{display:grid;grid-template-columns:1fr;gap:9px}
    @media(min-width:480px){.war-answer-grid{grid-template-columns:1fr 1fr}}
  `;

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#030712", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{STYLES}</style>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:64, animation:"wSpin 1s linear infinite", display:"inline-block", filter:"drop-shadow(0 0 20px rgba(239,68,68,.9))" }}>⚔️</div>
        <div style={{ fontFamily:"Cinzel", fontSize:16, color:"#ef4444", marginTop:16, letterSpacing:".2em" }}>ENTERING WAR BATTLE...</div>
      </div>
    </div>
  );

  if (result) return (
    <div style={{ minHeight:"100vh", background:"#030712", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Rajdhani", padding:16 }}>
      <style>{STYLES}</style>
      <div style={{
        backgroundImage:"linear-gradient(135deg,#0a0518,#150a28,#0a0518)",
        border:`3px solid ${result.result==="attacker_won"?"#fbbf24":result.result==="draw"?"#9ca3af":"#ef4444"}`,
        borderRadius:24, padding:"clamp(28px,6vw,48px)", textAlign:"center", maxWidth:420, width:"100%",
        animation:result.result==="attacker_won"?"wVictoryPulse 2s infinite":"wDefeatPulse 2s infinite",
      }}>
        <div style={{ fontSize:"clamp(56px,14vw,84px)", marginBottom:12, animation:"wBounceIn .6s ease-out" }}>
          {result.result==="attacker_won"?"🏆":result.result==="draw"?"🤝":"🛡️"}
        </div>
        <div style={{ fontFamily:"Cinzel", fontSize:"clamp(22px,6vw,36px)", fontWeight:900,
          color:result.result==="attacker_won"?"#fbbf24":result.result==="draw"?"#9ca3af":"#60a5fa",
          marginBottom:8 }}>
          {result.result==="attacker_won"?"VICTORY!":result.result==="draw"?"DRAW":"DEFENDER WINS"}
        </div>
        <div style={{ background:"rgba(0,0,0,.4)", border:"1px solid rgba(255,255,255,.06)", borderRadius:14, padding:16, margin:"14px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-around", padding:"8px 0" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"Cinzel", fontSize:24, fontWeight:700, color:"#60a5fa" }}>{result.attacker_score}</div>
              <div style={{ fontSize:10, color:"#6b7280", fontWeight:700 }}>ATTACKER</div>
            </div>
            <div style={{ fontSize:18, alignSelf:"center", color:"#6b7280" }}>vs</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"Cinzel", fontSize:24, fontWeight:700, color:"#f87171" }}>{result.defender_score}</div>
              <div style={{ fontSize:10, color:"#6b7280", fontWeight:700 }}>DEFENDER</div>
            </div>
          </div>
        </div>
        <button onClick={() => router.push("/clan")} style={{
          backgroundImage:"linear-gradient(135deg,#7c3aed,#be185d)",
          border:"none", borderRadius:12, padding:"12px 36px",
          color:"#fff", fontFamily:"Cinzel", fontSize:13,
          fontWeight:700, cursor:"pointer", letterSpacing:".1em" }}>
          🛡️ BACK TO CLAN
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#030712", color:"#fff", fontFamily:"Rajdhani" }}>
      <style>{STYLES}</style>

      {showQExpired && <TimeoutOverlay type="question" onClose={() => setShowQExpired(false)} />}
      {showBExpired && <TimeoutOverlay type="battle"   onClose={() => setShowBExpired(false)} />}

      {/* Nav */}
      <nav style={{ background:"rgba(0,0,0,.78)", borderBottom:"1px solid rgba(239,68,68,.18)",
        padding:"0 clamp(14px,3vw,24px)", height:52,
        display:"flex", justifyContent:"space-between", alignItems:"center",
        position:"sticky", top:0, zIndex:50, backdropFilter:"blur(16px)" }}>
        <button onClick={() => { stopTimers(); router.push("/clan"); }}
          style={{ background:"none", border:"1px solid rgba(255,255,255,.08)", borderRadius:8,
            padding:"6px 12px", cursor:"pointer", color:"#9ca3af", fontSize:13,
            fontFamily:"Rajdhani", fontWeight:600 }}>← CLAN</button>
        <div style={{ fontFamily:"Cinzel", fontSize:"clamp(11px,3vw,14px)", fontWeight:700,
          background:"linear-gradient(135deg,#ef4444,#f97316)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          🔥 CLAN WAR BATTLE
        </div>
        <BattleClock timeLeft={battleTimeLeft} isPaused={isPaused} />
      </nav>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"clamp(14px,3vw,20px) clamp(12px,3vw,16px)" }}>

        {/* War disclaimer */}
        <div style={{ background:"rgba(30,58,138,.2)", border:"1px solid rgba(99,102,241,.25)",
          borderRadius:10, padding:"8px 14px", marginBottom:14,
          fontSize:10, color:"#a5b4fc", textAlign:"center", lineHeight:1.5 }}>
          ☮️ This is a <strong>friendly academic competition</strong>. EduRPG stands against real-world conflict.
        </div>

        {matchup && (
          <div style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)",
            borderRadius:12, padding:"10px 16px", marginBottom:14,
            display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{ fontSize:12, color:"#f87171", fontWeight:700 }}>
                {matchup.attacker_name} vs {matchup.defender_name}
              </div>
              <div style={{ fontSize:10, color:"#6b7280", marginTop:2 }}>
                Topic: <span style={{ color:"#c084fc", fontWeight:700 }}>
                  {matchup.topic?.replace(/-/g," ").replace(/\b\w/g, (l:string) => l.toUpperCase())}
                </span>
              </div>
            </div>
            <div style={{ fontSize:10, color:"#f97316", fontWeight:700, fontFamily:"Cinzel" }}>
              Q{currentQIdx+1}/{questions.length}
            </div>
          </div>
        )}

        {/* ✅ War battle animation */}
        <WarArena
          attackerName={matchup?.attacker_name || "Attacker"}
          defenderName={matchup?.defender_name || "Defender"}
          attackerHP={attackerHP}
          defenderHP={defenderHP}
          maxHP={100}
          attackerAnim={attackerAnim}
          defenderAnim={defenderAnim}
          dmgFloat={dmgFloat}
          showCrit={showCrit}
          logMsg={logMsg}
          lastResult={lastResult}
          clanAColor="#60a5fa"
          clanBColor="#f87171"
        />

        {/* Progress dots */}
        <div style={{ display:"flex", gap:6, marginBottom:14, justifyContent:"center", flexWrap:"wrap" }}>
          {questions.map((q, i) => (
            <div key={q.id} style={{
              width:i===currentQIdx?26:10, height:10, borderRadius:5,
              background: q.id in answers
                ? answers[q.id]===-1 ? "#ef4444" : "#22c55e"
                : i===currentQIdx ? "#a855f7" : "rgba(255,255,255,.1)",
              transition:"all .3s",
            }}/>
          ))}
        </div>

        {/* Question */}
        {currentQ && !allAnswered && (
          <div style={{ background:"rgba(0,0,0,.5)", border:"1px solid rgba(239,68,68,.2)",
            borderRadius:16, padding:20, marginBottom:14, animation:"wFadeIn .3s ease-out" }}>
            <QuestionTimerBar timeLeft={questionTimeLeft} maxTime={30} isPaused={isPaused} />
            <div style={{ fontSize:10, color:"#ef4444", letterSpacing:".2em",
              fontWeight:700, marginBottom:12, fontFamily:"Cinzel" }}>
              ⚔️ WAR QUESTION {currentQIdx+1}
            </div>
            <p style={{ fontSize:"clamp(13px,3.5vw,15px)", lineHeight:1.65,
              color:"#e2e8f0", marginBottom:16, fontWeight:500 }}>
              {currentQ.body}
            </p>
            <div className="war-answer-grid">
              {currentQ.options?.map((opt:string, i:number) => (
                <button key={i}
                  onClick={() => !answeredRef.current && handleAnswer(currentQ.id, i)}
                  disabled={answeredRef.current}
                  style={{
                    background:   "rgba(239,68,68,.06)", border:"1px solid rgba(239,68,68,.18)",
                    borderRadius: 12, padding:"clamp(11px,3vw,14px) 14px",
                    color:        "#fecaca", cursor:answeredRef.current?"not-allowed":"pointer",
                    textAlign:    "left", fontSize:"clamp(12px,3vw,14px)",
                    fontFamily:   "Rajdhani", fontWeight:600, transition:"all .15s", minHeight:48,
                  }}
                  onMouseEnter={e=>{ if(!answeredRef.current){e.currentTarget.style.background="rgba(239,68,68,.14)"; e.currentTarget.style.transform="scale(1.02)";} }}
                  onMouseLeave={e=>{ if(!answeredRef.current){e.currentTarget.style.background="rgba(239,68,68,.06)"; e.currentTarget.style.transform="scale(1)";} }}
                >
                  <span style={{ color:"#6b7280", fontWeight:800, marginRight:7,
                    fontFamily:"Cinzel", fontSize:"clamp(10px,2.5vw,12px)" }}>
                    {["A","B","C","D"][i]}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        {allAnswered && !submitting && (
          <div style={{ textAlign:"center", animation:"wFadeIn .3s ease-out" }}>
            <div style={{ color:"#22c55e", fontSize:13, fontWeight:700, marginBottom:14 }}>✅ Battle complete!</div>
            <button onClick={() => doSubmit()} style={{
              backgroundImage:"linear-gradient(135deg,#dc2626,#991b1b)",
              border:"none", borderRadius:12, padding:"14px 48px",
              color:"#fff", fontFamily:"Cinzel", fontSize:15,
              fontWeight:700, cursor:"pointer", letterSpacing:".1em",
              boxShadow:"0 0 24px rgba(220,38,38,.4)" }}>
              ⚔️ SUBMIT BATTLE
            </button>
          </div>
        )}

        {submitting && (
          <div style={{ textAlign:"center", padding:24 }}>
            <div style={{ fontSize:40, animation:"wSpin 1s linear infinite", display:"inline-block" }}>⚔️</div>
            <div style={{ color:"#9ca3af", marginTop:8, fontSize:13 }}>Submitting to war score...</div>
          </div>
        )}

        {error && (
          <div style={{ background:"rgba(127,29,29,.3)", border:"1px solid rgba(239,68,68,.3)",
            borderRadius:10, padding:"10px 14px", fontSize:12, color:"#fca5a5", textAlign:"center", marginTop:10 }}>
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WarBattlePage() {
  return (
    <Suspense fallback={<div style={{padding:40}}>Loading battle...</div>}>
      <WarBattlePageContent />
    </Suspense>
  );
}
