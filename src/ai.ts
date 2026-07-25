import type { UserProfile, RoutineTask, MealSuggestion } from './types';

let idc = 0;
const uid = () => `t${Date.now()}${idc++}`;

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor((total % (24 * 60)) / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export function generateRoutine(profile: UserProfile): RoutineTask[] {
  const tasks: RoutineTask[] = [];
  const wake = profile.routine.wakeTime || '07:00';
  const sleep = profile.routine.sleepTime || '22:30';

  // Morning routine
  tasks.push({
    id: uid(), title: 'Morning Stretch & Hydrate', category: 'wellness',
    startTime: wake, endTime: addMinutes(wake, 15), completed: false, xp: 15, icon: '🧘', priority: true,
  });

  let cursor = addMinutes(wake, 20);

  // Study blocks (Pomodoro style)
  const studyHours = parseFloat(profile.study.hoursPerDay) || 2;
  const studyBlocks = Math.max(1, Math.min(4, Math.round(studyHours / 0.5)));
  const subjects = profile.study.subjects.filter((s) => s.priority).length > 0
    ? profile.study.subjects.filter((s) => s.priority)
    : profile.study.subjects;

  for (let i = 0; i < studyBlocks && subjects.length > 0; i++) {
    const subj = subjects[i % subjects.length];
    tasks.push({
      id: uid(), title: `${subj.name} (Pomodoro)`, category: 'study',
      startTime: cursor, endTime: addMinutes(cursor, 30), completed: false, xp: 40, icon: '📚', priority: true,
    });
    cursor = addMinutes(cursor, 35);
  }

  // Breakfast
  tasks.push({
    id: uid(), title: 'Breakfast', category: 'meal',
    startTime: addMinutes(wake, 90), endTime: addMinutes(wake, 105), completed: false, xp: 10, icon: '🍳',
  });

  // Work/study gap
  cursor = addMinutes(wake, 130);
  const workDays = profile.routine.workDays.length > 0;
  if (workDays) {
    tasks.push({
      id: uid(), title: 'Deep Work Session', category: 'work',
      startTime: cursor, endTime: addMinutes(cursor, 90), completed: false, xp: 50, icon: '💼', priority: true,
    });
    cursor = addMinutes(cursor, 100);
  }

  // Lunch
  tasks.push({
    id: uid(), title: 'Lunch', category: 'meal',
    startTime: '12:30', endTime: '13:00', completed: false, xp: 10, icon: '🥗',
  });

  // Exercise
  if (profile.exercise.types.length > 0) {
    tasks.push({
      id: uid(), title: `${profile.exercise.types[0].charAt(0).toUpperCase() + profile.exercise.types[0].slice(1)} Session`,
      category: 'exercise',
      startTime: '14:00', endTime: '15:00', completed: false, xp: 45, icon: '🏃', priority: true,
    });
  }

  // Afternoon study / review (spaced repetition)
  if (subjects.length > 0) {
    tasks.push({
      id: uid(), title: 'Spaced Repetition Review', category: 'study',
      startTime: '16:00', endTime: '16:30', completed: false, xp: 30, icon: '🔁',
    });
  }

  // Habits
  profile.habits.slice(0, 3).forEach((h, i) => {
    const t = addMinutes('17:00', i * 20);
    tasks.push({
      id: uid(), title: h.label, category: 'habit',
      startTime: t, endTime: addMinutes(t, 15), completed: false, xp: 20, icon: '✨',
    });
  });

  // Dinner
  tasks.push({
    id: uid(), title: 'Dinner', category: 'meal',
    startTime: '19:00', endTime: '19:30', completed: false, xp: 10, icon: '🍽️',
  });

  // Wellness / relaxation
  tasks.push({
    id: uid(), title: 'Wind-down & Relax', category: 'wellness',
    startTime: addMinutes(sleep, -45), endTime: addMinutes(sleep, -30), completed: false, xp: 15, icon: '🌙',
  });

  // Sleep
  tasks.push({
    id: uid(), title: 'Sleep', category: 'sleep',
    startTime: sleep, endTime: wake, completed: false, xp: 5, icon: '😴',
  });

  return tasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function generateMeals(profile: UserProfile): MealSuggestion[] {
  const meals: MealSuggestion[] = [];
  const restrictions = profile.nutrition.restrictions;
  const isVeg = restrictions.includes('vegetarian') || restrictions.includes('vegan');
  const isVegan = restrictions.includes('vegan');

  const breakfasts = isVegan
    ? ['Oatmeal with Berries', 'Smoothie Bowl', 'Avocado Toast']
    : isVeg
    ? ['Greek Yogurt with Granola', 'Scrambled Eggs & Spinach', 'Oatmeal with Banana']
    : ['Egg & Cheese Omelette', 'Protein Pancakes', 'Breakfast Burrito'];

  const lunches = isVegan
    ? ['Quinoa Buddha Bowl', 'Chickpea Salad Wrap', 'Lentil Soup']
    : isVeg
    ? ['Caprese Pasta', 'Grilled Veggie Wrap', 'Caesar Salad']
    : ['Grilled Chicken Salad', 'Salmon & Rice', 'Turkey Sandwich'];

  const dinners = isVegan
    ? ['Tofu Stir-Fry', 'Vegetable Curry', 'Stuffed Bell Peppers']
    : isVeg
    ? ['Margherita Pizza', 'Mushroom Risotto', 'Veggie Tacos']
    : ['Beef Stir-Fry', 'Baked Salmon', 'Chicken & Veggies'];

  const times = profile.nutrition.mealTimes.length > 0
    ? profile.nutrition.mealTimes
    : [
      { id: 'm1', name: 'Breakfast', time: '08:00' },
      { id: 'm2', name: 'Lunch', time: '12:30' },
      { id: 'm3', name: 'Dinner', time: '19:00' },
    ];

  const pools = [breakfasts, lunches, dinners];
  times.slice(0, 3).forEach((mt, i) => {
    const pool = pools[i] || pools[2];
    const name = pool[Math.floor(Math.random() * pool.length)];
    meals.push({
      id: uid(), name, time: mt.time, description: `A balanced ${mt.name.toLowerCase()} option`,
      emoji: ['🥣', '🥗', '🍽️'][i] || '🍽️', calories: 350 + i * 150, completed: false,
    });
  });

  return meals;
}

export function rescheduleDay(tasks: RoutineTask[], fromIndex: number, delayMinutes: number): RoutineTask[] {
  const result = [...tasks];
  for (let i = fromIndex; i < result.length; i++) {
    if (result[i].category === 'sleep' || result[i].completed) continue;
    result[i] = {
      ...result[i],
      startTime: addMinutes(result[i].startTime, delayMinutes),
      endTime: addMinutes(result[i].endTime, delayMinutes),
      rescheduled: true,
    };
  }
  return result;
}
