import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserProfile, GameState, AppSettings, AppBackground, ThemeMode, MascotType } from '../types';
import { Mascot } from './Mascot';
import { Achievements } from './Achievements';
import { WeeklyChallenges } from './WeeklyChallenges';
import { Palette, Moon, Sun, Type, RotateCcw, Info, ChevronRight, Trophy, Target, Star, Flame, Zap, Edit2, X, Check, Camera, TrendingUp, Award, LogOut, ImagePlus, Trash2, Download, Share2, Sparkles, RotateCw, Sliders, User as UserIcon } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface Props {
  profile: UserProfile;
  game: GameState;
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onReset: () => void;
  onGainXp: (amount: number, label?: string) => void;
  onSignOut: () => void;
  userId: string | null;
}

const BACKGROUNDS: { id: AppBackground; name: string; preview: string }[] = [
  { id: 'aurora', name: 'Aurora', preview: 'from-indigo-400 to-cyan-400' },
  { id: 'sunset', name: 'Sunset', preview: 'from-orange-400 to-rose-400' },
  { id: 'ocean', name: 'Ocean', preview: 'from-blue-400 to-teal-400' },
  { id: 'forest', name: 'Forest', preview: 'from-green-400 to-emerald-400' },
  { id: 'mint', name: 'Mint', preview: 'from-teal-400 to-green-400' },
  { id: 'lavender', name: 'Lavender', preview: 'from-fuchsia-400 to-pink-400' },
  { id: 'midnight', name: 'Midnight', preview: 'from-slate-700 to-gray-900' },
  { id: 'peach', name: 'Peach', preview: 'from-rose-400 to-yellow-300' },
];

const ACCENT_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6'];

const ALL_PETS: MascotType[] = ['goose', 'otter', 'rabbit', 'penguin', 'dog', 'cat'];
const PET_NAMES: Record<MascotType, string> = { goose: 'Goose', otter: 'Otter', rabbit: 'Rabbit', penguin: 'Penguin', dog: 'Dog', cat: 'Cat' };

interface PhotoEntry {
  id: string;
  image_data: string;
  source: string;
  caption: string | null;
  created_at: string;
}

export function Profile({ profile, game, settings, onUpdateSettings, onUpdateProfile, onReset, onGainXp, onSignOut, userId }: Props) {
  const [showReset, setShowReset] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(profile.personal);
  const [editRoutine, setEditRoutine] = useState(profile.routine);
  const [editBio, setEditBio] = useState(profile.bio || '');
  const [editInterests, setEditInterests] = useState((profile.interests || []).join(', '));
  const [showPhotoCreator, setShowPhotoCreator] = useState(false);
  const [showPhotoHistory, setShowPhotoHistory] = useState(false);
  const [showPetPicker, setShowPetPicker] = useState(false);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl || null);

  const saveEdits = () => {
    onUpdateProfile({
      personal: editData,
      routine: editRoutine,
      bio: editBio,
      interests: editInterests.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setEditing(false);
  };

  const setAvatar = (dataUrl: string) => {
    setAvatarPreview(dataUrl);
    onUpdateProfile({ avatarUrl: dataUrl });
    savePhoto(dataUrl, 'avatar');
    setShowPhotoCreator(false);
  };

  const savePhoto = async (imageData: string, source: string) => {
    if (!userId) return;
    await supabase.from('photo_history').insert({
      user_id: userId,
      image_data: imageData,
      source,
    });
    fetchPhotos();
  };

  const fetchPhotos = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('photo_history')
      .select('id, image_data, source, caption, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setPhotos(data as PhotoEntry[]);
  }, [userId]);

  const deletePhoto = async (id: string) => {
    await supabase.from('photo_history').delete().eq('id', id);
    fetchPhotos();
  };

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto space-y-4">
      {/* Profile header with avatar */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="w-20 h-20 rounded-full object-cover shadow-md" />
            ) : (
              <Mascot type={profile.mascot} size={80} mood="happy" />
            )}
            <button onClick={() => setShowPhotoCreator(true)}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform">
              <Camera size={14} />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-xl font-extrabold">{profile.personal.name}</p>
              <button onClick={() => {
                setEditData(profile.personal); setEditRoutine(profile.routine);
                setEditBio(profile.bio || ''); setEditInterests((profile.interests || []).join(', '));
                setEditing(true);
              }}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-90 transition-transform">
                <Edit2 size={12} className="text-gray-400" />
              </button>
            </div>
            {profile.bio && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{profile.bio}</p>}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span className="text-xs bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                <Star size={10} /> Lv {game.level}
              </span>
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                <Zap size={10} /> {game.coins}
              </span>
              <span className="text-xs bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                <Flame size={10} /> {game.streak}d
              </span>
            </div>
          </div>
        </div>

        {/* XP progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400 font-semibold">Level {game.level}</span>
            <span className="text-gray-400">{game.xp} XP</span>
          </div>
          <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (game.xp / (Math.floor(100 * Math.pow(game.level, 1.5)))) * 100)}%` }} />
          </div>
        </div>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-3">
            {profile.interests.map((tag, i) => (
              <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2.5 py-1 rounded-full font-semibold">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Pet customization */}
      <Section icon={<Sparkles size={18} className="text-cyan-500" />} title="Your Pet">
        <div className="flex items-center gap-4">
          <Mascot type={profile.mascot} size={64} mood="happy" />
          <div className="flex-1">
            <p className="font-bold text-sm">{profile.mascotName}</p>
            <p className="text-xs text-gray-400">{PET_NAMES[profile.mascot]}</p>
            <button onClick={() => setShowPetPicker(true)}
              className="mt-2 text-xs font-bold text-indigo-500 flex items-center gap-1">
              Change pet <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </Section>

      {/* Stats overview */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox icon={<Trophy size={18} className="text-amber-500" />} value={game.achievements.length} label="Badges" onClick={() => setShowAchievements(true)} />
        <StatBox icon={<Target size={18} className="text-indigo-500" />} value={game.weeklyChallenges.filter((c) => c.completed).length} label="Challenges" onClick={() => setShowChallenges(true)} />
        <StatBox icon={<Flame size={18} className="text-orange-500" />} value={game.streak} label="Day streak" />
      </div>

      {/* Photo History */}
      <Section icon={<Camera size={18} className="text-purple-500" />} title="Photo History">
        {photos.length === 0 ? (
          <p className="text-sm text-gray-400">No photos yet. Your captured and created images will appear here.</p>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {photos.slice(0, 8).map((p) => (
                <img key={p.id} src={p.image_data} alt="" className="aspect-square rounded-xl object-cover" />
              ))}
            </div>
            <button onClick={() => setShowPhotoHistory(true)}
              className="text-xs font-bold text-indigo-500 flex items-center gap-1">
              View all {photos.length} photos <ChevronRight size={12} />
            </button>
          </>
        )}
      </Section>

      {/* Appearance */}
      <Section icon={<Palette size={18} className="text-indigo-500" />} title="Appearance">
        <div className="flex gap-2 mb-4">
          {(['light', 'dark'] as ThemeMode[]).map((t) => (
            <button key={t} onClick={() => onUpdateSettings({ theme: t })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${settings.theme === t ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
              {t === 'light' ? <Sun size={16} /> : <Moon size={16} />}
              {t === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
        <p className="text-xs font-bold text-gray-400 mb-2">App Background</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {BACKGROUNDS.map((b) => (
            <button key={b.id} onClick={() => onUpdateSettings({ background: b.id })}
              className={`aspect-square rounded-2xl bg-gradient-to-br ${b.preview} transition-all ${settings.background === b.id ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-900 scale-105' : ''}`}
              title={b.name} />
          ))}
        </div>
        <p className="text-xs font-bold text-gray-400 mb-2">Accent Color</p>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map((c) => (
            <button key={c} onClick={() => onUpdateSettings({ accentColor: c })}
              className={`w-9 h-9 rounded-full transition-all ${settings.accentColor === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-110' : ''}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </Section>

      {/* Font scale */}
      <Section icon={<Type size={18} className="text-cyan-500" />} title="Text Size">
        <div className="flex gap-2">
          {(['small', 'medium', 'large'] as const).map((s) => (
            <button key={s} onClick={() => onUpdateSettings({ fontScale: s })}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm capitalize transition-all ${settings.fontScale === s ? 'bg-cyan-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
              {s}
            </button>
          ))}
        </div>
      </Section>

      {/* Personal info */}
      <Section icon={<Info size={18} className="text-amber-500" />} title="Your Info">
        <div className="space-y-1.5 text-sm">
          <InfoRow label="Date of Birth" value={profile.personal.birthDate} />
          <InfoRow label="Country" value={profile.personal.country} />
          <InfoRow label="Language" value={profile.personal.language} />
          <InfoRow label="Education" value={profile.personal.education} />
          <InfoRow label="Wake / Sleep" value={`${profile.routine.wakeTime} - ${profile.routine.sleepTime}`} />
          <InfoRow label="Study goal" value={profile.study.goalType} />
          <InfoRow label="Diet goal" value={profile.nutrition.goal} />
          <InfoRow label="Exercise" value={`${profile.exercise.frequencyPerWeek}x/week`} />
        </div>
      </Section>

      {/* Sign out */}
      <button onClick={onSignOut}
        className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
        <LogOut size={16} /> Sign Out
      </button>

      {/* Danger zone */}
      <Section icon={<RotateCcw size={18} className="text-red-500" />} title="Reset">
        {!showReset ? (
          <button onClick={() => setShowReset(true)}
            className="w-full bg-red-50 dark:bg-red-950/20 text-red-500 font-bold py-3 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
            <RotateCcw size={16} /> Start Over (clear all data)
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-400 text-center">This will erase your profile, tasks, and progress. Are you sure?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowReset(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 font-bold py-3 rounded-2xl text-sm">Cancel</button>
              <button onClick={onReset} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-2xl text-sm active:scale-95 transition-transform">Yes, Reset</button>
            </div>
          </div>
        )}
      </Section>

      <p className="text-center text-xs text-gray-400 pt-2">Dango v2.0 · Your personal life manager</p>

      {/* Modals */}
      {showAchievements && <Achievements game={game} onClose={() => setShowAchievements(false)} onGainXp={onGainXp} />}
      {showChallenges && <WeeklyChallenges game={game} onClose={() => setShowChallenges(false)} />}

      {/* Pet picker */}
      {showPetPicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowPetPicker(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto no-scrollbar animate-slide-up p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold">Choose Your Pet</h2>
              <button onClick={() => setShowPetPicker(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {ALL_PETS.map((p) => (
                <button key={p} onClick={() => { onUpdateProfile({ mascot: p }); setShowPetPicker(false); }}
                  className={`flex flex-col items-center p-4 rounded-2xl transition-all ${profile.mascot === p ? 'bg-indigo-50 dark:bg-indigo-950/30 ring-2 ring-indigo-400' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <Mascot type={p} size={56} mood="happy" animated={false} />
                  <p className="text-xs font-bold mt-2">{PET_NAMES[p]}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Photo creator */}
      {showPhotoCreator && (
        <PhotoCreator onSave={setAvatar} onClose={() => setShowPhotoCreator(false)} />
      )}

      {/* Photo history */}
      {showPhotoHistory && (
        <PhotoHistoryView photos={photos} onClose={() => setShowPhotoHistory(false)} onDelete={deletePhoto} onSetAvatar={setAvatar} />
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setEditing(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto no-scrollbar animate-slide-up p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold">Edit Profile</h2>
              <button onClick={() => setEditing(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <EditField label="Name" value={editData.name} onChange={(v) => setEditData({ ...editData, name: v })} />
              <EditField label="Date of Birth" value={editData.birthDate} onChange={(v) => setEditData({ ...editData, birthDate: v })} type="date" />
              <EditField label="Country" value={editData.country} onChange={(v) => setEditData({ ...editData, country: v })} />
              <EditField label="Profession" value={editData.profession} onChange={(v) => setEditData({ ...editData, profession: v })} />
              <div>
                <span className="text-xs text-gray-400 font-semibold">Bio</span>
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} maxLength={200} placeholder="Tell us about yourself..."
                  className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5 outline-none focus:ring-2 ring-indigo-400 resize-none h-20 text-sm" />
                <p className="text-xs text-gray-300 text-right">{editBio.length}/200</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-semibold">Interests (comma separated)</span>
                <input value={editInterests} onChange={(e) => setEditInterests(e.target.value)} placeholder="reading, hiking, music..."
                  className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5 outline-none focus:ring-2 ring-indigo-400 text-sm" />
              </div>
              <div className="flex gap-3">
                <label className="flex-1">
                  <span className="text-xs text-gray-400 font-semibold">Wake time</span>
                  <input type="time" value={editRoutine.wakeTime} onChange={(e) => setEditRoutine({ ...editRoutine, wakeTime: e.target.value })}
                    className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 outline-none" />
                </label>
                <label className="flex-1">
                  <span className="text-xs text-gray-400 font-semibold">Sleep time</span>
                  <input type="time" value={editRoutine.sleepTime} onChange={(e) => setEditRoutine({ ...editRoutine, sleepTime: e.target.value })}
                    className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 outline-none" />
                </label>
              </div>
            </div>
            <button onClick={saveEdits} className="w-full mt-4 bg-indigo-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2">
              <Check size={16} /> Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoCreator({ onSave, onClose }: { onSave: (dataUrl: string) => void; onClose: () => void }) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch {
      alert('Camera not available. You can upload a photo instead.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const v = videoRef.current;
    const size = Math.min(v.videoWidth, v.videoHeight);
    const sx = (v.videoWidth - size) / 2;
    const sy = (v.videoHeight - size) / 2;
    ctx.drawImage(v, sx, sy, size, size, 0, 0, 256, 256);
    setImageData(canvas.toDataURL('image/jpeg', 0.85));
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 256, 256);
        setImageData(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const applyFilters = () => {
    if (!imageData) return imageData;
    const img = new Image();
    img.src = imageData;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageData;
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.translate(128, 128);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-128, -128);
    ctx.drawImage(img, 0, 0, 256, 256);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar animate-slide-up p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold">Profile Photo</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        {/* Preview */}
        <div className="w-40 h-40 mx-auto rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 flex items-center justify-center">
          {imageData ? (
            <img src={imageData} alt="" className="w-full h-full object-cover"
              style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)`, transform: `rotate(${rotation}deg)` }} />
          ) : cameraActive ? (
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
          ) : (
            <Camera size={40} className="text-gray-300" />
          )}
        </div>

        {/* Source buttons */}
        {!imageData && !cameraActive && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={startCamera}
              className="flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 active:scale-95 transition-transform">
              <Camera size={24} className="text-indigo-500" />
              <p className="text-xs font-bold">Take Photo</p>
            </button>
            <button onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 active:scale-95 transition-transform">
              <ImagePlus size={24} className="text-indigo-500" />
              <p className="text-xs font-bold">Upload</p>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>
        )}

        {/* Camera capture */}
        {cameraActive && (
          <button onClick={capturePhoto}
            className="w-full bg-indigo-500 text-white font-bold py-3.5 rounded-2xl active:scale-95 transition-transform mb-4 flex items-center justify-center gap-2">
            <Camera size={18} /> Capture
          </button>
        )}

        {/* Filters */}
        {imageData && (
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400 font-semibold flex items-center gap-1"><Sliders size={12} /> Brightness</span>
                <span className="text-gray-400">{brightness}%</span>
              </div>
              <input type="range" min={50} max={150} value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400 font-semibold flex items-center gap-1"><Sliders size={12} /> Contrast</span>
                <span className="text-gray-400">{contrast}%</span>
              </div>
              <input type="range" min={50} max={150} value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setRotation((r) => r + 90)}
                className="flex-1 bg-gray-100 dark:bg-gray-800 font-bold py-2.5 rounded-2xl text-sm flex items-center justify-center gap-1.5">
                <RotateCw size={14} /> Rotate
              </button>
              <button onClick={() => { setImageData(null); setBrightness(100); setContrast(100); setRotation(0); }}
                className="flex-1 bg-gray-100 dark:bg-gray-800 font-bold py-2.5 rounded-2xl text-sm">
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Save */}
        {imageData && (
          <button onClick={() => { const filtered = applyFilters(); if (filtered) onSave(filtered); }}
            className="w-full bg-indigo-500 text-white font-bold py-3.5 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2">
            <Check size={18} /> Save as Profile Photo
          </button>
        )}
      </div>
    </div>
  );
}

function PhotoHistoryView({ photos, onClose, onDelete, onSetAvatar }: { photos: PhotoEntry[]; onClose: () => void; onDelete: (id: string) => void; onSetAvatar: (data: string) => void }) {
  const [fullscreen, setFullscreen] = useState<PhotoEntry | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar animate-slide-up p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold">Photo History</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12">
            <Camera size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No photos yet. Photos you take or create will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <div key={p.id} className="relative group">
                <img src={p.image_data} alt="" onClick={() => setFullscreen(p)}
                  className="aspect-square rounded-xl object-cover w-full cursor-pointer" />
              </div>
            ))}
          </div>
        )}

        {/* Fullscreen viewer */}
        {fullscreen && (
          <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-4" onClick={() => setFullscreen(null)}>
            <img src={fullscreen.image_data} alt="" className="max-w-full max-h-[70vh] rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
            <div className="flex gap-3 mt-4" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { onSetAvatar(fullscreen.image_data); setFullscreen(null); onClose(); }}
                className="bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-2xl text-sm flex items-center gap-1.5">
                <UserIcon size={14} /> Set as Avatar
              </button>
              <a href={fullscreen.image_data} download="photo.jpg"
                className="bg-gray-700 text-white font-bold px-5 py-2.5 rounded-2xl text-sm flex items-center gap-1.5">
                <Download size={14} /> Download
              </a>
              <button onClick={() => { onDelete(fullscreen.id); setFullscreen(null); }}
                className="bg-red-500 text-white font-bold px-5 py-2.5 rounded-2xl text-sm flex items-center gap-1.5">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <p className="font-bold">{title}</p>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold">{value || '—'}</span>
    </div>
  );
}

function StatBox({ icon, value, label, onClick }: { icon: React.ReactNode; value: number | string; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={!onClick}
      className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg text-center ${onClick ? 'active:scale-95 transition-transform' : ''}`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </button>
  );
}

function EditField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-gray-400 font-semibold">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5 outline-none focus:ring-2 ring-indigo-400" />
    </label>
  );
}
