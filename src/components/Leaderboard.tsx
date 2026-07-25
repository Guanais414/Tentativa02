import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { UserProfile, GameState } from '../types';
import { Mascot } from './Mascot';
import { Trophy, Flame, Star, Crown, RefreshCw, LogIn } from 'lucide-react';

interface Props {
  profile: UserProfile;
  game: GameState;
  userId: string | null;
}

interface LeaderEntry {
  id: string;
  player_name: string;
  mascot_type: string;
  level: number;
  xp: number;
  streak: number;
  country: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export function Leaderboard({ profile, game, userId }: Props) {
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('id, player_name, mascot_type, level, xp, streak, country, avatar_url, bio')
      .order('xp', { ascending: false })
      .limit(50);

    if (error) {
      setError('Could not load leaderboard. Please try again.');
    } else if (data) {
      setEntries(data as LeaderEntry[]);
    }
    setLoading(false);
  };

  const syncMyEntry = async () => {
    if (!userId) {
      setError('Please sign in to sync your score.');
      return;
    }
    setSyncing(true);
    setError(null);

    // Upsert: try update first by user_id, insert if not found
    const { data: existing } = await supabase
      .from('leaderboard_entries')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('leaderboard_entries')
        .update({
          level: game.level,
          xp: game.xp,
          streak: game.streak,
          mascot_type: profile.mascot,
          country: profile.personal.country,
          avatar_url: profile.avatarUrl || null,
          bio: profile.bio || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      if (error) setError('Could not sync your score. Please try again.');
    } else {
      const { error } = await supabase
        .from('leaderboard_entries')
        .insert({
          player_name: profile.personal.name || 'Anonymous',
          mascot_type: profile.mascot,
          level: game.level,
          xp: game.xp,
          streak: game.streak,
          country: profile.personal.country || null,
          avatar_url: profile.avatarUrl || null,
          bio: profile.bio || null,
        });
      if (error) setError('Could not sync your score. Please try again.');
    }
    setSyncing(false);
    loadLeaderboard();
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const displayEntries = entries.length > 0 ? entries : DEMO_ENTRIES;

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">Leaderboard</h1>
        <button onClick={syncMyEntry} disabled={syncing || !userId}
          className="flex items-center gap-1.5 bg-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-full active:scale-95 transition-transform disabled:opacity-50">
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Sync
        </button>
      </div>

      {!userId && (
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-3 flex items-center gap-2 mb-4">
          <LogIn size={16} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Sign in to sync your score and compete on the global leaderboard.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-3 mb-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Your rank card */}
      <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-3xl p-5 text-white shadow-lg shadow-indigo-500/30 mb-4">
        <div className="flex items-center gap-3">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white/30" />
          ) : (
            <Mascot type={profile.mascot} size={56} mood="excited" />
          )}
          <div className="flex-1">
            <p className="font-bold">{profile.personal.name || 'You'}</p>
            <p className="text-xs text-white/80">Level {game.level} · {game.xp} XP · {game.streak} day streak</p>
          </div>
          <Trophy size={24} />
        </div>
      </div>

      {/* Top 3 podium */}
      {displayEntries.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 mb-4 items-end">
          <Podium entry={displayEntries[1]} rank={2} height="h-20" color="from-gray-300 to-gray-400" />
          <Podium entry={displayEntries[0]} rank={1} height="h-28" color="from-yellow-300 to-amber-500" />
          <Podium entry={displayEntries[2]} rank={3} height="h-16" color="from-orange-300 to-orange-500" />
        </div>
      )}

      {/* Full list */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="inline-block w-8 h-8 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-2" />
            <p className="text-sm">Loading rankings...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayEntries.map((e, i) => {
              const isMe = userId && e.id === userId;
              return (
                <div key={e.id || i} className={`flex items-center gap-3 p-3 ${isMe ? 'bg-indigo-50 dark:bg-indigo-950/30' : ''}`}>
                  <div className={`w-8 text-center font-extrabold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-500' : 'text-gray-300'}`}>
                    {i + 1}
                  </div>
                  {e.avatar_url ? (
                    <img src={e.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <Mascot type={(e.mascot_type as 'otter' | 'goose') || 'otter'} size={36} animated={false} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{e.player_name}{isMe && <span className="text-indigo-500 text-xs ml-1">(you)</span>}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                      <span>Lv {e.level}</span>
                      <span className="flex items-center gap-0.5"><Star size={10} /> {e.xp}</span>
                      <span className="flex items-center gap-0.5"><Flame size={10} /> {e.streak}</span>
                    </p>
                  </div>
                  {i < 3 && <Crown size={16} className={i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-orange-500'} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 text-center mt-4">Tap Sync to publish your score and compete globally</p>
    </div>
  );
}

function Podium({ entry, rank, height, color }: { entry: LeaderEntry; rank: number; height: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      {entry.avatar_url ? (
        <img src={entry.avatar_url} alt="" className={`rounded-full object-cover border-2 border-white/20 ${rank === 1 ? 'w-14 h-14' : 'w-11 h-11'}`} />
      ) : (
        <Mascot type={(entry.mascot_type as 'otter' | 'goose') || 'otter'} size={rank === 1 ? 56 : 44} mood="excited" />
      )}
      <p className="font-bold text-xs mt-1 truncate max-w-full">{entry.player_name}</p>
      <p className="text-xs text-gray-400">Lv {entry.level}</p>
      <div className={`w-full ${height} bg-gradient-to-t ${color} rounded-t-2xl flex items-center justify-center mt-1`}>
        <span className="font-extrabold text-lg text-white drop-shadow">{rank}</span>
      </div>
    </div>
  );
}

const DEMO_ENTRIES: LeaderEntry[] = [
  { id: 'd1', player_name: 'AquaMaster', mascot_type: 'otter', level: 24, xp: 4200, streak: 18, country: 'Brazil', avatar_url: null, bio: null },
  { id: 'd2', player_name: 'GooseRunner', mascot_type: 'goose', level: 19, xp: 3100, streak: 12, country: 'USA', avatar_url: null, bio: null },
  { id: 'd3', player_name: 'StudyOtter', mascot_type: 'otter', level: 16, xp: 2800, streak: 9, country: 'Portugal', avatar_url: null, bio: null },
  { id: 'd4', player_name: 'ZenGoose', mascot_type: 'goose', level: 14, xp: 2200, streak: 7, country: 'Japan', avatar_url: null, bio: null },
  { id: 'd5', player_name: 'FocusFlow', mascot_type: 'otter', level: 11, xp: 1500, streak: 5, country: 'Germany', avatar_url: null, bio: null },
  { id: 'd6', player_name: 'HabitHero', mascot_type: 'goose', level: 8, xp: 900, streak: 3, country: 'Brazil', avatar_url: null, bio: null },
  { id: 'd7', player_name: 'EarlyBird', mascot_type: 'otter', level: 6, xp: 600, streak: 2, country: 'France', avatar_url: null, bio: null },
];
