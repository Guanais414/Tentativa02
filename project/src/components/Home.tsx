import { useState } from 'react';
import type { UserProfile, GameState, RoutineTask, MealSuggestion, AppSettings } from '../types';
import { Mascot } from './Mascot';
import { Achievements } from './Achievements';
import { xpForLevel } from '../store';
import { Droplets, Flame, Star, Zap, Moon, Smile, ChevronRight, Sparkles, Leaf, Map, Trophy, User, ShoppingBag, Award } from 'lucide-react';

interface Props {
  profile: UserProfile;
  game: GameState;
  settings: AppSettings;
  tasks: RoutineTask[];
  meals: MealSuggestion[];
  waterMl: number;
  mood: number;
  onNavigate: (s: string) => void;
  onGainXp: (amount: number, label?: string) => void;
}

const ACHIEVEMENT_PREVIEW = [
  { id: 'first_task', title: 'First Steps', icon: '🎯' },
  { id: 'first_study', title: 'Bookworm', icon: '📚' },
  { id: 'streak_3', title: 'On Fire', icon: '🔥' },
  { id: 'study_10', title: 'Scholar', icon: '🎓' },
  { id: 'streak_7', title: 'Warrior', icon: '🏆' },
  { id: 'level_10', title: 'Rising Star', icon: '⭐' },
  { id: 'first_letter', title: 'Letter', icon: '🎋' },
  { id: 'reply_5', title: 'Kind Soul', icon: '💌' },
];

export function Home({ profile, game, settings, tasks, meals, waterMl, mood, onNavigate, onGainXp }: Props) {
  const [showAchievements, setShowAchievements] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const now = new Date().toTimeString().slice(0, 5);
  const nextTask = tasks.find((t) => !t.completed && t.startTime >= now) || tasks.find((t) => !t.completed);
  const nextMeal = meals.find((m) => !m.completed && m.time >= now) || meals.find((m) => !m.completed);

  const studyHours = tasks.filter((t) => t.category === 'study' && t.completed).length * 0.5;
  const xpInLevel = game.xp;
  const xpNeeded = xpForLevel(game.level);
  const xpPct = Math.min(100, (xpInLevel / xpNeeded) * 100);

  const waterPct = Math.min(100, (waterMl / settings.waterGoalMl) * 100);
  const moodLabel = mood >= 8 ? 'Great' : mood >= 6 ? 'Good' : mood >= 4 ? 'Okay' : mood >= 2 ? 'Low' : 'Down';
  const moodColor = mood >= 6 ? 'text-amber-500' : 'text-gray-400';

  return (
    <div className="px-4 pt-6 pb-4 space-y-4 max-w-md mx-auto">
      {/* Greeting */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{greeting}</p>
          <h1 className="text-2xl font-extrabold">{profile.personal.name}</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5 rounded-full">
          <Flame size={16} className="text-amber-500" />
          <span className="font-bold text-amber-600 dark:text-amber-400">{game.streak}</span>
        </div>
      </div>

      {/* Level card */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-sm">
              {game.level}
            </div>
            <div>
              <p className="font-bold text-sm">Level {game.level}</p>
              <p className="text-xs text-gray-400">{xpInLevel} / {xpNeeded} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/40 px-3 py-1.5 rounded-full">
            <Star size={16} className="text-yellow-500" />
            <span className="font-bold text-sm text-yellow-600 dark:text-yellow-400">{game.coins}</span>
          </div>
        </div>
        <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: `${xpPct}%` }} />
        </div>
      </div>

      {/* Productivity ring */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg flex items-center gap-4 animate-slide-up">
        <ProgressRing value={productivity} size={72} />
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Productivity</p>
          <p className="text-2xl font-extrabold">{productivity}%</p>
          <p className="text-xs text-gray-400">{completedTasks} of {totalTasks} tasks done</p>
        </div>
        <Mascot type={profile.mascot} size={56} mood={productivity > 60 ? 'excited' : 'neutral'} />
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Zap size={18} className="text-indigo-500" />} label="Study" value={`${studyHours}h`} bg="bg-indigo-50 dark:bg-indigo-950/40" onClick={() => onNavigate('studies')} />
        <StatCard icon={<Droplets size={18} className="text-cyan-500" />} label="Water" value={`${waterMl}ml`} sub={`/${settings.waterGoalMl}ml`} bg="bg-cyan-50 dark:bg-cyan-950/40" onClick={() => onNavigate('health')} />
        <StatCard icon={<Moon size={18} className="text-purple-500" />} label="Sleep" value="7h45" bg="bg-purple-50 dark:bg-purple-950/40" onClick={() => onNavigate('health')} />
        <StatCard icon={<Smile size={18} className="text-amber-500" />} label="Mood" value={moodLabel} bg="bg-amber-50 dark:bg-amber-950/40" onClick={() => onNavigate('health')} />
      </div>

      {/* Bamboo Forest community card */}
      <button onClick={() => onNavigate('bamboo')} className="w-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-5 text-white shadow-lg shadow-green-500/30 active:scale-[0.98] transition-transform text-left animate-slide-up flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Leaf size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold">Bamboo Forest</p>
          <p className="text-sm text-white/80">Share how your day went. Someone will reply with kindness.</p>
        </div>
        <ChevronRight size={20} className="text-white/60" />
      </button>

      {/* Forest map card */}
      <button onClick={() => onNavigate('map')} className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg active:scale-[0.98] transition-transform text-left animate-slide-up flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
          <Map size={22} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">Watch Your Pet</p>
          <p className="text-xs text-gray-400">Observe your pet exploring the garden freely</p>
        </div>
        <ChevronRight size={20} className="text-gray-300" />
      </button>

      {/* Quick access row for other screens */}
      <div className="grid grid-cols-3 gap-2">
        <QuickCard icon={<Sparkles size={18} className="text-pink-500" />} label="Pet" onClick={() => onNavigate('mascot')} />
        <QuickCard icon={<Trophy size={18} className="text-yellow-500" />} label="Ranks" onClick={() => onNavigate('leaderboard')} />
        <QuickCard icon={<User size={18} className="text-blue-500" />} label="Profile" onClick={() => onNavigate('profile')} />
      </div>

      {/* Achievements section — integrated from removed Awards tab */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            <p className="font-bold text-sm">Achievements</p>
          </div>
          <button onClick={() => setShowAchievements(true)} className="text-xs font-bold text-indigo-500 flex items-center gap-0.5">
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {ACHIEVEMENT_PREVIEW.map((a, i) => {
            const unlocked = game.achievements.includes(a.id) || (i === 0 && game.level >= 1);
            return (
              <div key={a.id} className={`flex-shrink-0 w-16 text-center ${unlocked ? '' : 'opacity-40'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto ${unlocked ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-gray-100 dark:bg-gray-800 grayscale'}`}>
                  {unlocked ? a.icon : '🔒'}
                </div>
                <p className="text-[9px] font-bold text-gray-400 mt-1 truncate">{a.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Water progress bar */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg animate-slide-up">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-bold flex items-center gap-1.5"><Droplets size={16} className="text-cyan-500" /> Hydration</span>
          <span className="text-gray-400">{waterMl} / {settings.waterGoalMl} ml</span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${waterPct}%` }} />
        </div>
      </div>

      {/* Next task */}
      {nextTask && (
        <button onClick={() => onNavigate('agenda')} className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg flex items-center gap-3 active:scale-[0.98] transition-transform text-left animate-slide-up">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-indigo-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Next task</p>
            <p className="font-bold">{nextTask.title}</p>
            <p className="text-sm text-gray-400">{nextTask.startTime} - {nextTask.endTime}</p>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </button>
      )}

      {/* Next meal */}
      {nextMeal && (
        <button onClick={() => onNavigate('health')} className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg flex items-center gap-3 active:scale-[0.98] transition-transform text-left animate-slide-up">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center flex-shrink-0">
            <Droplets size={18} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Next meal</p>
            <p className="font-bold">{nextMeal.name}</p>
            <p className="text-sm text-gray-400">{nextMeal.time} · {nextMeal.calories} kcal</p>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </button>
      )}

      {/* Weekly challenge teaser */}
      <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-3xl p-5 text-white shadow-lg shadow-indigo-500/30 animate-slide-up">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} />
          <p className="font-bold">Weekly Challenge</p>
        </div>
        {game.weeklyChallenges.slice(0, 1).map((c) => (
          <div key={c.id}>
            <p className="text-sm text-white/80">{c.title}</p>
            <div className="flex justify-between text-xs mt-2 mb-1">
              <span>{c.progress} / {c.target}</span>
              <span className="font-bold">+{c.reward} coins</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, (c.progress / c.target) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Achievements modal */}
      {showAchievements && <Achievements game={game} onClose={() => setShowAchievements(false)} onGainXp={onGainXp} />}
    </div>
  );
}

function QuickCard({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-sm active:scale-95 transition-transform">
      {icon}
      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value, sub, bg, onClick }: { icon: React.ReactNode; label: string; value: string; sub?: string; bg: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`${bg} rounded-3xl p-4 shadow-sm active:scale-95 transition-transform text-left`}>
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-xs text-gray-400 font-semibold">{label}</span></div>
      <p className="text-xl font-extrabold">{value} {sub && <span className="text-xs text-gray-400 font-normal">{sub}</span>}</p>
    </button>
  );
}

function ProgressRing({ value, size }: { value: number; size: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-gray-200 dark:stroke-gray-800" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} stroke="url(#grad)" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-700" />
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="rotate-90 fill-current font-extrabold text-sm" style={{ transformOrigin: 'center' }}>{value}%</text>
    </svg>
  );
}
