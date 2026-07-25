import { useState, useEffect, useRef, useCallback } from 'react';
import type { UserProfile, GameState, MascotType } from '../types';
import { Mascot } from './Mascot';
import type { PetAnimation } from './Mascot';
import { Camera, X, Info } from 'lucide-react';

interface Props {
  profile: UserProfile;
  game: GameState;
  onGainXp?: (amount: number, label?: string) => void;
}

interface PetState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facing: 'left' | 'right';
  anim: PetAnimation;
  inWater: boolean;
  idleTimer: number;
}

const LAKE_BOUNDS = { x1: 20, y1: 38, x2: 80, y2: 62 };
const MAP_BOUNDS = { x1: 8, y1: 20, x2: 92, y2: 88 };

function isInLake(x: number, y: number): boolean {
  return x >= LAKE_BOUNDS.x1 && x <= LAKE_BOUNDS.x2 && y >= LAKE_BOUNDS.y1 && y <= LAKE_BOUNDS.y2;
}

export function ForestMap({ profile }: Props) {
  const [pet, setPet] = useState<PetState>({
    x: 50, y: 75, targetX: 50, targetY: 75, facing: 'right', anim: 'idle', inWater: false, idleTimer: 0,
  });
  const [showPhoto, setShowPhoto] = useState(false);
  const [petPhoto, setPetPhoto] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleIdRef = useRef(0);
  const petRef = useRef(pet);
  petRef.current = pet;

  // Autonomous AI movement
  useEffect(() => {
    const pickNewTarget = () => {
      // 40% chance to go near lake, 60% random
      const nearLake = Math.random() < 0.4;
      let tx: number, ty: number;
      if (nearLake) {
        tx = LAKE_BOUNDS.x1 + Math.random() * (LAKE_BOUNDS.x2 - LAKE_BOUNDS.x1);
        ty = LAKE_BOUNDS.y1 + Math.random() * (LAKE_BOUNDS.y2 - LAKE_BOUNDS.y1);
      } else {
        tx = MAP_BOUNDS.x1 + Math.random() * (MAP_BOUNDS.x2 - MAP_BOUNDS.x1);
        ty = MAP_BOUNDS.y1 + Math.random() * (MAP_BOUNDS.y2 - MAP_BOUNDS.y1);
      }
      return { tx, ty };
    };

    const interval = setInterval(() => {
      setPet((prev) => {
        const dx = prev.targetX - prev.x;
        const dy = prev.targetY - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Reached target or idle
        if (dist < 2 || prev.idleTimer > 3) {
          // Pick a new target
          const { tx, ty } = pickNewTarget();
          const newFacing = tx < prev.x ? 'left' : 'right';
          return {
            ...prev,
            targetX: tx,
            targetY: ty,
            facing: newFacing,
            anim: 'walk',
            idleTimer: 0,
          };
        }

        // Move toward target
        const speed = 0.4;
        const nx = prev.x + (dx / dist) * speed;
        const ny = prev.y + (dy / dist) * speed;
        const nowInWater = isInLake(nx, ny);

        // Create ripples when entering water or swimming
        if (nowInWater && Math.random() < 0.15) {
          const id = rippleIdRef.current++;
          setRipples((r) => [...r, { id, x: nx, y: ny }]);
          setTimeout(() => setRipples((r) => r.filter((rip) => rip.id !== id)), 2000);
        }

        // If near target, start idling
        const newDist = Math.sqrt((prev.targetX - nx) ** 2 + (prev.targetY - ny) ** 2);
        const newAnim: PetAnimation = newDist < 3 ? 'idle' : nowInWater ? 'walk' : 'walk';

        return {
          ...prev,
          x: nx,
          y: ny,
          inWater: nowInWater,
          anim: newAnim,
          idleTimer: newDist < 3 ? prev.idleTimer + 1 : 0,
        };
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const isQuadruped = (t: MascotType) => t === 'rabbit' || t === 'dog' || t === 'cat' || t === 'otter';

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-green-800 dark:text-green-300">World</h1>
          <p className="text-xs text-gray-400 mt-0.5">Watch your pet explore the garden</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(true)}
            className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg flex items-center justify-center active:scale-90 transition-transform"
          >
            <Info size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => setShowPhoto(true)}
            className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg flex items-center justify-center active:scale-90 transition-transform"
          >
            <Camera size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Autonomous garden scene */}
      <div
        className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl mb-4"
        style={{ background: 'linear-gradient(180deg, #c8e6f5 0%, #d4ede0 18%, #b8dcc4 40%, #8fc8a0 65%, #6ba87e 85%, #5a9670 100%)' }}
      >
        <GardenScenery />

        {/* Autonomous pet */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
          style={{ left: `${pet.x}%`, top: `${pet.y}%` }}
        >
          <div style={{ transform: pet.facing === 'left' ? 'scaleX(-1)' : 'none' }}>
            <Mascot
              type={profile.mascot}
              size={72}
              mood={pet.anim === 'idle' ? 'happy' : 'neutral'}
              animated={pet.anim === 'idle'}
              animation={pet.anim}
            />
          </div>
          {/* Shadow */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-14 h-3 rounded-full bg-black/20 blur-sm" />
          {/* Swimming indicator */}
          {pet.inWater && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 rounded-full bg-cyan-300/40 animate-ripple" />
          )}
        </div>

        {/* Water ripples */}
        {ripples.map((r) => (
          <div
            key={r.id}
            className="absolute z-20 pointer-events-none animate-ripple"
            style={{
              left: `${r.x}%`, top: `${r.y}%`,
              width: '30px', height: '12px',
              border: '1.5px solid rgba(255,255,255,0.5)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {/* Info badge */}
        <div className="absolute top-3 left-3 z-40 bg-white/70 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-bold text-green-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {pet.inWater ? 'Swimming' : pet.anim === 'walk' ? 'Exploring' : 'Resting'}
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Your pet roams freely through the garden — walking, resting by the lake, and swimming when it feels like it. Just sit back and enjoy watching it explore.
        </p>
      </div>

      {/* Info modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowInfo(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                  <Info size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <p className="font-extrabold text-lg">Welcome to the World</p>
              </div>
              <button onClick={() => setShowInfo(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-950/30 dark:to-emerald-900/30 flex items-center justify-center overflow-hidden">
                <Mascot type={profile.mascot} size={64} mood="happy" animation="wave" />
                <div className="absolute top-2 right-3 text-2xl animate-float">🌳</div>
                <div className="absolute bottom-2 left-3 text-xl animate-float" style={{ animationDelay: '1s' }}>🦋</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-center">
              This is your pet's leisure space, where you can watch {profile.mascotName} explore, relax, and express his current mood. Spending time here helps you better understand how your companion is feeling.
            </p>
            <button onClick={() => setShowInfo(false)} className="w-full mt-5 bg-green-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Photo modal */}
      {showPhoto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowPhoto(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold">Take a photo of your pet</p>
              <button onClick={() => setShowPhoto(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            {petPhoto ? (
              <div>
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
                  <img src={petPhoto} alt="My pet" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setPetPhoto(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 font-bold py-3 rounded-2xl text-sm active:scale-95 transition-transform">Retake</button>
                  <button onClick={() => { setPetPhoto(null); setShowPhoto(false); }} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-2xl text-sm active:scale-95 transition-transform">Save</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-400">Camera access needed to take photos of your pet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- SVG Garden Scenery with giant tree, big lake, falling leaves ---- */
function GardenScenery() {
  return (
    <>
      {/* Sky gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200/30 via-transparent to-transparent" />

      {/* Sun with glow */}
      <div className="absolute top-5 right-8 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-100 to-amber-300 shadow-[0_0_40px_20px_rgba(252,211,77,0.4)] animate-float" />

      {/* Soft clouds */}
      <svg className="absolute top-6 left-3 w-24 h-14 opacity-90 animate-float" viewBox="0 0 64 40">
        <ellipse cx="20" cy="24" rx="16" ry="11" fill="white" opacity="0.9" />
        <ellipse cx="38" cy="20" rx="14" ry="9" fill="white" opacity="0.9" />
        <ellipse cx="48" cy="26" rx="10" ry="7" fill="white" opacity="0.9" />
      </svg>
      <svg className="absolute top-14 right-4 w-20 h-12 opacity-70 animate-float" viewBox="0 0 64 40" style={{ animationDelay: '2.5s' }}>
        <ellipse cx="20" cy="24" rx="16" ry="11" fill="white" />
        <ellipse cx="40" cy="20" rx="14" ry="9" fill="white" />
      </svg>

      {/* Distant misty mountains */}
      <svg className="absolute bottom-[28%] left-0 right-0 w-full" viewBox="0 0 300 90" preserveAspectRatio="none">
        <path d="M0,90 L40,40 L80,60 L130,30 L180,55 L230,35 L300,50 L300,90 Z" fill="#7ba88a" opacity="0.35" />
      </svg>

      {/* GIANT TREE in center */}
      <svg className="absolute z-10" style={{ left: '50%', top: '15%', transform: 'translateX(-50%)' }} width="180" height="240" viewBox="0 0 180 240">
        {/* Trunk */}
        <path d="M82,120 L78,230 L102,230 L98,120 Z" fill="#5d4030" />
        <path d="M82,120 L78,230 L88,230 L86,120 Z" fill="#4a3324" opacity="0.5" />
        {/* Bark texture */}
        <line x1="85" y1="140" x2="85" y2="160" stroke="#3e2818" strokeWidth="1" opacity="0.4" />
        <line x1="92" y1="170" x2="92" y2="190" stroke="#3e2818" strokeWidth="1" opacity="0.4" />
        {/* Branches */}
        <path d="M88,120 Q70,100 55,90" stroke="#5d4030" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M92,120 Q110,100 125,92" stroke="#5d4030" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Massive layered foliage */}
        <ellipse cx="90" cy="50" rx="80" ry="55" fill="#3d7a4d" />
        <ellipse cx="55" cy="65" rx="45" ry="35" fill="#4a8c5a" />
        <ellipse cx="125" cy="65" rx="45" ry="35" fill="#4a8c5a" />
        <ellipse cx="90" cy="35" rx="40" ry="30" fill="#56a06a" />
        <ellipse cx="40" cy="50" rx="30" ry="25" fill="#4a8c5a" />
        <ellipse cx="140" cy="50" rx="30" ry="25" fill="#4a8c5a" />
        <ellipse cx="70" cy="45" rx="25" ry="20" fill="#6bb87e" opacity="0.7" />
        <ellipse cx="110" cy="45" rx="25" ry="20" fill="#6bb87e" opacity="0.7" />
        <ellipse cx="90" cy="25" rx="20" ry="15" fill="#7aca8e" opacity="0.5" />
      </svg>

      {/* Small trees on sides */}
      {[{ x: 6, y: 50, s: 0.7 }, { x: 88, y: 48, s: 0.8 }].map((t, i) => (
        <svg key={i} className="absolute animate-float" style={{ left: `${t.x}%`, top: `${t.y}%`, animationDelay: `${i * 1.2}s` }} width={48 * t.s} height={72 * t.s} viewBox="0 0 48 72">
          <path d="M22,40 L20,70 L28,70 L26,40 Z" fill="#5d4030" />
          <ellipse cx="24" cy="20" rx="20" ry="18" fill="#3d7a4d" />
          <ellipse cx="16" cy="24" rx="13" ry="12" fill="#4a8c5a" />
          <ellipse cx="32" cy="24" rx="13" ry="12" fill="#4a8c5a" />
          <ellipse cx="24" cy="14" rx="11" ry="10" fill="#56a06a" />
        </svg>
      ))}

      {/* LARGE LAKE */}
      <svg className="absolute" style={{ left: '15%', top: '36%', width: '70%', height: '30%' }} viewBox="0 0 280 120" preserveAspectRatio="none">
        <ellipse cx="140" cy="65" rx="130" ry="50" fill="#4a9cc4" opacity="0.5" />
        <ellipse cx="140" cy="60" rx="120" ry="42" fill="#6bb6d6" opacity="0.6" />
        <ellipse cx="140" cy="56" rx="100" ry="32" fill="#8ecae3" opacity="0.5" />
        {/* Ripples */}
        <path d="M30,55 Q140,48 250,55" stroke="#3a8cb4" strokeWidth="1.2" fill="none" opacity="0.4" />
        <path d="M50,65 Q140,60 230,65" stroke="#3a8cb4" strokeWidth="0.8" fill="none" opacity="0.3" />
        <path d="M70,75 Q140,72 210,75" stroke="#3a8cb4" strokeWidth="0.6" fill="none" opacity="0.2" />
        {/* Reflection highlight */}
        <ellipse cx="110" cy="50" rx="40" ry="6" fill="white" opacity="0.3" />
      </svg>

      {/* Lily pads on lake */}
      <svg className="absolute" style={{ left: '30%', top: '42%' }} width="28" height="20" viewBox="0 0 28 20">
        <ellipse cx="14" cy="12" rx="12" ry="5" fill="#3d7a4d" opacity="0.7" />
        <ellipse cx="14" cy="10" rx="10" ry="4" fill="#4a8c5a" opacity="0.6" />
        <circle cx="14" cy="8" r="3" fill="#f9a8d4" />
        <circle cx="14" cy="8" r="1.5" fill="#fde047" />
      </svg>
      <svg className="absolute" style={{ left: '55%', top: '46%' }} width="22" height="16" viewBox="0 0 22 16">
        <ellipse cx="11" cy="9" rx="9" ry="4" fill="#3d7a4d" opacity="0.6" />
      </svg>
      <svg className="absolute" style={{ left: '70%', top: '44%' }} width="20" height="14" viewBox="0 0 20 14">
        <ellipse cx="10" cy="8" rx="8" ry="3.5" fill="#3d7a4d" opacity="0.5" />
      </svg>

      {/* Reeds at lake edge */}
      {[{ x: 14, h: 28 }, { x: 17, h: 22 }, { x: 80, h: 26 }, { x: 83, h: 30 }].map((r, i) => (
        <svg key={i} className="absolute" style={{ left: `${r.x}%`, top: `${40 - r.h / 2}%` }} width="4" height={r.h} viewBox={`0 0 4 ${r.h}`}>
          <line x1="2" y1="0" x2="2" y2={r.h} stroke="#4a7a3a" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="2" cy="2" rx="1.5" ry="4" fill="#5a8a4a" />
        </svg>
      ))}

      {/* Stone path */}
      <svg className="absolute bottom-[8%] left-0 right-0 w-full" viewBox="0 0 300 30" preserveAspectRatio="none">
        <ellipse cx="40" cy="18" rx="18" ry="6" fill="#a8a098" opacity="0.5" />
        <ellipse cx="100" cy="20" rx="16" ry="5" fill="#9a9288" opacity="0.5" />
        <ellipse cx="160" cy="17" rx="18" ry="6" fill="#a8a098" opacity="0.5" />
        <ellipse cx="220" cy="19" rx="16" ry="5" fill="#9a9288" opacity="0.5" />
        <ellipse cx="270" cy="18" rx="14" ry="5" fill="#a8a098" opacity="0.5" />
      </svg>

      {/* Wildflowers */}
      {[{ x: 22, y: 80, c: '#f9a8d4' }, { x: 68, y: 84, c: '#fde047' }, { x: 54, y: 78, c: '#f9a8d4' }, { x: 80, y: 74, c: '#c4b5fd' }, { x: 12, y: 76, c: '#fde047' }, { x: 42, y: 86, c: '#fca5a5' }, { x: 88, y: 82, c: '#f9a8d4' }, { x: 6, y: 84, c: '#fde047' }].map((f, i) => (
        <svg key={i} className="absolute" style={{ left: `${f.x}%`, top: `${f.y}%` }} width="16" height="16" viewBox="0 0 16 16">
          <line x1="8" y1="14" x2="8" y2="8" stroke="#4a7a3a" strokeWidth="1" strokeLinecap="round" />
          <circle cx="8" cy="6" r="2.5" fill={f.c} />
          <circle cx="5" cy="8" r="2.5" fill={f.c} />
          <circle cx="11" cy="8" r="2.5" fill={f.c} />
          <circle cx="8" cy="10" r="2.5" fill={f.c} />
          <circle cx="8" cy="8" r="1.5" fill="#fbbf24" />
        </svg>
      ))}

      {/* Grass tufts */}
      {[{ x: 28, y: 88 }, { x: 62, y: 90 }, { x: 45, y: 92 }, { x: 82, y: 84 }, { x: 8, y: 88 }, { x: 90, y: 90 }, { x: 35, y: 86 }, { x: 72, y: 88 }].map((g, i) => (
        <svg key={i} className="absolute" style={{ left: `${g.x}%`, top: `${g.y}%` }} width="22" height="14" viewBox="0 0 22 14">
          <path d="M2,14 Q4,5 6,14 M8,14 Q10,3 12,14 M14,14 Q16,6 18,14" stroke="#4a8c5a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      ))}

      {/* Butterflies */}
      <svg className="absolute animate-float" style={{ left: '58%', top: '32%', animationDelay: '1.5s' }} width="18" height="16" viewBox="0 0 18 16">
        <ellipse cx="6" cy="6" rx="4.5" ry="3.5" fill="#f9a8d4" opacity="0.8" />
        <ellipse cx="12" cy="6" rx="4.5" ry="3.5" fill="#f9a8d4" opacity="0.8" />
        <ellipse cx="6" cy="11" rx="3.5" ry="3" fill="#f9a8d4" opacity="0.6" />
        <ellipse cx="12" cy="11" rx="3.5" ry="3" fill="#f9a8d4" opacity="0.6" />
        <line x1="9" y1="3" x2="9" y2="13" stroke="#7a5a4a" strokeWidth="1" />
      </svg>
      <svg className="absolute animate-float" style={{ left: '25%', top: '28%', animationDelay: '0.8s' }} width="16" height="14" viewBox="0 0 16 14">
        <ellipse cx="5" cy="5" rx="4" ry="3" fill="#c4b5fd" opacity="0.8" />
        <ellipse cx="11" cy="5" rx="4" ry="3" fill="#c4b5fd" opacity="0.8" />
        <line x1="8" y1="3" x2="8" y2="11" stroke="#7a5a4a" strokeWidth="1" />
      </svg>

      {/* Bird in sky */}
      <svg className="absolute animate-float" style={{ left: '70%', top: '12%', animationDelay: '0.5s' }} width="20" height="10" viewBox="0 0 20 10">
        <path d="M2,6 Q6,2 10,6 Q14,2 18,6" stroke="#6b7280" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>

      {/* Falling leaves */}
      {[{ x: 35, delay: 0 }, { x: 60, delay: 3 }, { x: 75, delay: 6 }, { x: 45, delay: 9 }].map((l, i) => (
        <div key={i} className="absolute animate-fall" style={{ left: `${l.x}%`, top: '20%', animationDelay: `${l.delay}s` }}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M7,1 Q12,4 11,9 Q8,13 4,11 Q1,7 3,4 Q5,1 7,1 Z" fill="#8bbf6a" opacity="0.7" />
            <line x1="7" y1="1" x2="9" y2="13" stroke="#5a8a3a" strokeWidth="0.5" opacity="0.5" />
          </svg>
        </div>
      ))}
    </>
  );
}
