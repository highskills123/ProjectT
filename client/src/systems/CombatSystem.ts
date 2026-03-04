import { ENEMIES_DATA, EnemyConfig } from '../data/enemies';
import type { GameSave } from '../utils/SaveManager';
import type { HeroSystem } from './HeroSystem';

export interface LiveEnemy {
  type: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  goldDrop: number;
  expDrop: number;
  isBoss: boolean;
}

export interface CombatResult {
  log: string[];
  waveCleared: boolean;
  goldGained: number;
  expGained: number;
}

export class CombatSystem {
  private save: GameSave;
  private heroSystem: HeroSystem;
  private enemies: LiveEnemy[] = [];

  constructor(save: GameSave, heroSystem: HeroSystem) {
    this.save       = save;
    this.heroSystem = heroSystem;
  }

  generateWave(waveNumber: number): LiveEnemy[] {
    const scaleFactor = 1 + (waveNumber - 1) * 0.15;
    const isBossWave  = waveNumber % 10 === 0;
    const enemyCount  = isBossWave ? 1 : Math.min(4, 1 + Math.floor(waveNumber / 3));

    const pool = Object.values(ENEMIES_DATA).filter(e => {
      if (isBossWave) return e.isBoss === true;
      return !e.isBoss && e.spawnWave <= waveNumber;
    });

    if (pool.length === 0) {
      pool.push(ENEMIES_DATA['skeleton']);
    }

    this.enemies = [];
    for (let i = 0; i < enemyCount; i++) {
      const cfg = pool[Math.floor(Math.random() * pool.length)];
      this.enemies.push(this.createLiveEnemy(cfg, scaleFactor));
    }
    return [...this.enemies];
  }

  /** Called every 2 seconds during auto-battle. */
  tick(): CombatResult {
    const result: CombatResult = { log: [], waveCleared: false, goldGained: 0, expGained: 0 };
    const heroes = this.heroSystem.getActiveHeroes();
    if (heroes.length === 0 || this.enemies.length === 0) return result;

    // Heroes attack
    for (const hero of heroes) {
      if (hero.hp <= 0) continue;
      const target = this.enemies.find(e => e.hp > 0);
      if (!target) break;

      const dmg = Math.max(1, hero.attack - target.defense + Math.floor(Math.random() * 6) - 3);
      target.hp -= dmg;
      result.log.push(`${hero.name} hits ${target.name} for ${dmg} dmg`);

      if (target.hp <= 0) {
        result.log.push(`💀 ${target.name} defeated!`);
        result.goldGained += target.goldDrop;
        result.expGained  += target.expDrop;
      }
    }

    // Enemies attack
    for (const enemy of this.enemies) {
      if (enemy.hp <= 0) continue;
      const target = heroes.find(h => h.hp > 0);
      if (!target) break;

      const dmg = Math.max(1, enemy.attack - target.defense + Math.floor(Math.random() * 4) - 2);
      target.hp -= dmg;
      result.log.push(`${enemy.name} strikes ${target.name} for ${dmg}`);

      // Prevent hero from dropping below 1 HP (auto-revive mechanic)
      if (target.hp <= 0) {
        target.hp = 1;
        result.log.push(`⚕ ${target.name} barely survives…`);
      }
    }

    // Check wave clear
    if (this.enemies.every(e => e.hp <= 0)) {
      result.waveCleared = true;
      this.save.resources['gold'] = (this.save.resources['gold'] ?? 0) + result.goldGained;
      this.heroSystem.grantExp(result.expGained);
    }

    return result;
  }

  getEnemies(): LiveEnemy[] {
    return this.enemies;
  }

  getSave(): GameSave {
    return this.save;
  }

  private createLiveEnemy(cfg: EnemyConfig, scale: number): LiveEnemy {
    return {
      type:     cfg.type,
      name:     cfg.name,
      hp:       Math.floor(cfg.baseHp * scale),
      maxHp:    Math.floor(cfg.baseHp * scale),
      attack:   Math.floor(cfg.baseAttack * scale),
      defense:  Math.floor(cfg.baseDefense * scale),
      goldDrop: Math.floor(cfg.goldDrop * scale),
      expDrop:  Math.floor(cfg.expDrop * scale),
      isBoss:   cfg.isBoss ?? false,
    };
  }
}
