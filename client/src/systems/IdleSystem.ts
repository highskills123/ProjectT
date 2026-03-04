import type { BuildingSystem } from './BuildingSystem';
import type { GameSave } from '../utils/SaveManager';

/**
 * IdleSystem – called every second to accumulate offline + online resources.
 * Also handles offline progression when the player returns after being away.
 */
export class IdleSystem {
  private save: GameSave;
  private buildingSystem: BuildingSystem;
  private lastTick: number;

  constructor(save: GameSave, buildingSystem: BuildingSystem) {
    this.save           = save;
    this.buildingSystem = buildingSystem;
    this.lastTick       = save.lastTickTime ?? Date.now();

    // Apply offline progress immediately on construction
    this.applyOfflineProgress();
  }

  /** Called every second by the scene timer. */
  tick() {
    const production = this.buildingSystem.getTotalProduction();
    for (const [res, amount] of Object.entries(production)) {
      this.save.resources[res] = Math.min(
        this.getCapacity(res),
        (this.save.resources[res] ?? 0) + amount,
      );
    }
    this.save.lastTickTime = Date.now();
    this.save.totalPlayTime = (this.save.totalPlayTime ?? 0) + 1;
  }

  getSave(): GameSave {
    return this.save;
  }

  private applyOfflineProgress() {
    const now = Date.now();
    const elapsed = Math.floor((now - this.lastTick) / 1000); // seconds
    if (elapsed <= 0) return;

    // Cap offline time at 8 hours to prevent exploits
    const cappedSeconds = Math.min(elapsed, 8 * 3600);

    const production = this.buildingSystem.getTotalProduction();
    for (const [res, amount] of Object.entries(production)) {
      const gained = amount * cappedSeconds;
      this.save.resources[res] = Math.min(
        this.getCapacity(res),
        (this.save.resources[res] ?? 0) + gained,
      );
    }
    this.save.lastTickTime = now;
  }

  /** Resource storage caps – scales with number of storage buildings */
  private getCapacity(resource: string): number {
    const base: Record<string, number> = {
      gold:  10000,
      food:  8000,
      wood:  8000,
      stone: 8000,
      mana:  2000,
      gems:  9999,
    };
    return base[resource] ?? 99999;
  }
}
