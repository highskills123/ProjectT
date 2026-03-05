import { ENEMY_TYPE_TO_SPRITE } from './sprites';

export interface EnemyConfig {
  name: string;
  type: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  goldDrop: number;
  expDrop: number;
  spawnWave: number;
  isBoss?: boolean;
  /**
   * Key into TINY_SPRITES (e.g. 'Skeleton').
   * Resolved from ENEMY_TYPE_TO_SPRITE in data/sprites.ts.
   */
  spriteKey: string;
}

export const ENEMIES_DATA: Record<string, EnemyConfig> = {
  skeleton: {
    name: 'Skeleton',
    type: 'skeleton',
    spriteKey: ENEMY_TYPE_TO_SPRITE['skeleton'],
    baseHp: 80,
    baseAttack: 12,
    baseDefense: 5,
    goldDrop: 8,
    expDrop: 10,
    spawnWave: 1,
  },
  zombie: {
    name: 'Zombie',
    type: 'zombie',
    spriteKey: ENEMY_TYPE_TO_SPRITE['zombie'],
    baseHp: 140,
    baseAttack: 10,
    baseDefense: 8,
    goldDrop: 12,
    expDrop: 15,
    spawnWave: 1,
  },
  goblin: {
    name: 'Goblin',
    type: 'goblin',
    spriteKey: ENEMY_TYPE_TO_SPRITE['goblin'],
    baseHp: 100,
    baseAttack: 14,
    baseDefense: 4,
    goldDrop: 10,
    expDrop: 12,
    spawnWave: 2,
  },
  orc: {
    name: 'Orc',
    type: 'orc',
    spriteKey: ENEMY_TYPE_TO_SPRITE['orc'],
    baseHp: 160,
    baseAttack: 18,
    baseDefense: 10,
    goldDrop: 18,
    expDrop: 22,
    spawnWave: 3,
  },
  troll: {
    name: 'Troll',
    type: 'troll',
    spriteKey: ENEMY_TYPE_TO_SPRITE['troll'],
    baseHp: 220,
    baseAttack: 24,
    baseDefense: 14,
    goldDrop: 22,
    expDrop: 28,
    spawnWave: 4,
  },
  vampire: {
    name: 'Vampire',
    type: 'vampire',
    spriteKey: ENEMY_TYPE_TO_SPRITE['vampire'],
    baseHp: 200,
    baseAttack: 22,
    baseDefense: 10,
    goldDrop: 25,
    expDrop: 30,
    spawnWave: 5,
  },
  slime: {
    name: 'Slime',
    type: 'slime',
    spriteKey: ENEMY_TYPE_TO_SPRITE['slime'],
    baseHp: 120,
    baseAttack: 8,
    baseDefense: 6,
    goldDrop: 8,
    expDrop: 10,
    spawnWave: 2,
  },
  spider: {
    name: 'Spider',
    type: 'spider',
    spriteKey: ENEMY_TYPE_TO_SPRITE['spider'],
    baseHp: 110,
    baseAttack: 16,
    baseDefense: 4,
    goldDrop: 10,
    expDrop: 13,
    spawnWave: 3,
  },
  golem: {
    name: 'Golem',
    type: 'golem',
    spriteKey: ENEMY_TYPE_TO_SPRITE['golem'],
    baseHp: 300,
    baseAttack: 20,
    baseDefense: 22,
    goldDrop: 35,
    expDrop: 45,
    spawnWave: 6,
  },
  lich: {
    name: 'Lich',
    type: 'lich',
    spriteKey: ENEMY_TYPE_TO_SPRITE['lich'],
    baseHp: 180,
    baseAttack: 28,
    baseDefense: 12,
    goldDrop: 30,
    expDrop: 40,
    spawnWave: 8,
  },
  werewolf: {
    name: 'Werewolf',
    type: 'werewolf',
    spriteKey: ENEMY_TYPE_TO_SPRITE['werewolf'],
    baseHp: 280,
    baseAttack: 35,
    baseDefense: 18,
    goldDrop: 45,
    expDrop: 55,
    spawnWave: 12,
  },
  dragonling: {
    name: 'Dragonling',
    type: 'dragonling',
    spriteKey: ENEMY_TYPE_TO_SPRITE['dragonling'],
    baseHp: 350,
    baseAttack: 42,
    baseDefense: 25,
    goldDrop: 60,
    expDrop: 70,
    spawnWave: 16,
  },
  boss: {
    name: 'Death Lord',
    type: 'boss',
    spriteKey: ENEMY_TYPE_TO_SPRITE['boss'],
    baseHp: 2000,
    baseAttack: 80,
    baseDefense: 40,
    goldDrop: 300,
    expDrop: 500,
    spawnWave: 10,
    isBoss: true,
  },
};
