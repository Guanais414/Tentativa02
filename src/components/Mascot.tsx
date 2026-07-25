import type { MascotType } from '../types';

export type PetAnimation = 'idle' | 'walk' | 'wave' | 'pet' | 'celebrate' | 'sleep';

interface MascotSVGProps {
  type: MascotType;
  size?: number;
  hat?: string;
  outfit?: string;
  accessory?: string;
  mood?: 'happy' | 'neutral' | 'sleepy' | 'excited' | 'sad';
  animated?: boolean;
  animation?: PetAnimation;
  className?: string;
}

export function Mascot({ type, size = 80, hat, outfit, accessory, mood = 'happy', animated = true, animation = 'idle', className = '' }: MascotSVGProps) {
  const animClass = animation === 'walk' ? 'pet-walk'
    : animation === 'wave' ? 'pet-wave'
    : animation === 'pet' ? 'pet-pet'
    : animation === 'celebrate' ? 'pet-celebrate'
    : animation === 'sleep' ? 'pet-sleep'
    : animated ? 'pet-idle' : '';
  return (
    <div className={`relative inline-flex items-center justify-center ${animClass} ${className}`}
      style={{ width: size, height: size }}>
      {renderMascot(type, size, mood, animation)}
      {hat && <span style={{ fontSize: size * 0.38, position: 'absolute', top: -size * 0.12, left: '50%', transform: 'translateX(-50%)' }}>{hat}</span>}
      {outfit && <span style={{ fontSize: size * 0.28, position: 'absolute', bottom: size * 0.04, right: -size * 0.08 }}>{outfit}</span>}
      {accessory && <span style={{ fontSize: size * 0.26, position: 'absolute', top: size * 0.08, right: -size * 0.1 }}>{accessory}</span>}
      {animation === 'sleep' && <SleepCap size={size} />}
    </div>
  );
}

function SleepCap({ size }: { size: number }) {
  const s = size / 100;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      <path d="M42,18 Q40,6 50,4 Q60,6 58,18" fill="#6366f1" stroke="#4f46e5" strokeWidth="1" />
      <ellipse cx="50" cy="18" rx="10" ry="3" fill="#4f46e5" />
      <circle cx="58" cy="5" r="2.5" fill="#fbbf24" className="pet-sleep-cap-pompom" />
      <path d="M44,10 Q46,8 48,10" stroke="#818cf8" strokeWidth="0.8" fill="none" opacity="0.5" />
    </svg>
  );
}

function renderMascot(type: MascotType, size: number, mood: string, anim: PetAnimation): React.ReactNode {
  switch (type) {
    case 'goose': return <GooseSVG size={size} mood={mood} anim={anim} />;
    case 'otter': return <OtterSVG size={size} mood={mood} anim={anim} />;
    case 'rabbit': return <RabbitSVG size={size} mood={mood} anim={anim} />;
    case 'penguin': return <PenguinSVG size={size} mood={mood} anim={anim} />;
    case 'dog': return <DogSVG size={size} mood={mood} anim={anim} />;
    case 'cat': return <CatSVG size={size} mood={mood} anim={anim} />;
  }
}

/* ---- Eyes helper (realistic) ---- */
function Eyes({ cx1, cx2, cy, mood, color = '#1a1208', r = 3.2 }: { cx1: number; cx2: number; cy: number; mood: string; color?: string; r?: number }) {
  if (mood === 'sleepy') return (
    <>
      <path d={`M${cx1 - 4},${cy} Q${cx1},${cy - 2} ${cx1 + 4},${cy}`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={`M${cx2 - 4},${cy} Q${cx2},${cy - 2} ${cx2 + 4},${cy}`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  );
  if (mood === 'excited') return (
    <>
      <ellipse cx={cx1} cy={cy} rx={r} ry={r + 1.2} fill={color} />
      <ellipse cx={cx2} cy={cy} rx={r} ry={r + 1.2} fill={color} />
      <circle cx={cx1 + 1} cy={cy - 1.2} r={1.2} fill="white" />
      <circle cx={cx2 + 1} cy={cy - 1.2} r={1.2} fill="white" />
    </>
  );
  return (
    <>
      <ellipse cx={cx1} cy={cy} rx={r} ry={r + 0.5} fill={color} className="pet-eye" />
      <ellipse cx={cx2} cy={cy} rx={r} ry={r + 0.5} fill={color} className="pet-eye" />
      <circle cx={cx1 + 0.8} cy={cy - 0.8} r={1} fill="white" />
      <circle cx={cx2 + 0.8} cy={cy - 0.8} r={1} fill="white" />
    </>
  );
}

/* ===== GOOSE / SWAN (replaces duck) ===== */
function GooseSVG({ size, mood, anim }: { size: number; mood: string; anim: PetAnimation }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="gooseBody" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" /><stop offset="50%" stopColor="#f4f4f0" /><stop offset="100%" stopColor="#d8d8d0" />
        </radialGradient>
        <radialGradient id="gooseNeck" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f8f8f4" /><stop offset="100%" stopColor="#e0e0d8" />
        </radialGradient>
        <linearGradient id="gooseBeak" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f5a623" /><stop offset="100%" stopColor="#e8910c" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="92" rx="26" ry="4" fill="rgba(0,0,0,0.12)" />
      {/* Body */}
      <path d="M20,65 Q16,50 26,45 Q36,40 50,42 Q66,40 76,46 Q86,52 82,65 Q84,82 66,88 Q50,92 34,88 Q18,82 20,65 Z" fill="url(#gooseBody)" className={anim === 'walk' ? 'pet-body-bob' : ''} />
      {/* Wing feather detail */}
      <path d="M30,58 Q28,72 38,80 Q48,82 52,74 Q50,66 42,62 Q34,58 30,58 Z" fill="#e8e8e0" opacity="0.6" className={anim === 'walk' ? 'pet-wing' : ''} />
      <path d="M34,62 Q33,72 40,77" stroke="#d0d0c8" strokeWidth="0.6" fill="none" opacity="0.5" />
      <path d="M38,64 Q37,74 44,78" stroke="#d0d0c8" strokeWidth="0.6" fill="none" opacity="0.5" />
      {/* Tail feathers */}
      <path d="M78,70 Q86,66 84,76 Q82,80 78,78 Z" fill="#e8e8e0" className={anim === 'walk' ? 'pet-tail-swish' : ''} />
      {/* Long curved neck */}
      <path d="M44,48 Q40,30 48,18 Q52,12 58,16 Q56,22 54,28 Q52,38 50,46 Z" fill="url(#gooseNeck)" className={anim === 'walk' ? 'pet-head' : ''} />
      {/* Head */}
      <ellipse cx="54" cy="18" rx="11" ry="10" fill="url(#gooseNeck)" />
      {/* Beak */}
      <path d="M62,18 Q72,17 74,20 Q72,23 62,22 Z" fill="url(#gooseBeak)" />
      <path d="M62,20 L74,20" stroke="#c47a08" strokeWidth="0.6" />
      {/* Eye */}
      <Eyes cx1={56} cx2={56} cy={16} mood={mood} color="#1a1208" r={2.2} />
      {/* Wave: raised wing */}
      {anim === 'wave' && (
        <path d="M26,52 Q14,44 12,32 Q14,28 18,32 Q22,40 28,46 Z" fill="#f0f0e8" />
      )}
      {/* Celebrate: confetti sparkles */}
      {anim === 'celebrate' && (
        <>
          <circle cx="20" cy="20" r="1.5" fill="#fbbf24" />
          <circle cx="82" cy="14" r="1.5" fill="#f472b6" />
          <circle cx="88" cy="30" r="1.2" fill="#34d399" />
          <circle cx="14" cy="40" r="1.2" fill="#60a5fa" />
        </>
      )}
    </svg>
  );
}

/* ===== OTTER (realistic) ===== */
function OtterSVG({ size, mood, anim }: { size: number; mood: string; anim: PetAnimation }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="otterBodyR" cx="45%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#a0805a" /><stop offset="50%" stopColor="#7a5c3a" /><stop offset="100%" stopColor="#4a3420" />
        </radialGradient>
        <radialGradient id="otterHeadR" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#9a7a54" /><stop offset="70%" stopColor="#6e5030" /><stop offset="100%" stopColor="#3e2818" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="92" rx="24" ry="4" fill="rgba(0,0,0,0.12)" />
      {/* Body — sleek */}
      <path d="M22,62 Q18,48 30,44 Q42,40 50,42 Q60,40 70,44 Q82,48 78,62 Q80,80 64,86 Q50,90 36,86 Q20,80 22,62 Z" fill="url(#otterBodyR)" className={anim === 'walk' ? 'pet-body-bob' : ''} />
      {/* Light belly */}
      <path d="M34,56 Q32,72 42,82 Q50,84 58,82 Q68,72 66,56 Q60,52 50,53 Q40,52 34,56 Z" fill="#d8c4a8" />
      {/* Head */}
      <ellipse cx="50" cy="34" rx="22" ry="20" fill="url(#otterHeadR)" className={anim === 'walk' ? 'pet-head' : ''} />
      {/* Light face mask */}
      <ellipse cx="50" cy="40" rx="13" ry="9" fill="#d8c4a8" opacity="0.7" />
      {/* Ears */}
      <ellipse cx="30" cy="18" rx="5" ry="4" fill="#4a3420" transform="rotate(-20,30,18)" className="pet-ear" />
      <ellipse cx="70" cy="18" rx="5" ry="4" fill="#4a3420" transform="rotate(20,70,18)" className="pet-ear" />
      <ellipse cx="31" cy="19" rx="2.5" ry="2" fill="#7a5c3a" transform="rotate(-20,31,19)" />
      <ellipse cx="69" cy="19" rx="2.5" ry="2" fill="#7a5c3a" transform="rotate(20,69,19)" />
      <Eyes cx1={43} cx2={57} cy={34} mood={mood} color="#1a0e04" r={3} />
      <ellipse cx="50" cy="40" rx="2.2" ry="1.6" fill="#1a0e04" />
      {/* Nose */}
      <path d="M48,42 Q50,44 52,42" stroke="#5a3a20" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="44" y1="41" x2="28" y2="39" stroke="#c8b898" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
      <line x1="56" y1="41" x2="72" y2="39" stroke="#c8b898" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
      {/* Wave paw */}
      {anim === 'wave' && <ellipse cx="22" cy="50" rx="5" ry="8" fill="#7a5c3a" transform="rotate(-30,22,50)" />}
      {anim === 'celebrate' && (
        <>
          <circle cx="18" cy="18" r="1.5" fill="#fbbf24" />
          <circle cx="84" cy="16" r="1.5" fill="#f472b6" />
          <circle cx="86" cy="34" r="1.2" fill="#34d399" />
        </>
      )}
    </svg>
  );
}

/* ===== RABBIT (realistic) ===== */
function RabbitSVG({ size, mood, anim }: { size: number; mood: string; anim: PetAnimation }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="rabbitBodyR" cx="45%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f5f5f0" /><stop offset="60%" stopColor="#e8e8e0" /><stop offset="100%" stopColor="#c8c8be" />
        </radialGradient>
        <radialGradient id="rabbitHeadR" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fafaf6" /><stop offset="70%" stopColor="#e8e8e0" /><stop offset="100%" stopColor="#b8b8ae" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="92" rx="22" ry="4" fill="rgba(0,0,0,0.12)" />
      {/* Long ears */}
      <ellipse cx="38" cy="14" rx="5" ry="15" fill="url(#rabbitHeadR)" transform="rotate(-8,38,14)" className="pet-ear" />
      <ellipse cx="62" cy="14" rx="5" ry="15" fill="url(#rabbitHeadR)" transform="rotate(8,62,14)" className="pet-ear" />
      <ellipse cx="38" cy="14" rx="2.5" ry="10" fill="#e8c8c0" opacity="0.6" transform="rotate(-8,38,14)" />
      <ellipse cx="62" cy="14" rx="2.5" ry="10" fill="#e8c8c0" opacity="0.6" transform="rotate(8,62,14)" />
      {/* Body */}
      <path d="M26,60 Q22,48 32,44 Q40,40 50,42 Q60,40 68,44 Q78,48 74,60 Q76,80 62,86 Q50,90 38,86 Q24,80 26,60 Z" fill="url(#rabbitBodyR)" className={anim === 'walk' ? 'pet-body-bob' : ''} />
      {/* Tail fluff */}
      <circle cx="76" cy="72" r="6" fill="#fafaf6" className={anim === 'walk' ? 'pet-tail-swish' : ''} />
      {/* Paws */}
      <ellipse cx="36" cy="80" rx="5" ry="4" fill="#d8d8d0" className={anim === 'walk' ? 'pet-leg-front' : ''} />
      <ellipse cx="64" cy="80" rx="5" ry="4" fill="#d8d8d0" className={anim === 'walk' ? 'pet-leg-back' : ''} />
      {/* Head */}
      <ellipse cx="50" cy="38" rx="19" ry="18" fill="url(#rabbitHeadR)" className={anim === 'walk' ? 'pet-head' : ''} />
      <Eyes cx1={43} cx2={57} cy={38} mood={mood} color="#1a1208" r={3} />
      {/* Nose */}
      <path d="M50,43 L47,45 L50,47 L53,45 Z" fill="#d4889a" />
      <path d="M50,47 L50,49" stroke="#b07080" strokeWidth="1" />
      {/* Mouth */}
      <path d="M47,49 Q50,51 53,49" stroke="#a08888" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="44" y1="45" x2="26" y2="43" stroke="#c0c0b8" strokeWidth="0.5" strokeLinecap="round" opacity="0.6" />
      <line x1="56" y1="45" x2="74" y2="43" stroke="#c0c0b8" strokeWidth="0.5" strokeLinecap="round" opacity="0.6" />
      {anim === 'celebrate' && (
        <>
          <circle cx="16" cy="20" r="1.5" fill="#fbbf24" />
          <circle cx="86" cy="18" r="1.5" fill="#f472b6" />
        </>
      )}
    </svg>
  );
}

/* ===== PENGUIN (realistic) ===== */
function PenguinSVG({ size, mood, anim }: { size: number; mood: string; anim: PetAnimation }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="penguinBodyR" cx="45%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#3a4452" /><stop offset="55%" stopColor="#222a36" /><stop offset="100%" stopColor="#0e1420" />
        </radialGradient>
        <radialGradient id="penguinBellyR" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" /><stop offset="80%" stopColor="#f0f0e8" /><stop offset="100%" stopColor="#d8d8d0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="92" rx="20" ry="4" fill="rgba(0,0,0,0.15)" />
      {/* Body */}
      <path d="M30,28 Q26,50 28,74 Q30,88 50,90 Q70,88 72,74 Q74,50 70,28 Q60,20 50,20 Q40,20 30,28 Z" fill="url(#penguinBodyR)" className={anim === 'walk' ? 'pet-body-bob' : ''} />
      {/* White belly */}
      <path d="M38,36 Q36,56 38,74 Q40,82 50,82 Q60,82 62,74 Q64,56 62,36 Q56,32 50,32 Q44,32 38,36 Z" fill="url(#penguinBellyR)" />
      {/* Flippers */}
      <ellipse cx="26" cy="52" rx="4.5" ry="13" fill="#1a2230" transform="rotate(-12,26,52)" className={anim === 'walk' ? 'pet-arm' : ''} />
      <ellipse cx="74" cy="52" rx="4.5" ry="13" fill="#1a2230" transform="rotate(12,74,52)" className={anim === 'walk' ? 'pet-arm' : ''} />
      {/* Feet */}
      <ellipse cx="42" cy="90" rx="7" ry="4" fill="#e8910c" className={anim === 'walk' ? 'pet-leg-front' : ''} />
      <ellipse cx="58" cy="90" rx="7" ry="4" fill="#e8910c" className={anim === 'walk' ? 'pet-leg-back' : ''} />
      {/* Head */}
      <ellipse cx="50" cy="28" rx="17" ry="15" fill="url(#penguinBodyR)" className={anim === 'walk' ? 'pet-head' : ''} />
      {/* Face patch */}
      <ellipse cx="50" cy="30" rx="11" ry="9" fill="url(#penguinBellyR)" opacity="0.85" />
      <Eyes cx1={44} cx2={56} cy={26} mood={mood} color="#0a0e14" r={2.8} />
      {/* Beak */}
      <path d="M47,32 L50,36 L53,32 Z" fill="#e8910c" />
      <path d="M47,32 L53,32" stroke="#b8740a" strokeWidth="0.6" />
      {/* Wave flipper */}
      {anim === 'wave' && <ellipse cx="20" cy="40" rx="4" ry="10" fill="#1a2230" transform="rotate(-40,20,40)" />}
      {anim === 'celebrate' && (
        <>
          <circle cx="16" cy="16" r="1.5" fill="#fbbf24" />
          <circle cx="86" cy="14" r="1.5" fill="#f472b6" />
        </>
      )}
    </svg>
  );
}

/* ===== DOG (realistic) ===== */
function DogSVG({ size, mood, anim }: { size: number; mood: string; anim: PetAnimation }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="dogBodyR" cx="45%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#c89060" /><stop offset="55%" stopColor="#a87040" /><stop offset="100%" stopColor="#6a4020" />
        </radialGradient>
        <radialGradient id="dogHeadR" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#c89060" /><stop offset="70%" stopColor="#a87040" /><stop offset="100%" stopColor="#6a4020" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="92" rx="22" ry="4" fill="rgba(0,0,0,0.12)" />
      {/* Body */}
      <path d="M26,58 Q22,46 32,42 Q40,38 50,40 Q60,38 68,42 Q78,46 74,58 Q76,80 62,86 Q50,90 38,86 Q24,80 26,58 Z" fill="url(#dogBodyR)" className={anim === 'walk' ? 'pet-body-bob' : ''} />
      {/* Belly */}
      <ellipse cx="50" cy="66" rx="11" ry="13" fill="#e8d0a8" opacity="0.5" />
      {/* Paws */}
      <ellipse cx="36" cy="82" rx="5" ry="4" fill="#6a4020" className={anim === 'walk' ? 'pet-leg-front' : ''} />
      <ellipse cx="64" cy="82" rx="5" ry="4" fill="#6a4020" className={anim === 'walk' ? 'pet-leg-back' : ''} />
      {/* Head */}
      <ellipse cx="50" cy="36" rx="21" ry="19" fill="url(#dogHeadR)" className={anim === 'walk' ? 'pet-head' : ''} />
      {/* Floppy ears */}
      <ellipse cx="28" cy="30" rx="7" ry="13" fill="#6a4020" transform="rotate(-22,28,30)" className="pet-ear" />
      <ellipse cx="72" cy="30" rx="7" ry="13" fill="#6a4020" transform="rotate(22,72,30)" className="pet-ear" />
      {/* Muzzle */}
      <ellipse cx="50" cy="44" rx="11" ry="8" fill="#e8d0a8" />
      <Eyes cx1={43} cx2={57} cy={36} mood={mood} color="#1a0e04" r={3} />
      {/* Nose */}
      <ellipse cx="50" cy="42" rx="2.8" ry="2.2" fill="#1a0e04" />
      {/* Mouth */}
      {(mood === 'happy' || mood === 'excited') && <path d="M47,45 Q50,49 53,45" stroke="#c87878" strokeWidth="1.8" fill="none" strokeLinecap="round" />}
      {mood === 'sad' && <path d="M47,47 Q50,45 53,47" stroke="#6a4020" strokeWidth="1.2" fill="none" strokeLinecap="round" />}
      {mood === 'neutral' && <path d="M47,46 Q50,47 53,46" stroke="#6a4020" strokeWidth="1.2" fill="none" strokeLinecap="round" />}
      {/* Wave paw */}
      {anim === 'wave' && <ellipse cx="22" cy="48" rx="4.5" ry="8" fill="#a87040" transform="rotate(-30,22,48)" />}
      {anim === 'celebrate' && (
        <>
          <circle cx="16" cy="18" r="1.5" fill="#fbbf24" />
          <circle cx="86" cy="16" r="1.5" fill="#f472b6" />
          <circle cx="88" cy="34" r="1.2" fill="#34d399" />
        </>
      )}
    </svg>
  );
}

/* ===== CAT (realistic) ===== */
function CatSVG({ size, mood, anim }: { size: number; mood: string; anim: PetAnimation }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="catBodyR" cx="45%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#9a9a92" /><stop offset="55%" stopColor="#6e6e66" /><stop offset="100%" stopColor="#3e3e36" />
        </radialGradient>
        <radialGradient id="catHeadR" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#a8a8a0" /><stop offset="70%" stopColor="#7a7a72" /><stop offset="100%" stopColor="#4a4a42" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="92" rx="22" ry="4" fill="rgba(0,0,0,0.12)" />
      {/* Tail */}
      <path d="M74,68 Q88,58 84,44 Q82,38 86,36" stroke="#6e6e66" strokeWidth="5" fill="none" strokeLinecap="round" className="pet-tail" />
      {/* Body */}
      <path d="M28,58 Q24,46 34,42 Q42,38 50,40 Q58,38 66,42 Q76,46 72,58 Q74,80 60,86 Q50,90 40,86 Q26,80 28,58 Z" fill="url(#catBodyR)" className={anim === 'walk' ? 'pet-body-bob' : ''} />
      {/* Belly */}
      <ellipse cx="50" cy="66" rx="9" ry="11" fill="#c8c8c0" opacity="0.35" />
      {/* Paws */}
      <ellipse cx="38" cy="82" rx="5" ry="4" fill="#4a4a42" className={anim === 'walk' ? 'pet-leg-front' : ''} />
      <ellipse cx="62" cy="82" rx="5" ry="4" fill="#4a4a42" className={anim === 'walk' ? 'pet-leg-back' : ''} />
      {/* Head */}
      <ellipse cx="50" cy="36" rx="19" ry="17" fill="url(#catHeadR)" className={anim === 'walk' ? 'pet-head' : ''} />
      {/* Pointy ears */}
      <path d="M32,22 L28,8 L42,18 Z" fill="#6e6e66" className="pet-ear" />
      <path d="M68,22 L72,8 L58,18 Z" fill="#6e6e66" className="pet-ear" />
      <path d="M34,20 L32,14 L40,18 Z" fill="#e8a8a8" opacity="0.4" />
      <path d="M66,20 L68,14 L60,18 Z" fill="#e8a8a8" opacity="0.4" />
      {/* Muzzle */}
      <ellipse cx="50" cy="42" rx="9" ry="6" fill="#c8c8c0" opacity="0.4" />
      {/* Cat eyes */}
      {mood === 'sleepy' ? (
        <>
          <path d="M38,36 Q42,34 46,36" stroke="#1a3a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M54,36 Q58,34 62,36" stroke="#1a3a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="43" cy="36" rx="3" ry="4.2" fill="#1a3a1a" />
          <ellipse cx="57" cy="36" rx="3" ry="4.2" fill="#1a3a1a" />
          <circle cx="44" cy="35" r="1" fill="white" />
          <circle cx="58" cy="35" r="1" fill="white" />
        </>
      )}
      {/* Nose */}
      <path d="M48,40 L50,43 L52,40 Z" fill="#d4889a" />
      {/* Mouth */}
      {mood === 'happy' || mood === 'excited' ? (
        <path d="M46,44 Q48,46 50,44 Q52,46 54,44" stroke="#7a7a72" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      ) : mood === 'sad' ? (
        <path d="M47,45 Q50,43 53,45" stroke="#7a7a72" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M47,44 Q50,45 53,44" stroke="#7a7a72" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      )}
      {/* Whiskers */}
      <line x1="44" y1="42" x2="26" y2="40" stroke="#c0c0b8" strokeWidth="0.5" strokeLinecap="round" opacity="0.6" />
      <line x1="56" y1="42" x2="74" y2="40" stroke="#c0c0b8" strokeWidth="0.5" strokeLinecap="round" opacity="0.6" />
      {/* Wave paw */}
      {anim === 'wave' && <ellipse cx="22" cy="46" rx="4" ry="7" fill="#7a7a72" transform="rotate(-30,22,46)" />}
      {anim === 'celebrate' && (
        <>
          <circle cx="16" cy="18" r="1.5" fill="#fbbf24" />
          <circle cx="86" cy="16" r="1.5" fill="#f472b6" />
        </>
      )}
    </svg>
  );
}
