import type { AppBackground } from '../types';

const backgrounds: Record<AppBackground, string> = {
  aurora: 'from-indigo-100 via-purple-50 to-cyan-100 dark:from-indigo-950 dark:via-slate-900 dark:to-cyan-950',
  sunset: 'from-orange-100 via-rose-50 to-amber-100 dark:from-orange-950 dark:via-rose-950 dark:to-amber-950',
  ocean: 'from-blue-100 via-cyan-50 to-teal-100 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950',
  forest: 'from-green-100 via-emerald-50 to-lime-100 dark:from-green-950 dark:via-emerald-950 dark:to-lime-950',
  mint: 'from-teal-100 via-emerald-50 to-green-100 dark:from-teal-950 dark:via-emerald-950 dark:to-green-950',
  lavender: 'from-fuchsia-100 via-pink-50 to-rose-100 dark:from-fuchsia-950 dark:via-pink-950 dark:to-rose-950',
  midnight: 'from-slate-800 via-gray-900 to-slate-800 dark:from-slate-950 dark:via-gray-950 dark:to-slate-950',
  peach: 'from-rose-100 via-orange-50 to-yellow-100 dark:from-rose-950 dark:via-orange-950 dark:to-yellow-950',
};

export function BackgroundLayer({ bg }: { bg: AppBackground }) {
  return (
    <div className={`fixed inset-0 -z-10 bg-gradient-to-br ${backgrounds[bg]} transition-all duration-700`} />
  );
}
