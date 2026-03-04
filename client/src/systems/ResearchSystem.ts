import { RESEARCH_TREE } from '../data/research';
import type { GameSave } from '../utils/SaveManager';

export class ResearchSystem {
  private save: GameSave;

  constructor(save: GameSave) {
    this.save = save;
    if (!this.save.research) this.save.research = {};
  }

  isCompleted(id: string): boolean {
    const node = RESEARCH_TREE[id];
    if (!node) return false;
    return (this.save.research[id] ?? 0) >= node.maxLevel;
  }

  isAvailable(id: string): boolean {
    const node = RESEARCH_TREE[id];
    if (!node) return false;
    if (!node.requires) return true;
    return node.requires.every(req => (this.save.research[req] ?? 0) >= 1);
  }

  getLevel(id: string): number {
    return this.save.research[id] ?? 0;
  }

  research(id: string): { success: boolean; reason?: string } {
    if (!this.isAvailable(id)) {
      return { success: false, reason: 'Prerequisites not met' };
    }
    if (this.isCompleted(id)) {
      return { success: false, reason: 'Already at max level' };
    }

    const node = RESEARCH_TREE[id];
    if (!node) return { success: false, reason: 'Unknown research' };

    const cost = node.costPerLevel;
    if ((this.save.resources['gold'] ?? 0) < cost.gold) {
      return { success: false, reason: `Need ${cost.gold} gold` };
    }
    if (cost.mana && (this.save.resources['mana'] ?? 0) < cost.mana) {
      return { success: false, reason: `Need ${cost.mana} mana` };
    }

    this.save.resources['gold'] -= cost.gold;
    if (cost.mana) this.save.resources['mana'] = (this.save.resources['mana'] ?? 0) - cost.mana;
    this.save.research[id] = (this.save.research[id] ?? 0) + 1;

    return { success: true };
  }

  /** Returns a multiplier bonus for a resource type based on completed research */
  getProductionBonus(resource: string): number {
    let bonus = 0;
    const map: Record<string, string[]> = {
      gold:  ['gold_mining', 'trade_routes'],
      food:  ['farming'],
      wood:  ['logging'],
      mana:  ['mana_control', 'dragon_lore'],
    };
    const nodes = map[resource] ?? [];
    for (const id of nodes) {
      bonus += (this.save.research[id] ?? 0) * 0.05;
    }
    return bonus;
  }

  getSave(): GameSave {
    return this.save;
  }
}
