export interface ResourceCost {
  [key: string]: number | undefined;
  gold?: number;
  food?: number;
  wood?: number;
  stone?: number;
  mana?: number;
}

export interface ResourceProduction {
  gold?: number;
  food?: number;
  wood?: number;
  stone?: number;
  mana?: number;
}

export interface BuildingConfig {
  name: string;
  description: string;
  buildCost: ResourceCost;
  upgradeCost: (level: number) => ResourceCost;
  production: ResourceProduction;
  /** Maximum level */
  maxLevel: number;
  /** Other buildings required before this can be built */
  requires?: string[];
  /** Minimum castle level required */
  castleLevel?: number;
}

export interface PlacedBuilding {
  id: string;
  type: string;
  col: number;
  row: number;
  level: number;
}

export const BUILDINGS_DATA: Record<string, BuildingConfig> = {
  castle: {
    name: 'Castle',
    description: 'The heart of your kingdom. Upgrade to unlock new buildings.',
    buildCost:    { gold: 0, wood: 0, stone: 0 },
    upgradeCost:  (lvl) => ({ gold: 500 * lvl, wood: 300 * lvl, stone: 200 * lvl }),
    production:   {},
    maxLevel:     20,
  },
  barracks: {
    name: 'Barracks',
    description: 'Train troops and increase army capacity.',
    buildCost:    { gold: 200, wood: 150 },
    upgradeCost:  (lvl) => ({ gold: 300 * lvl, wood: 200 * lvl }),
    production:   {},
    maxLevel:     15,
    castleLevel:  1,
  },
  farm: {
    name: 'Farm',
    description: 'Produces food to feed your army.',
    buildCost:    { gold: 100, wood: 50 },
    upgradeCost:  (lvl) => ({ gold: 150 * lvl, wood: 80 * lvl }),
    production:   { food: 10 },
    maxLevel:     20,
    castleLevel:  1,
  },
  mine: {
    name: 'Gold Mine',
    description: 'Produces gold over time.',
    buildCost:    { gold: 0, stone: 100 },
    upgradeCost:  (lvl) => ({ stone: 150 * lvl }),
    production:   { gold: 8 },
    maxLevel:     20,
    castleLevel:  1,
  },
  lumber: {
    name: 'Lumber Mill',
    description: 'Produces wood for construction.',
    buildCost:    { gold: 80, stone: 60 },
    upgradeCost:  (lvl) => ({ gold: 120 * lvl, stone: 90 * lvl }),
    production:   { wood: 6 },
    maxLevel:     20,
    castleLevel:  1,
  },
  market: {
    name: 'Market',
    description: 'Trade resources and speed up production.',
    buildCost:    { gold: 300, wood: 200, stone: 100 },
    upgradeCost:  (lvl) => ({ gold: 400 * lvl, wood: 250 * lvl }),
    production:   { gold: 5 },
    maxLevel:     10,
    castleLevel:  3,
  },
  blacksmith: {
    name: 'Blacksmith',
    description: 'Craft equipment for your heroes.',
    buildCost:    { gold: 400, stone: 300 },
    upgradeCost:  (lvl) => ({ gold: 500 * lvl, stone: 400 * lvl }),
    production:   {},
    maxLevel:     15,
    castleLevel:  3,
  },
  mage_tower: {
    name: 'Mage Tower',
    description: 'Produces mana and boosts magical research.',
    buildCost:    { gold: 500, stone: 400, mana: 0 },
    upgradeCost:  (lvl) => ({ gold: 600 * lvl, stone: 500 * lvl }),
    production:   { mana: 5 },
    maxLevel:     15,
    castleLevel:  5,
  },
  wall: {
    name: 'City Wall',
    description: 'Defends your city from enemy attacks.',
    buildCost:    { gold: 300, stone: 500 },
    upgradeCost:  (lvl) => ({ gold: 400 * lvl, stone: 600 * lvl }),
    production:   {},
    maxLevel:     25,
    castleLevel:  2,
  },
  tavern: {
    name: 'Tavern',
    description: 'Recruit new heroes and gather intelligence.',
    buildCost:    { gold: 350, wood: 200 },
    upgradeCost:  (lvl) => ({ gold: 450 * lvl, wood: 250 * lvl }),
    production:   {},
    maxLevel:     10,
    castleLevel:  4,
  },
};
