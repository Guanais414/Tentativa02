import { useState } from 'react';
import type { UserProfile, GameState } from '../types';
import { Mascot } from './Mascot';
import { COSMETICS_CATALOG } from '../cosmetics';
import { ShoppingBag, Check, Lock, Sparkles, Star, Flame, Crown, Search, TrendingUp } from 'lucide-react';

interface Props {
  profile: UserProfile;
  game: GameState;
  onBuy: (itemId: string, price: number) => void;
  onEquip: (itemId: string) => void;
}

type Category = 'all' | 'hat' | 'outfit' | 'accessory' | 'environment' | 'companion';
type SortMode = 'featured' | 'price-low' | 'price-high' | 'category';

const FEATURED_IDS = ['hat_crown', 'outfit_super', 'env_space', 'comp_turtle', 'hat_grad'];

export function Shop({ profile, game, onBuy, onEquip }: Props) {
  const [category, setCategory] = useState<Category>('all');
  const [sort, setSort] = useState<SortMode>('featured');
  const [search, setSearch] = useState('');

  const owned = game.ownedCosmetics;
  const equippedHat = owned.find((o) => o.itemId.startsWith('hat_') && o.equipped);
  const equippedOutfit = owned.find((o) => o.itemId.startsWith('outfit_') && o.equipped);
  const equippedAcc = owned.find((o) => o.itemId.startsWith('acc_') && o.equipped);
  const equippedEnv = owned.find((o) => o.itemId.startsWith('env_') && o.equipped);
  const equippedComp = owned.find((o) => o.itemId.startsWith('comp_') && o.equipped);

  const hatEmoji = equippedHat ? COSMETICS_CATALOG.find((c) => c.id === equippedHat.itemId)?.emoji : undefined;
  const outfitEmoji = equippedOutfit ? COSMETICS_CATALOG.find((c) => c.id === equippedOutfit.itemId)?.emoji : undefined;
  const accEmoji = equippedAcc ? COSMETICS_CATALOG.find((c) => c.id === equippedAcc.itemId)?.emoji : undefined;

  let items = COSMETICS_CATALOG.filter((c) => category === 'all' || c.category === category);
  if (search) items = items.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()));
  if (sort === 'price-low') items = [...items].sort((a, b) => a.price - b.price);
  else if (sort === 'price-high') items = [...items].sort((a, b) => b.price - a.price);
  else if (sort === 'category') items = [...items].sort((a, b) => a.category.localeCompare(b.category));
  else items = [...items].sort((a, b) => {
    const af = FEATURED_IDS.includes(a.id) ? 0 : 1;
    const bf = FEATURED_IDS.includes(b.id) ? 0 : 1;
    return af - bf;
  });

  const featured = COSMETICS_CATALOG.filter((c) => FEATURED_IDS.includes(c.id));

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag size={24} className="text-indigo-500" />
          <h1 className="text-2xl font-extrabold">Shop</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/40 px-3 py-1.5 rounded-full">
          <Sparkles size={16} className="text-yellow-500" />
          <span className="font-bold text-sm text-yellow-600 dark:text-yellow-400">{game.coins}</span>
        </div>
      </div>

      {/* Mascot preview */}
      <div className="bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-950/30 dark:to-cyan-950/30 rounded-3xl p-5 shadow-lg mb-4 flex items-center gap-4">
        <Mascot type={profile.mascot} size={72} hat={hatEmoji} outfit={outfitEmoji} accessory={accEmoji} mood="happy" />
        <div className="flex-1">
          <p className="font-bold">{profile.mascotName}</p>
          <p className="text-xs text-gray-400">Level {game.level} · {owned.length} items owned</p>
          <div className="flex gap-1 mt-1.5">
            {hatEmoji && <span className="text-lg">{hatEmoji}</span>}
            {outfitEmoji && <span className="text-lg">{outfitEmoji}</span>}
            {accEmoji && <span className="text-lg">{accEmoji}</span>}
            {!hatEmoji && !outfitEmoji && !accEmoji && <span className="text-xs text-gray-400">No items equipped</span>}
          </div>
        </div>
      </div>

      {/* Featured carousel */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Flame size={16} className="text-orange-500" />
          <p className="font-bold text-sm">Featured Items</p>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {featured.map((item) => {
            const own = owned.find((o) => o.itemId === item.id);
            return (
              <div key={item.id} className="flex-shrink-0 w-28 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-3 shadow-md">
                <div className="text-3xl text-center mb-1">{item.emoji}</div>
                <p className="text-xs font-bold truncate">{item.name}</p>
                <p className="text-[10px] text-gray-400 truncate mb-2">{item.description}</p>
                {own ? (
                  <button onClick={() => onEquip(item.id)}
                    className={`w-full py-1.5 rounded-xl text-[10px] font-bold ${own.equipped ? 'bg-green-500 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600'}`}>
                    {own.equipped ? 'Equipped' : 'Equip'}
                  </button>
                ) : (
                  <button onClick={() => game.coins >= item.price && onBuy(item.id, item.price)} disabled={game.coins < item.price}
                    className={`w-full py-1.5 rounded-xl text-[10px] font-bold ${game.coins >= item.price ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                    <Sparkles size={10} className="inline" /> {item.price}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..."
          className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 ring-indigo-400" />
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
        {(['all', 'hat', 'outfit', 'accessory', 'environment', 'companion'] as Category[]).map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${category === c ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
            {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1) + 's'}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-1.5 mb-4">
        {(['featured', 'price-low', 'price-high', 'category'] as SortMode[]).map((s) => (
          <button key={s} onClick={() => setSort(s)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${sort === s ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
            {s === 'featured' ? 'Featured' : s === 'price-low' ? 'Price ↑' : s === 'price-high' ? 'Price ↓' : 'Category'}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const own = owned.find((o) => o.itemId === item.id);
          const canAfford = game.coins >= item.price;
          const isFeatured = FEATURED_IDS.includes(item.id);
          return (
            <div key={item.id} className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg relative ${isFeatured ? 'ring-1 ring-orange-200 dark:ring-orange-800' : ''}`}>
              {isFeatured && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Flame size={8} /> HOT
                </div>
              )}
              <div className="text-4xl text-center mb-2">{item.emoji}</div>
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

      {/* Info */}
      <div className="mt-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-4 flex items-start gap-2">
        <ShoppingBag size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-500 dark:text-gray-400">Complete tasks, drink water, finish study sessions, and send letters in Bamboo Forest to earn coins. Spend them here to customize your companion!</p>
      </div>
    </div>
  );
}
