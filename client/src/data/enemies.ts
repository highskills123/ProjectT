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
}

export const ENEMIES_DATA: Record<string, EnemyConfig> = {
  skeleton: {
    name: 'Skeleton',
    type: 'skeleton',
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
    baseHp: 140,
    baseAttack: 10,
    baseDefense: 8,
    goldDrop: 12,
    expDrop: 15,
    spawnWave: 1,
  },
  vampire: {
    name: 'Vampire',
    type: 'vampire',
    baseHp: 200,
    baseAttack: 22,
    baseDefense: 10,
    goldDrop: 25,
    expDrop: 30,
    spawnWave: 5,
  },
  lich: {
    name: 'Lich',
    type: 'lich',
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
    baseHp: 2000,
    baseAttack: 80,
    baseDefense: 40,
    goldDrop: 300,
    expDrop: 500,
    spawnWave: 10,
    isBoss: true,
  },
};
