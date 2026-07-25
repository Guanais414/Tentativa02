import { useState, useMemo } from 'react';
import type { RoutineTask, UserProfile, GameState } from '../types';
import { Check, Clock, AlertTriangle, Zap, RotateCcw, X, Plus, ChevronLeft, ChevronRight, Calendar, List, Trash2, Edit3, Repeat, Flag, Palette } from 'lucide-react';
import { PhotoCapture } from './PhotoCapture';

interface Props {
  profile: UserProfile;
  game: GameState;
  tasks: RoutineTask[];
  onToggleTask: (id: string) => void;
  onReschedule: (fromIndex: number, delayMin: number) => void;
  onAddTask: (task: RoutineTask) => void;
  onUpdateTask: (id: string, patch: Partial<RoutineTask>) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (tasks: RoutineTask[]) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string; ring: string }> = {
  study: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-500', ring: 'ring-indigo-400' },
  work: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500', ring: 'ring-blue-400' },
  meal: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500', ring: 'ring-orange-400' },
  exercise: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500', ring: 'ring-rose-400' },
  habit: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', ring: 'ring-amber-400' },
  leisure: { bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-600 dark:text-cyan-400', dot: 'bg-cyan-500', ring: 'ring-cyan-400' },
  sleep: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500', ring: 'ring-purple-400' },
  wellness: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500', ring: 'ring-green-400' },
};

const CATEGORY_LABELS: Record<string, string> = {
  study: 'Study', work: 'Work', meal: 'Meal', exercise: 'Exercise',
  habit: 'Habit', leisure: 'Leisure', sleep: 'Sleep', wellness: 'Wellness',
};

const RECURRENCE_OPTIONS: { value: RoutineTask['recurrence']; label: string }[] = [
  { value: 'none', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'weekdays', label: 'Weekdays' },
];

export function Agenda({ tasks, onToggleTask, onReschedule, onAddTask, onUpdateTask, onDeleteTask, onReorderTasks }: Props) {
  const [view, setView] = useState<'timeline' | 'month' | 'week'>('timeline');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showReschedule, setShowReschedule] = useState<string | null>(null);
  const [delay, setDelay] = useState(30);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taskPhotos, setTaskPhotos] = useState<Record<string, string>>({});
  const [newTask, setNewTask] = useState({
    title: '', startTime: '12:00', duration: 30, category: 'habit' as RoutineTask['category'],
    recurrence: 'none' as RoutineTask['recurrence'], priority: false, notes: '',
  });

  const sorted = useMemo(() => [...tasks].sort((a, b) => a.startTime.localeCompare(b.startTime)), [tasks]);
  const now = new Date().toTimeString().slice(0, 5);

  const handleAdd = () => {
    if (!newTask.title) return;
    const end = addMin(newTask.startTime, newTask.duration);
    onAddTask({
      id: `t${Date.now()}`, title: newTask.title, category: newTask.category,
      startTime: newTask.startTime, endTime: end, completed: false, xp: 20, icon: newTask.category,
      recurrence: newTask.recurrence, priority: newTask.priority, notes: newTask.notes,
    });
    setNewTask({ ...newTask, title: '' });
    setShowAdd(false);
  };

  const moveTask = (id: string, dir: 'up' | 'down') => {
    const idx = sorted.findIndex((t) => t.id === id);
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[idx], reordered[swap]] = [reordered[swap], reordered[idx]];
    onReorderTasks(reordered);
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">Agenda</h1>
        <button onClick={() => setShowAdd(true)} className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-90 transition-transform">
          <Plus size={20} />
        </button>
      </div>

      {/* View toggle */}
      <div className="flex gap-1.5 mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
        {(['timeline', 'week', 'month'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${view === v ? 'bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-400'}`}>
            {v === 'timeline' ? <List size={12} /> : v === 'week' ? <Calendar size={12} /> : <Calendar size={12} />}
            {v === 'timeline' ? 'Timeline' : v === 'week' ? 'Week' : 'Month'}
          </button>
        ))}
      </div>

      {/* Timeline view */}
      {view === 'timeline' && (
        <div className="relative animate-fade-in">
          <div className="absolute left-[26px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-800" />
          <div className="space-y-2">
            {sorted.map((t, i) => {
              const colors = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.habit;
              const isNow = now >= t.startTime && now < t.endTime;
              const isPast = now > t.endTime && !t.completed;
              const isEditing = editingId === t.id;
              return (
                <div key={t.id} className="relative pl-14 animate-fade-in">
                  <div className="absolute left-0 top-3 w-[52px] text-right">
                    <p className="text-xs font-bold tabular-nums">{t.startTime}</p>
                    <p className="text-[10px] text-gray-400">{t.endTime}</p>
                  </div>
                  <div className={`absolute left-[22px] top-4 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 z-10 ${t.completed ? 'bg-green-500' : colors.dot}`} />

                  <div className={`rounded-2xl p-3 shadow-sm transition-all ${t.completed ? 'bg-green-50 dark:bg-green-950/20' : isNow ? `${colors.bg} ring-2 ${colors.ring}` : 'bg-white/80 dark:bg-gray-900/80'}`}>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onToggleTask(t.id)} className="flex-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${colors.bg} ${colors.text}`}>{CATEGORY_LABELS[t.category]}</span>
                          {t.priority && <Flag size={10} className="text-orange-500" />}
                          {t.recurrence && t.recurrence !== 'none' && <Repeat size={10} className="text-gray-400" />}
                        </div>
                        <p className={`font-semibold text-sm mt-0.5 ${t.completed ? 'line-through text-gray-400' : ''}`}>{t.title}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={11} /> {t.startTime}-{t.endTime}
                          {t.rescheduled && <span className="text-amber-500">· moved</span>}
                        </p>
                      </button>
                      <button onClick={() => onToggleTask(t.id)}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${t.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
                        {t.completed && <Check size={14} className="text-white" />}
                      </button>
                    </div>

                    {/* Action row */}
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      {!t.completed && (
                        <PhotoCapture label="Photo" onCapture={(url) => setTaskPhotos((prev) => ({ ...prev, [t.id]: url }))} />
                      )}
                      {taskPhotos[t.id] && <img src={taskPhotos[t.id]} alt="Task" className="w-8 h-8 rounded-lg object-cover" />}
                      <button onClick={() => setEditingId(isEditing ? null : t.id)} className="text-xs text-gray-400 font-semibold flex items-center gap-1 hover:text-indigo-500">
                        <Edit3 size={11} /> Edit
                      </button>
                      {!t.completed && (
                        <button onClick={() => setShowReschedule(t.id)} className="text-xs text-gray-400 font-semibold flex items-center gap-1 hover:text-amber-500">
                          <RotateCcw size={11} /> Move
                        </button>
                      )}
                      <button onClick={() => moveTask(t.id, 'up')} disabled={i === 0} className="text-xs text-gray-400 disabled:opacity-30">↑</button>
                      <button onClick={() => moveTask(t.id, 'down')} disabled={i === sorted.length - 1} className="text-xs text-gray-400 disabled:opacity-30">↓</button>
                      <button onClick={() => onDeleteTask(t.id)} className="text-xs text-gray-400 font-semibold flex items-center gap-1 hover:text-rose-500 ml-auto">
                        <Trash2 size={11} />
                      </button>
                    </div>

                    {/* Edit panel */}
                    {isEditing && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2 animate-slide-up">
                        <input value={t.title} onChange={(e) => onUpdateTask(t.id, { title: e.target.value })}
                          className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm outline-none" />
                        <div className="flex gap-2">
                          <label className="flex-1">
                            <span className="text-[10px] text-gray-400">Start</span>
                            <input type="time" value={t.startTime} onChange={(e) => onUpdateTask(t.id, { startTime: e.target.value, endTime: addMin(e.target.value, durationToMin(t.startTime, t.endTime)) })}
                              className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-2 py-1.5 text-sm outline-none" />
                          </label>
                          <label className="flex-1">
                            <span className="text-[10px] text-gray-400">Duration</span>
                            <input type="number" value={durationToMin(t.startTime, t.endTime)} onChange={(e) => onUpdateTask(t.id, { endTime: addMin(t.startTime, parseInt(e.target.value) || 30) })}
                              className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-2 py-1.5 text-sm outline-none" />
                          </label>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {(Object.keys(CATEGORY_COLORS) as RoutineTask['category'][]).map((c) => (
                            <button key={c} onClick={() => onUpdateTask(t.id, { category: c })}
                              className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold ${t.category === c ? `${CATEGORY_COLORS[c].bg} ${CATEGORY_COLORS[c].text} ring-1 ${CATEGORY_COLORS[c].ring}` : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                              {CATEGORY_LABELS[c]}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1.5">
                          {RECURRENCE_OPTIONS.map((r) => (
                            <button key={r.value} onClick={() => onUpdateTask(t.id, { recurrence: r.value })}
                              className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold ${t.recurrence === r.value ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                              {r.label}
                            </button>
                          ))}
                        </div>
                        <button onClick={() => onUpdateTask(t.id, { priority: !t.priority })}
                          className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold ${t.priority ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                          <Flag size={10} className="inline mr-1" /> Priority
                        </button>
                        <button onClick={() => setEditingId(null)} className="w-full bg-indigo-500 text-white font-bold py-2 rounded-xl text-sm active:scale-95 mt-2">Done</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {sorted.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Calendar size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No tasks scheduled. Tap + to add one.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Week view */}
      {view === 'week' && <WeekView tasks={sorted} selectedDate={selectedDate} onSelectDate={setSelectedDate} />}

      {/* Month view */}
      {view === 'month' && <MonthView tasks={sorted} selectedDate={selectedDate} onSelectDate={setSelectedDate} />}

      {/* Reschedule modal */}
      {showReschedule && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={() => setShowReschedule(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-amber-500" />
              <p className="font-bold">Reschedule remaining tasks</p>
            </div>
            <p className="text-sm text-gray-400 mb-4">Push back the rest of your day — priorities are preserved.</p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button onClick={() => setDelay(Math.max(15, delay - 15))} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 font-bold">−</button>
              <div className="text-center">
                <p className="text-3xl font-extrabold">{delay}</p>
                <p className="text-xs text-gray-400">minutes</p>
              </div>
              <button onClick={() => setDelay(delay + 15)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 font-bold">+</button>
            </div>
            <button onClick={() => { const idx = sorted.findIndex((t) => t.id === showReschedule); onReschedule(idx, delay); setShowReschedule(null); }}
              className="w-full bg-indigo-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform">
              Reschedule +{delay}min
            </button>
            <button onClick={() => setShowReschedule(null)} className="w-full text-gray-400 font-semibold py-2 mt-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Add task modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto no-scrollbar animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold">New Task</p>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title..."
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 mb-3 outline-none" />
            <div className="flex gap-3 mb-3">
              <label className="flex-1">
                <span className="text-xs text-gray-400 font-semibold">Start time</span>
                <input type="time" value={newTask.startTime} onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                  className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 outline-none" />
              </label>
              <label className="flex-1">
                <span className="text-xs text-gray-400 font-semibold">Duration (min)</span>
                <input type="number" value={newTask.duration} onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 30 })}
                  className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 outline-none" />
              </label>
            </div>
            <p className="text-xs text-gray-400 font-semibold mb-1.5">Category</p>
            <div className="flex gap-1.5 flex-wrap mb-3">
              {(Object.keys(CATEGORY_COLORS) as RoutineTask['category'][]).map((c) => (
                <button key={c} onClick={() => setNewTask({ ...newTask, category: c })}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${newTask.category === c ? `${CATEGORY_COLORS[c].bg} ${CATEGORY_COLORS[c].text} ring-1 ${CATEGORY_COLORS[c].ring}` : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 font-semibold mb-1.5">Repeat</p>
            <div className="flex gap-1.5 mb-3">
              {RECURRENCE_OPTIONS.map((r) => (
                <button key={r.value} onClick={() => setNewTask({ ...newTask, recurrence: r.value })}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${newTask.recurrence === r.value ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  {r.label}
                </button>
              ))}
            </div>
            <button onClick={() => setNewTask({ ...newTask, priority: !newTask.priority })}
              className={`px-3 py-1.5 rounded-full text-xs font-bold mb-3 ${newTask.priority ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
              <Flag size={10} className="inline mr-1" /> Priority
            </button>
            <textarea value={newTask.notes} onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })} placeholder="Notes (optional)..."
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2 text-sm outline-none resize-none mb-3" rows={2} />
            <button onClick={handleAdd} className="w-full bg-indigo-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform">
              Add Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Week View ---- */
function WeekView({ tasks, selectedDate, onSelectDate }: { tasks: RoutineTask[]; selectedDate: Date; onSelectDate: (d: Date) => void }) {
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
  const todayStr = new Date().toDateString();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 7); onSelectDate(d); }} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <ChevronLeft size={16} className="text-gray-400" />
        </button>
        <p className="font-bold text-sm">{startOfWeek.toLocaleDateString('en', { month: 'short', day: 'numeric' })} — {days[6].toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
        <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 7); onSelectDate(d); }} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 mb-4">
        {days.map((d, i) => {
          const isToday = d.toDateString() === todayStr;
          const isSelected = d.toDateString() === selectedDate.toDateString();
          return (
            <button key={i} onClick={() => onSelectDate(d)}
              className={`flex flex-col items-center py-2 rounded-2xl transition-all ${isSelected ? 'bg-indigo-500 text-white shadow-md' : isToday ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <span className="text-[10px] font-bold">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}</span>
              <span className="text-lg font-extrabold">{d.getDate()}</span>
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        {tasks.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No tasks for this day</p>}
        {tasks.map((t) => {
          const colors = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.habit;
          return (
            <div key={t.id} className={`flex items-center gap-3 p-3 rounded-2xl ${t.completed ? 'bg-green-50 dark:bg-green-950/20' : colors.bg}`}>
              <div className={`w-2 h-10 rounded-full ${colors.dot}`} />
              <div className="flex-1">
                <p className={`font-semibold text-sm ${t.completed ? 'line-through text-gray-400' : ''}`}>{t.title}</p>
                <p className="text-xs text-gray-400">{t.startTime} - {t.endTime}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${colors.bg} ${colors.text}`}>{CATEGORY_LABELS[t.category]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Month View ---- */
function MonthView({ tasks, selectedDate, onSelectDate }: { tasks: RoutineTask[]; selectedDate: Date; onSelectDate: (d: Date) => void }) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toDateString();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => onSelectDate(new Date(year, month - 1, 1))} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <ChevronLeft size={16} className="text-gray-400" />
        </button>
        <p className="font-bold">{selectedDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}</p>
        <button onClick={() => onSelectDate(new Date(year, month + 1, 1))} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isToday = d.toDateString() === todayStr;
          const isSelected = d.toDateString() === selectedDate.toDateString();
          const dayTasks = tasks.filter((t) => t.startTime); // simplified — all tasks shown
          return (
            <button key={i} onClick={() => onSelectDate(d)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${isSelected ? 'bg-indigo-500 text-white shadow-md' : isToday ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 font-bold' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <span className="text-sm font-bold">{d.getDate()}</span>
              {dayTasks.length > 0 && <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />}
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-sm font-bold text-gray-500">{tasks.length} tasks today</p>
        {tasks.slice(0, 5).map((t) => {
          const colors = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.habit;
          return (
            <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800">
              <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
              <span className="text-sm flex-1">{t.title}</span>
              <span className="text-xs text-gray-400">{t.startTime}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function addMin(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor((total % (24 * 60)) / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function durationToMin(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}
