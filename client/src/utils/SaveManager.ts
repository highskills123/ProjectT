import type { PlacedBuilding } from '../data/buildings';
import type { HeroInstance } from '../systems/HeroSystem';

export interface AllianceSave {
  id: string;
  name: string;
  memberCount: number;
  power: number;
  rank: number;
  wins: number;
  losses: number;
  techBonus: number;
}

export interface GameSave {
  version: number;
  playerName: string;
  level: number;
  exp: number;
  resources: Record<string, number>;
  buildings: PlacedBuilding[];
  heroes: Record<string, HeroInstance>;
  activeHeroes: string[];
  research: Record<string, number>;
  battleWave: number;
  alliance?: AllianceSave;
  allianceRole?: string;
  lastTickTime: number;
  totalPlayTime: number;
  settings: {
    sfxVolume: number;
    musicVolume: number;
    notifications: boolean;
  };
}

const SAVE_KEY = 'projectt_save';
const SAVE_VERSION = 1;

const DEFAULT_SAVE: GameSave = {
  version: SAVE_VERSION,
  playerName: 'Lord',
  level: 1,
  exp: 0,
  resources: {
    gold:  500,
    food:  200,
    wood:  300,
    stone: 200,
    mana:  50,
    gems:  5,
  },
  buildings: [],
  heroes: {},
  activeHeroes: ['hero_warrior'],
  research: {},
  battleWave: 1,
  lastTickTime: Date.now(),
  totalPlayTime: 0,
  settings: {
    sfxVolume: 0.8,
    musicVolume: 0.5,
    notifications: true,
  },
};

export const SaveManager = {
  hasSave(): boolean {
    return !!localStorage.getItem(SAVE_KEY);
  },

  newGame(): GameSave {
    const save = JSON.parse(JSON.stringify(DEFAULT_SAVE)) as GameSave;
    save.lastTickTime = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    return save;
  },

  load(): GameSave {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return this.newGame();
    try {
      const parsed = JSON.parse(raw) as GameSave;
      // Migrate older saves
      if (!parsed.version || parsed.version < SAVE_VERSION) {
        return this.migrate(parsed);
      }
      return parsed;
    } catch {
      return this.newGame();
    }
  },

  save(data: GameSave) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  },

  deleteSave() {
    localStorage.removeItem(SAVE_KEY);
  },

  migrate(old: Partial<GameSave>): GameSave {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_SAVE)) as GameSave;
    return { ...fresh, ...old, version: SAVE_VERSION };
  },
};
