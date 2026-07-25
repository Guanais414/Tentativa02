import { useState } from 'react';
import type { UserProfile, GameState, AppSettings } from '../types';
import { Mascot } from './Mascot';
import { COSMETICS_CATALOG } from '../cosmetics';
import { ShoppingBag, Check, Lock, Sparkles, Cloud, Waves, Star, Leaf, Flower2, Mountain, Snowflake, Bird, Sun, Flame, Crown, Glasses, Gift, Heart } from 'lucide-react';

interface Props {
  profile: UserProfile;
  game: GameState;
  settings: AppSettings;
  onBuy: (itemId: string, price: number) => void;
  onEquip: (itemId: string) => void;
}

const envIcons: Record<string, React.ReactNode> = {
  env_pond: <Waves size={14} className="text-cyan-500" />,
  env_beach: <Sun size={14} className="text-amber-500" />,
  env_forest: <Leaf size={14} className="text-green-500" />,
  env_space: <Star size={14} className="text-indigo-400" />,
  env_sakura: <Flower2 size={14} className="text-pink-400" />,
  env_volcano: <Mountain size={14} className="text-orange-500" />,
};

export function MascotPond({ profile, game, onBuy, onEquip }: Props) {
  const [tab, setTab] = useState<'home' | 'shop'>('home');
  const [shopCat, setShopCat] = useState<'hat' | 'outfit' | 'accessory' | 'environment' | 'companion'>('hat');

  const owned = game.ownedCosmetics;
  const equippedHat = owned.find((o) => o.itemId.startsWith('hat_') && o.equipped);
  const equippedOutfit = owned.find((o) => o.itemId.startsWith('outfit_') && o.equipped);
  const equippedAcc = owned.find((o) => o.itemId.startsWith('acc_') && o.equipped);
  const equippedEnv = owned.find((o) => o.itemId.startsWith('env_') && o.equipped);

  const hatEmoji = equippedHat ? COSMETICS_CATALOG.find((c) => c.id === equippedHat.itemId)?.emoji : undefined;
  const outfitEmoji = equippedOutfit ? COSMETICS_CATALOG.find((c) => c.id === equippedOutfit.itemId)?.emoji : undefined;
  const accEmoji = equippedAcc ? COSMETICS_CATALOG.find((c) => c.id === equippedAcc.itemId)?.emoji : undefined;
  const envId = equippedEnv?.itemId || 'env_pond';

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
      {/* Coins */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">{profile.mascotName}'s Pond</h1>
        <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/40 px-3 py-1.5 rounded-full">
          <Sparkles size={16} className="text-yellow-500" />
          <span className="font-bold text-sm text-yellow-600 dark:text-yellow-400">{game.coins}</span>
        </div>
      </div>

      {/* Tab switch */}
      <div className="flex gap-2 mb-4 bg-gray-200 dark:bg-gray-800 rounded-2xl p-1">
        <button onClick={() => setTab('home')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${tab === 'home' ? 'bg-white dark:bg-gray-900 shadow' : 'text-gray-400'}`}>Pond</button>
        <button onClick={() => setTab('shop')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${tab === 'shop' ? 'bg-white dark:bg-gray-900 shadow' : 'text-gray-400'}`}>Shop</button>
      </div>

      {tab === 'home' ? (
        <div className="animate-fade-in">
          {/* Pond scene */}
          <div className="relative h-72 rounded-3xl overflow-hidden shadow-xl mb-4" style={{
            background: envId === 'env_space' ? 'linear-gradient(135deg,#1e1b4b,#312e81,#1e3a8a)'
              : envId === 'env_volcano' ? 'linear-gradient(135deg,#7f1d1d,#ea580c,#fbbf24)'
              : envId === 'env_sakura' ? 'linear-gradient(135deg,#fce7f3,#fbcfe8,#f9a8d4)'
              : envId === 'env_beach' ? 'linear-gradient(135deg,#fef3c7,#fde68a,#7dd3fc)'
              : envId === 'env_forest' ? 'linear-gradient(135deg,#d1fae5,#6ee7b7,#059669)'
              : 'linear-gradient(135deg,#cffafe,#a5f3fc,#67e8f9)'
          }}>
            {/* Water ripples */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-cyan-300/40 to-transparent" />
            <div className="absolute bottom-1/3 left-1/4 w-32 h-32 rounded-full border-2 border-white/20 animate-ripple" />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full border-2 border-white/20 animate-ripple" style={{ animationDelay: '0.5s' }} />

            {/* Floating decorations (SVG/CSS, no emojis) */}
            <div className="absolute top-4 left-4 animate-float"><Cloud size={24} className="text-white/70" /></div>
            <div className="absolute top-8 right-6 animate-float" style={{ animationDelay: '1s' }}><Leaf size={20} className="text-green-400/70" /></div>
            {envId === 'env_sakura' && <div className="absolute top-6 left-1/2 animate-float"><Flower2 size={22} className="text-pink-300" /></div>}
            {envId === 'env_space' && <div className="absolute top-6 right-8 animate-float"><Star size={18} className="text-yellow-300" fill="currentColor" /></div>}
            {envId === 'env_volcano' && <div className="absolute top-6 left-8 animate-float"><Flame size={18} className="text-orange-400" /></div>}
            {envId === 'env_beach' && <div className="absolute top-6 left-8 animate-float"><Sun size={18} className="text-amber-400" fill="currentColor" /></div>}

            {/* Mascot centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-bounce-slow">
                <Mascot type={profile.mascot} size={120} hat={hatEmoji} outfit={outfitEmoji} accessory={accEmoji} mood="happy" />
              </div>
            </div>

            {/* Companion (SVG icon, no emoji) */}
            {owned.find((o) => o.itemId.startsWith('comp_') && o.equipped) && (
              <div className="absolute bottom-6 right-6 animate-float">
                <Bird size={32} className="text-amber-500" />
              </div>
            )}

            {/* Environment label */}
            <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              {envIcons[envId]} {COSMETICS_CATALOG.find((c) => c.id === envId)?.name}
            </div>
          </div>

          {/* Mood speech bubble */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.mascotName} says:</p>
            <p className="font-semibold mt-1">"Hi {profile.personal.name}! I'm so happy to see you. Let's complete some tasks and earn coins together!"</p>
          </div>

          {/* Equipped items */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg">
            <p className="font-bold mb-3 text-sm">Currently wearing</p>
            <div className="flex gap-3 flex-wrap">
              {hatEmoji && <EquippedBadge emoji={hatEmoji} label="Hat" />}
              {outfitEmoji && <EquippedBadge emoji={outfitEmoji} label="Outfit" />}
              {accEmoji && <EquippedBadge emoji={accEmoji} label="Accessory" />}
              {!hatEmoji && !outfitEmoji && !accEmoji && <p className="text-sm text-gray-400">Nothing equipped yet. Visit the shop!</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* Shop categories */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            {(['hat', 'outfit', 'accessory', 'environment', 'companion'] as const).map((c) => (
              <button key={c} onClick={() => setShopCat(c)}
                className={`px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${shopCat === c ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                {c.charAt(0).toUpperCase() + c.slice(1)}s
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div className="grid grid-cols-2 gap-3">
            {COSMETICS_CATALOG.filter((c) => c.category === shopCat).map((item) => {
              const own = owned.find((o) => o.itemId === item.id);
              const canAfford = game.coins >= item.price;
              return (
                <div key={item.id} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg">
                  <div className="text-4xl text-center mb-2 flex justify-center">{renderCosmeticIcon(item.emoji)}</div>
                  <p className="font-bold text-sm">{item.name}</p>
                  <p className="text-xs text-gray-400 mb-3">{item.description}</p>
                  {own ? (
                    <button onClick={() => onEquip(item.id)}
                      className={`w-full py-2 rounded-xl text-sm font-bold transition-all ${own.equipped ? 'bg-green-500 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'}`}>
                      {own.equipped ? <span className="flex items-center justify-center gap-1"><Check size={14} /> Equipped</span> : 'Equip'}
                    </button>
                  ) : (
                    <button onClick={() => canAfford && onBuy(item.id, item.price)} disabled={!canAfford}
                      className={`w-full py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1 ${canAfford ? 'bg-yellow-400 text-yellow-900 active:scale-95' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                      {canAfford ? <><Sparkles size={14} /> {item.price}</> : <><Lock size={14} /> {item.price}</>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-4 flex items-start gap-2">
            <ShoppingBag size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Complete tasks, drink water, and finish study sessions to earn coins. Spend them here to customize your companion!</p>
          </div>
        </div>
      )}
    </div>
  );
}

function renderCosmeticIcon(emoji: string): React.ReactNode {
  const map: Record<string, React.ReactNode> = {
    '👑': <Crown size={32} className="text-amber-400" />,
    '🎩': <Crown size={32} className="text-gray-700" />,
    '🎀': <Gift size={32} className="text-pink-400" />,
    '🧢': <Crown size={32} className="text-blue-500" />,
    '👓': <Glasses size={32} className="text-gray-600" />,
    '🕶️': <Glasses size={32} className="text-gray-800" />,
    '🧣': <Heart size={32} className="text-red-400" />,
    '🦜': <Bird size={32} className="text-green-500" />,
    '🐢': <Bird size={32} className="text-emerald-600" />,
  };
  return map[emoji] || <Sparkles size={32} className="text-indigo-400" />;
}

function EquippedBadge({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2">
      <div className="w-8 h-8 flex items-center justify-center">{renderCosmeticIcon(emoji)}</div>
      <span className="text-xs text-gray-400 font-semibold">{label}</span>
    </div>
  );
}
