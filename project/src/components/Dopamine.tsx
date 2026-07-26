import { useEffect, useState, useCallback, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'circle' | 'square' | 'star';
}

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#a855f7', '#06b6d4', '#ef4444'];

let particleId = 0;

export function useConfetti() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [burst, setBurst] = useState(0);
  const frameRef = useRef<number | null>(null);

  const fire = useCallback((count = 40) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 3 + Math.random() * 5;
      newParticles.push({
        id: particleId++,
        x: 50,
        y: 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: ['circle', 'square', 'star'][Math.floor(Math.random() * 3)] as Particle['shape'],
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
    setBurst((b) => b + 1);
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;
    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 16, 2);
      lastTime = time;
      setParticles((prev) => {
        const next = prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            vy: p.vy + 0.15 * dt,
            rotation: p.rotation + p.rotationSpeed * dt,
          }))
          .filter((p) => p.y < 120 && p.x > -10 && p.x < 110);
        if (next.length === 0) return [];
        frameRef.current = requestAnimationFrame(animate);
        return next;
      });
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [burst]);

  return { particles, fire };
}

export function ConfettiLayer({ particles }: { particles: Particle[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          {p.shape === 'circle' && <div className="w-full h-full rounded-full" style={{ background: p.color }} />}
          {p.shape === 'square' && <div className="w-full h-full rounded-sm" style={{ background: p.color }} />}
          {p.shape === 'star' && <StarShape color={p.color} size={p.size} />}
        </div>
      ))}
    </div>
  );
}

function StarShape({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2-6.3-4.6-6.3 4.6L7.9 13.8 2 9.4h7.6z" />
    </svg>
  );
}

export function LevelUpOverlay({ level, show }: { level: number; show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none animate-pop">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative text-center">
        <div className="text-6xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent animate-celebrate">
          LEVEL {level}
        </div>
        <div className="mt-2 text-lg font-bold text-white animate-slide-up">You leveled up!</div>
      </div>
    </div>
  );
}
