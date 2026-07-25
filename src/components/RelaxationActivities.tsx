import { useState, useEffect, useRef, useCallback } from 'react';
import { Wind, Brain, Leaf, Heart, Footprints, Sparkles, X, Play, Pause, Check, RotateCcw } from 'lucide-react';
import { playSoundEffect } from './AmbientMusic';

interface Props {
  onComplete: (xp: number, label: string) => void;
}

type Activity = 'breath' | 'meditate' | 'stretch' | 'journal' | 'walk' | 'gratitude' | null;

export function RelaxationActivities({ onComplete }: Props) {
  const [active, setActive] = useState<Activity>(null);

  const activities = [
    { id: 'breath' as const, name: 'Box Breathing', icon: Wind, desc: '4-4-4-4 pattern to calm the mind', color: 'cyan' },
    { id: 'meditate' as const, name: 'Guided Meditation', icon: Brain, desc: '10 min mindful awareness', color: 'indigo' },
    { id: 'stretch' as const, name: 'Gentle Stretching', icon: Leaf, desc: 'Release body tension', color: 'green' },
    { id: 'journal' as const, name: 'Journaling', icon: Heart, desc: 'Write your thoughts freely', color: 'rose' },
    { id: 'walk' as const, name: 'Mindful Walk', icon: Footprints, desc: 'A slow, present walk outside', color: 'amber' },
    { id: 'gratitude' as const, name: 'Gratitude List', icon: Sparkles, desc: 'Note 3 things you are grateful for', color: 'pink' },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400">Take a moment for yourself. Choose an activity:</p>
      {activities.map((r) => {
        const Icon = r.icon;
        return (
          <button key={r.id} onClick={() => setActive(r.id)}
            className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg flex items-center gap-3 active:scale-[0.98] transition-transform text-left">
            <div className={`w-12 h-12 rounded-2xl bg-${r.color}-100 dark:bg-${r.color}-950/30 flex items-center justify-center`}>
              <Icon size={22} className={`text-${r.color}-500`} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{r.name}</p>
              <p className="text-xs text-gray-400">{r.desc}</p>
            </div>
            <Play size={18} className="text-gray-300" />
          </button>
        );
      })}

      {active === 'breath' && <BoxBreathing onClose={() => setActive(null)} onComplete={onComplete} />}
      {active === 'meditate' && <GuidedMeditation onClose={() => setActive(null)} onComplete={onComplete} />}
      {active === 'stretch' && <GentleStretching onClose={() => setActive(null)} onComplete={onComplete} />}
      {active === 'journal' && <Journaling onClose={() => setActive(null)} onComplete={onComplete} />}
      {active === 'walk' && <MindfulWalk onClose={() => setActive(null)} onComplete={onComplete} />}
      {active === 'gratitude' && <GratitudeList onClose={() => setActive(null)} onComplete={onComplete} />}
    </div>
  );
}

/* ---- Modal wrapper ---- */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl p-5 max-w-md w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 sticky top-0">
          <p className="font-bold text-lg">{title}</p>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---- Box Breathing ---- */
function BoxBreathing({ onClose, onComplete }: { onClose: () => void; onComplete: (xp: number, label: string) => void }) {
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [running, setRunning] = useState(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = window.setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          setPhase((p) => {
            const order = ['inhale', 'hold1', 'exhale', 'hold2'] as const;
            const idx = order.indexOf(p);
            const next = order[(idx + 1) % 4];
            if (next === 'inhale') {
              setCycles((cy) => cy + 1);
              playSoundEffect('click');
            }
            return next;
          });
          return 4;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  useEffect(() => {
    if (cycles >= 4) {
      onComplete(20, 'Box Breathing complete');
      setRunning(false);
    }
  }, [cycles, onComplete]);

  const phaseLabel = { inhale: 'Breathe In', hold1: 'Hold', exhale: 'Breathe Out', hold2: 'Hold' }[phase];
  const scale = phase === 'inhale' ? 1 + (4 - count) * 0.2 : phase === 'exhale' ? 1.8 - (4 - count) * 0.2 : phase === 'hold1' ? 1.8 : 1;

  return (
    <Modal title="Box Breathing" onClose={onClose}>
      <div className="flex flex-col items-center py-6">
        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full bg-cyan-100 dark:bg-cyan-950/30" />
          <div
            className="absolute rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 transition-all duration-1000 ease-in-out"
            style={{ width: `${scale * 60}%`, height: `${scale * 60}%`, opacity: 0.6 }}
          />
          <div className="relative z-10 text-center">
            <p className="font-extrabold text-2xl text-cyan-700 dark:text-cyan-300">{phaseLabel}</p>
            <p className="text-5xl font-extrabold text-cyan-900 dark:text-cyan-100">{count}</p>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-4">Cycle {Math.min(cycles + 1, 4)} of 4</p>
        {cycles >= 4 ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-3">
              <Check size={28} className="text-green-500" />
            </div>
            <p className="font-bold text-green-600 dark:text-green-400 mb-3">Complete! You feel calmer.</p>
            <button onClick={onClose} className="bg-cyan-500 text-white font-bold py-3 px-8 rounded-2xl active:scale-95 transition-transform">Done</button>
          </div>
        ) : (
          <button onClick={() => setRunning(!running)} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-5 py-2.5 rounded-full font-bold text-sm active:scale-95 transition-transform">
            {running ? <Pause size={16} /> : <Play size={16} />} {running ? 'Pause' : 'Resume'}
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ---- Guided Meditation ---- */
function GuidedMeditation({ onClose, onComplete }: { onClose: () => void; onComplete: (xp: number, label: string) => void }) {
  const steps = [
    'Find a comfortable position. Close your eyes or soften your gaze.',
    'Take three deep breaths. In through the nose, out through the mouth.',
    'Notice your body. Feel the weight of your legs, your back, your hands.',
    'Bring attention to your breath. Don\'t change it — just observe.',
    'If your mind wanders, gently return to the breath. No judgment.',
    'Notice sounds around you. Let them come and go.',
    'Feel the rise and fall of your chest with each breath.',
    'Scan your body from head to toe. Release any tension you find.',
    'Rest in this stillness. You are safe. You are present.',
    'Slowly wiggle your fingers and toes. When ready, open your eyes.',
  ];
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(true);
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setStep((st) => {
            if (st >= steps.length - 1) {
              setRunning(false);
              onComplete(30, 'Guided Meditation complete');
              return st;
            }
            return st + 1;
          });
          return 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, steps.length, onComplete]);

  const progress = ((step + (60 - seconds) / 60) / steps.length) * 100;

  return (
    <Modal title="Guided Meditation" onClose={onClose}>
      <div className="py-4">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <div className="relative w-40 h-40 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-indigo-100 dark:bg-indigo-950/30 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute inset-4 rounded-full bg-indigo-200 dark:bg-indigo-900/40 animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-8 rounded-full bg-indigo-300 dark:bg-indigo-800/50 animate-pulse" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain size={32} className="text-indigo-500" />
          </div>
        </div>
        <p className="text-center text-lg font-semibold mb-2 min-h-[3rem]">{steps[step]}</p>
        <p className="text-center text-sm text-gray-400 mb-6">Step {step + 1} of {steps.length} · {seconds}s</p>
        {!running && step >= steps.length - 1 ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-3">
              <Check size={28} className="text-green-500" />
            </div>
            <p className="font-bold text-green-600 dark:text-green-400 mb-3">Meditation complete!</p>
            <button onClick={onClose} className="bg-indigo-500 text-white font-bold py-3 px-8 rounded-2xl active:scale-95 transition-transform">Done</button>
          </div>
        ) : (
          <div className="flex justify-center gap-3">
            <button onClick={() => setRunning(!running)} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-5 py-2.5 rounded-full font-bold text-sm active:scale-95 transition-transform">
              {running ? <Pause size={16} /> : <Play size={16} />} {running ? 'Pause' : 'Resume'}
            </button>
            <button onClick={() => { setStep(0); setSeconds(60); setRunning(true); }} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-5 py-2.5 rounded-full font-bold text-sm active:scale-95 transition-transform">
              <RotateCcw size={16} /> Restart
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ---- Gentle Stretching ---- */
function GentleStretching({ onClose, onComplete }: { onClose: () => void; onComplete: (xp: number, label: string) => void }) {
  const stretches = [
    { name: 'Neck Rolls', instruction: 'Slowly roll your head in a circle. 5 times clockwise, 5 times counter-clockwise.', duration: 30 },
    { name: 'Shoulder Shrugs', instruction: 'Lift both shoulders toward your ears, hold 5 seconds, release. Repeat 10 times.', duration: 40 },
    { name: 'Cat-Cow Stretch', instruction: 'On hands and knees, arch your back up like a cat, then dip it down like a cow. Flow 8 times.', duration: 45 },
    { name: 'Seated Forward Fold', instruction: 'Sit with legs extended. Reach toward your toes. Hold for 20 seconds, breathing deeply.', duration: 30 },
    { name: 'Spinal Twist', instruction: 'Sit tall, twist gently to one side, hold 15 seconds. Repeat on the other side.', duration: 35 },
    { name: 'Child\'s Pose', instruction: 'Kneel, sit back on heels, reach arms forward. Rest forehead on the floor. Breathe.', duration: 30 },
  ];
  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(stretches[0].duration);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!running || done) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          if (step >= stretches.length - 1) {
            setDone(true);
            setRunning(false);
            onComplete(25, 'Stretching complete');
            return 0;
          }
          setStep((st) => st + 1);
          return stretches[step + 1].duration;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, step, done, onComplete, stretches]);

  const progress = ((step + (stretches[step].duration - seconds) / stretches[step].duration) / stretches.length) * 100;

  return (
    <Modal title="Gentle Stretching" onClose={onClose}>
      <div className="py-4">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
          <Leaf size={48} className="text-green-500 animate-pulse" />
        </div>
        <p className="text-center font-bold text-lg mb-2">{stretches[step].name}</p>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4 min-h-[3rem]">{stretches[step].instruction}</p>
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">{seconds}</p>
            <p className="text-xs text-gray-400">seconds left</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-gray-400">{step + 1}/{stretches.length}</p>
            <p className="text-xs text-gray-400">stretches</p>
          </div>
        </div>
        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-3">
              <Check size={28} className="text-green-500" />
            </div>
            <p className="font-bold text-green-600 dark:text-green-400 mb-3">All stretches done!</p>
            <button onClick={onClose} className="bg-green-500 text-white font-bold py-3 px-8 rounded-2xl active:scale-95 transition-transform">Done</button>
          </div>
        ) : (
          <div className="flex justify-center gap-3">
            <button onClick={() => setRunning(!running)} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-5 py-2.5 rounded-full font-bold text-sm active:scale-95 transition-transform">
              {running ? <Pause size={16} /> : <Play size={16} />} {running ? 'Pause' : 'Resume'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ---- Journaling ---- */
function Journaling({ onClose, onComplete }: { onClose: () => void; onComplete: (xp: number, label: string) => void }) {
  const [entry, setEntry] = useState('');
  const [saved, setSaved] = useState(false);
  const wordCount = entry.trim().split(/\s+/).filter(Boolean).length;

  const handleSave = () => {
    if (wordCount < 5) return;
    try {
      const existing = JSON.parse(localStorage.getItem('journal_entries') || '[]');
      existing.push({ date: new Date().toISOString(), text: entry });
      localStorage.setItem('journal_entries', JSON.stringify(existing));
    } catch {}
    setSaved(true);
    onComplete(15, 'Journal entry saved');
    playSoundEffect('success');
  };

  const prompts = [
    'What\'s on your mind right now?',
    'What went well today?',
    'What\'s something you\'re looking forward to?',
    'Describe a feeling you had today.',
    'What would you tell your past self?',
  ];
  const prompt = prompts[new Date().getDate() % prompts.length];

  return (
    <Modal title="Journaling" onClose={onClose}>
      <div className="py-2">
        <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-3 mb-3">
          <p className="text-sm text-rose-600 dark:text-rose-400 font-semibold">{prompt}</p>
        </div>
        {saved ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-3">
              <Check size={28} className="text-green-500" />
            </div>
            <p className="font-bold text-green-600 dark:text-green-400 mb-1">Entry saved!</p>
            <p className="text-xs text-gray-400 mb-4">{wordCount} words written</p>
            <button onClick={onClose} className="bg-rose-500 text-white font-bold py-3 px-8 rounded-2xl active:scale-95 transition-transform">Done</button>
          </div>
        ) : (
          <>
            <textarea
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Write freely... no one will see this but you."
              className="w-full h-48 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
              autoFocus
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-400">{wordCount} words</p>
              <button onClick={handleSave} disabled={wordCount < 5}
                className="bg-rose-500 text-white font-bold py-3 px-6 rounded-2xl active:scale-95 transition-transform disabled:opacity-40 flex items-center gap-2">
                <Check size={16} /> Save Entry
              </button>
            </div>
            {wordCount < 5 && <p className="text-xs text-gray-400 mt-2">Write at least 5 words to save</p>}
          </>
        )}
      </div>
    </Modal>
  );
}

/* ---- Mindful Walk ---- */
function MindfulWalk({ onClose, onComplete }: { onClose: () => void; onComplete: (xp: number, label: string) => void }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const targetMin = 10;
  const progress = Math.min(100, (seconds / (targetMin * 60)) * 100);

  const cues = [
    'Notice the feeling of your feet on the ground',
    'Look at the sky. What colors do you see?',
    'Listen to the sounds around you',
    'Feel the air on your skin — is it warm or cool?',
    'Notice your breathing as you walk',
    'Observe a tree, a leaf, or a flower',
  ];
  const cueIdx = Math.floor(seconds / 60) % cues.length;

  const finish = () => {
    if (seconds >= 60) {
      setDone(true);
      setRunning(false);
      onComplete(30, 'Mindful walk complete');
    }
  };

  return (
    <Modal title="Mindful Walk" onClose={onClose}>
      <div className="py-4">
        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center relative overflow-hidden">
          <Footprints size={48} className="text-amber-500" />
          {running && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 animate-pulse" style={{ width: `${progress}%` }} />
          )}
        </div>
        {!done ? (
          <>
            <p className="text-center text-3xl font-extrabold text-amber-600 dark:text-amber-400 mb-2 tabular-nums">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </p>
            <p className="text-center text-xs text-gray-400 mb-6">Target: {targetMin} min · minimum 1 min to complete</p>
            {running && (
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-3 mb-6 animate-fade-in" key={cueIdx}>
                <p className="text-center text-sm text-amber-700 dark:text-amber-300 font-semibold">{cues[cueIdx]}</p>
              </div>
            )}
            <div className="flex justify-center gap-3">
              {!running ? (
                <button onClick={() => setRunning(true)} className="flex items-center gap-2 bg-amber-500 text-white font-bold py-3 px-8 rounded-2xl active:scale-95 transition-transform">
                  <Play size={16} /> Start Walking
                </button>
              ) : (
                <>
                  <button onClick={() => setRunning(false)} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-5 py-2.5 rounded-full font-bold text-sm active:scale-95 transition-transform">
                    <Pause size={16} /> Pause
                  </button>
                  <button onClick={finish} disabled={seconds < 60} className="flex items-center gap-2 bg-green-500 text-white font-bold py-3 px-6 rounded-2xl active:scale-95 transition-transform disabled:opacity-40">
                    <Check size={16} /> Finish
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-3">
              <Check size={28} className="text-green-500" />
            </div>
            <p className="font-bold text-green-600 dark:text-green-400 mb-1">Walk complete!</p>
            <p className="text-xs text-gray-400 mb-4">You walked mindfully for {mins} min {secs} sec</p>
            <button onClick={onClose} className="bg-amber-500 text-white font-bold py-3 px-8 rounded-2xl active:scale-95 transition-transform">Done</button>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ---- Gratitude List ---- */
function GratitudeList({ onClose, onComplete }: { onClose: () => void; onComplete: (xp: number, label: string) => void }) {
  const [items, setItems] = useState(['', '', '']);
  const [saved, setSaved] = useState(false);
  const filledCount = items.filter((i) => i.trim().length > 0).length;

  const handleSave = () => {
    if (filledCount < 3) return;
    try {
      const existing = JSON.parse(localStorage.getItem('gratitude_entries') || '[]');
      existing.push({ date: new Date().toISOString(), items: items.filter((i) => i.trim()) });
      localStorage.setItem('gratitude_entries', JSON.stringify(existing));
    } catch {}
    setSaved(true);
    onComplete(15, 'Gratitude list saved');
    playSoundEffect('success');
  };

  return (
    <Modal title="Gratitude List" onClose={onClose}>
      <div className="py-2">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">Write 3 things you are grateful for today.</p>
        {saved ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-3">
              <Check size={28} className="text-green-500" />
            </div>
            <p className="font-bold text-green-600 dark:text-green-400 mb-3">Saved! Feel the gratitude.</p>
            <div className="space-y-2 mb-4">
              {items.filter((i) => i.trim()).map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-pink-50 dark:bg-pink-950/20 rounded-2xl p-3">
                  <Heart size={16} className="text-pink-500 flex-shrink-0" />
                  <p className="text-sm text-left">{item}</p>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="bg-pink-500 text-white font-bold py-3 px-8 rounded-2xl active:scale-95 transition-transform">Done</button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-950/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-pink-500 font-bold text-sm">{i + 1}</span>
                  </div>
                  <input
                    value={item}
                    onChange={(e) => { const next = [...items]; next[i] = e.target.value; setItems(next); }}
                    placeholder={`I am grateful for...`}
                    className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              ))}
            </div>
            <button onClick={handleSave} disabled={filledCount < 3}
              className="w-full bg-pink-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform disabled:opacity-40 flex items-center justify-center gap-2">
              <Check size={16} /> Save Gratitude ({filledCount}/3)
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
