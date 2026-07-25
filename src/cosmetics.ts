import type { CosmeticItem } from './types';

export const COSMETICS_CATALOG: CosmeticItem[] = [
  // Hats
  { id: 'hat_cap', name: 'Sporty Cap', category: 'hat', price: 80, emoji: '🧢', description: 'A cool cap for sunny days' },
  { id: 'hat_crown', name: 'Royal Crown', category: 'hat', price: 500, emoji: '👑', description: 'Rule the pond with style' },
  { id: 'hat_party', name: 'Party Hat', category: 'hat', price: 120, emoji: '🎉', description: 'Celebrate every win' },
  { id: 'hat_grad', name: 'Graduation Cap', category: 'hat', price: 300, emoji: '🎓', description: 'For the dedicated student' },
  { id: 'hat_beanie', name: 'Cozy Beanie', category: 'hat', price: 100, emoji: '🧶', description: 'Warm and snug' },
  // Outfits
  { id: 'outfit_scarf', name: 'Winter Scarf', category: 'outfit', price: 90, emoji: '🧣', description: 'Stay warm in style' },
  { id: 'outfit_tux', name: 'Tiny Tuxedo', category: 'outfit', price: 400, emoji: '🤵', description: 'Formal pond attire' },
  { id: 'outfit_super', name: 'Super Cape', category: 'outfit', price: 350, emoji: '🦸', description: 'A hero in the water' },
  { id: 'outfit_hula', name: 'Hula Skirt', category: 'outfit', price: 180, emoji: '🌺', description: 'Tropical vibes' },
  // Accessories
  { id: 'acc_glasses', name: 'Smart Glasses', category: 'accessory', price: 150, emoji: '🤓', description: 'Look intelligent' },
  { id: 'acc_headphones', name: 'Headphones', category: 'accessory', price: 200, emoji: '🎧', description: 'For study playlists' },
  { id: 'acc_shades', name: 'Cool Shades', category: 'accessory', price: 130, emoji: '🕶️', description: 'Too cool for the pond' },
  { id: 'acc_balloon', name: 'Balloon', category: 'accessory', price: 60, emoji: '🎈', description: 'A floating friend' },
  // Environments
  { id: 'env_pond', name: 'Classic Pond', category: 'environment', price: 0, emoji: '🏞️', description: 'The default home' },
  { id: 'env_beach', name: 'Sunny Beach', category: 'environment', price: 250, emoji: '🏖️', description: 'Sand and waves' },
  { id: 'env_forest', name: 'Forest Lake', category: 'environment', price: 280, emoji: '🌲', description: 'A peaceful grove' },
  { id: 'env_space', name: 'Space Pond', category: 'environment', price: 600, emoji: '🌌', description: 'Out of this world' },
  { id: 'env_sakura', name: 'Sakura Spring', category: 'environment', price: 350, emoji: '🌸', description: 'Cherry blossoms falling' },
  { id: 'env_volcano', name: 'Volcano Lagoon', category: 'environment', price: 500, emoji: '🌋', description: 'Warm and dramatic' },
  // Companions
  { id: 'comp_fish', name: 'Tiny Fish', category: 'companion', price: 100, emoji: '🐟', description: 'A swimming buddy' },
  { id: 'comp_turtle', name: 'Baby Turtle', category: 'companion', price: 220, emoji: '🐢', description: 'Slow and steady friend' },
  { id: 'comp_frog', name: 'Frog Friend', category: 'companion', price: 180, emoji: '🐸', description: 'Ribbit ribbit' },
  { id: 'comp_dragonfly', name: 'Dragonfly', category: 'companion', price: 150, emoji: '🪰', description: 'A buzzing companion' },
];

export function getCosmetic(id: string): CosmeticItem | undefined {
  return COSMETICS_CATALOG.find((c) => c.id === id);
}
