export interface ResearchNode {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'Economy' | 'Military' | 'Magic' | 'Defence';
  maxLevel: number;
  costPerLevel: { gold: number; mana?: number };
  requires?: string[];
  effect: string;
}

export const RESEARCH_TREE: Record<string, ResearchNode> = {
  // ── Economy ────────────────────────────────────────────────────────────────
  gold_mining: {
    id: 'gold_mining',
    name: 'Gold Mining',
    icon: '⛏',
    description: 'Increases gold production from mines.',
    category: 'Economy',
    maxLevel: 10,
    costPerLevel: { gold: 200 },
    effect: '+5% gold per level',
  },
  farming: {
    id: 'farming',
    name: 'Farming',
    icon: '🌾',
    description: 'Boosts food output from farms.',
    category: 'Economy',
    maxLevel: 10,
    costPerLevel: { gold: 180 },
    effect: '+5% food per level',
  },
  logging: {
    id: 'logging',
    name: 'Logging',
    icon: '🪵',
    description: 'Increases wood output from lumber mills.',
    category: 'Economy',
    maxLevel: 10,
    costPerLevel: { gold: 180 },
    effect: '+5% wood per level',
  },
  trade_routes: {
    id: 'trade_routes',
    name: 'Trade Routes',
    icon: '🛒',
    description: 'Unlocks inter-alliance resource trading.',
    category: 'Economy',
    maxLevel: 5,
    costPerLevel: { gold: 500 },
    requires: ['gold_mining', 'farming'],
    effect: 'Enables trading; +3% market income per level',
  },
  // ── Military ──────────────────────────────────────────────────────────────
  swordsmanship: {
    id: 'swordsmanship',
    name: 'Swordsmanship',
    icon: '⚔',
    description: 'Increases hero attack damage.',
    category: 'Military',
    maxLevel: 10,
    costPerLevel: { gold: 250 },
    effect: '+3% hero ATK per level',
  },
  archery: {
    id: 'archery',
    name: 'Archery',
    icon: '🏹',
    description: 'Boosts archer and ranged hero damage.',
    category: 'Military',
    maxLevel: 10,
    costPerLevel: { gold: 250 },
    effect: '+4% ranged ATK per level',
  },
  troop_training: {
    id: 'troop_training',
    name: 'Troop Training',
    icon: '🪖',
    description: 'Speeds up troop training time.',
    category: 'Military',
    maxLevel: 10,
    costPerLevel: { gold: 300 },
    effect: '-5% training time per level',
  },
  battle_tactics: {
    id: 'battle_tactics',
    name: 'Battle Tactics',
    icon: '🗺',
    description: 'Increases army march speed and formation bonuses.',
    category: 'Military',
    maxLevel: 5,
    costPerLevel: { gold: 600 },
    requires: ['swordsmanship', 'troop_training'],
    effect: '+10% march speed; +5% army capacity per level',
  },
  // ── Magic ─────────────────────────────────────────────────────────────────
  arcane_study: {
    id: 'arcane_study',
    name: 'Arcane Study',
    icon: '📖',
    description: 'Increases mage hero spell damage.',
    category: 'Magic',
    maxLevel: 10,
    costPerLevel: { gold: 300, mana: 50 },
    effect: '+4% spell damage per level',
  },
  mana_control: {
    id: 'mana_control',
    name: 'Mana Control',
    icon: '✨',
    description: 'Increases mana production and capacity.',
    category: 'Magic',
    maxLevel: 10,
    costPerLevel: { gold: 200, mana: 30 },
    effect: '+5% mana production per level',
  },
  dragon_lore: {
    id: 'dragon_lore',
    name: 'Dragon Lore',
    icon: '🐉',
    description: 'Unlocks dragon companion bonuses.',
    category: 'Magic',
    maxLevel: 5,
    costPerLevel: { gold: 1000, mana: 200 },
    requires: ['arcane_study', 'mana_control'],
    effect: 'Unlocks dragon companions; +10% all stats per level',
  },
  // ── Defence ───────────────────────────────────────────────────────────────
  fortification: {
    id: 'fortification',
    name: 'Fortification',
    icon: '🏰',
    description: 'Strengthens city walls against attacks.',
    category: 'Defence',
    maxLevel: 10,
    costPerLevel: { gold: 350 },
    effect: '+5% wall HP per level',
  },
  healing_arts: {
    id: 'healing_arts',
    name: 'Healing Arts',
    icon: '💊',
    description: 'Improves troop and hero healing rates.',
    category: 'Defence',
    maxLevel: 10,
    costPerLevel: { gold: 280, mana: 20 },
    effect: '+5% heal effectiveness per level',
  },
};
