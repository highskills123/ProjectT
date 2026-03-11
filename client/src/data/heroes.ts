import { HERO_CLASS_TO_SPRITE } from './sprites';

export interface HeroConfig {
  className: string;
  description: string;
  /** Base stat growth per level */
  statGrowth: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  skills: HeroSkill[];
  role: 'tank' | 'dps' | 'support' | 'mage' | 'ranged';
  element: 'fire' | 'ice' | 'lightning' | 'dark' | 'light' | 'nature';
  /**
   * Key into TINY_SPRITES (e.g. 'Knight').
   * Resolved from HERO_CLASS_TO_SPRITE in data/sprites.ts.
   */
  spriteKey: string;
}

export interface HeroSkill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  damageMultiplier?: number;
  healPercent?: number;
  buffType?: string;
}

export const HEROES_DATA: Record<string, HeroConfig> = {
  WARRIOR: {
    className: 'Dark Knight',
    description: 'A heavily armoured melee warrior inspired by Mu Online\'s Dark Knight. Excels in defence and dealing consistent damage.',
    role: 'tank',
    element: 'dark',
    spriteKey: HERO_CLASS_TO_SPRITE['WARRIOR'],
    statGrowth: { hp: 120, attack: 8, defense: 12, speed: 3 },
    skills: [
      { id: 'slash',       name: 'Power Slash',    description: 'Deals 150% ATK to one enemy.',          cooldown: 3, damageMultiplier: 1.5 },
      { id: 'taunt',       name: 'Battle Cry',     description: 'Forces enemies to target self for 2 turns.', cooldown: 8 },
      { id: 'whirlwind',   name: 'Whirlwind',      description: 'Deals 80% ATK to all enemies.',          cooldown: 6, damageMultiplier: 0.8 },
      { id: 'ironwall',    name: 'Iron Wall',       description: 'Increases defence by 50% for 3 turns.', cooldown: 10 },
    ],
  },
  MAGE: {
    className: 'Dark Wizard',
    description: 'A powerful spellcaster inspired by Mu Online\'s Dark Wizard. Glass cannon with devastating area spells.',
    role: 'mage',
    element: 'lightning',
    spriteKey: HERO_CLASS_TO_SPRITE['MAGE'],
    statGrowth: { hp: 60, attack: 18, defense: 4, speed: 6 },
    skills: [
      { id: 'fireball',    name: 'Meteor Strike',  description: 'Deals 200% ATK to all enemies.',         cooldown: 5, damageMultiplier: 2.0 },
      { id: 'blizzard',    name: 'Ice Storm',       description: 'Freezes all enemies for 1 turn.',        cooldown: 10 },
      { id: 'manaburn',    name: 'Mana Burn',       description: 'Drains enemy mana and deals damage.',    cooldown: 7 },
      { id: 'teleport',    name: 'Teleport',        description: 'Dodges all attacks for 1 turn.',         cooldown: 12 },
    ],
  },
  ARCHER: {
    className: 'Fairy Elf',
    description: 'A swift ranged attacker inspired by Mu Online\'s Fairy Elf. High speed and critical rate.',
    role: 'ranged',
    element: 'nature',
    spriteKey: HERO_CLASS_TO_SPRITE['ARCHER'],
    statGrowth: { hp: 75, attack: 14, defense: 6, speed: 10 },
    skills: [
      { id: 'multishot',   name: 'Multi-Shot',     description: 'Fires 3 arrows, each dealing 70% ATK.',  cooldown: 4, damageMultiplier: 0.7 },
      { id: 'healingbuff', name: 'Nature\'s Gift',  description: 'Heals all allies for 15% of max HP.',    cooldown: 8, healPercent: 0.15 },
      { id: 'poison',      name: 'Poison Arrow',   description: 'Poisons target for 3 turns.',             cooldown: 6 },
      { id: 'rainofarrows',name: 'Rain of Arrows', description: 'Deals 120% ATK to all enemies.',         cooldown: 10, damageMultiplier: 1.2 },
    ],
  },
  ELF: {
    className: 'Summoner',
    description: 'A support hero who summons creatures and buffs allies. Inspired by Call of Dragons companion system.',
    role: 'support',
    element: 'light',
    spriteKey: HERO_CLASS_TO_SPRITE['ELF'],
    statGrowth: { hp: 80, attack: 10, defense: 8, speed: 7 },
    skills: [
      { id: 'summon',      name: 'Summon Beast',   description: 'Summons a creature to fight for 5 turns.',cooldown: 8 },
      { id: 'rally',       name: 'Rally Troops',   description: 'Increases all allies\' ATK by 30%.',      cooldown: 7, buffType: 'atk' },
      { id: 'barrier',     name: 'Magic Barrier',  description: 'Gives all allies a shield equal to 20% max HP.', cooldown: 9 },
      { id: 'devour',      name: 'Dragon\'s Roar',  description: 'Deals massive fire damage to all.',      cooldown: 15, damageMultiplier: 2.5 },
    ],
  },
};
