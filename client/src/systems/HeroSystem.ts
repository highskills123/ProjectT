import { HEROES_DATA } from '../data/heroes';
import type { GameSave } from '../utils/SaveManager';

export interface HeroInstance {
  id: string;
  heroClass: string;
  name: string;
  level: number;
  exp: number;
  rarity: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  unlockCost: number;
}

const EXP_PER_LEVEL = 100;

const HERO_TEMPLATES: Array<Omit<HeroInstance, 'hp' | 'maxHp'> & { baseHp: number }> = [
  { id: 'hero_warrior', heroClass: 'WARRIOR', name: 'Roland the Knight', level: 1, exp: 0, rarity: 3, attack: 25, defense: 20, speed: 5, unlockCost: 0, baseHp: 500 },
  { id: 'hero_mage',    heroClass: 'MAGE',    name: 'Seraphina',          level: 1, exp: 0, rarity: 4, attack: 40, defense: 8,  speed: 10, unlockCost: 500, baseHp: 280 },
  { id: 'hero_archer',  heroClass: 'ARCHER',  name: 'Elara Swiftbow',    level: 1, exp: 0, rarity: 3, attack: 30, defense: 12, speed: 14, unlockCost: 400, baseHp: 340 },
  { id: 'hero_elf',     heroClass: 'ELF',     name: 'Lyria the Summoner', level: 1, exp: 0, rarity: 5, attack: 20, defense: 15, speed: 9,  unlockCost: 1200, baseHp: 380 },
];

export class HeroSystem {
  private save: GameSave;

  constructor(save: GameSave) {
    this.save = save;
    if (!this.save.heroes) this.save.heroes = {};
    if (!this.save.activeHeroes) this.save.activeHeroes = ['hero_warrior'];
    // Ensure warrior is always owned (starting hero)
    if (!this.save.heroes['hero_warrior']) {
      const tmpl = HERO_TEMPLATES.find(h => h.id === 'hero_warrior')!;
      this.save.heroes['hero_warrior'] = { ...tmpl, hp: tmpl.baseHp, maxHp: tmpl.baseHp };
    }
  }

  getAllHeroes(): HeroInstance[] {
    return HERO_TEMPLATES.map(tmpl => {
      if (this.save.heroes[tmpl.id]) return this.save.heroes[tmpl.id];
      return { ...tmpl, hp: tmpl.baseHp, maxHp: tmpl.baseHp };
    });
  }

  getActiveHeroes(): HeroInstance[] {
    return this.save.activeHeroes
      .map(id => this.save.heroes[id])
      .filter(Boolean);
  }

  ownsHero(id: string): boolean {
    return !!this.save.heroes[id];
  }

  isActive(id: string): boolean {
    return this.save.activeHeroes.includes(id);
  }

  setActive(id: string) {
    if (!this.ownsHero(id)) return;
    if (!this.save.activeHeroes.includes(id)) {
      // Max 3 active heroes at a time
      if (this.save.activeHeroes.length >= 3) this.save.activeHeroes.shift();
      this.save.activeHeroes.push(id);
    }
  }

  unlock(id: string): { success: boolean; reason?: string } {
    const tmpl = HERO_TEMPLATES.find(h => h.id === id);
    if (!tmpl) return { success: false, reason: 'Unknown hero' };
    if (this.save.heroes[id]) return { success: false, reason: 'Already owned' };
    if ((this.save.resources['gold'] ?? 0) < tmpl.unlockCost) {
      return { success: false, reason: `Need ${tmpl.unlockCost} gold` };
    }
    this.save.resources['gold'] -= tmpl.unlockCost;
    this.save.heroes[id] = { ...tmpl, hp: tmpl.baseHp, maxHp: tmpl.baseHp };
    return { success: true };
  }

  grantExp(amount: number) {
    for (const hero of this.getActiveHeroes()) {
      const cfg = HEROES_DATA[hero.heroClass];
      if (!cfg) continue;
      hero.exp += amount;
      while (hero.exp >= hero.level * EXP_PER_LEVEL) {
        hero.exp -= hero.level * EXP_PER_LEVEL;
        hero.level++;
        hero.maxHp    += cfg.statGrowth.hp;
        hero.hp        = hero.maxHp;
        hero.attack   += cfg.statGrowth.attack;
        hero.defense  += cfg.statGrowth.defense;
        hero.speed    += cfg.statGrowth.speed;
      }
    }
  }

  getSave(): GameSave {
    return this.save;
  }
}
