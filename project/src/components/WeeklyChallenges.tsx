import { useState } from 'react';
import type { GameState } from '../types';
import { X, Target, Star, Sparkles, TrendingUp, Flame, Zap, Droplets, BookOpen, Heart, Trophy, Clock } from 'lucide-react';

interface Props {
  game: GameState;
  onClose: () => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  icon: string;
  target: number;
  unit: string;
  reward: { xp: number; coins: number };
}

const CHALLENGES: Challenge[] = [
  { id: 'wc1', title: 'Study Sprint', description: 'Complete 5 study sessions this week', difficulty: 'easy', icon: '📚', target: 5, unit: 'sessions', reward: { xp: 100, coins: 50 } },
  { id: 'wc2', title: 'Hydration Challenge', description: 'Drink 14L of water this week', difficulty: 'easy', icon: '💧', target: 14000, unit: 'ml', reward: { xp: 80, coins: 40 } },
  { id: 'wc3', title: 'Habit Builder', description: 'Complete 15 habits this week', difficulty: 'medium', icon: '✨', target: 15, unit: 'habits', reward: { xp: 150, coins: 75 } },
  { id: 'wc4', title: 'Task Terminator', description: 'Complete 25 tasks this week', difficulty: 'medium', icon: '⚡', target: 25, unit: 'tasks', reward: { xp: 200, coins: 100 } },
  { id: 'wc5', title: 'Forest Guardian', description: 'Send 3 letters in Bamboo Forest', difficulty: 'hard', icon: '🎋', target: 3, unit: 'letters', reward: { xp: 250, coins: 150 } },
  { id: 'wc6', title: 'Perfect Week', description: 'Maintain a 7-day streak', difficulty: 'hard', icon: '🔥', target: 7, unit: 'days', reward: { xp: 300, coins: 200 } },
];

const DIFFICULTY_INFO: Record<Difficulty, { label: string; color: string; bg: string; ring: string }> = {
  easy: { label: 'Easy', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-950/30', ring: 'ring-green-200 dark:ring-green-800' },
  medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-950/30', ring: 'ring-amber-200 dark:ring-amber-800' },
  hard: { label: 'Hard', color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-950/30', ring: 'ring-rose-200 dark:ring-rose-800' },
};

export function WeeklyChallenges({ game, onClose }: Props) {
  const [filter, setFilter] = useState<Difficulty | 'all'>('all');

  // Map game's weeklyChallenges to our challenge definitions
  const getProgress = (challengeId: string): number => {
    const gs = game.weeklyChallenges.find((c) => c.id === challengeId);
    if (gs) return gs.progress;
    // Fallback approximations
    if (challengeId === 'wc6') return Math.min(7, game.streak);
    return 0;
  };

  const isCompleted = (challengeId: string): boolean => {
    const gs = game.weeklyChallenges.find((c) => c.id === challengeId);
    return gs?.completed || false;
  };

  const filtered = filter === 'all' ? CHALLENGES : CHALLENGES.filter((c) => c.difficulty === filter);
  const completedCount = CHALLENGES.filter((c) => isCompleted(c.id)).length;
  const totalRewardXp = CHALLENGES.filter((c) => isCompleted(c.id)).reduce((s, c) => s + c.reward.xp, 0);
  const totalRewardCoins = CHALLENGES.filter((c) => isCompleted(c.id)).reduce((s, c) => s + c.reward.coins, 0);

  // Days until reset (assuming weekly reset on Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilReset = dayOfWeek === 0 ? 1 : 7 - dayOfWeek;
  const hoursUntilReset = daysUntilReset * 24 - now.getHours();

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto no-scrollbar animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={22} className="text-indigo-500" />
              <h2 className="text-xl font-extrabold">Weekly Challenges</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          {/* Reset timer */}
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl px-3 py-2 mb-3">
            <Clock size={14} className="text-indigo-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Resets in <span className="font-bold text-indigo-600">{daysUntilReset}d {hoursUntilReset % 24}h</span></p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl p-2 text-center">
              <p className="text-lg font-extrabold text-indigo-600">{completedCount}/{CHALLENGES.length}</p>
              <p className="text-[10px] text-gray-400">Completed</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-2 text-center">
              <p className="text-lg font-extrabold text-amber-600">{totalRewardXp}</p>
              <p className="text-[10px] text-gray-400">XP to earn</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl p-2 text-center">
              <p className="text-lg font-extrabold text-yellow-600">{totalRewardCoins}</p>
              <p className="text-[10px] text-gray-400">Coins to earn</p>
            </div>
          </div>

          {/* Difficulty filter */}
          <div className="flex gap-1.5">
            <button onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
              All
            </button>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button key={d} onClick={() => setFilter(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === d ? `bg-${d === 'easy' ? 'green' : d === 'medium' ? 'amber' : 'rose'}-500 text-white` : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                {DIFFICULTY_INFO[d].label}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge list */}
        <div className="p-4 space-y-3">
          {filtered.map((c) => {
            const diff = DIFFICULTY_INFO[c.difficulty];
            const progress = getProgress(c.id);
            const completed = isCompleted(c.id);
            const pct = Math.min(100, (progress / c.target) * 100);
            return (
              <div key={c.id} className={`rounded-3xl p-4 shadow-sm transition-all ${completed ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 ring-1 ring-green-200 dark:ring-green-800' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${completed ? 'bg-white dark:bg-gray-900 shadow-md' : diff.bg}`}>
                    {completed ? '✅' : c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold text-sm ${completed ? 'text-green-700 dark:text-green-400' : ''}`}>{c.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${diff.bg} ${diff.color}`}>{diff.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{c.description}</p>
                    {/* Progress bar */}
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${completed ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-indigo-400 to-cyan-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-gray-400 font-semibold">{progress} / {c.target} {c.unit}</span>
                      <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                        <Star size={10} /> {c.reward.xp} · <Sparkles size={10} /> {c.reward.coins}
                      </span>
                    </div>
                  </div>
                </div>
                {completed && (
                  <div className="mt-2 flex items-center gap-1 text-xs font-bold text-green-600">
                    <Trophy size={12} /> Challenge completed! Rewards claimed.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
