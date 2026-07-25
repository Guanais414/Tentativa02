export type MascotType = 'otter' | 'goose' | 'rabbit' | 'penguin' | 'dog' | 'cat';

export type Screen = 'home' | 'map' | 'bamboo' | 'agenda' | 'studies' | 'health' | 'mascot' | 'shop' | 'leaderboard' | 'profile' | 'community';

export type ThemeMode = 'light' | 'dark';

export type AppBackground = 'aurora' | 'sunset' | 'ocean' | 'forest' | 'mint' | 'lavender' | 'midnight' | 'peach';

export interface PersonalInfo {
  name: string;
  birthDate: string;
  country: string;
  language: string;
  profession: string;
  education: string;
}

export interface RoutineInfo {
  wakeTime: string;
  sleepTime: string;
  freeDays: string[];
  workDays: string[];
  studyDays: string[];
  dailyAvailableHours: string;
}

export interface StudySubject {
  id: string;
  name: string;
  goal: string;
  level: string;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: boolean;
  weight: number;
  recommendedMinutes: number;
}

export interface StudyInfo {
  topics: string;
  goalType: string;
  hoursPerDay: string;
  currentLevel: string;
  examDate: string;
  subjects: StudySubject[];
}

export interface DailyTarget {
  studyMinutes: number;
  exercises: number;
  chapters: number;
  reviews: number;
  customGoal: string;
}

export type DietRestriction =
  | 'vegetarian' | 'vegan' | 'diabetic' | 'celiac' | 'lactose' | 'hypertension' | 'allergies' | 'none';

export type DietGoal = 'lose' | 'gain' | 'maintain' | 'healthy';

export interface MealTime {
  id: string;
  name: string;
  time: string;
}

export interface NutritionInfo {
  restrictions: DietRestriction[];
  goal: DietGoal;
  mealsPerDay: number;
  mealTimes: MealTime[];
  favoriteFoods: string;
  dislikedFoods: string;
}

export type ExerciseType = 'gym' | 'run' | 'walk' | 'bike' | 'yoga' | 'pilates' | 'weights';
export type ExerciseGoal = 'lose' | 'endurance' | 'hypertrophy' | 'health';

export interface ExerciseInfo {
  types: ExerciseType[];
  goal: ExerciseGoal;
  frequencyPerWeek: number;
}

export type HabitType =
  | 'reading' | 'meditation' | 'water' | 'sleep_early' | 'languages'
  | 'writing' | 'exercise' | 'prayer' | 'journaling' | 'other';

export interface Habit {
  id: string;
  type: HabitType;
  label: string;
  customLabel?: string;
  targetPerDay: number;
  completedToday: number;
  history: string[];
}

export interface MentalHealth {
  stress: number;
  anxiety: number;
  focus: number;
  energy: number;
  mood: number;
}

export interface RoutineTask {
  id: string;
  title: string;
  category: 'study' | 'work' | 'meal' | 'exercise' | 'habit' | 'leisure' | 'sleep' | 'wellness';
  startTime: string;
  endTime: string;
  completed: boolean;
  xp: number;
  icon: string;
  rescheduled?: boolean;
  priority?: boolean;
  recurrence?: 'none' | 'daily' | 'weekly' | 'weekdays';
  color?: string;
  notes?: string;
  xpClaimed?: boolean;
}

export interface CosmeticItem {
  id: string;
  name: string;
  category: 'hat' | 'outfit' | 'accessory' | 'environment' | 'companion';
  price: number;
  emoji: string;
  description: string;
}

export interface OwnedCosmetic {
  itemId: string;
  equipped: boolean;
}

export interface MealSuggestion {
  id: string;
  name: string;
  time: string;
  description: string;
  emoji: string;
  calories: number;
  completed: boolean;
  xpClaimed?: boolean;
}
export interface DiaryMeal {
  id: string;
  name: string;
  time: string;
  photo?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
  completed: boolean;
  createdAt: number;
}

export interface DayStats {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  studyHours: number;
  waterMl: number;
  mood: number;
  xpEarned: number;
}

export interface UserProfile {
  personal: PersonalInfo;
  routine: RoutineInfo;
  study: StudyInfo;
  nutrition: NutritionInfo;
  exercise: ExerciseInfo;
  habits: Habit[];
  mental: MentalHealth;
  mascot: MascotType;
  mascotName: string;
  onboarded: boolean;
  dailyTarget: DailyTarget;
  bio?: string;
  interests?: string[];
  avatarUrl?: string;
}

export interface GameState {
  xp: number;
  level: number;
  coins: number;
  streak: number;
  lastActiveDate: string;
  ownedCosmetics: OwnedCosmetic[];
  achievements: string[];
  weeklyChallenges: WeeklyChallenge[];
  unlockedAchievements: UnlockedAchievement[];
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
  tier: AchievementTier;
}

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  background: AppBackground;
  accentColor: string;
  fontScale: 'small' | 'medium' | 'large';
  moduleOrder: Screen[];
  waterGoalMl: number;
  sleepInsightsLayout: SleepInsightCard[];
}

export interface SleepInsightCard {
  id: string;
  visible: boolean;
  pinned: boolean;
  order: number;
}

/** Saved study session */
export interface StudySession {
  id: string;
  date: string;
  durationSec: number;
  method: string;
  subject?: string;
  completed: boolean;
}

/** Saved favorite timer preset */
export interface TimerPreset {
  id: string;
  label: string;
  seconds: number;
  type: 'countdown' | 'pomodoro';
}
