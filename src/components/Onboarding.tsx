import { useState } from 'react';
import type { UserProfile, MascotType, HabitType, DietRestriction, ExerciseType, StudySubject } from '../types';
import { Mascot } from './Mascot';
import { Info, CalendarCheck, ChevronDown } from 'lucide-react';
import { COUNTRIES, EDUCATION_LEVELS } from '../constants';

const MASCOT_INTERACTIONS: Record<MascotType, string> = {
  otter: 'splashes playfully in the water!',
  goose: 'honks and flaps its wings excitedly!',
  rabbit: 'hops around and twitches its nose!',
  penguin: 'waddles and slides on its belly!',
  dog: 'wags its tail and barks happily!',
  cat: 'purrs and rubs against your hand!',
};

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const uid = () => `s${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

const initialProfile: UserProfile = {
  personal: { name: '', birthDate: '', country: '', language: '', profession: '', education: '' },
  routine: { wakeTime: '07:00', sleepTime: '22:30', freeDays: [], workDays: [], studyDays: [], dailyAvailableHours: '4' },
  study: { topics: '', goalType: '', hoursPerDay: '2', currentLevel: '', examDate: '', subjects: [] },
  nutrition: { restrictions: [], goal: 'healthy', mealsPerDay: 3, mealTimes: [], favoriteFoods: '', dislikedFoods: '' },
  exercise: { types: [], goal: 'health', frequencyPerWeek: 3 },
  habits: [],
  mental: { stress: 5, anxiety: 5, focus: 5, energy: 5, mood: 5 },
  mascot: 'otter',
  mascotName: '',
  onboarded: false,
  dailyTarget: { studyMinutes: 120, exercises: 5, chapters: 2, reviews: 3, customGoal: '' },
};

const STEPS = [
  'welcome', 'mascot', 'personal', 'routine', 'study', 'nutrition', 'exercise', 'habits', 'mental', 'done',
] as const;

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState<UserProfile>(initialProfile);
  const [newSubject, setNewSubject] = useState<StudySubject>({ id: uid(), name: '', goal: '', level: 'beginner', difficulty: 'medium', priority: false, weight: 5, recommendedMinutes: 30 });

  const stepName = STEPS[step];
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const upd = (patch: Partial<UserProfile>) => setP((prev) => ({ ...prev, ...patch }));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8 max-w-md mx-auto">
      {/* Progress dots */}
      <div className="flex gap-1.5 mb-8">
        {STEPS.filter((s) => s !== 'welcome' && s !== 'done').map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i < step ? 'w-6 bg-indigo-500' : 'w-1.5 bg-gray-300 dark:bg-gray-700'}`} />
        ))}
      </div>

      {stepName === 'welcome' && (
        <div className="text-center animate-fade-in">
          <Mascot type="otter" size={120} mood="excited" />
          <h1 className="text-3xl font-extrabold mt-4 bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">Dango</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3">Your personal life manager. Let's set up your perfect routine together.</p>
          <button onClick={next} className="mt-8 w-full bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform">
            Get Started
          </button>
        </div>
      )}

      {stepName === 'mascot' && (
        <div className="w-full animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 text-center">Choose your companion</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-6">They'll live in your pond and cheer you on!</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {(['otter', 'goose', 'rabbit', 'penguin', 'dog', 'cat'] as MascotType[]).map((t) => (
              <button key={t} onClick={() => upd({ mascot: t })}
                className={`flex flex-col items-center gap-1 p-4 rounded-3xl border-2 transition-all ${p.mascot === t ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 scale-105' : 'border-gray-200 dark:border-gray-700'}`}>
                <Mascot type={t} size={56} mood="happy" animated={false} />
                <span className="font-bold text-xs capitalize">{t}</span>
              </button>
            ))}
          </div>
          {p.mascot && (
            <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-3 mb-4 text-center animate-fade-in">
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 capitalize">{p.mascot} {p.mascotName && `(${p.mascotName})`}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{MASCOT_INTERACTIONS[p.mascot]}</p>
            </div>
          )}
          <input value={p.mascotName} onChange={(e) => upd({ mascotName: e.target.value })} placeholder="Name your companion..."
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-400 mb-6" />
          <NavButtons back={back} next={next} canNext={p.mascotName.length > 0} />
        </div>
      )}

      {stepName === 'personal' && (
        <div className="w-full animate-fade-in">
          <h2 className="text-2xl font-bold mb-6">Tell us about you</h2>
          <div className="space-y-3">
            <Field label="Name" value={p.personal.name} onChange={(v) => upd({ personal: { ...p.personal, name: v } })} />
            <Field label="Date of birth" value={p.personal.birthDate} onChange={(v) => upd({ personal: { ...p.personal, birthDate: v } })} type="date" />
            <p className="text-xs text-gray-400 -mt-2">We only use this to know your age — it stays private.</p>
            <SelectField label="Country" value={p.personal.country} onChange={(v) => upd({ personal: { ...p.personal, country: v } })} options={COUNTRIES} placeholder="Search your country..." />
            <Field label="Language" value={p.personal.language} onChange={(v) => upd({ personal: { ...p.personal, language: v } })} />
            <p className="text-xs text-gray-400 -mt-2">We use this only to know how many people from different languages join the app.</p>
            <Field label="Profession" value={p.personal.profession} onChange={(v) => upd({ personal: { ...p.personal, profession: v } })} />
            <SelectField label="Education level" value={p.personal.education} onChange={(v) => upd({ personal: { ...p.personal, education: v } })} options={[...EDUCATION_LEVELS]} placeholder="Select..." />
          </div>
          <NavButtons back={back} next={next} canNext={p.personal.name.length > 0 && p.personal.birthDate.length > 0 && p.personal.country.length > 0} />
        </div>
      )}

      {stepName === 'routine' && (
        <div className="w-full animate-fade-in">
          <h2 className="text-2xl font-bold mb-6">Your daily rhythm</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <TimeField label="Wake up" value={p.routine.wakeTime} onChange={(v) => upd({ routine: { ...p.routine, wakeTime: v } })} />
              <TimeField label="Sleep" value={p.routine.sleepTime} onChange={(v) => upd({ routine: { ...p.routine, sleepTime: v } })} />
            </div>
            <Field label="Available hours per day" value={p.routine.dailyAvailableHours} onChange={(v) => upd({ routine: { ...p.routine, dailyAvailableHours: v } })} type="number" />
            <DayPicker label="Work days" value={p.routine.workDays} onChange={(v) => upd({ routine: { ...p.routine, workDays: v } })} />
            <DayPicker label="Study days" value={p.routine.studyDays} onChange={(v) => upd({ routine: { ...p.routine, studyDays: v } })} />
            <DayPicker label="Free days" value={p.routine.freeDays} onChange={(v) => upd({ routine: { ...p.routine, freeDays: v } })} />
          </div>
          <NavButtons back={back} next={next} canNext />
        </div>
      )}

      {stepName === 'study' && (
        <div className="w-full animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">Study goals</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">What are you studying for?</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {['Vestibular', 'Concurso', 'College', 'Languages', 'Programming', 'Music', 'Other'].map((g) => (
              <Chip key={g} active={p.study.goalType === g} onClick={() => upd({ study: { ...p.study, goalType: g } })}>{g}</Chip>
            ))}
          </div>
          <div className="space-y-3 mb-4">
            <Field label="Hours per day" value={p.study.hoursPerDay} onChange={(v) => upd({ study: { ...p.study, hoursPerDay: v } })} type="number" />
            <Field label="Current level" value={p.study.currentLevel} onChange={(v) => upd({ study: { ...p.study, currentLevel: v } })} />
            <Field label="Exam date (optional)" value={p.study.examDate} onChange={(v) => upd({ study: { ...p.study, examDate: v } })} type="date" />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="font-semibold mb-2">Priority subjects</p>
            <div className="flex gap-2 mb-2">
              <input value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} placeholder="Subject name..."
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm outline-none" />
              <select value={newSubject.difficulty} onChange={(e) => setNewSubject({ ...newSubject, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                className="bg-gray-100 dark:bg-gray-800 rounded-xl px-2 py-2 text-sm outline-none">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button onClick={() => { if (newSubject.name) { upd({ study: { ...p.study, subjects: [...p.study.subjects, newSubject] } }); setNewSubject({ ...newSubject, id: uid(), name: '' }); } }}
                className="bg-indigo-500 text-white rounded-xl px-3 font-bold">+</button>
            </div>
            <div className="space-y-1">
              {p.study.subjects.map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm">
                  <span>{s.name} <span className="text-gray-400">({s.difficulty})</span></span>
                  <button onClick={() => upd({ study: { ...p.study, subjects: p.study.subjects.filter((x) => x.id !== s.id) } })} className="text-red-400">✕</button>
                </div>
              ))}
            </div>
          </div>
          <NavButtons back={back} next={next} canNext />
        </div>
      )}

      {stepName === 'nutrition' && (
        <div className="w-full animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">Nutrition</h2>
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-3 mb-4 flex items-start gap-2">
            <Info size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-600 dark:text-amber-400">We have an eating guide to help you — but it shouldn't be taken 100% seriously, since it's built with general information and isn't a specialist.</p>
          </div>
          <p className="font-semibold mb-2 text-sm">Restrictions</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(['vegetarian', 'vegan', 'diabetic', 'celiac', 'lactose', 'hypertension', 'allergies', 'none'] as DietRestriction[]).map((r) => (
              <Chip key={r} active={p.nutrition.restrictions.includes(r)}
                onClick={() => { const has = p.nutrition.restrictions.includes(r); upd({ nutrition: { ...p.nutrition, restrictions: has ? p.nutrition.restrictions.filter((x) => x !== r) : [...p.nutrition.restrictions, r] } }); }}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Chip>
            ))}
          </div>
          <p className="font-semibold mb-2 text-sm">Goal</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[['lose', 'Lose weight'], ['gain', 'Gain mass'], ['maintain', 'Maintain'], ['healthy', 'Healthy']].map(([v, l]) => (
              <Chip key={v} active={p.nutrition.goal === v} onClick={() => upd({ nutrition: { ...p.nutrition, goal: v as 'lose' | 'gain' | 'maintain' | 'healthy' } })}>{l}</Chip>
            ))}
          </div>
          <Field label="Meals per day" value={String(p.nutrition.mealsPerDay)} onChange={(v) => upd({ nutrition: { ...p.nutrition, mealsPerDay: parseInt(v) || 3 } })} type="number" />
          <Field label="Favorite foods" value={p.nutrition.favoriteFoods} onChange={(v) => upd({ nutrition: { ...p.nutrition, favoriteFoods: v } })} />
          <Field label="Disliked foods" value={p.nutrition.dislikedFoods} onChange={(v) => upd({ nutrition: { ...p.nutrition, dislikedFoods: v } })} />
          <NavButtons back={back} next={next} canNext />
        </div>
      )}

      {stepName === 'exercise' && (
        <div className="w-full animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">Exercise</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">What do you do?</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(['gym', 'run', 'walk', 'bike', 'yoga', 'pilates', 'weights'] as ExerciseType[]).map((t) => (
              <Chip key={t} active={p.exercise.types.includes(t)}
                onClick={() => { const has = p.exercise.types.includes(t); upd({ exercise: { ...p.exercise, types: has ? p.exercise.types.filter((x) => x !== t) : [...p.exercise.types, t] } }); }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Chip>
            ))}
          </div>
          <p className="font-semibold mb-2 text-sm">Goal</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[['lose', 'Lose'], ['endurance', 'Endurance'], ['hypertrophy', 'Hypertrophy'], ['health', 'Health']].map(([v, l]) => (
              <Chip key={v} active={p.exercise.goal === v} onClick={() => upd({ exercise: { ...p.exercise, goal: v as 'lose' | 'endurance' | 'hypertrophy' | 'health' } })}>{l}</Chip>
            ))}
          </div>
          <Field label="Sessions per week" value={String(p.exercise.frequencyPerWeek)} onChange={(v) => upd({ exercise: { ...p.exercise, frequencyPerWeek: parseInt(v) || 3 } })} type="number" />
          <NavButtons back={back} next={next} canNext />
        </div>
      )}

      {stepName === 'habits' && (
        <div className="w-full animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">Build habits</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm">Pick what you want to develop</p>
          <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-3 mb-4 flex items-start gap-2">
            <CalendarCheck size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-indigo-600 dark:text-indigo-400">Your chosen habits will be added to your agenda with an AI guide to help you build and strengthen each one.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(['reading', 'meditation', 'water', 'sleep_early', 'languages', 'writing', 'exercise', 'prayer', 'journaling', 'other'] as HabitType[]).map((t) => {
              const exists = p.habits.find((h) => h.type === t);
              return (
                <Chip key={t} active={!!exists}
                  onClick={() => {
                    if (exists) upd({ habits: p.habits.filter((h) => h.id !== exists.id) });
                    else upd({ habits: [...p.habits, { id: uid(), type: t, label: t.replace('_', ' '), targetPerDay: 1, completedToday: 0, history: [] }] });
                  }}>
                  {t.replace('_', ' ')}
                </Chip>
              );
            })}
          </div>
          <NavButtons back={back} next={next} canNext />
        </div>
      )}

      {stepName === 'mental' && (
        <div className="w-full animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">How are you feeling?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">This helps us balance your routine</p>
          <div className="space-y-5">
            {([['stress', 'Stress'], ['anxiety', 'Anxiety'], ['focus', 'Focus'], ['energy', 'Energy'], ['mood', 'Mood']] as const).map(([key, label]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1"><span className="font-semibold">{label}</span><span className="text-gray-400">{p.mental[key]}/10</span></div>
                <input type="range" min={1} max={10} value={p.mental[key]}
                  onChange={(e) => upd({ mental: { ...p.mental, [key]: parseInt(e.target.value) } })}
                  className="w-full accent-indigo-500" />
              </div>
            ))}
          </div>
          <NavButtons back={back} next={next} canNext />
        </div>
      )}

      {stepName === 'done' && (
        <div className="text-center animate-fade-in">
          <Mascot type={p.mascot} size={120} mood="excited" />
          <h2 className="text-2xl font-bold mt-4">All set, {p.personal.name}!</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Your AI companion is generating your personalized routine...</p>
          <button onClick={() => onComplete({ ...p, onboarded: true })}
            className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
            Enter Dango
          </button>
        </div>
      )}
    </div>
  );
}

function NavButtons({ back, next, canNext }: { back: () => void; next: () => void; canNext: boolean }) {
  return (
    <div className="flex gap-3 mt-8">
      <button onClick={back} className="px-5 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 font-semibold active:scale-95 transition-transform">Back</button>
      <button onClick={next} disabled={!canNext}
        className="flex-1 bg-indigo-500 text-white font-bold py-3 rounded-2xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform disabled:opacity-40 disabled:shadow-none">
        Continue
      </button>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-400" />
    </label>
  );
}

function SelectField({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = query ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase())) : options;
  return (
    <div className="relative">
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</span>
      <button type="button" onClick={() => setOpen(!open)}
        className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-400 text-left flex items-center justify-between">
        <span className={value ? '' : 'text-gray-400'}>{value || placeholder || 'Select...'}</span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setQuery(''); }} />
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-64 overflow-hidden flex flex-col">
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 outline-none border-b border-gray-100 dark:border-gray-700 text-sm" />
            <div className="overflow-y-auto">
              {filtered.map((o) => (
                <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); setQuery(''); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 ${value === o ? 'bg-indigo-50 dark:bg-indigo-950/30 font-bold text-indigo-600' : ''}`}>
                  {o}
                </button>
              ))}
              {filtered.length === 0 && <p className="px-4 py-3 text-sm text-gray-400">No matches</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block flex-1">
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</span>
      <input type="time" value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-400" />
    </label>
  );
}

function DayPicker({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (d: string) => onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d]);
  return (
    <div>
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex gap-1.5 mt-1">
        {WEEKDAYS.map((d) => (
          <button key={d} onClick={() => toggle(d)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${value.includes(d) ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${active ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
      {children}
    </button>
  );
}
