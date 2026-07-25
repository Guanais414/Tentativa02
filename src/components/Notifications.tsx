import { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, Trophy, Target, Sparkles, Calendar, ShoppingBag, Heart } from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'challenge' | 'reward' | 'agenda' | 'shop' | 'event' | 'update';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface NotificationSettings {
  challenges: boolean;
  rewards: boolean;
  agenda: boolean;
  shop: boolean;
  events: boolean;
  updates: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  challenges: true,
  rewards: true,
  agenda: true,
  shop: false,
  events: true,
  updates: true,
};

const TYPE_ICONS: Record<string, { icon: typeof Bell; color: string }> = {
  challenge: { icon: Target, color: 'indigo' },
  reward: { icon: Trophy, color: 'amber' },
  agenda: { icon: Calendar, color: 'cyan' },
  shop: { icon: ShoppingBag, color: 'purple' },
  event: { icon: Sparkles, color: 'green' },
  update: { icon: Bell, color: 'blue' },
};

function loadNotifs(): NotificationItem[] {
  try {
    const raw = localStorage.getItem('lifeflow_notifications');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function loadSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem('lifeflow_notifSettings');
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

interface Props {
  onNavigate: (screen: string) => void;
}

export function NotificationSystem({ onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [badge, setBadge] = useState(0);

  useEffect(() => {
    setNotifs(loadNotifs());
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    localStorage.setItem('lifeflow_notifications', JSON.stringify(notifs));
    setBadge(notifs.filter((n) => !n.read).length);
  }, [notifs]);

  useEffect(() => {
    localStorage.setItem('lifeflow_notifSettings', JSON.stringify(settings));
  }, [settings]);

  // Seed initial notifications for first-time users
  useEffect(() => {
    const existing = loadNotifs();
    if (existing.length === 0) {
      const seed: NotificationItem[] = [
        { id: 'n1', type: 'challenge', title: 'New Weekly Challenges!', message: 'Fresh challenges are available. Complete them for XP and coins!', timestamp: Date.now(), read: false },
        { id: 'n2', type: 'event', title: 'Welcome to Bamboo Forest', message: 'Share your thoughts anonymously and encourage others in the community.', timestamp: Date.now() - 60000, read: false },
        { id: 'n3', type: 'agenda', title: 'Your routine is ready', message: 'Your AI has generated a personalized schedule. Check your agenda!', timestamp: Date.now() - 120000, read: false },
      ];
      setNotifs(seed);
    }
  }, []);

  const addNotification = useCallback((type: NotificationItem['type'], title: string, message: string) => {
    const key = type as keyof NotificationSettings;
    if (!settings[key]) return;
    setNotifs((prev) => [{ id: `n${Date.now()}`, type, title, message, timestamp: Date.now(), read: false }, ...prev].slice(0, 30));
  }, [settings]);

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotif = (id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotifClick = (n: NotificationItem) => {
    setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
    if (n.type === 'challenge') onNavigate('profile');
    else if (n.type === 'agenda') onNavigate('agenda');
    else if (n.type === 'shop') onNavigate('mascot');
    else if (n.type === 'event') onNavigate('bamboo');
    setOpen(false);
  };

  return (
    <>
      {/* Bell button */}
      <button onClick={() => setOpen(true)}
        className="fixed top-4 right-16 z-40 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg flex items-center justify-center active:scale-90 transition-transform">
        <Bell size={18} className="text-gray-600 dark:text-gray-300" />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>

      {/* Notification panel */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm h-full overflow-y-auto no-scrollbar animate-slide-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 px-4 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-extrabold flex items-center gap-2"><Bell size={18} /> Notifications</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowSettings(!showSettings)} className="text-xs font-bold text-indigo-500 px-2 py-1">Settings</button>
                <button onClick={markAllRead} className="text-xs font-bold text-gray-400 px-2 py-1">Mark all read</button>
                <button onClick={() => setOpen(false)}><X size={18} className="text-gray-400" /></button>
              </div>
            </div>

            {showSettings ? (
              <div className="p-4 space-y-3">
                <p className="font-bold text-sm mb-2">Choose what to receive</p>
                {([
                  ['challenges', 'Weekly Challenges', 'New challenges and progress updates'],
                  ['rewards', 'Rewards', 'When you earn XP, coins, or level up'],
                  ['agenda', 'Agenda Reminders', 'Upcoming tasks and schedule changes'],
                  ['shop', 'Shop Updates', 'New items and special offers'],
                  ['events', 'Special Events', 'Bamboo Forest and community events'],
                  ['updates', 'App Updates', 'New features and improvements'],
                ] as const).map(([key, label, desc]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
                    <div>
                      <p className="font-semibold text-sm">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                    <button onClick={() => setSettings((s) => ({ ...s, [key]: !s[key] }))}
                      className={`w-11 h-6 rounded-full transition-all relative ${settings[key] ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings[key] ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {notifs.length === 0 && (
                  <div className="text-center py-16">
                    <Bell size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-400">No notifications yet</p>
                  </div>
                )}
                {notifs.map((n) => {
                  const info = TYPE_ICONS[n.type];
                  const Icon = info.icon;
                  return (
                    <div key={n.id} className={`rounded-2xl p-3 flex items-start gap-3 transition-all ${n.read ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-indigo-50 dark:bg-indigo-950/20'}`}>
                      <div className={`w-10 h-10 rounded-2xl bg-${info.color}-100 dark:bg-${info.color}-950/30 flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className={`text-${info.color}-500`} />
                      </div>
                      <button onClick={() => handleNotifClick(n)} className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">{n.title}</p>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.timestamp)}</p>
                      </button>
                      <button onClick={() => deleteNotif(n.id)} className="flex-shrink-0">
                        <X size={14} className="text-gray-300" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
