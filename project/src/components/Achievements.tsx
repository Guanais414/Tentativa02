import { useState, useEffect, useRef } from 'react';
import type { GameState, AchievementTier } from '../types';
import { Trophy, Star, Flame, Zap, Droplets, BookOpen, Heart, Target, Crown, Lock, Check, Sparkles, Award, TrendingUp, X, Gem, Shield, Medal } from 'lucide-react';
import { useConfetti, ConfettiLayer } from './Dopamine';
import { playSoundEffect } from './AmbientMusic';

interface Props {
  game: GameState;
  onClose: () => void;
  onGainXp: (amount: number, label?: string) => void;
}

type Category = 'study' | 'health' | 'streak' | 'social' | 'productivity' | 'special' | 'secret';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: Category;
  tier: AchievementTier;
  icon: string;
  target: number;
  reward: { xp: number; coins: number; title?: string };
  secret?: boolean;
}

const TIER_INFO: Record<AchievementTier, { label: string; color: string; bg: string; ring: string; icon: typeof Medal; glow: string }> = {
  bronze: { label: 'Bronze', color: 'text-amber-700', bg: 'bg-amber-100 dark:bg-amber-950/40', ring: 'ring-amber-400', icon: Medal, glow: 'shadow-amber-700/30' },
  silver: { label: 'Silver', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700/40', ring: 'ring-gray-400', icon: Medal, glow: 'shadow-gray-400/30' },
  gold: { label: 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-950/40', ring: 'ring-yellow-400', icon: Award, glow: 'shadow-yellow-500/40' },
  platinum: { label: 'Platinum', color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-950/40', ring: 'ring-cyan-400', icon: Shield, glow: 'shadow-cyan-400/40' },
  diamond: { label: 'Diamond', color: 'text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/40', ring: 'ring-blue-300', icon: Gem, glow: 'shadow-blue-400/50' },
};

const ACHIEVEMENTS: Achievement[] = [
  // Bronze — easy starter
  { id: 'first_task', title: 'First Steps', description: 'Complete your first task', category: 'productivity', tier: 'bronze', icon: '🎯', target: 1, reward: { xp: 20, coins: 10 } },
  { id: 'first_study', title: 'Bookworm', description: 'Complete your first study session', category: 'study', tier: 'bronze', icon: '📚', target: 1, reward: { xp: 25, coins: 15 } },
  { id: 'first_water', title: 'Sip Sip', description: 'Drink water for the first time', category: 'health', tier: 'bronze', icon: '💧', target: 1, reward: { xp: 15, coins: 10 } },
  { id: 'first_letter', title: 'Bamboo Letter', description: 'Send your first letter in Bamboo Forest', category: 'social', tier: 'bronze', icon: '🎋', target: 1, reward: { xp: 30, coins: 20 } },
  { id: 'first_pet', title: 'Animal Friend', description: 'Pet your companion for the first time', category: 'special', tier: 'bronze', icon: '🐾', target: 1, reward: { xp: 20, coins: 15 } },
  // Silver — medium
  { id: 'study_10', title: 'Study Master', description: 'Complete 10 study sessions', category: 'study', tier: 'silver', icon: '🎓', target: 10, reward: { xp: 100, coins: 50, title: 'Scholar' } },
  { id: 'streak_3', title: 'On Fire', description: 'Maintain a 3-day streak', category: 'streak', tier: 'silver', icon: '🔥', target: 3, reward: { xp: 80, coins: 40 } },
  { id: 'water_2l', title: 'Hydration Hero', description: 'Drink 2L of water in one day', category: 'health', tier: 'silver', icon: '🌊', target: 2000, reward: { xp: 60, coins: 30 } },
  { id: 'reply_5', title: 'Kind Soul', description: 'Reply to 5 letters in Bamboo Forest', category: 'social', tier: 'silver', icon: '💌', target: 5, reward: { xp: 125, coins: 60, title: 'Kind Soul' } },
  { id: 'tasks_20', title: 'Task Crusher', description: 'Complete 20 tasks total', category: 'productivity', tier: 'silver', icon: '⚡', target: 20, reward: { xp: 90, coins: 45 } },
  // Gold — hard
  { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', category: 'streak', tier: 'gold', icon: '🏆', target: 7, reward: { xp: 200, coins: 100, title: 'Consistent' } },
  { id: 'study_50', title: 'Scholar', description: 'Complete 50 study sessions', category: 'study', tier: 'gold', icon: '🧠', target: 50, reward: { xp: 250, coins: 150, title: 'Dedicated Scholar' } },
  { id: 'level_10', title: 'Rising Star', description: 'Reach level 10', category: 'special', tier: 'gold', icon: '⭐', target: 10, reward: { xp: 300, coins: 200, title: 'Rising Star' } },
  { id: 'water_week', title: 'Well of Life', description: 'Hit water goal 7 days in a row', category: 'health', tier: 'gold', icon: '💧', target: 7, reward: { xp: 220, coins: 120 } },
  // Platinum — very hard
  { id: 'streak_30', title: 'Unstoppable', description: 'Maintain a 30-day streak', category: 'streak', tier: 'platinum', icon: '🔥', target: 30, reward: { xp: 500, coins: 300, title: 'Unstoppable' } },
  { id: 'study_100', title: 'Knowledge Seeker', description: 'Complete 100 study sessions', category: 'study', tier: 'platinum', icon: '📚', target: 100, reward: { xp: 600, coins: 400, title: 'Knowledge Seeker' } },
  { id: 'level_25', title: 'Life Master', description: 'Reach level 25', category: 'special', tier: 'platinum', icon: '💎', target: 25, reward: { xp: 800, coins: 500, title: 'Life Master' } },
  // Diamond — legendary
  { id: 'streak_100', title: 'Centurion', description: 'Maintain a 100-day streak', category: 'streak', tier: 'diamond', icon: '👑', target: 100, reward: { xp: 1500, coins: 1000, title: 'Centurion' } },
  { id: 'level_50', title: 'Legend', description: 'Reach level 50', category: 'special', tier: 'diamond', icon: '💎', target: 50, reward: { xp: 2000, coins: 1500, title: 'Legend' } },
  { id: 'all_gold', title: 'Completionist', description: 'Unlock all Gold achievements', category: 'special', tier: 'diamond', icon: '👑', target: 4, reward: { xp: 3000, coins: 2000, title: 'Completionist' } },
  // Secret achievements
  { id: 'secret_midnight', title: '???', description: 'Hidden achievement', category: 'secret', tier: 'gold', icon: '🌙', target: 1, reward: { xp: 150, coins: 100, title: 'Night Owl' }, secret: true },
  { id: 'secret_overhydrated', title: '???', description: 'Hidden achievement', category: 'secret', tier: 'silver', icon: '🌊', target: 1, reward: { xp: 100, coins: 50, title: 'Water Bender' }, secret: true },
  { id: 'secret_zen', title: '???', description: 'Hidden achievement', category: 'secret', tier: 'platinum', icon: '🧘', target: 1, reward: { xp: 400, coins: 250, title: 'Zen Master' }, secret: true },
];

const CATEGORY_INFO: Record<Category, { label: string; icon: typeof BookOpen }> = {
  study: { label: 'Study', icon: BookOpen },
  health: { label: 'Health', icon: Heart },
  streak: { label: 'Streak', icon: Flame },
  social: { label: 'Social', icon: Sparkles },
  productivity: { label: 'Tasks', icon: Zap },
  special: { label: 'Special', icon: Crown },
  secret: { label: 'Secret', icon: Lock },
};

export function Achievements({ game, onClose, onGainXp }: Props) {
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [unlockedAnim, setUnlockedAnim] = useState<string | null>(null);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const prevUnlockedRef = useRef<string[]>([]);
  const { particles, fire } = useConfetti();

  // Compute achievement progress from game state
  const achievements = ACHIEVEMENTS.map((a) => {
    let progress = 0;
    let unlocked = false;

    if (a.id === 'first_task' || a.id === 'tasks_20') {
      progress = Math.min(a.target, Math.floor(game.xp / 20) + (game.level - 1) * 5);
    } else if (a.id === 'first_study' || a.id === 'study_10' || a.id === 'study_50' || a.id === 'study_100') {
      progress = Math.min(a.target, Math.floor(game.xp / 40));
    } else if (a.id === 'first_water' || a.id === 'water_2l') {
      progress = a.id === 'first_water' ? Math.min(1, game.streak) : Math.min(a.target, game.streak * 500);
    } else if (a.id === 'streak_3' || a.id === 'streak_7' || a.id === 'streak_30' || a.id === 'streak_100') {
      progress = Math.min(a.target, game.streak);
    } else if (a.id === 'level_10' || a.id === 'level_25' || a.id === 'level_50') {
      progress = Math.min(a.target, game.level);
    } else if (a.id === 'first_letter' || a.id === 'reply_5' || a.id === 'first_pet') {
      progress = game.achievements.includes(a.id) ? a.target : 0;
    } else if (a.id === 'water_week') {
      progress = Math.min(a.target, Math.floor(game.streak / 1));
    } else if (a.id === 'all_gold') {
      const goldIds = ['streak_7', 'study_50', 'level_10', 'water_week'];
      progress = goldIds.filter((id) => game.achievements.includes(id) || ACHIEVEMENTS.find((x) => x.id === id)?.target === 1).length;
    } else if (a.secret) {
      progress = game.achievements.includes(a.id) ? a.target : 0;
    }

    unlocked = progress >= a.target || game.achievements.includes(a.id);
    return { ...a, progress, unlocked };
  });

  // Detect newly unlocked achievements for animation
  useEffect(() => {
    const currentUnlocked = achievements.filter((a) => a.unlocked).map((a) => a.id);
    const newOnes = currentUnlocked.filter((id) => !prevUnlockedRef.current.includes(id));
    if (newOnes.length > 0 && prevUnlockedRef.current.length > 0) {
      setNewlyUnlocked(newOnes);
      setUnlockedAnim(newOnes[0]);
      fire(40);
      playSoundEffect('levelup');
      setTimeout(() => setUnlockedAnim(null), 3000);
    }
    prevUnlockedRef.current = currentUnlocked;
  }, [achievements, fire]);

  const filtered = filter === 'all' ? achievements : achievements.filter((a) => a.category === filter);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXp = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.reward.xp, 0);
  const totalCoins = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.reward.coins, 0);

  // Tier stats
  const tierStats = (['bronze', 'silver', 'gold', 'platinum', 'diamond'] as AchievementTier[]).map((tier) => {
    const tierAch = achievements.filter((a) => a.tier === tier);
    return { tier, total: tierAch.length, unlocked: tierAch.filter((a) => a.unlocked).length };
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <ConfettiLayer particles={particles} />
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto no-scrollbar animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={22} className="text-amber-500" />
              <h2 className="text-xl font-extrabold">Achievements</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-2 text-center">
              <p className="text-lg font-extrabold text-amber-600">{unlockedCount}/{achievements.length}</p>
              <p className="text-[10px] text-gray-400">Unlocked</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl p-2 text-center">
              <p className="text-lg font-extrabold text-indigo-600">{totalXp}</p>
              <p className="text-[10px] text-gray-400">XP earned</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl p-2 text-center">
              <p className="text-lg font-extrabold text-yellow-600">{totalCoins}</p>
              <p className="text-[10px] text-gray-400">Coins</p>
            </div>
          </div>

          {/* Tier progress */}
          <div className="flex gap-1.5 mb-3">
            {tierStats.map((ts) => {
              const ti = TIER_INFO[ts.tier];
              const TierIcon = ti.icon;
              return (
                <div key={ts.tier} className={`flex-1 ${ti.bg} rounded-xl p-1.5 text-center`}>
                  <TierIcon size={14} className={`mx-auto ${ti.color} mb-0.5`} />
                  <p className={`text-[10px] font-bold ${ti.color}`}>{ts.unlocked}/{ts.total}</p>
                </div>
              );
            })}
          </div>

          {/* Category filter */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            <button onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
              All
            </button>
            {(Object.keys(CATEGORY_INFO) as Category[]).map((cat) => {
              const Icon = CATEGORY_INFO[cat].icon;
              return (
                <button key={cat} onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${filter === cat ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  <Icon size={12} /> {CATEGORY_INFO[cat].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Achievement list */}
        <div className="p-4 space-y-3">
          {filtered.map((a) => {
            const ti = TIER_INFO[a.tier];
            const TierIcon = ti.icon;
            const pct = Math.min(100, (a.progress / a.target) * 100);
            const isNew = newlyUnlocked.includes(a.id);
            return (
              <div key={a.id} className={`rounded-3xl p-4 shadow-sm transition-all ${a.unlocked ? `${ti.bg} ring-1 ${ti.ring} ${isNew ? 'animate-celebrate' : ''}` : 'bg-gray-50 dark:bg-gray-800'}`}>
                <div className="flex items-start gap-3">
                  <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${a.unlocked ? `bg-white dark:bg-gray-900 shadow-md ${ti.glow}` : 'bg-gray-200 dark:bg-gray-700 grayscale opacity-60'}`}>
                    {a.unlocked ? a.icon : <Lock size={20} className="text-gray-400" />}
                    {a.unlocked && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold text-sm ${a.unlocked ? '' : 'text-gray-500'}`}>{a.title}</p>
                      <span className={`flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full font-bold ${ti.bg} ${ti.color}`}>
                        <TierIcon size={9} /> {ti.label}
                      </span>
                      {a.secret && !a.unlocked && <span className="text-[10px] text-gray-400">Secret</span>}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{a.description}</p>
                    {/* Progress bar */}
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${a.unlocked ? `bg-gradient-to-r ${a.tier === 'diamond' ? 'from-blue-300 to-cyan-300' : a.tier === 'platinum' ? 'from-cyan-300 to-blue-300' : a.tier === 'gold' ? 'from-yellow-400 to-amber-500' : a.tier === 'silver' ? 'from-gray-300 to-gray-400' : 'from-amber-500 to-amber-700'}` : 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-gray-400">{a.progress} / {a.target}</span>
                      <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                        <Star size={10} /> {a.reward.xp} XP · <Sparkles size={10} /> {a.reward.coins} coins
                        {a.reward.title && <span className="ml-1 text-indigo-500">· {a.reward.title}</span>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Unlock animation overlay */}
        {unlockedAnim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="animate-celebrate text-center">
              <div className="text-6xl mb-2">{achievements.find((a) => a.id === unlockedAnim)?.icon}</div>
              <p className="font-extrabold text-lg text-amber-500">Achievement Unlocked!</p>
              <p className="text-sm text-gray-400">{achievements.find((a) => a.id === unlockedAnim)?.title}</p>
              <p className="text-xs text-indigo-500 mt-1">{achievements.find((a) => a.id === unlockedAnim)?.reward.title || `+${achievements.find((a) => a.id === unlockedAnim)?.reward.xp} XP`}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
