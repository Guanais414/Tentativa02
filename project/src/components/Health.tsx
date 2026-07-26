import { useState, useEffect } from 'react';
import type { UserProfile, GameState, MealSuggestion, AppSettings, DiaryMeal } from '../types';
import { PhotoCapture } from './PhotoCapture';
import {
  analyzeFoodDescription, analyzeFoodPhoto, generateSurprisePlate, generateFullRecipe,
  type FoodAnalysis, type MealType, type SurprisePlate, type FullRecipe, MEAL_TYPE_LABELS,
} from '../foodAnalysis';
import { RelaxationActivities } from './RelaxationActivities';
import { Mascot } from './Mascot';
import { Droplets, Moon, Smile, X, Utensils, Heart, Leaf, Plus, Minus, Check, AlertCircle, PenLine, Sparkles, TrendingUp, Camera, Shuffle, ArrowRight, Apple, IceCream, Coffee, Sun, Moon as MoonIcon, UtensilsCrossed, Trash2, Edit3, Clock, ChefHat, AlertTriangle, Pin, Eye, EyeOff, ChevronDown, RefreshCw } from 'lucide-react';

interface Props {
  profile: UserProfile;
  game: GameState;
  settings: AppSettings;
  meals: MealSuggestion[];
  waterMl: number;
  mood: number;
  onAddWater: (ml: number) => void;
  onSetWaterGoal: (ml: number) => void;
  onToggleMeal: (id: string) => void;
  onSetMood: (m: number) => void;
  onGainXp?: (xp: number, label: string) => void;
  diaryMeals: DiaryMeal[];
  onAddDiaryMeal: (meal: DiaryMeal) => void;
  onUpdateDiaryMeal: (id: string, patch: Partial<DiaryMeal>) => void;
  onDeleteDiaryMeal: (id: string) => void;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onUpdateProfile?: (patch: Partial<UserProfile>) => void;
}

const MOOD_LABELS = ['Down', 'Low', 'Okay', 'Good', 'Great'];
const MOOD_COLORS = ['text-rose-500', 'text-amber-500', 'text-gray-400', 'text-lime-500', 'text-green-500'];

const MEAL_TYPE_ICONS: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee size={22} className="text-amber-500" />,
  lunch: <Sun size={22} className="text-orange-500" />,
  dinner: <MoonIcon size={22} className="text-indigo-500" />,
  snack: <Utensils size={22} className="text-teal-500" />,
  fruit: <Apple size={22} className="text-rose-500" />,
  dessert: <IceCream size={22} className="text-pink-500" />,
};

export function Health({ profile, game, settings, meals, waterMl, mood, onAddWater, onSetWaterGoal, onToggleMeal, onSetMood, onGainXp, diaryMeals, onAddDiaryMeal, onUpdateDiaryMeal, onDeleteDiaryMeal, onUpdateSettings, onUpdateProfile }: Props) {
  const [view, setView] = useState<'overview' | 'water' | 'meals' | 'surprise' | 'relax' | 'sleep' | 'mood'>('overview');
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photoAnalysis, setPhotoAnalysis] = useState<FoodAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showTextDesc, setShowTextDesc] = useState(false);
  const [foodDesc, setFoodDesc] = useState('');
  const [textAnalysis, setTextAnalysis] = useState<FoodAnalysis | null>(null);
  const [analyzingText, setAnalyzingText] = useState(false);

  // Surprise plate state
  const [surpriseMealType, setSurpriseMealType] = useState<MealType | null>(null);
  const [surprisePhotos, setSurprisePhotos] = useState<string[]>([]);
  const [surpriseIngredients, setSurpriseIngredients] = useState('');
  const [surprisePlate, setSurprisePlate] = useState<SurprisePlate | null>(null);
  const [surpriseVariant, setSurpriseVariant] = useState(0);
  const [fullRecipe, setFullRecipe] = useState<FullRecipe | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showRecipe, setShowRecipe] = useState(false);

  // Diary meal state
  const [showAddDiary, setShowAddDiary] = useState(false);
  const [editingDiaryId, setEditingDiaryId] = useState<string | null>(null);
  const [newDiary, setNewDiary] = useState({ name: '', time: '12:00', calories: '', protein: '', carbs: '', fat: '', notes: '' });
  const [diaryPhoto, setDiaryPhoto] = useState<string | null>(null);
  const [showDiaryList, setShowDiaryList] = useState(false);

  // Sleep Insights customization
  const defaultSleepCards = [
    { id: 'target', visible: true, pinned: true, order: 0 },
    { id: 'bedtime', visible: true, pinned: true, order: 1 },
    { id: 'tips', visible: true, pinned: false, order: 2 },
    { id: 'quality', visible: true, pinned: false, order: 3 },
    { id: 'routine', visible: true, pinned: false, order: 4 },
  ];
  const [sleepCards, setSleepCards] = useState(settings.sleepInsightsLayout || defaultSleepCards);
  const [editingSleep, setEditingSleep] = useState(false);

  // Water pet reaction
  const overHydrated = waterMl > settings.waterGoalMl + 1000;
  const waterPct = Math.min(100, (waterMl / settings.waterGoalMl) * 100);
  const [petMood, setPetMood] = useState<'happy' | 'excited' | 'neutral' | 'sleepy'>('neutral');
  useEffect(() => {
    if (overHydrated) setPetMood('sleepy');
    else if (waterPct >= 100) setPetMood('excited');
    else if (waterPct >= 75) setPetMood('happy');
    else setPetMood('neutral');
  }, [waterPct, overHydrated]);

  const quickAdds = [250, 500, 750];

  const analyzePhoto = () => {
    if (!mealType) return;
    setAnalyzing(true);
    setPhotoAnalysis(null);
    setTimeout(() => {
      setPhotoAnalysis(analyzeFoodPhoto(mealType));
      setAnalyzing(false);
    }, 1800);
  };

  const analyzeText = () => {
    if (!foodDesc.trim() || !mealType) return;
    setAnalyzingText(true);
    setTextAnalysis(null);
    setTimeout(() => {
      setTextAnalysis(analyzeFoodDescription(foodDesc, mealType));
      setAnalyzingText(false);
    }, 1200);
  };

  const generateSurprise = (variant = 0) => {
    if (!surpriseMealType) return;
    setGenerating(true);
    if (variant === 0) { setSurprisePlate(null); setFullRecipe(null); }
    setTimeout(() => {
      const ingredientText = surpriseIngredients || (surprisePhotos.length > 0 ? 'chicken rice broccoli apple yogurt' : '');
      setSurprisePlate(generateSurprisePlate(ingredientText, surpriseMealType, variant));
      setFullRecipe(generateFullRecipe(ingredientText, surpriseMealType));
      setSurpriseVariant(variant);
      setGenerating(false);
    }, variant === 0 ? 2000 : 1200);
  };

  const handleAddDiary = () => {
    if (!newDiary.name.trim()) return;
    onAddDiaryMeal({
      id: `d${Date.now()}`,
      name: newDiary.name.trim(),
      time: newDiary.time,
      photo: diaryPhoto || undefined,
      calories: newDiary.calories ? parseInt(newDiary.calories) : undefined,
      protein: newDiary.protein ? parseInt(newDiary.protein) : undefined,
      carbs: newDiary.carbs ? parseInt(newDiary.carbs) : undefined,
      fat: newDiary.fat ? parseInt(newDiary.fat) : undefined,
      notes: newDiary.notes || undefined,
      completed: false,
      createdAt: Date.now(),
    });
    setNewDiary({ name: '', time: '12:00', calories: '', protein: '', carbs: '', fat: '', notes: '' });
    setDiaryPhoto(null);
    setShowAddDiary(false);
  };

  const toggleSleepCard = (id: string) => {
    const updated = sleepCards.map((c) => c.id === id ? { ...c, visible: !c.visible } : c);
    setSleepCards(updated);
    onUpdateSettings({ sleepInsightsLayout: updated });
  };
  const pinSleepCard = (id: string) => {
    const updated = sleepCards.map((c) => c.id === id ? { ...c, pinned: !c.pinned } : c);
    setSleepCards(updated);
    onUpdateSettings({ sleepInsightsLayout: updated });
  };
  const moveSleepCard = (id: string, dir: 'up' | 'down') => {
    const sorted = [...sleepCards].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c.id === id);
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= sorted.length) return;
    [sorted[idx].order, sorted[swap].order] = [sorted[swap].order, sorted[idx].order];
    setSleepCards(sorted);
    onUpdateSettings({ sleepInsightsLayout: sorted });
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
      <h1 className="text-2xl font-extrabold mb-4">Health</h1>

      {/* View tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {(['overview', 'water', 'meals', 'surprise', 'relax', 'sleep', 'mood'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${view === v ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
            {v === 'surprise' ? 'Surprise' : v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {view === 'overview' && (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => setView('water')} className="w-full bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-5 text-white shadow-lg shadow-cyan-500/30 text-left active:scale-[0.98] transition-transform">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><Droplets size={20} /><p className="font-bold">Hydration</p></div>
              <p className="text-sm font-bold">{waterMl}ml / {settings.waterGoalMl}ml</p>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${waterPct}%` }} />
            </div>
            <p className="text-xs text-white/80 mt-2">{waterPct >= 100 ? 'Goal reached! Amazing!' : `${settings.waterGoalMl - waterMl}ml to go`}</p>
          </button>

          <button onClick={() => setView('mood')} className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg text-left active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-2 mb-2"><Smile size={20} className="text-amber-500" /><p className="font-bold">Mood Today</p></div>
            <p className={`text-2xl font-extrabold ${MOOD_COLORS[Math.max(0, Math.min(4, mood - 1))]}`}>{mood > 0 ? MOOD_LABELS[Math.max(0, Math.min(4, mood - 1))] : 'Tap to set'}</p>
          </button>

          <button onClick={() => setView('meals')} className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg text-left active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-2 mb-3"><Utensils size={20} className="text-orange-500" /><p className="font-bold">Meals</p></div>
            <div className="space-y-1">
              {meals.slice(0, 2).map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-sm">
                  <Utensils size={16} className="text-orange-400" />
                  <span className={m.completed ? 'line-through text-gray-400' : ''}>{m.name}</span>
                  <span className="text-gray-400 text-xs ml-auto">{m.time}</span>
                </div>
              ))}
            </div>
          </button>

          <button onClick={() => setView('surprise')} className="w-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-5 text-white shadow-lg active:scale-[0.98] transition-transform text-left">
            <div className="flex items-center gap-2 mb-1"><Shuffle size={20} /><p className="font-bold">Surprise Plate</p></div>
            <p className="text-xs text-white/80">Snap your ingredients and let AI build a healthy plate</p>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setView('relax')} className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl p-5 text-white shadow-lg active:scale-95 transition-transform text-left">
              <Leaf size={24} />
              <p className="font-bold mt-2">Relaxation</p>
              <p className="text-xs text-white/80">Calm your mind</p>
            </button>
            <button onClick={() => setView('sleep')} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 text-white shadow-lg active:scale-95 transition-transform text-left">
              <Moon size={24} />
              <p className="font-bold mt-2">Sleep</p>
              <p className="text-xs text-white/80">Rest & tips</p>
            </button>
          </div>
        </div>
      )}

      {view === 'water' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg text-center">
            <div className="relative w-40 h-40 mx-auto mb-4">
              <svg width="160" height="160" className="-rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" strokeWidth="12" className="stroke-gray-200 dark:stroke-gray-800" />
                <circle cx="80" cy="80" r="70" fill="none" strokeWidth="12" stroke="url(#waterGrad)" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 70} strokeDashoffset={2 * Math.PI * 70 * (1 - waterPct / 100)} className="transition-all duration-700" />
                <defs>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Droplets size={28} className="text-cyan-500" />
                <p className="text-2xl font-extrabold">{waterMl}ml</p>
                <p className="text-xs text-gray-400">of {settings.waterGoalMl}ml</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">Minimum recommended: 2L per day</p>
            {/* Pet reaction */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="animate-pet-idle">
                <Mascot type={profile.mascot} size={64} mood={overHydrated ? 'sad' : petMood === 'excited' ? 'excited' : 'happy'} animated={petMood === 'excited'} animation={petMood === 'excited' ? 'celebrate' : 'idle'} />
              </div>
              <div className="text-left">
                {overHydrated ? (
                  <>
                    <p className="text-sm font-bold text-rose-500">{profile.mascotName} is worried!</p>
                    <p className="text-xs text-gray-400 max-w-[160px]">That's over 1L past your goal. Too much water can be harmful — please slow down and balance your intake.</p>
                  </>
                ) : waterPct >= 100 ? (
                  <p className="text-sm font-bold text-green-500">{profile.mascotName} is celebrating! Goal reached!</p>
                ) : waterPct >= 75 ? (
                  <p className="text-sm font-bold text-cyan-500">{profile.mascotName} is happy! Almost there!</p>
                ) : (
                  <p className="text-sm font-bold text-gray-400">{profile.mascotName} is watching your progress</p>
                )}
              </div>
            </div>
            {overHydrated && (
              <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-3 mb-4 flex items-start gap-2">
                <AlertTriangle size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-rose-600 dark:text-rose-400">You've exceeded your daily water goal by over 1 liter. While staying hydrated is good, drinking too much water can dilute essential minerals in your body. Consider slowing down.</p>
              </div>
            )}
            <div className="flex gap-2 justify-center mb-3">
              {quickAdds.map((ml) => (
                <button key={ml} onClick={() => onAddWater(ml)}
                  className="flex-1 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 font-bold py-3 rounded-2xl active:scale-95 transition-transform">
                  +{ml}ml
                </button>
              ))}
            </div>
            <button onClick={() => onAddWater(-250)}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold py-2.5 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-1">
              <Minus size={14} /> Remove 250ml
            </button>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
            <p className="font-bold mb-3 text-sm">Daily Water Goal</p>
            <div className="flex items-center gap-3">
              <button onClick={() => onSetWaterGoal(Math.max(1000, settings.waterGoalMl - 250))} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><Minus size={16} /></button>
              <p className="flex-1 text-center font-extrabold text-lg">{settings.waterGoalMl} ml</p>
              <button onClick={() => onSetWaterGoal(Math.min(5000, settings.waterGoalMl + 250))} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><Plus size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {/* MEALS — with meal-type question first */}
      {view === 'meals' && (
        <div className="space-y-4 animate-fade-in">
          {/* Step 1: Choose meal type */}
          {mealType === null && (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <UtensilsCrossed size={18} className="text-orange-500" />
                <p className="font-bold">Which meal is this?</p>
              </div>
              <p className="text-xs text-gray-400 mb-4">The AI will evaluate your food based on the meal type — no heavy proteins at snack time, lighter dinners, etc.</p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((mt) => (
                  <button key={mt} onClick={() => setMealType(mt)}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 active:scale-95 transition-transform text-left">
                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      {MEAL_TYPE_ICONS[mt]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm">{MEAL_TYPE_LABELS[mt].label}</p>
                      <p className="text-[10px] text-gray-400 truncate">{MEAL_TYPE_LABELS[mt].desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Analyze food for chosen meal type */}
          {mealType !== null && (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {MEAL_TYPE_ICONS[mealType]}
                  <div>
                    <p className="font-bold text-sm">{MEAL_TYPE_LABELS[mealType].label} Analysis</p>
                    <p className="text-[10px] text-gray-400">{MEAL_TYPE_LABELS[mealType].desc}</p>
                  </div>
                </div>
                <button onClick={() => { setMealType(null); setCapturedPhoto(null); setPhotoAnalysis(null); setFoodDesc(''); setTextAnalysis(null); setShowTextDesc(false); }}
                  className="text-xs text-indigo-500 font-bold flex items-center gap-1">
                  Change <ArrowRight size={12} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-4">Snap a photo of your meal, or describe it. The AI identifies the food, reads its benefits, and evaluates if it fits a {MEAL_TYPE_LABELS[mealType].label.toLowerCase()}.</p>

              <div className="flex flex-col gap-3 mb-4">
                <PhotoCapture label="Take Photo" fullWidth onCapture={(url) => { setCapturedPhoto(url); setPhotoAnalysis(null); }} />
                <button onClick={() => setShowTextDesc(!showTextDesc)}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-500 px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 active:scale-95 transition-transform w-full">
                  <PenLine size={14} /> Describe Instead
                </button>
              </div>

              {capturedPhoto && (
                <div className="mb-4">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img src={capturedPhoto} alt="Meal" className="w-full h-full object-cover" />
                    <button onClick={() => { setCapturedPhoto(null); setPhotoAnalysis(null); }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                  {!photoAnalysis && !analyzing && (
                    <button onClick={analyzePhoto} className="w-full mt-3 bg-indigo-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2">
                      <Sparkles size={16} /> Identify & Analyze
                    </button>
                  )}
                  {analyzing && (
                    <div className="text-center py-4">
                      <div className="inline-block w-8 h-8 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                      <p className="text-sm text-gray-400 mt-2">Identifying your food...</p>
                    </div>
                  )}
                  {photoAnalysis && <AnalysisCard analysis={photoAnalysis} />}
                </div>
              )}

              {showTextDesc && (
                <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs font-bold text-gray-500 mb-2">Describe your {MEAL_TYPE_LABELS[mealType].label.toLowerCase()}:</p>
                  <textarea
                    value={foodDesc}
                    onChange={(e) => setFoodDesc(e.target.value)}
                    placeholder="e.g. grilled chicken with rice and broccoli, a side salad with avocado..."
                    className="w-full text-sm bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    rows={3}
                  />
                  <button onClick={analyzeText} disabled={!foodDesc.trim() || analyzingText}
                    className="w-full mt-2 bg-indigo-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform disabled:opacity-40 flex items-center justify-center gap-2">
                    <Sparkles size={16} /> {analyzingText ? 'Analyzing...' : 'Identify & Analyze'}
                  </button>
                  {analyzingText && (
                    <div className="text-center py-3">
                      <div className="inline-block w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                  )}
                  {textAnalysis && <AnalysisCard analysis={textAnalysis} />}
                </div>
              )}

              {!capturedPhoto && !showTextDesc && (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl py-6 text-center">
                  <Utensils size={28} className="mx-auto text-gray-300" />
                  <p className="text-xs text-gray-400 mt-2">Take a photo or describe your {MEAL_TYPE_LABELS[mealType].label.toLowerCase()} to get started</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Utensils size={18} className="text-orange-500" /><p className="font-bold">Food Diary</p><span className="text-xs text-gray-400">{diaryMeals.length}</span></div><div className="flex items-center gap-2"><button onClick={() => setShowDiaryList(!showDiaryList)} className="text-xs text-gray-400 font-bold flex items-center gap-1">{showDiaryList ? 'Hide' : 'Show'} <ChevronDown size={12} className={`transition-transform ${showDiaryList ? 'rotate-180' : ''}`} /></button><button onClick={() => setShowAddDiary(true)} className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center"><Plus size={14} /></button></div></div>
            {showDiaryList && <div className="space-y-2">
              {diaryMeals.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No meals logged yet. Tap + to add one.</p>}
              {diaryMeals.map((m) => (
                <div key={m.id} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${m.completed ? 'bg-green-50 dark:bg-green-950/30' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  {m.photo ? <img src={m.photo} alt={m.name} className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center"><Utensils size={16} className="text-orange-500" /></div>}
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${m.completed ? 'line-through text-gray-400' : ''}`}>{m.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> {m.time}{m.calories ? ` · ${m.calories} kcal` : ''}{m.protein ? ` · P${m.protein}g` : ''}{m.carbs ? ` · C${m.carbs}g` : ''}{m.fat ? ` · F${m.fat}g` : ''}</p>
                  </div>
                  <button onClick={() => onUpdateDiaryMeal(m.id, { completed: !m.completed })} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${m.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>{m.completed && <Check size={14} className="text-white" />}</button>
                  <button onClick={() => onDeleteDiaryMeal(m.id)} className="text-gray-400"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>}
          </div>

          {/* Add diary meal modal */}
          {showAddDiary && (
            <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={() => setShowAddDiary(false)}>
              <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto no-scrollbar animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4"><p className="font-bold">Add Meal to Diary</p><button onClick={() => setShowAddDiary(false)}><X size={20} className="text-gray-400" /></button></div>
                <input value={newDiary.name} onChange={(e) => setNewDiary({ ...newDiary, name: e.target.value })} placeholder="Meal name..." className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 mb-3 outline-none" />
                <div className="flex gap-3 mb-3">
                  <label className="flex-1"><span className="text-xs text-gray-400 font-semibold">Time</span><input type="time" value={newDiary.time} onChange={(e) => setNewDiary({ ...newDiary, time: e.target.value })} className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 outline-none" /></label>
                  <label className="flex-1"><span className="text-xs text-gray-400 font-semibold">Calories</span><input type="number" value={newDiary.calories} onChange={(e) => setNewDiary({ ...newDiary, calories: e.target.value })} placeholder="kcal" className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 outline-none" /></label>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <label><span className="text-xs text-gray-400 font-semibold">Protein</span><input type="number" value={newDiary.protein} onChange={(e) => setNewDiary({ ...newDiary, protein: e.target.value })} placeholder="g" className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-2 py-2 outline-none" /></label>
                  <label><span className="text-xs text-gray-400 font-semibold">Carbs</span><input type="number" value={newDiary.carbs} onChange={(e) => setNewDiary({ ...newDiary, carbs: e.target.value })} placeholder="g" className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-2 py-2 outline-none" /></label>
                  <label><span className="text-xs text-gray-400 font-semibold">Fat</span><input type="number" value={newDiary.fat} onChange={(e) => setNewDiary({ ...newDiary, fat: e.target.value })} placeholder="g" className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-2 py-2 outline-none" /></label>
                </div>
                <div className="flex items-center gap-2 mb-3"><PhotoCapture label="Add Photo" onCapture={(url) => setDiaryPhoto(url)} />{diaryPhoto && <img src={diaryPhoto} alt="Meal" className="w-12 h-12 rounded-xl object-cover" />}</div>
                <textarea value={newDiary.notes} onChange={(e) => setNewDiary({ ...newDiary, notes: e.target.value })} placeholder="Notes (optional)..." className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2 text-sm outline-none resize-none mb-3" rows={2} />
                <button onClick={handleAddDiary} disabled={!newDiary.name.trim()} className="w-full bg-orange-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform disabled:opacity-40">Add to Diary</button>
              </div>
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-4 flex items-start gap-2">
            <AlertCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Meal analysis is based on general nutrition data. It does not replace guidance from a qualified nutritionist.</p>
          </div>
        </div>
      )}

      {/* SURPRISE PLATE */}
      {view === 'surprise' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2"><Shuffle size={20} /><p className="font-bold">Surprise Plate</p></div>
            <p className="text-xs text-white/80">Choose your meal type, then snap a photo of the ingredients you have. The AI will create a healthy plate with full nutritional value.</p>
          </div>

          {/* Step 1: meal type */}
          {surpriseMealType === null ? (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
              <p className="font-bold mb-3 text-sm">Which meal do you want?</p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((mt) => (
                  <button key={mt} onClick={() => setSurpriseMealType(mt)}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 active:scale-95 transition-transform text-left">
                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      {MEAL_TYPE_ICONS[mt]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm">{MEAL_TYPE_LABELS[mt].label}</p>
                      <p className="text-[10px] text-gray-400 truncate">{MEAL_TYPE_LABELS[mt].desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {MEAL_TYPE_ICONS[surpriseMealType]}
                  <p className="font-bold text-sm">{MEAL_TYPE_LABELS[surpriseMealType].label} Plate</p>
                </div>
                <button onClick={() => { setSurpriseMealType(null); setSurprisePhotos([]); setSurpriseIngredients(''); setSurprisePlate(null); }}
                  className="text-xs text-indigo-500 font-bold flex items-center gap-1">
                  Change <ArrowRight size={12} />
                </button>
              </div>

              {/* Photo capture */}
              <p className="text-xs font-bold text-gray-500 mb-2">Snap your ingredients:</p>
              <div className="flex items-center gap-2 mb-4">
                <PhotoCapture label="Add Ingredient Photo" onCapture={(url) => setSurprisePhotos((p) => [...p, url])} />
              </div>
              {surprisePhotos.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                  {surprisePhotos.map((p, i) => (
                    <div key={i} className="relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img src={p} alt={`Ingredient ${i + 1}`} className="w-full h-full object-cover" />
                      <button onClick={() => setSurprisePhotos((photos) => photos.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Text fallback */}
              <p className="text-xs font-bold text-gray-500 mb-2">Or list what you have:</p>
              <textarea
                value={surpriseIngredients}
                onChange={(e) => setSurpriseIngredients(e.target.value)}
                placeholder="e.g. rice, chicken, broccoli, apple, yogurt..."
                className="w-full text-sm bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4"
                rows={2}
              />

              <button onClick={() => generateSurprise()} disabled={(surprisePhotos.length === 0 && !surpriseIngredients.trim()) || generating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform disabled:opacity-40 flex items-center justify-center gap-2">
                <Shuffle size={16} /> {generating ? 'Creating your plate...' : 'Generate Surprise Plate'}
              </button>

              {generating && (
                <div className="text-center py-4">
                  <div className="inline-block w-8 h-8 border-3 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-sm text-gray-400 mt-2">Building a healthy plate from your ingredients...</p>
                </div>
              )}

              {surprisePlate && <SurprisePlateCard plate={surprisePlate} />}
              {surprisePlate && surprisePlate.ingredients.length > 0 && (
                <button
                  onClick={() => generateSurprise(surpriseVariant + 1)}
                  disabled={generating}
                  className="w-full mt-3 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 font-bold py-3 rounded-2xl active:scale-95 transition-transform disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} className={generating ? 'animate-spin' : ''} /> {generating ? 'Creating...' : 'Other Option'}
                </button>
              )}
              {surprisePlate && fullRecipe && (
                <button onClick={() => setShowRecipe(!showRecipe)} className="w-full mt-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2">
                  <ChefHat size={16} /> {showRecipe ? 'Hide Full Recipe' : 'View Full Recipe Guide'}
                </button>
              )}
              {surprisePlate && fullRecipe && showRecipe && <FullRecipeCard recipe={fullRecipe} />}
            </div>
          )}
        </div>
      )}

      {view === 'relax' && (
        <div className="space-y-4 animate-fade-in">
          <RelaxationActivities onComplete={(xp, label) => { if (onGainXp) onGainXp(xp, label); }} />
        </div>
      )}

      {view === 'sleep' && (
        <div className="space-y-4 animate-fade-in">
          {/* Sleeping pet with sleep cap */}
          <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 shadow-lg overflow-hidden">
            {/* Stars */}
            {[{ x: 15, y: 15 }, { x: 35, y: 10 }, { x: 60, y: 18 }, { x: 80, y: 12 }, { x: 50, y: 22 }].map((s, i) => (
              <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${i * 0.5}s`, opacity: 0.5 }} />
            ))}
            {/* Moon */}
            <div className="absolute top-4 right-6 w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-500 shadow-[0_0_15px_6px_rgba(180,200,190,0.15)]" />
            {/* Sleeping pet */}
            <div className="relative flex flex-col items-center pt-8 pb-2">
              <div className="relative">
                <Mascot type={profile.mascot} size={80} mood="sleepy" animated={true} animation="sleep" />
                {/* Zzz particles */}
                <span className="absolute -top-1 right-2 text-indigo-300/70 text-sm font-bold zzz-particle" style={{ animationDelay: '0s' }}>z</span>
                <span className="absolute top-2 right-0 text-indigo-300/50 text-xs font-bold zzz-particle" style={{ animationDelay: '1s' }}>z</span>
                <span className="absolute top-4 right-4 text-indigo-300/30 text-[10px] font-bold zzz-particle" style={{ animationDelay: '2s' }}>z</span>
              </div>
              <p className="text-white/80 text-sm font-bold mt-3">{profile.mascotName} is resting...</p>
            </div>
          </div>

          {/* Sleep Schedule */}
          <SleepSchedule profile={profile} onUpdateProfile={onUpdateProfile || (() => {})} />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Moon size={22} className="text-indigo-500" /><h2 className="text-xl font-extrabold">Sleep Insights</h2></div>
            <button onClick={() => setEditingSleep(!editingSleep)} className="text-xs font-bold text-indigo-500 flex items-center gap-1"><Edit3 size={12} /> {editingSleep ? 'Done' : 'Customize'}</button>
          </div>

          {[...sleepCards].sort((a, b) => a.order - b.order).map((card) => {
            if (!card.visible && !editingSleep) return null;
            return (
              <div key={card.id} className={`relative ${!card.visible ? 'opacity-40' : ''}`}>
                {editingSleep && (
                  <div className="absolute -top-2 -right-2 z-10 flex gap-1">
                    <button onClick={() => moveSleepCard(card.id, 'up')} className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center text-xs">↑</button>
                    <button onClick={() => moveSleepCard(card.id, 'down')} className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center text-xs">↓</button>
                    <button onClick={() => pinSleepCard(card.id)} className={`w-6 h-6 rounded-full shadow flex items-center justify-center ${card.pinned ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-800'}`}><Pin size={10} /></button>
                    <button onClick={() => toggleSleepCard(card.id)} className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center">{card.visible ? <Eye size={10} /> : <EyeOff size={10} />}</button>
                  </div>
                )}
                {card.id === 'target' && (
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-700 rounded-3xl p-5 text-white shadow-lg">
                    <p className="text-xs text-white/70 mb-1">Sleep Target</p>
                    <p className="font-extrabold text-3xl">8h</p>
                    <p className="text-xs text-white/80 mt-2">Adults need 7-9 hours of quality sleep per night.</p>
                  </div>
                )}
                {card.id === 'bedtime' && (
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-800 rounded-3xl p-5 text-white shadow-lg">
                    <p className="text-xs text-white/70 mb-1">Your Bedtime</p>
                    <p className="font-extrabold text-3xl">{profile.routine.sleepTime}</p>
                    <p className="text-xs text-white/80 mt-2">Consistent sleep times improve your circadian rhythm.</p>
                  </div>
                )}
                {card.id === 'tips' && (
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
                    <div className="flex items-center gap-2 mb-3"><Moon size={18} className="text-indigo-500" /><p className="font-bold">Sleep Tips</p></div>
                    <div className="space-y-2">
                      {['Keep your room cool, dark, and quiet', 'Avoid caffeine after 2 PM', 'Try a relaxing activity before bed', 'Keep a consistent sleep schedule, even on weekends'].map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"><Check size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" /> {tip}</div>
                      ))}
                    </div>
                  </div>
                )}
                {card.id === 'quality' && (
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
                    <div className="flex items-center gap-2 mb-3"><TrendingUp size={18} className="text-indigo-500" /><p className="font-bold">Sleep Quality</p></div>
                    <div className="flex items-end justify-between h-24 gap-1.5 mb-2">
                      {[0.6, 0.8, 0.5, 0.9, 0.7, 0.85, 0.75].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t-lg" style={{ height: `${h * 100}%` }} />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
                  </div>
                )}
                {card.id === 'routine' && (
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
                    <div className="flex items-center gap-2 mb-3"><Clock size={18} className="text-indigo-500" /><p className="font-bold">Wind-down Routine</p></div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <p>1 hour before: Dim lights, stop screens</p>
                      <p>30 min before: Read or stretch gently</p>
                      <p>15 min before: Deep breathing or meditation</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {editingSleep && (
            <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl p-3 flex items-start gap-2">
              <Sparkles size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Tap ↑↓ to reorder, pin to keep a card on top, and eye to show/hide. Your layout is saved automatically.</p>
            </div>
          )}
        </div>
      )}

      {view === 'mood' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg text-center">
            <Smile size={32} className="mx-auto text-amber-500 mb-3" />
            <p className="font-bold mb-1">How are you feeling today?</p>
            <p className="text-xs text-gray-400 mb-6">Your routine adapts to your mood</p>
            <div className="flex justify-center gap-3 mb-6">
              {MOOD_LABELS.map((label, i) => (
                <button key={i} onClick={() => onSetMood(i + 1)}
                  className={`flex flex-col items-center gap-1 transition-all ${mood === i + 1 ? 'scale-110' : 'opacity-50 hover:opacity-80'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${mood === i + 1 ? 'bg-amber-100 dark:bg-amber-950/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Smile size={24} className={MOOD_COLORS[i]} />
                  </div>
                  <span className={`text-[10px] font-bold ${mood === i + 1 ? 'text-amber-500' : 'text-gray-400'}`}>{label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[['Stress', profile.mental.stress], ['Anxiety', profile.mental.anxiety], ['Focus', profile.mental.focus]].map(([l, v]) => (
                <div key={l as string} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
                  <p className="text-xs text-gray-400">{l}</p>
                  <p className="font-extrabold">{v as number}/10</p>
                </div>
              ))}
            </div>
          </div>
          {mood > 0 && mood <= 3 && (
            <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-4 flex items-start gap-2">
              <Heart size={18} className="text-rose-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Rough day? Your AI has lightened your schedule. Try a relaxation activity or a short walk. Be kind to yourself.</p>
            </div>
          )}
          {mood >= 4 && (
            <div className="bg-green-50 dark:bg-green-950/20 rounded-2xl p-4 flex items-start gap-2">
              <Heart size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Great mood! A good day to tackle priority tasks and push your goals forward.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AnalysisCard({ analysis }: { analysis: FoodAnalysis }) {
  const scoreColor = analysis.score >= 70 ? 'text-green-500' : analysis.score >= 40 ? 'text-amber-500' : 'text-rose-500';
  const scoreBg = analysis.score >= 70 ? 'bg-green-500' : analysis.score >= 40 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-4 animate-slide-up">
      {/* Identified food name */}
      {analysis.foodName !== 'Unknown' && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-indigo-100 dark:border-indigo-900/50">
          <Utensils size={16} className="text-indigo-500" />
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold">Identified</p>
            <p className="font-bold text-sm">{analysis.foodName}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className={scoreColor} />
          <p className="font-bold text-sm">Health Score</p>
        </div>
        <p className={`text-2xl font-extrabold ${scoreColor}`}>{analysis.score}/100</p>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 overflow-hidden">
        <div className={`h-full rounded-full ${scoreBg} transition-all`} style={{ width: `${analysis.score}%` }} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{analysis.feedback}</p>

      {/* Nutritional value */}
      {analysis.calories > 0 && (
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          <NutrientPill label="kcal" value={analysis.calories} color="text-orange-500" />
          <NutrientPill label="protein" value={`${analysis.protein}g`} color="text-rose-500" />
          <NutrientPill label="carbs" value={`${analysis.carbs}g`} color="text-amber-500" />
          <NutrientPill label="fat" value={`${analysis.fat}g`} color="text-blue-500" />
          <NutrientPill label="fiber" value={`${analysis.fiber}g`} color="text-green-500" />
        </div>
      )}

      {/* Benefits */}
      {analysis.benefits.length > 0 && (
        <div className="mb-3 bg-green-50 dark:bg-green-950/20 rounded-2xl p-3">
          <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-1.5 flex items-center gap-1"><Heart size={12} /> Benefits</p>
          {analysis.benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-green-700 dark:text-green-300 mb-1">
              <Check size={12} className="mt-0.5 flex-shrink-0" /> {b}
            </div>
          ))}
        </div>
      )}

      {analysis.positives.length > 0 && (
        <div className="mb-2">
          {analysis.positives.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mb-1">
              <Check size={12} /> {p}
            </div>
          ))}
        </div>
      )}
      {analysis.negatives.length > 0 && (
        <div className="mb-2">
          {analysis.negatives.map((n, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-rose-500 mb-1">
              <AlertCircle size={12} /> {n}
            </div>
          ))}
        </div>
      )}
      {analysis.suggestions.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
          {analysis.suggestions.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-indigo-500 mb-1">
              <Sparkles size={12} /> {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SurprisePlateCard({ plate }: { plate: SurprisePlate }) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl p-4 mt-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-2">
        <Shuffle size={18} className="text-purple-500" />
        <p className="font-bold text-sm">{plate.plateName}</p>
        {plate.healthy && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">Healthy</span>}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{plate.description}</p>

      {plate.ingredients.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {plate.ingredients.map((ing, i) => (
            <span key={i} className="text-xs bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full font-bold text-purple-600 dark:text-purple-400">{ing}</span>
          ))}
        </div>
      )}

      {plate.calories > 0 && (
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          <NutrientPill label="kcal" value={plate.calories} color="text-orange-500" />
          <NutrientPill label="protein" value={`${plate.protein}g`} color="text-rose-500" />
          <NutrientPill label="carbs" value={`${plate.carbs}g`} color="text-amber-500" />
          <NutrientPill label="fat" value={`${plate.fat}g`} color="text-blue-500" />
          <NutrientPill label="fiber" value={`${plate.fiber}g`} color="text-green-500" />
        </div>
      )}

      <p className="text-sm text-gray-600 dark:text-gray-300">{plate.feedback}</p>
    </div>
  );
}

function NutrientPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-2 text-center">
      <p className={`font-extrabold text-sm ${color}`}>{value}</p>
      <p className="text-[10px] text-gray-400 uppercase font-bold">{label}</p>
    </div>
  );
}

function FullRecipeCard({ recipe }: { recipe: FullRecipe }) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-4 mt-3 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <ChefHat size={18} className="text-amber-600" />
        <p className="font-bold text-sm">{recipe.recipeName}</p>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-2 text-center"><p className="text-[10px] text-gray-400">Difficulty</p><p className="font-bold text-xs">{recipe.difficulty}</p></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-2 text-center"><p className="text-[10px] text-gray-400">Prep</p><p className="font-bold text-xs">{recipe.totalPrepTimeMin}m</p></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-2 text-center"><p className="text-[10px] text-gray-400">Cook</p><p className="font-bold text-xs">{recipe.totalCookTimeMin}m</p></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-2 text-center"><p className="text-[10px] text-gray-400">Serves</p><p className="font-bold text-xs">{recipe.servings}</p></div>
      </div>
      <p className="text-xs font-bold text-gray-500 mb-2">Ingredients:</p>
      <div className="space-y-1 mb-4">
        {recipe.ingredients.map((ing, i) => (
          <div key={i} className="flex justify-between text-xs"><span>{ing.name}</span><span className="font-bold text-amber-600">{ing.amount}</span></div>
        ))}
      </div>
      <p className="text-xs font-bold text-gray-500 mb-2">Step-by-step:</p>
      <div className="space-y-3 mb-4">
        {recipe.steps.map((step, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">{i + 1}</div>
              <p className="text-xs font-bold">{step.instruction}</p>
            </div>
            <div className="flex flex-wrap gap-2 ml-8 text-[10px] text-gray-400">
              <span>Adding: <b className="text-amber-600">{step.ingredient}</b> ({step.amount})</span>
              {step.cookTimeSec > 0 && <span>· Wait: <b>{Math.floor(step.cookTimeSec / 60)}min {step.cookTimeSec % 60}s</b></span>}
              {step.temperature && <span>· Heat: <b>{step.temperature}</b></span>}
            </div>
            {step.tip && <div className="mt-1 ml-8 flex items-start gap-1.5 text-[10px] text-indigo-500"><Sparkles size={10} className="mt-0.5 flex-shrink-0" /> {step.tip}</div>}
          </div>
        ))}
      </div>
      <p className="text-xs font-bold text-gray-500 mb-2">Nutrition (per serving):</p>
      <div className="grid grid-cols-5 gap-1.5 mb-4">
        <NutrientPill label="kcal" value={recipe.nutrition.calories} color="text-orange-500" />
        <NutrientPill label="protein" value={`${recipe.nutrition.protein}g`} color="text-rose-500" />
        <NutrientPill label="carbs" value={`${recipe.nutrition.carbs}g`} color="text-amber-500" />
        <NutrientPill label="fat" value={`${recipe.nutrition.fat}g`} color="text-blue-500" />
        <NutrientPill label="fiber" value={`${recipe.nutrition.fiber}g`} color="text-green-500" />
      </div>
      <p className="text-xs font-bold text-gray-500 mb-2">Pro tips:</p>
      <div className="space-y-1">
        {recipe.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300"><Check size={12} className="text-amber-500 mt-0.5 flex-shrink-0" /> {tip}</div>
        ))}
      </div>
    </div>
  );
}

function SleepSchedule({ profile, onUpdateProfile }: { profile: UserProfile; onUpdateProfile: (patch: Partial<UserProfile>) => void }) {
  const [bedtime, setBedtime] = useState(profile.routine.sleepTime || '23:00');
  const [wakeTime, setWakeTime] = useState(profile.routine.wakeTime || '07:00');
  const [goalHours, setGoalHours] = useState(8);
  const [reminder, setReminder] = useState(true);
  const [reminderDays, setReminderDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const calcHours = () => {
    const [bh, bm] = bedtime.split(':').map(Number);
    const [wh, wm] = wakeTime.split(':').map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins < 0) mins += 24 * 60;
    return (mins / 60).toFixed(1);
  };

  const toggleDay = (day: string) => {
    setReminderDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const save = () => {
    onUpdateProfile({
      routine: { ...profile.routine, sleepTime: bedtime, wakeTime: wakeTime },
    });
  };

  const aiTip = (() => {
    const hours = parseFloat(calcHours());
    if (hours < 6) return 'You\'re sleeping less than 6 hours. Try going to bed 30 minutes earlier this week.';
    if (hours > 9) return 'Sleeping over 9 hours can be as disruptive as too little. Aim for 7-8 hours.';
    if (bedtime > '00:00' && bedtime < '02:00') return 'Going to bed after midnight can affect your circadian rhythm. Try shifting 15 minutes earlier each night.';
    return 'Your sleep schedule looks balanced. Keep it consistent, even on weekends!';
  })();

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Moon size={18} className="text-indigo-500" />
        <p className="font-bold text-sm">Sleep Schedule</p>
      </div>

      <div className="flex gap-3 mb-4">
        <label className="flex-1">
          <span className="text-xs text-gray-400 font-semibold">Bedtime</span>
          <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)}
            className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2.5 outline-none focus:ring-2 ring-indigo-400" />
        </label>
        <label className="flex-1">
          <span className="text-xs text-gray-400 font-semibold">Wake up</span>
          <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)}
            className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2.5 outline-none focus:ring-2 ring-indigo-400" />
        </label>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl p-3 mb-4 text-center">
        <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{calcHours()}h</p>
        <p className="text-xs text-gray-400">of sleep per night</p>
      </div>

      <div className="mb-4">
        <span className="text-xs text-gray-400 font-semibold">Sleep goal: {goalHours}h</span>
        <input type="range" min={5} max={10} value={goalHours} onChange={(e) => setGoalHours(parseInt(e.target.value))} className="w-full mt-1" />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-semibold">Reminders</span>
          <button onClick={() => setReminder(!reminder)}
            className={`w-11 h-6 rounded-full transition-colors ${reminder ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${reminder ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {reminder && (
          <div className="flex gap-1.5 flex-wrap">
            {DAYS.map((d) => (
              <button key={d} onClick={() => toggleDay(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${reminderDays.includes(d) ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI recommendation */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-3 mb-4 flex items-start gap-2">
        <Sparkles size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-600 dark:text-gray-300">{aiTip}</p>
      </div>

      <button onClick={save}
        className="w-full bg-indigo-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm">
        <Check size={16} /> Save Schedule
      </button>
    </div>
  );
}
