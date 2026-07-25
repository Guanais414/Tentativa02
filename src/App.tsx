import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { UserProfile, GameState, RoutineTask, MealSuggestion, AppSettings, Screen, DiaryMeal } from './types';
import {
  loadProfile, saveProfile, loadState, saveState, defaultGameState, defaultSettings,
  loadTasks, saveTasks, loadMeals, saveMeals, loadWaterMl, saveWaterMl, loadMood, saveMood,
  applyXp, updateStreak, todayStr, clearUserData,
} from './store';
import { generateRoutine, generateMeals, rescheduleDay } from './ai';
import { supabase } from './supabaseClient';
import { BackgroundLayer } from './components/BackgroundLayer';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { AmbientMusic, playSoundEffect } from './components/AmbientMusic';
import { NotificationSystem } from './components/Notifications';
import { Home as HomeIcon, Calendar, BookOpen, Heart, Sparkles, Trophy, User, Map, Users } from 'lucide-react';
import { useConfetti, ConfettiLayer, LevelUpOverlay } from './components/Dopamine';

const Home = lazy(() => import('./components/Home').then((m) => ({ default: m.Home })));
const Agenda = lazy(() => import('./components/Agenda').then((m) => ({ default: m.Agenda })));
const Studies = lazy(() => import('./components/Studies').then((m) => ({ default: m.Studies })));
const Health = lazy(() => import('./components/Health').then((m) => ({ default: m.Health })));
const Achievements = lazy(() => import('./components/Achievements').then((m) => ({ default: m.Achievements })));
const MascotPond = lazy(() => import('./components/MascotPond').then((m) => ({ default: m.MascotPond })));
const Shop = lazy(() => import('./components/Shop').then((m) => ({ default: m.Shop })));
const Leaderboard = lazy(() => import('./components/Leaderboard').then((m) => ({ default: m.Leaderboard })));
const Profile = lazy(() => import('./components/Profile').then((m) => ({ default: m.Profile })));
const BambooForest = lazy(() => import('./components/BambooForest').then((m) => ({ default: m.BambooForest })));
const ForestMap = lazy(() => import('./components/ForestMap').then((m) => ({ default: m.ForestMap })));
const Community = lazy(() => import('./components/Community').then((m) => ({ default: m.Community })));

// Awards removed from nav — achievements now live on Home. Community added.
const NAV_ITEMS: { id: Screen; label: string; icon: typeof HomeIcon }[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'map', label: 'World', icon: Map },
  { id: 'agenda', label: 'Tasks', icon: Calendar },
  { id: 'studies', label: 'Study', icon: BookOpen },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'community', label: 'Community', icon: Users },
];

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [game, setGame] = useState<GameState>(defaultGameState);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [meals, setMeals] = useState<MealSuggestion[]>([]);
  const [diaryMeals, setDiaryMeals] = useState<DiaryMeal[]>([]);
  const [waterMl, setWaterMl] = useState(0);
  const [mood, setMood] = useState(0);
  const [screen, setScreen] = useState<Screen>('home');
  const [showAchievements, setShowAchievements] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [xpPopup, setXpPopup] = useState<number | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const { particles, fire } = useConfetti();

  const userId = session?.user?.id ?? null;

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      (async () => {
        setSession(sess);
        if (!sess) {
          // Signed out — clear local state
          setProfile(null);
          setGame(defaultGameState);
          setSettings(defaultSettings);
          setTasks([]);
          setMeals([]);
          setDiaryMeals([]);
          setWaterMl(0);
          setMood(0);
          setScreen('home');
        }
      })();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Load user-scoped data when session changes
  useEffect(() => {
    if (!userId) return;
    const p = loadProfile(userId);
    if (p && p.onboarded) {
      setProfile(p);
      setGame(loadState(userId, 'game', defaultGameState));
      setSettings(loadState(userId, 'settings', defaultSettings));
      setTasks(loadTasks(userId));
      setMeals(loadMeals(userId));
      setWaterMl(loadWaterMl(userId));
      setMood(loadMood(userId));
    } else {
      // New user or not onboarded — reset to defaults
      setProfile(null);
      setGame(defaultGameState);
      setSettings(defaultSettings);
      setTasks([]);
      setMeals([]);
      setWaterMl(0);
      setMood(0);
    }
  }, [userId]);

  // Apply dark mode
  useEffect(() => {
    if (settings.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings.theme]);

  // Persist (all scoped by userId)
  useEffect(() => { if (profile) saveProfile(userId, profile); }, [profile, userId]);
  useEffect(() => { saveState(userId, 'game', game); }, [game, userId]);
  useEffect(() => { saveState(userId, 'settings', settings); }, [settings, userId]);
  useEffect(() => { saveTasks(userId, tasks); }, [tasks, userId]);
  useEffect(() => { saveMeals(userId, meals); }, [meals, userId]);
  useEffect(() => { saveState(userId, 'diaryMeals', diaryMeals); }, [diaryMeals, userId]);
  useEffect(() => { saveWaterMl(userId, waterMl); }, [waterMl, userId]);
  useEffect(() => { saveMood(userId, mood); }, [mood, userId]);

  // Reset water daily
  useEffect(() => {
    if (!userId || !profile) return;
    const waterDateKey = `lifeflow_${userId}_waterDate`;
    const lastWaterDate = localStorage.getItem(waterDateKey);
    const today = todayStr();
    if (lastWaterDate !== today) {
      setWaterMl(0);
      saveWaterMl(userId, 0);
      localStorage.setItem(waterDateKey, today);
      setTasks((prev) => prev.map((t) => ({ ...t, completed: false, xpClaimed: false })));
      setMeals((prev) => prev.map((m) => ({ ...m, completed: false, xpClaimed: false })));
      setDiaryMeals((prev) => prev.map((m) => ({ ...m, completed: false })));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, profile]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const gainXp = useCallback((amount: number, label?: string) => {
    setGame((prev) => {
      const oldLevel = prev.level;
      const updated = applyXp(updateStreak(prev), amount);
      if (updated.level > oldLevel) {
        setLevelUp(updated.level);
        fire(50);
        playSoundEffect('levelup');
        setTimeout(() => setLevelUp(null), 2000);
      }
      const challenges = updated.weeklyChallenges.map((c) => {
        if (c.completed) return c;
        const newProgress = c.progress + amount;
        if (newProgress >= c.target) return { ...c, progress: c.target, completed: true };
        return { ...c, progress: newProgress };
      });
      return { ...updated, weeklyChallenges: challenges };
    });
    if (label) {
      setXpPopup(amount);
      setTimeout(() => setXpPopup(null), 1000);
    }
  }, [fire]);

  const handleOnboardingComplete = (p: UserProfile) => {
    setProfile(p);
    setTasks(generateRoutine(p));
    setMeals(generateMeals(p));
    setGame(updateStreak(defaultGameState));
    showToast('Welcome to Dango!');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setScreen('home');
    showToast('Signed out');
  };

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task) return prev;
      const wasCompleted = task.completed;
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      if (!wasCompleted && !task.xpClaimed) {
        gainXp(task.xp, task.title);
        playSoundEffect('success');
        showToast(`+${task.xp} XP! ${task.title} done!`);
        return updated.map((t) => (t.id === id ? { ...t, xpClaimed: true } : t));
      }
      return updated;
    });
  }, [gainXp, showToast]);

  const handleReschedule = (fromIndex: number, delayMin: number) => {
    setTasks((prev) => {
      const sorted = [...prev].sort((a, b) => a.startTime.localeCompare(b.startTime));
      return rescheduleDay(sorted, fromIndex, delayMin);
    });
    showToast(`Rescheduled +${delayMin}min`);
    gainXp(5, 'Adapted to change');
  };

  const handleAddTask = (task: RoutineTask) => {
    setTasks((prev) => [...prev, task]);
    showToast('Task added');
  };
  const handleUpdateTask = (id: string, patch: Partial<RoutineTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task removed');
  };
  const handleReorderTasks = (reordered: RoutineTask[]) => {
    setTasks(reordered);
  };
  const handleAddDiaryMeal = (meal: DiaryMeal) => {
    setDiaryMeals((prev) => [...prev, meal]);
    showToast('Meal added to diary');
  };
  const handleUpdateDiaryMeal = (id: string, patch: Partial<DiaryMeal>) => {
    setDiaryMeals((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };
  const handleDeleteDiaryMeal = (id: string) => {
    setDiaryMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddWater = (ml: number) => {
    setWaterMl((prev) => Math.max(0, prev + ml));
    if (ml > 0) gainXp(5, 'Hydrated');
  };

  const handleSetWaterGoal = (ml: number) => setSettings((prev) => ({ ...prev, waterGoalMl: ml }));

  const handleToggleMeal = (id: string) => {
    setMeals((prev) => {
      const meal = prev.find((m) => m.id === id);
      if (!meal) return prev;
      const wasCompleted = meal.completed;
      const updated = prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m));
      if (!wasCompleted && !meal.xpClaimed) {
        gainXp(10, 'Ate a meal');
        return updated.map((m) => (m.id === id ? { ...m, xpClaimed: true } : m));
      }
      return updated;
    });
  };

  const handleSetMood = (m: number) => { setMood(m); gainXp(5, 'Checked in'); };

  const handleBuy = (itemId: string, price: number) => {
    setGame((prev) => {
      if (prev.coins < price) return prev;
      const owned = [...prev.ownedCosmetics, { itemId, equipped: false }];
      const item = itemId.split('_')[0];
      const reEquipped = owned.map((o) => {
        if (o.itemId.split('_')[0] === item && o.itemId !== itemId) return { ...o, equipped: false };
        if (o.itemId === itemId) return { ...o, equipped: true };
        return o;
      });
      return { ...prev, coins: prev.coins - price, ownedCosmetics: reEquipped };
    });
    showToast('Purchase complete!');
  };

  const handleEquip = (itemId: string) => {
    setGame((prev) => {
      const prefix = itemId.split('_')[0];
      const owned = prev.ownedCosmetics.map((o) => {
        if (o.itemId.split('_')[0] === prefix) return { ...o, equipped: o.itemId === itemId };
        return o;
      });
      return { ...prev, ownedCosmetics: owned };
    });
  };

  const handleUpdateSettings = (patch: Partial<AppSettings>) => setSettings((prev) => ({ ...prev, ...patch }));
  const handleUpdateProfile = (patch: Partial<UserProfile>) => setProfile((prev) => prev ? { ...prev, ...patch } : prev);

  const handleReset = () => {
    clearUserData(userId);
    window.location.reload();
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-dynamic flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-cyan-100 dark:from-green-950 dark:via-slate-900 dark:to-cyan-950">
        <div className="inline-block w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — show auth screen
  if (!session) {
    return (
      <div className="min-h-dynamic bg-gradient-to-br from-green-100 via-emerald-50 to-cyan-100 dark:from-green-950 dark:via-slate-900 dark:to-cyan-950">
        <Auth onAuthSuccess={() => {}} />
      </div>
    );
  }

  // Authenticated but not onboarded — show onboarding
  if (!profile || !profile.onboarded) {
    return (
      <div className="min-h-dynamic bg-gradient-to-br from-green-100 via-emerald-50 to-cyan-100 dark:from-green-950 dark:via-slate-900 dark:to-cyan-950">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // Main app
  return (
    <div className={`min-h-dynamic ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <BackgroundLayer bg={settings.background} />
      <AmbientMusic />
      <NotificationSystem onNavigate={(s) => setScreen(s as Screen)} />
      <div className="min-h-dynamic text-gray-900 dark:text-gray-100 transition-colors">
        <main className="pb-24 min-h-dynamic pt-safe">
          <Suspense fallback={
            <div className="flex items-center justify-center h-[60vh]">
              <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
            </div>
          }>
          {screen === 'home' && (
            <Home profile={profile} game={game} settings={settings} tasks={tasks} meals={meals}
              waterMl={waterMl} mood={mood} onNavigate={(s) => setScreen(s as Screen)} onGainXp={gainXp} />
          )}
          {screen === 'map' && <ForestMap profile={profile} game={game} onGainXp={gainXp} />}
          {screen === 'bamboo' && <BambooForest profile={profile} game={game} userId={userId} onGainXp={gainXp} />}
          {screen === 'agenda' && (
            <Agenda profile={profile} game={game} tasks={tasks} onToggleTask={toggleTask}
              onReschedule={handleReschedule} onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onReorderTasks={handleReorderTasks} />
          )}
          {screen === 'studies' && <Studies profile={profile} game={game} tasks={tasks} onToggleTask={toggleTask} onUpdateProfile={handleUpdateProfile} onGainXp={gainXp} />}
          {screen === 'health' && (
            <Health profile={profile} game={game} settings={settings} meals={meals} waterMl={waterMl}
              mood={mood} onAddWater={handleAddWater} onSetWaterGoal={handleSetWaterGoal}
              onToggleMeal={handleToggleMeal} onSetMood={handleSetMood} onGainXp={gainXp}
              diaryMeals={diaryMeals} onAddDiaryMeal={handleAddDiaryMeal} onUpdateDiaryMeal={handleUpdateDiaryMeal}
              onDeleteDiaryMeal={handleDeleteDiaryMeal} onUpdateSettings={handleUpdateSettings} onUpdateProfile={handleUpdateProfile} />
          )}
          {screen === 'mascot' && <MascotPond profile={profile} game={game} settings={settings} onBuy={handleBuy} onEquip={handleEquip} />}
          {screen === 'shop' && <Shop profile={profile} game={game} onBuy={handleBuy} onEquip={handleEquip} />}
          {screen === 'leaderboard' && <Leaderboard profile={profile} game={game} userId={userId} />}
          {screen === 'community' && <Community profile={profile} game={game} userId={userId} onGainXp={gainXp} />}
          {screen === 'profile' && (
            <Profile profile={profile} game={game} settings={settings}
              onUpdateSettings={handleUpdateSettings} onUpdateProfile={handleUpdateProfile}
              onReset={handleReset} onGainXp={gainXp} onSignOut={handleSignOut} userId={userId} />
          )}
          </Suspense>
        </main>

        <ConfettiLayer particles={particles} />
        <LevelUpOverlay level={levelUp ?? 0} show={levelUp !== null} />
        {xpPopup && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fade-in">
            <div className="bg-amber-400 text-white font-bold px-4 py-2 rounded-full shadow text-sm">
              +{xpPopup} XP
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up pointer-events-none">
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-bold px-5 py-2.5 rounded-full shadow-lg">{toast}</div>
          </div>
        )}

        {showAchievements && (
          <Achievements game={game} onClose={() => setShowAchievements(false)} onGainXp={gainXp} />
        )}

        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-safe">
          <div className="max-w-md mx-auto grid grid-cols-6 gap-0.5 px-1 py-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = screen === item.id;
              return (
                <button key={item.id} onClick={() => setScreen(item.id)}
                  className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-2xl transition-all ${active ? 'scale-105' : 'opacity-50'}`}>
                  <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-green-500 text-white shadow-md shadow-green-500/30' : 'text-gray-400'}`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-[9px] font-bold ${active ? 'text-green-500' : 'text-gray-400'}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
