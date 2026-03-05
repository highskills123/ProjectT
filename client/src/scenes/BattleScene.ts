import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { CombatSystem } from '../systems/CombatSystem';
import { SaveManager } from '../utils/SaveManager';
import { ENEMIES_DATA, EnemyConfig } from '../data/enemies';
import { HeroSystem } from '../systems/HeroSystem';
import { TINY_SPRITES, getHeroSprite, getEnemySprite } from '../data/sprites';

const WAVE_DURATION = 30; // seconds per wave

export class BattleScene extends Phaser.Scene {
  private combat!: CombatSystem;
  private heroSystem!: HeroSystem;
  private waveTimer = WAVE_DURATION;
  private waveNumber = 1;
  private autoFightActive = true;
  private timerEvent!: Phaser.Time.TimerEvent;
  private enemyGroup!: Phaser.GameObjects.Group;
  private heroSprites: Phaser.GameObjects.Sprite[] = [];
  private logLines: string[] = [];
  private logText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BattleScene' });
  }

  create() {
    const save = SaveManager.load();
    this.heroSystem = new HeroSystem(save);
    this.combat     = new CombatSystem(save, this.heroSystem);
    this.waveNumber = save.battleWave ?? 1;

    this.drawBackground();
    this.createHeroSide();
    this.spawnWave();
    this.createUI();
    this.createBottomNav();

    // Auto-fight tick every 2 s
    this.timerEvent = this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: this.autoFightTick,
      callbackScope: this,
    });

    // Wave countdown
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!this.autoFightActive) return;
        this.waveTimer--;
        if (this.waveTimer <= 0) this.nextWave();
        this.timerText.setText(`⏱ ${this.waveTimer}s`);
      },
    });
  }

  // ── Background ───────────────────────────────────────────────────────────
  private drawBackground() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0a0a, 0x1a0a0a, 0x0a0a1a, 0x0a0a1a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Ground line
    const ground = this.add.graphics();
    ground.fillStyle(0x2a1a0a);
    ground.fillRect(0, GAME_HEIGHT * 0.55, GAME_WIDTH, GAME_HEIGHT * 0.45);
    ground.lineStyle(2, 0x5a3a1a);
    ground.lineBetween(0, GAME_HEIGHT * 0.55, GAME_WIDTH, GAME_HEIGHT * 0.55);
  }

  // ── Hero side ────────────────────────────────────────────────────────────
  private createHeroSide() {
    const heroes = this.heroSystem.getActiveHeroes();
    heroes.forEach((hero, i) => {
      const x = 60 + i * 60;
      const y = GAME_HEIGHT * 0.5;
      const cls = hero.heroClass;

      const sprite = this.createCharacterSprite(x, y, 'hero', cls);
      sprite.setDepth(5);
      this.heroSprites.push(sprite);

      // HP bar
      this.add.rectangle(x, y + 30, 40, 5, 0x333333).setDepth(6);
      this.add.rectangle(x - 20 + 20 * (hero.hp / hero.maxHp), y + 30,
        40 * (hero.hp / hero.maxHp), 5, 0x44ff44).setDepth(7).setName(`hpbar_${i}`);

      // Hero name
      this.add.text(x, y + 40, hero.name.split(' ')[0], {
        fontFamily: 'Courier New', fontSize: '9px', color: '#aaaaff',
      }).setOrigin(0.5).setDepth(6);
    });
  }

  /**
   * Create a Phaser.GameObjects.Sprite for the given character type.
   * Uses the tinyrpg sprite sheet and plays the idle animation if loaded;
   * otherwise falls back to a static image placeholder.
   */
  private createCharacterSprite(
    x: number,
    y: number,
    role: 'hero' | 'enemy',
    typeKey: string,
  ): Phaser.GameObjects.Sprite {
    const cfg = role === 'hero'
      ? getHeroSprite(typeKey)
      : getEnemySprite(typeKey.toLowerCase());

    // Prefer real sprite sheet; fall back to placeholder texture
    const textureKey = cfg && this.textures.exists(cfg.defaultTextureKey)
      ? cfg.defaultTextureKey
      : (role === 'hero'
          ? `hero_${typeKey.toLowerCase()}`
          : `enemy_${typeKey.toLowerCase()}`);

    const sprite = this.add.sprite(x, y, textureKey).setDisplaySize(48, 64);

    // Play idle animation if available
    if (cfg && this.anims.exists(cfg.idleAnimKey)) {
      sprite.play(cfg.idleAnimKey);
    }

    return sprite;
  }

  // ── Wave spawning ────────────────────────────────────────────────────────
  private spawnWave() {
    if (this.enemyGroup) this.enemyGroup.clear(true, true);
    this.enemyGroup = this.add.group();
    this.waveTimer = WAVE_DURATION;

    const enemies = this.combat.generateWave(this.waveNumber);
    enemies.forEach((enemy, i) => {
      const x = GAME_WIDTH - 60 - i * 55;
      const y = GAME_HEIGHT * 0.47;

      const sprite = this.createCharacterSprite(x, y, 'enemy', enemy.type);
      sprite.setFlipX(true); // face left toward heroes
      sprite.setDepth(5);
      sprite.setData('enemy', enemy);
      sprite.setData('idx', i);
      this.enemyGroup.add(sprite);

      // Enemy HP bar
      this.add.rectangle(x, y + 28, 36, 4, 0x333333).setDepth(6);
      const hpBar = this.add.rectangle(x, y + 28, 36, 4, 0xff4444)
        .setDepth(7).setName(`enemy_hpbar_${i}`);
      this.enemyGroup.add(hpBar);
    });

    if (this.waveText) this.waveText.setText(`Wave ${this.waveNumber}`);
    this.log(`⚔ Wave ${this.waveNumber} started! ${enemies.length} enemies.`);
  }

  private nextWave() {
    this.waveNumber++;
    const save = SaveManager.load();
    save.battleWave = this.waveNumber;
    SaveManager.save(save);
    this.spawnWave();
  }

  // ── Auto-fight ───────────────────────────────────────────────────────────
  private autoFightTick() {
    if (!this.autoFightActive) return;
    const result = this.combat.tick();
    result.log.forEach(l => this.log(l));

    // Briefly play attack animation for each hero sprite
    this.heroSprites.forEach((heroSprite, idx) => {
      const hero = this.heroSystem.getActiveHeroes()[idx];
      if (!hero) return;
      const cfg = getHeroSprite(hero.heroClass);
      if (!cfg) return;
      const atkKey  = cfg.attackAnimKeys[0];
      const idleKey = cfg.idleAnimKey;
      if (atkKey && this.anims.exists(atkKey)) {
        heroSprite.play(atkKey);
        heroSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          if (this.anims.exists(idleKey)) heroSprite.play(idleKey);
        });
      }
    });

    // Refresh enemy HP bars
    this.enemyGroup.getChildren().forEach((obj) => {
      const sprite = obj as Phaser.GameObjects.Sprite;
      const enemy = sprite.getData('enemy');
      const idx = sprite.getData('idx');
      if (!enemy || idx === undefined) return;
      const hpBar = this.children.getByName(`enemy_hpbar_${idx}`) as Phaser.GameObjects.Rectangle;
      if (hpBar) {
        const ratio = Math.max(0, enemy.hp / enemy.maxHp);
        hpBar.setSize(36 * ratio, 4);
        if (enemy.hp <= 0) {
          sprite.setAlpha(0.3);
          // Play death animation if available
          const eCfg = getEnemySprite(enemy.type);
          if (eCfg && this.anims.exists(eCfg.deadAnimKey)) {
            sprite.play(eCfg.deadAnimKey);
          }
        }
      }
    });

    if (result.waveCleared) {
      this.log(`✨ Wave ${this.waveNumber} cleared! +${result.goldGained} gold`);
      this.time.delayedCall(1500, () => this.nextWave());
    }

    SaveManager.save(this.combat.getSave());
    this.events.emit('resources-updated');
  }

  // ── UI ───────────────────────────────────────────────────────────────────
  private createUI() {
    // Top bar
    const topBg = this.add.rectangle(GAME_WIDTH / 2, 22, GAME_WIDTH, 44, 0x06060f, 0.9).setDepth(15);

    this.waveText = this.add.text(GAME_WIDTH / 2, 22, `Wave ${this.waveNumber}`, {
      fontFamily: 'Courier New', fontSize: '16px', color: '#f0c040',
    }).setOrigin(0.5).setDepth(16);

    this.timerText = this.add.text(GAME_WIDTH - 16, 22, `⏱ ${WAVE_DURATION}s`, {
      fontFamily: 'Courier New', fontSize: '13px', color: '#aaaacc',
    }).setOrigin(1, 0.5).setDepth(16);

    // Auto-fight toggle
    const autoBtn = this.add.text(16, 22, '⚡AUTO', {
      fontFamily: 'Courier New', fontSize: '12px',
      color: '#44ff44', backgroundColor: '#003300',
      padding: { x: 6, y: 3 },
    }).setOrigin(0, 0.5).setDepth(16).setInteractive({ useHandCursor: true });

    autoBtn.on('pointerdown', () => {
      this.autoFightActive = !this.autoFightActive;
      autoBtn.setColor(this.autoFightActive ? '#44ff44' : '#ff4444');
      autoBtn.setBackgroundColor(this.autoFightActive ? '#003300' : '#330000');
    });

    // Combat log
    const logBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 140, GAME_WIDTH - 20, 120, 0x06060f, 0.75)
      .setStrokeStyle(1, 0x2a2a5a).setDepth(14);

    this.logText = this.add.text(12, GAME_HEIGHT - 196, '', {
      fontFamily: 'Courier New',
      fontSize: '11px',
      color: '#ccccdd',
      wordWrap: { width: GAME_WIDTH - 40 },
    }).setDepth(15);
  }

  private log(msg: string) {
    this.logLines.unshift(msg);
    if (this.logLines.length > 6) this.logLines.pop();
    if (this.logText) this.logText.setText(this.logLines.join('\n'));
  }

  // ── Bottom nav ───────────────────────────────────────────────────────────
  private createBottomNav() {
    const navItems = [
      { label: '🏰\nTown',     scene: 'TownScene'     },
      { label: '⚔\nBattle',   scene: 'BattleScene'   },
      { label: '🧙\nHeroes',   scene: 'HeroScene'     },
      { label: '⚗\nResearch', scene: 'ResearchScene' },
      { label: '🗺\nAlliance', scene: 'AllianceScene' },
    ];

    const navH = 58;
    const y = GAME_HEIGHT - navH / 2;
    this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH, navH, 0x06060f, 0.95)
      .setDepth(15).setStrokeStyle(1, 0x2a2a5a);

    const w = GAME_WIDTH / navItems.length;
    navItems.forEach((item, i) => {
      const x = w * i + w / 2;
      this.add.text(x, y, item.label, {
        fontFamily: 'Courier New', fontSize: '11px',
        color: item.scene === 'BattleScene' ? '#f0c040' : '#8888bb',
        align: 'center',
      }).setOrigin(0.5).setDepth(16).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { if (item.scene !== 'BattleScene') this.scene.start(item.scene); });
    });
  }
}
