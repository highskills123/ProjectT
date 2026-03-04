import { BUILDINGS_DATA, PlacedBuilding } from '../data/buildings';
import type { GameSave } from '../utils/SaveManager';

export interface BuildResult {
  success: boolean;
  reason?: string;
}

export class BuildingSystem {
  private save: GameSave;

  constructor(save: GameSave) {
    this.save = save;
    // Ensure castle exists from new game
    if (!this.save.buildings.find(b => b.type === 'castle')) {
      this.save.buildings.push({
        id: 'castle_0_0',
        type: 'castle',
        col: 3,
        row: 4,
        level: 1,
      });
    }
  }

  getPlacedBuildings(): PlacedBuilding[] {
    return this.save.buildings;
  }

  isCellOccupied(col: number, row: number): boolean {
    return this.save.buildings.some(b => b.col === col && b.row === row);
  }

  getCastleLevel(): number {
    const castle = this.save.buildings.find(b => b.type === 'castle');
    return castle ? castle.level : 1;
  }

  build(type: string, col: number, row: number): BuildResult {
    if (this.isCellOccupied(col, row)) {
      return { success: false, reason: 'Cell already occupied' };
    }

    const cfg = BUILDINGS_DATA[type];
    if (!cfg) return { success: false, reason: 'Unknown building type' };

    // Castle level requirement
    if (cfg.castleLevel && this.getCastleLevel() < cfg.castleLevel) {
      return { success: false, reason: `Requires Castle Lv${cfg.castleLevel}` };
    }

    // Check resource cost
    const cost = cfg.buildCost;
    if (!this.canAfford(cost)) {
      return { success: false, reason: 'Not enough resources' };
    }

    this.deductResources(cost);

    this.save.buildings.push({
      id: `${type}_${col}_${row}`,
      type,
      col,
      row,
      level: 1,
    });

    return { success: true };
  }

  upgrade(col: number, row: number): BuildResult {
    const building = this.save.buildings.find(b => b.col === col && b.row === row);
    if (!building) return { success: false, reason: 'No building here' };

    const cfg = BUILDINGS_DATA[building.type];
    if (!cfg) return { success: false, reason: 'Unknown building' };

    if (building.level >= cfg.maxLevel) {
      return { success: false, reason: 'Already at max level' };
    }

    const cost = cfg.upgradeCost(building.level);
    if (!this.canAfford(cost)) {
      return { success: false, reason: 'Not enough resources' };
    }

    this.deductResources(cost);
    building.level++;
    return { success: true };
  }

  demolish(col: number, row: number): BuildResult {
    const idx = this.save.buildings.findIndex(b => b.col === col && b.row === row);
    if (idx === -1) return { success: false, reason: 'No building here' };
    if (this.save.buildings[idx].type === 'castle') {
      return { success: false, reason: 'Cannot demolish the castle' };
    }
    this.save.buildings.splice(idx, 1);
    return { success: true };
  }

  getTotalProduction(): Record<string, number> {
    const prod: Record<string, number> = {};
    for (const b of this.save.buildings) {
      const cfg = BUILDINGS_DATA[b.type];
      if (!cfg) continue;
      for (const [res, base] of Object.entries(cfg.production)) {
        const amount = (base as number) * b.level;
        prod[res] = (prod[res] ?? 0) + amount;
      }
    }
    return prod;
  }

  getSave(): GameSave {
    return this.save;
  }

  private canAfford(cost: Record<string, number | undefined>): boolean {
    for (const [res, amount] of Object.entries(cost)) {
      if (amount && (this.save.resources[res] ?? 0) < amount) return false;
    }
    return true;
  }

  private deductResources(cost: Record<string, number | undefined>) {
    for (const [res, amount] of Object.entries(cost)) {
      if (amount) {
        this.save.resources[res] = Math.max(0, (this.save.resources[res] ?? 0) - amount);
      }
    }
  }
}
