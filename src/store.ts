import type { GameState, RoutineTask, MealSuggestion, DayStats, AppSettings, UserProfile } from './types';

const PREFIX = 'lifeflow_';

export const defaultSettings: AppSettings = {
  theme: 'light',
  background: 'aurora',
  accentColor: '#6366f1',
  fontScale: 'medium',
  moduleOrder: ['home', 'agenda', 'studies', 'health', 'mascot', 'leaderboard', 'profile'],
  waterGoalMl: 2000,
  sleepInsightsLayout: [
    { id: 'target', visible: true, pinned: true, order: 0 },
    { id: 'bedtime', visible: true, pinned: true, order: 1 },
    { id: 'tips', visible: true, pinned: false, order: 2 },
    { id: 'quality', visible: true, pinned: false, order: 3 },
    { id: 'routine', visible: true, pinned: false, order: 4 },
  ],
};

export const defaultGameState: GameState = {
  xp: 0,
  level: 1,
  coins: 100,
  streak: 0,
  lastActiveDate: '',
  ownedCosmetics: [],
  achievements: [],
  unlockedAchievements: [],
  weeklyChallenges: [
    { id: 'wc1', title: 'Study Master', description: 'Complete 10 study sessions', target: 10, progress: 0, reward: 150, completed: false },
    { id: 'wc2', title: 'Hydration Hero', description: 'Drink 14L of water this week', target: 14000, progress: 0, reward: 100, completed: false },
    { id: 'wc3', title: 'Habit Streak', description: 'Complete 20 habits', target: 20, progress: 0, reward: 120, completed: false },
  ],
};

function userKey(userId: string | null, key: string): string {
  return userId ? `${PREFIX}${userId}_${key}` : `${PREFIX}${key}`;
}

// Object merge for record types (GameState, AppSettings, etc.)
export function loadState<T>(userId: string | null, key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(userKey(userId, key));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    // For arrays, return parsed directly (do NOT spread into an object)
    if (Array.isArray(fallback)) {
      return (Array.isArray(parsed) ? parsed : fallback) as T;
    }
    // For objects, merge with fallback
    if (typeof fallback === 'object' && fallback !== null) {
      return { ...fallback, ...parsed };
    }
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveState<T>(userId: string | null, key: string, value: T): void {
  try {
    localStorage.setItem(userKey(userId, key), JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function loadProfile(userId: string | null): UserProfile | null {
  try {
    const raw = localStorage.getItem(userKey(userId, 'profile'));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(userId: string | null, profile: UserProfile): void {
  saveState(userId, 'profile', profile);
}

export function loadTasks(userId: string | null): RoutineTask[] {
  return loadState<RoutineTask[]>(userId, 'tasks', []);
}

export function saveTasks(userId: string | null, tasks: RoutineTask[]): void {
  saveState(userId, 'tasks', tasks);
}

export function loadMeals(userId: string | null): MealSuggestion[] {
  return loadState<MealSuggestion[]>(userId, 'meals', []);
}

export function saveMeals(userId: string | null, meals: MealSuggestion[]): void {
  saveState(userId, 'meals', meals);
}

export function loadDayStats(userId: string | null): DayStats[] {
  return loadState<DayStats[]>(userId, 'dayStats', []);
}

export function saveDayStats(userId: string | null, stats: DayStats[]): void {
  saveState(userId, 'dayStats', stats);
}

export function loadWaterMl(userId: string | null): number {
  return loadState<number>(userId, 'waterMl', 0);
}

export function saveWaterMl(userId: string | null, ml: number): void {
  saveState(userId, 'waterMl', ml);
}

export function loadMood(userId: string | null): number {
  return loadState<number>(userId, 'mood', 0);
}

export function saveMood(userId: string | null, mood: number): void {
  saveState(userId, 'mood', mood);
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function applyXp(current: GameState, gained: number): GameState {
  let xp = current.xp + gained;
  let level = current.level;
  let coins = current.coins + Math.floor(gained / 10);
  let need = xpForLevel(level);
  while (xp >= need) {
    xp -= need;
    level += 1;
    coins += 50;
    need = xpForLevel(level);
  }
  return { ...current, xp, level, coins };
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function updateStreak(gs: GameState): GameState {
  const today = todayStr();
  if (gs.lastActiveDate === today) return gs;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak = gs.lastActiveDate === yesterday ? gs.streak + 1 : 1;
  return { ...gs, streak, lastActiveDate: today };
}

export function clearUserData(userId: string | null): void {
  if (!userId) return;
  const keys = ['profile', 'game', 'settings', 'tasks', 'meals', 'waterMl', 'mood', 'waterDate', 'dayStats'];
  keys.forEach((k) => localStorage.removeItem(userKey(userId, k)));
}
