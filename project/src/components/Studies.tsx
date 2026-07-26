import { useState, useEffect, useRef, useCallback } from 'react';
import type { UserProfile, GameState, RoutineTask, StudySubject, TimerPreset, StudySession } from '../types';
import { BookOpen, Clock, Target, Repeat, Trophy, Plus, Check, Flame, TrendingUp, Play, Pause, RotateCcw, Save, History, X, Timer, Brain, Zap, Sparkles, ChevronDown, ChevronUp, Star, Award, Zap as ZapIcon, Edit2 } from 'lucide-react';

interface Props {
  profile: UserProfile;
  game: GameState;
  tasks: RoutineTask[];
  onToggleTask: (id: string) => void;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onGainXp?: (xp: number, label: string) => void;
}

type TimerMode = 'stopwatch' | 'countdown' | 'pomodoro';

const STUDY_METHODS = [
  {
    id: 'pomodoro',
    name: 'Pomodoro Technique',
    icon: '🍅',
    color: 'from-red-400 to-orange-500',
    description: 'Work in 25-minute focused bursts with 5-minute breaks. After 4 cycles, take a longer 15-30 minute break.',
    config: { focusMin: 25, breakMin: 5, longBreakMin: 20, cycles: 4 },
    steps: ['Set timer for 25 minutes', 'Focus on one task only', 'Take a 5-minute break when it rings', 'Repeat 4 times, then take a long break'],
  },
  {
    id: 'active-recall',
    name: 'Active Recall',
    icon: '🧠',
    color: 'from-indigo-400 to-purple-500',
    description: 'Test yourself on what you learned instead of re-reading. The struggle of retrieving strengthens memory.',
    config: { focusMin: 20, breakMin: 5, longBreakMin: 15, cycles: 3 },
    steps: ['Study a topic for 20 min', 'Close the book and write everything you remember', 'Check what you missed', 'Repeat with new material'],
  },
  {
    id: 'feynman',
    name: 'Feynman Technique',
    icon: '👨‍🏫',
    color: 'from-amber-400 to-yellow-500',
    description: 'Explain a concept in simple terms as if teaching a child. Gaps in your explanation reveal what you don\'t understand yet.',
    config: { focusMin: 30, breakMin: 10, longBreakMin: 20, cycles: 2 },
    steps: ['Pick a concept to learn', 'Explain it in simple words aloud or on paper', 'Identify gaps in your explanation', 'Review and simplify further'],
  },
  {
    id: 'leitner',
    name: 'Leitner System',
    icon: '🗂️',
    color: 'from-green-400 to-emerald-500',
    description: 'Use flashcards in boxes. Correct answers move to a box reviewed less often. Wrong answers go back to box 1.',
    config: { focusMin: 15, breakMin: 5, longBreakMin: 15, cycles: 4 },
    steps: ['Create flashcards for key concepts', 'Review Box 1 daily, Box 2 every 2 days, Box 3 weekly', 'Correct cards move up, wrong ones reset', 'Track which boxes need review'],
  },
  {
    id: 'blurting',
    name: 'Blurting',
    icon: '✍️',
    color: 'from-cyan-400 to-blue-500',
    description: 'Write down everything you know about a topic without looking. Then check your notes to fill the gaps.',
    config: { focusMin: 10, breakMin: 5, longBreakMin: 10, cycles: 3 },
    steps: ['Set a 10-minute timer', 'Write everything you know about the topic', 'Open your notes and compare', 'Fill in what you missed in a different color'],
  },
  {
    id: 'spaced-repetition',
    name: 'Spaced Repetition',
    icon: '🔁',
    color: 'from-purple-400 to-pink-500',
    description: 'Review material at increasing intervals (1 day, 3 days, 1 week, 2 weeks). This exploits how your brain forgets.',
    config: { focusMin: 20, breakMin: 5, longBreakMin: 15, cycles: 3 },
    steps: ['Learn new material', 'Review after 1 day', 'Review again after 3 days', 'Continue extending intervals'],
  },
];

export function Studies({ profile, game, tasks, onToggleTask, onUpdateProfile, onGainXp }: Props) {
  const [view, setView] = useState<'today' | 'plan' | 'stats' | 'methods'>('today');

  const studyTasks = tasks.filter((t) => t.category === 'study');
  const completed = studyTasks.filter((t) => t.completed).length;
  const studyHours = completed * 0.5;

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
      <h1 className="text-2xl font-extrabold mb-4">Studies</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {(['today', 'methods', 'plan', 'stats'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${view === v ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
            {v === 'today' ? 'Today' : v === 'methods' ? 'Methods' : v === 'plan' ? 'Plan' : 'Stats'}
          </button>
        ))}
      </div>

      {view === 'today' && <TodayView tasks={studyTasks} completed={completed} onToggleTask={onToggleTask} profile={profile} onGainXp={onGainXp} />}
      {view === 'methods' && <MethodsView onGainXp={onGainXp} />}
      {view === 'plan' && <PlanView profile={profile} game={game} onUpdateProfile={onUpdateProfile} />}
      {view === 'stats' && <StatsView game={game} studyHours={studyHours} completed={completed} />}
    </div>
  );
}

/* ---- TODAY VIEW with full timer ---- */
function TodayView({ tasks, completed, onToggleTask, profile, onGainXp }: { tasks: RoutineTask[]; completed: number; onToggleTask: (id: string) => void; profile: UserProfile; onGainXp?: (xp: number, label: string) => void }) {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [presets, setPresets] = useState<TimerPreset[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [showPresets, setShowPresets] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [customMin, setCustomMin] = useState(25);
  const [inputH, setInputH] = useState(0);
  const [inputM, setInputM] = useState(25);
  const [inputS, setInputS] = useState(0);
  const [presetLabel, setPresetLabel] = useState('');
  const intervalRef = useRef<number | null>(null);

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (mode === 'countdown' || mode === 'pomodoro') {
          if (s <= 1) {
            setRunning(false);
            // Save session
            const startSec = mode === 'pomodoro' ? 25 * 60 : customMin * 60;
            saveSession(startSec);
            if (onGainXp) onGainXp(10, 'Completed a focus session');
            return mode === 'pomodoro' ? 25 * 60 : customMin * 60;
          }
          return s - 1;
        }
        return s + 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, customMin]);

  const saveSession = (durationSec: number) => {
    const session: StudySession = {
      id: `s${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      durationSec,
      method: mode,
      completed: true,
    };
    setSessions((prev) => [session, ...prev].slice(0, 50));
  };

  const startTimer = () => {
    if (mode === 'countdown') {
      const total = (inputH * 3600) + (inputM * 60) + inputS;
      const clamped = Math.max(60, Math.min(86400, total || 60));
      setSeconds(clamped);
      setCustomMin(Math.floor(clamped / 60));
    } else if (mode === 'pomodoro') {
      setSeconds(25 * 60);
    } else {
      setSeconds(0);
    }
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    if (mode === 'pomodoro') {
      setSeconds(25 * 60);
      setInputH(0); setInputM(25); setInputS(0);
    } else if (mode === 'countdown') {
      const total = (inputH * 3600) + (inputM * 60) + inputS;
      const clamped = Math.max(60, Math.min(86400, total || 60));
      setSeconds(clamped);
      setCustomMin(Math.floor(clamped / 60));
    } else {
      setSeconds(0);
    }
  };

  const savePreset = () => {
    if (!presetLabel.trim()) return;
    const p: TimerPreset = {
      id: `p${Date.now()}`,
      label: presetLabel.trim(),
      seconds: customMin * 60,
      type: mode === 'pomodoro' ? 'pomodoro' : 'countdown',
    };
    setPresets((prev) => [...prev, p]);
    setPresetLabel('');
  };

  const applyPreset = (p: TimerPreset) => {
    setMode(p.type === 'pomodoro' ? 'pomodoro' : 'countdown');
    setSeconds(p.seconds);
    if (p.type === 'countdown') {
      const h = Math.floor(p.seconds / 3600);
      const m = Math.floor((p.seconds % 3600) / 60);
      const s = p.seconds % 60;
      setInputH(h); setInputM(m); setInputS(s);
      setCustomMin(Math.floor(p.seconds / 60));
    }
    setRunning(false);
    setShowPresets(false);
  };

  const clampInput = (val: number, max: number) => Math.max(0, Math.min(max, isNaN(val) ? 0 : val));
  const onHChange = (v: number) => { setInputH(clampInput(v, 23)); syncCountdown(); };
  const onMChange = (v: number) => { setInputM(clampInput(v, 59)); syncCountdown(); };
  const onSChange = (v: number) => { setInputS(clampInput(v, 59)); syncCountdown(); };
  const syncCountdown = () => {
    if (mode === 'countdown' && !running) {
      const total = (inputH * 3600) + (inputM * 60) + inputS;
      const clamped = Math.max(60, Math.min(86400, total || 60));
      setSeconds(clamped);
      setCustomMin(Math.floor(clamped / 60));
    }
  };
  const quickAdd = (mins: number) => {
    const newM = Math.min(59, inputM + mins);
    const carryH = inputH + Math.floor((inputM + mins) / 60);
    setInputM(newM);
    setInputH(Math.min(23, carryH));
    syncCountdown();
  };

  const totalSec = mode === 'pomodoro' ? 25 * 60 : mode === 'countdown' ? Math.max(60, Math.min(86400, (inputH * 3600) + (inputM * 60) + inputS)) : 0;
  const progress = totalSec > 0 ? ((totalSec - seconds) / totalSec) * 100 : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Timer card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Timer size={18} />
            <p className="font-bold">Study Timer</p>
          </div>
          <div className="flex gap-1 bg-white/20 rounded-full p-1">
            {(['pomodoro', 'countdown', 'stopwatch'] as TimerMode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); reset(); }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${mode === m ? 'bg-white text-indigo-600' : 'text-white/70'}`}>
                {m === 'pomodoro' ? 'Pomodoro' : m === 'countdown' ? 'Countdown' : 'Free'}
              </button>
            ))}
          </div>
        </div>

        {/* Timer display */}
        <div className="relative w-48 h-48 mx-auto mb-4">
          <svg width="192" height="192" className="-rotate-90">
            <circle cx="96" cy="96" r="84" fill="none" strokeWidth="10" stroke="rgba(255,255,255,0.15)" />
            {totalSec > 0 && (
              <circle cx="96" cy="96" r="84" fill="none" strokeWidth="10" stroke="white" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 84} strokeDashoffset={2 * Math.PI * 84 * (1 - progress / 100)}
                className="transition-all duration-1000" />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-extrabold tabular-nums">{fmtTime(seconds)}</p>
            <p className="text-xs text-white/70 capitalize">{mode}</p>
          </div>
        </div>

        {/* Direct H:M:S input for countdown */}
        {mode === 'countdown' && (
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TimeField label="Hours" value={inputH} onChange={onHChange} max={23} disabled={running} />
              <span className="text-2xl font-bold text-white/40">:</span>
              <TimeField label="Minutes" value={inputM} onChange={onMChange} max={59} disabled={running} />
              <span className="text-2xl font-bold text-white/40">:</span>
              <TimeField label="Seconds" value={inputS} onChange={onSChange} max={59} disabled={running} />
            </div>
            <div className="flex gap-1.5 justify-center flex-wrap">
              {[5, 15, 30, 60].map((m) => (
                <button key={m} onClick={() => quickAdd(m)} disabled={running}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/15 active:scale-95 transition-transform disabled:opacity-30">
                  +{m >= 60 ? `${m / 60}h` : `${m}m`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2 mb-3">
          <button onClick={() => running ? setRunning(false) : startTimer()}
            className="flex-1 bg-white text-indigo-600 font-bold py-3 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2">
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button onClick={reset} className="w-14 bg-white/20 rounded-2xl flex items-center justify-center active:scale-95 transition-transform">
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setShowPresets(!showPresets)} className="flex-1 bg-white/15 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1">
            <Save size={12} /> Presets
          </button>
          <button onClick={() => setShowHistory(!showHistory)} className="flex-1 bg-white/15 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1">
            <History size={12} /> History
          </button>
        </div>
      </div>

      {/* Presets panel */}
      {showPresets && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg animate-slide-up">
          <p className="font-bold text-sm mb-3">Saved Presets</p>
          <div className="flex gap-2 mb-3">
            <input value={presetLabel} onChange={(e) => setPresetLabel(e.target.value)} placeholder="Preset name..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm outline-none" />
            <button onClick={savePreset} className="bg-indigo-500 text-white px-4 rounded-xl text-sm font-bold active:scale-95">Save</button>
          </div>
          <div className="space-y-2">
            {presets.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No saved presets yet</p>}
            {presets.map((p) => (
              <button key={p.id} onClick={() => applyPreset(p)}
                className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 active:scale-95 transition-transform">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-indigo-500" />
                  <span className="text-sm font-bold">{p.label}</span>
                </div>
                <span className="text-xs text-gray-400">{Math.floor(p.seconds / 60)}min · {p.type}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History panel */}
      {showHistory && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg animate-slide-up">
          <p className="font-bold text-sm mb-3">Session History</p>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {sessions.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No sessions yet</p>}
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  <div>
                    <p className="text-sm font-bold capitalize">{s.method}</p>
                    <p className="text-xs text-gray-400">{s.date}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-500">{Math.floor(s.durationSec / 60)}min</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study tasks */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <p className="font-bold flex items-center gap-2"><BookOpen size={18} className="text-indigo-500" /> Study Sessions</p>
          <span className="text-xs text-gray-400">{completed}/{tasks.length} done</span>
        </div>
        <div className="space-y-2">
          {tasks.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No study sessions today</p>}
          {tasks.map((t) => (
            <button key={t.id} onClick={() => onToggleTask(t.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-95 ${t.completed ? 'bg-green-50 dark:bg-green-950/30' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${t.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
                {t.completed && <Check size={14} className="text-white" />}
              </div>
              <div className="flex-1 text-left">
                <p className={`font-semibold text-sm ${t.completed ? 'line-through text-gray-400' : ''}`}>{t.title}</p>
                <p className="text-xs text-gray-400">{t.startTime} - {t.endTime} · +{t.xp} XP</p>
              </div>
              {t.rescheduled && <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">moved</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- METHODS VIEW — interactive ---- */
function MethodsView({ onGainXp }: { onGainXp?: (xp: number, label: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [activeMethod, setActiveMethod] = useState<typeof STUDY_METHODS[0] | null>(null);

  const method = STUDY_METHODS.find((m) => m.id === selected);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={18} className="text-indigo-500" />
          <p className="font-bold">Study Methods</p>
        </div>
        <p className="text-xs text-gray-400 mb-3">Tap a method to learn how it works and start a guided session.</p>
        <div className="grid grid-cols-2 gap-3">
          {STUDY_METHODS.map((m) => (
            <button key={m.id} onClick={() => setSelected(m.id)}
              className={`p-4 rounded-2xl text-left transition-all active:scale-95 ${selected === m.id ? `bg-gradient-to-br ${m.color} text-white shadow-lg` : 'bg-gray-50 dark:bg-gray-800'}`}>
              <span className="text-3xl block mb-1">{m.icon}</span>
              <p className={`font-bold text-sm ${selected === m.id ? 'text-white' : ''}`}>{m.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Method detail */}
      {method && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center text-2xl`}>
              {method.icon}
            </div>
            <div>
              <p className="font-bold">{method.name}</p>
              <p className="text-xs text-gray-400">Interactive study method</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{method.description}</p>

          <p className="font-bold text-sm mb-2">How it works:</p>
          <div className="space-y-2 mb-4">
            {method.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/30 text-indigo-500 font-bold text-xs flex items-center justify-center flex-shrink-0">{i + 1}</div>
                {step}
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl p-3 mb-4">
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">Auto Configuration</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-gray-400">Focus:</span> <b>{method.config.focusMin}min</b></div>
              <div><span className="text-gray-400">Break:</span> <b>{method.config.breakMin}min</b></div>
              <div><span className="text-gray-400">Long break:</span> <b>{method.config.longBreakMin}min</b></div>
              <div><span className="text-gray-400">Cycles:</span> <b>{method.config.cycles}</b></div>
            </div>
          </div>

          <button onClick={() => { setActiveMethod(method); if (onGainXp) onGainXp(5, 'Started a study method'); }}
            className={`w-full bg-gradient-to-r ${method.color} text-white font-bold py-3.5 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2`}>
            <Play size={16} /> Start {method.name} Session
          </button>
        </div>
      )}

      {/* Active method animation */}
      {activeMethod && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg animate-slide-up text-center">
          <div className="text-5xl mb-3 animate-pulse">{activeMethod.icon}</div>
          <p className="font-bold mb-1">{activeMethod.name} active</p>
          <p className="text-xs text-white/70 mb-4">Focus for {activeMethod.config.focusMin} minutes, then take a {activeMethod.config.breakMin} minute break.</p>
          <button onClick={() => setActiveMethod(null)} className="bg-white/20 text-white font-bold py-2 px-6 rounded-full text-sm">End Session</button>
        </div>
      )}
    </div>
  );
}

/* ---- PLAN VIEW — editable subjects, daily target ---- */
function PlanView({ profile, game, onUpdateProfile }: { profile: UserProfile; game: GameState; onUpdateProfile: (patch: Partial<UserProfile>) => void }) {
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', weight: 5, recommendedMinutes: 30, difficulty: 'medium' as 'easy' | 'medium' | 'hard' });
  const [editingTarget, setEditingTarget] = useState(false);
  const [target, setTarget] = useState(profile.dailyTarget || { studyMinutes: 120, exercises: 5, chapters: 2, reviews: 3, customGoal: '' });

  const addSubject = () => {
    if (!newSubject.name.trim()) return;
    const s: StudySubject = {
      id: `s${Date.now()}`,
      name: newSubject.name.trim(),
      goal: '',
      level: 'Beginner',
      difficulty: newSubject.difficulty,
      priority: false,
      weight: newSubject.weight,
      recommendedMinutes: newSubject.recommendedMinutes,
    };
    onUpdateProfile({ study: { ...profile.study, subjects: [...profile.study.subjects, s] } });
    setNewSubject({ name: '', weight: 5, recommendedMinutes: 30, difficulty: 'medium' });
    setShowAddSubject(false);
  };

  const removeSubject = (id: string) => {
    onUpdateProfile({ study: { ...profile.study, subjects: profile.study.subjects.filter((s) => s.id !== id) } });
  };

  const togglePriority = (id: string) => {
    onUpdateProfile({
      study: {
        ...profile.study,
        subjects: profile.study.subjects.map((s) => s.id === id ? { ...s, priority: !s.priority } : s),
      },
    });
  };

  const updateWeight = (id: string, delta: number) => {
    onUpdateProfile({
      study: {
        ...profile.study,
        subjects: profile.study.subjects.map((s) => s.id === id ? { ...s, weight: Math.max(1, Math.min(10, s.weight + delta)) } : s),
      },
    });
  };

  const updateMinutes = (id: string, delta: number) => {
    onUpdateProfile({
      study: {
        ...profile.study,
        subjects: profile.study.subjects.map((s) => s.id === id ? { ...s, recommendedMinutes: Math.max(5, s.recommendedMinutes + delta) } : s),
      },
    });
  };

  const moveSubject = (id: string, dir: 'up' | 'down') => {
    const subjects = [...profile.study.subjects];
    const idx = subjects.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= subjects.length) return;
    [subjects[idx], subjects[swap]] = [subjects[swap], subjects[idx]];
    onUpdateProfile({ study: { ...profile.study, subjects } });
  };

  const saveTarget = () => {
    onUpdateProfile({ dailyTarget: target });
    setEditingTarget(false);
  };

  // AI suggestion for time division
  const totalWeight = profile.study.subjects.reduce((sum, s) => sum + s.weight, 0);
  const totalMinutes = profile.study.subjects.reduce((sum, s) => sum + s.recommendedMinutes, 0);
  const suggestedDivision = profile.study.subjects.map((s) => ({
    name: s.name,
    pct: totalWeight > 0 ? Math.round((s.weight / totalWeight) * 100) : 0,
    minutes: s.recommendedMinutes,
  }));

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Daily Target */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-indigo-500" />
            <p className="font-bold">Daily Target</p>
          </div>
          <button onClick={() => setEditingTarget(!editingTarget)} className="text-xs text-indigo-500 font-bold">
            {editingTarget ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {!editingTarget ? (
          <div className="grid grid-cols-2 gap-3">
            <TargetItem label="Study time" value={`${target.studyMinutes} min`} icon={<Clock size={14} />} />
            <TargetItem label="Exercises" value={`${target.exercises}`} icon={<Zap size={14} />} />
            <TargetItem label="Chapters" value={`${target.chapters}`} icon={<BookOpen size={14} />} />
            <TargetItem label="Reviews" value={`${target.reviews}`} icon={<Repeat size={14} />} />
            {target.customGoal && <div className="col-span-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl p-3"><p className="text-xs text-gray-400">Custom</p><p className="text-sm font-bold">{target.customGoal}</p></div>}
          </div>
        ) : (
          <div className="space-y-3">
            <TargetEditor label="Study minutes" value={target.studyMinutes} onChange={(v) => setTarget({ ...target, studyMinutes: v })} step={15} min={0} max={720} />
            <TargetEditor label="Exercises" value={target.exercises} onChange={(v) => setTarget({ ...target, exercises: v })} step={1} min={0} max={50} />
            <TargetEditor label="Chapters" value={target.chapters} onChange={(v) => setTarget({ ...target, chapters: v })} step={1} min={0} max={20} />
            <TargetEditor label="Reviews" value={target.reviews} onChange={(v) => setTarget({ ...target, reviews: v })} step={1} min={0} max={20} />
            <input value={target.customGoal} onChange={(e) => setTarget({ ...target, customGoal: e.target.value })} placeholder="Custom goal..."
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm outline-none" />
            <button onClick={saveTarget} className="w-full bg-indigo-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform">Save Target</button>
          </div>
        )}
      </div>

      {/* Priority Subjects */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold">Priority Subjects</p>
          <button onClick={() => setShowAddSubject(!showAddSubject)} className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center active:scale-90">
            <Plus size={16} />
          </button>
        </div>

        {showAddSubject && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-3 animate-slide-up">
            <input value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} placeholder="Subject name..."
              className="w-full bg-white dark:bg-gray-900 rounded-xl px-3 py-2 text-sm outline-none mb-3" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Importance (1-10)</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setNewSubject({ ...newSubject, weight: Math.max(1, newSubject.weight - 1) })} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700">−</button>
                  <span className="font-bold flex-1 text-center">{newSubject.weight}</span>
                  <button onClick={() => setNewSubject({ ...newSubject, weight: Math.min(10, newSubject.weight + 1) })} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700">+</button>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Minutes</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setNewSubject({ ...newSubject, recommendedMinutes: Math.max(5, newSubject.recommendedMinutes - 5) })} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700">−</button>
                  <span className="font-bold flex-1 text-center">{newSubject.recommendedMinutes}</span>
                  <button onClick={() => setNewSubject({ ...newSubject, recommendedMinutes: Math.min(240, newSubject.recommendedMinutes + 5) })} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700">+</button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} onClick={() => setNewSubject({ ...newSubject, difficulty: d })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold ${newSubject.difficulty === d ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>{d}</button>
              ))}
            </div>
            <button onClick={addSubject} className="w-full bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm active:scale-95">Add Subject</button>
          </div>
        )}

        <div className="space-y-2">
          {profile.study.subjects.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No subjects added</p>}
          {profile.study.subjects.map((s, i) => (
            <div key={s.id} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex flex-col">
                  <button onClick={() => moveSubject(s.id, 'up')} disabled={i === 0} className="text-gray-300 disabled:opacity-30"><ChevronUp size={14} /></button>
                  <button onClick={() => moveSubject(s.id, 'down')} disabled={i === profile.study.subjects.length - 1} className="text-gray-300 disabled:opacity-30"><ChevronDown size={14} /></button>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400">Level: {s.level}</p>
                </div>
                <button onClick={() => togglePriority(s.id)} className={`w-8 h-8 rounded-full flex items-center justify-center ${s.priority ? 'bg-orange-100 text-orange-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                  <Flame size={14} />
                </button>
                <button onClick={() => removeSubject(s.id)} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center gap-3 pl-8">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">Importance</span>
                  <button onClick={() => updateWeight(s.id, -1)} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs">−</button>
                  <span className="text-xs font-bold w-4 text-center">{s.weight}</span>
                  <button onClick={() => updateWeight(s.id, 1)} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs">+</button>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">Min</span>
                  <button onClick={() => updateMinutes(s.id, -5)} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs">−</button>
                  <span className="text-xs font-bold w-8 text-center">{s.recommendedMinutes}</span>
                  <button onClick={() => updateMinutes(s.id, 5)} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs">+</button>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${s.difficulty === 'hard' ? 'bg-red-100 text-red-600' : s.difficulty === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{s.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI suggestion */}
      {profile.study.subjects.length > 0 && (
        <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} />
            <p className="font-bold">AI Time Suggestion</p>
          </div>
          <p className="text-xs text-white/80 mb-3">Based on importance weights, here's a balanced division of your {totalMinutes} minutes:</p>
          <div className="space-y-2">
            {suggestedDivision.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold">{d.name}</span>
                  <span>{d.pct}% · {d.minutes}min</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Preferences - editable */}
      <StudyPreferences profile={profile} onUpdateProfile={onUpdateProfile} />
    </div>
  );
}

function TargetItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
      <div className="flex items-center gap-1.5 mb-1 text-gray-400">{icon}<span className="text-xs">{label}</span></div>
      <p className="font-extrabold">{value}</p>
    </div>
  );
}

function TargetEditor({ label, value, onChange, step, min, max }: { label: string; value: number; onChange: (v: number) => void; step: number; min: number; max: number }) {
  return (
    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
      <span className="text-sm font-semibold">{label}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(min, value - step))} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 font-bold">−</button>
        <span className="font-extrabold w-10 text-center">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + step))} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 font-bold">+</button>
      </div>
    </div>
  );
}

/* ---- STATS VIEW ---- */
function TimeField({ label, value, onChange, max, disabled }: { label: string; value: number; onChange: (v: number) => void; max: number; disabled: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        disabled={disabled}
        min={0}
        max={max}
        className="w-16 text-center text-2xl font-extrabold bg-white/15 rounded-2xl py-2 outline-none focus:ring-2 ring-white/50 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
      />
      <span className="text-[10px] text-white/60 mt-0.5">{label}</span>
    </div>
  );
}

function StatsView({ game, studyHours, completed }: { game: GameState; studyHours: number; completed: number }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
        <p className="font-bold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-500" /> Study Progress</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-indigo-500">{studyHours}h</p>
            <p className="text-xs text-gray-400">Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-cyan-500">{completed}</p>
            <p className="text-xs text-gray-400">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-amber-500">{game.streak}</p>
            <p className="text-xs text-gray-400">Day streak</p>
          </div>
        </div>
        <div className="flex items-end justify-between h-24 gap-1.5">
          {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, studyHours > 0 ? Math.min(1, studyHours / 4) : 0.1].map((h, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-t-lg transition-all" style={{ height: `${h * 100}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
        </div>
      </div>
    </div>
  );
}

function StudyPreferences({ profile, onUpdateProfile }: { profile: UserProfile; onUpdateProfile: (patch: Partial<UserProfile>) => void }) {
  const [editing, setEditing] = useState(false);
  const [goal, setGoal] = useState(profile.study.goalType || 'General study');
  const [level, setLevel] = useState(profile.study.currentLevel || '');
  const [hours, setHours] = useState(profile.study.hoursPerDay || 2);

  const goals = ['General study', 'Exam prep', 'Language learning', 'Skill building', 'Career growth', 'Academic degree'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const save = () => {
    onUpdateProfile({
      study: { ...profile.study, goalType: goal, currentLevel: level, hoursPerDay: String(hours) },
    });
    setEditing(false);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-indigo-500" />
          <p className="font-bold">Study Preferences</p>
        </div>
        <button onClick={() => { setEditing(!editing); setGoal(profile.study.goalType || 'General study'); setLevel(profile.study.currentLevel || ''); setHours(profile.study.hoursPerDay || 2); }}
          className="text-xs font-bold text-indigo-500 flex items-center gap-1">
          {editing ? <><X size={12} /> Cancel</> : <><Edit2 size={12} /> Edit</>}
        </button>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-1.5">Goal</p>
            <div className="flex flex-wrap gap-1.5">
              {goals.map((g) => (
                <button key={g} onClick={() => setGoal(g)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${goal === g ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-1.5">Current Level</p>
            <div className="flex flex-wrap gap-1.5">
              {levels.map((l) => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${level === l ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-400 font-semibold">Daily Target</p>
              <p className="text-sm font-extrabold text-indigo-500">{hours}h</p>
            </div>
            <input type="range" min={0.5} max={8} step={0.5} value={hours} onChange={(e) => setHours(parseFloat(e.target.value))} className="w-full" />
          </div>
          <button onClick={save} className="w-full bg-indigo-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm">
            <Check size={16} /> Save Preferences
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400">Goal</p>
            <p className="font-bold">{profile.study.goalType || 'General study'}</p>
            {profile.study.examDate && <p className="text-sm text-gray-400 mt-0.5">Exam: {profile.study.examDate}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-3">
              <p className="text-xs text-gray-400">Daily target</p>
              <p className="font-extrabold text-lg">{profile.study.hoursPerDay}h</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-3">
              <p className="text-xs text-gray-400">Level</p>
              <p className="font-extrabold text-lg">{profile.study.currentLevel || '—'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
