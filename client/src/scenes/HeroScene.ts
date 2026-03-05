import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { HeroSystem } from '../systems/HeroSystem';
import { SaveManager } from '../utils/SaveManager';
import { HEROES_DATA, HeroConfig } from '../data/heroes';
import { getHeroSprite } from '../data/sprites';

export class HeroScene extends Phaser.Scene {
  private heroSystem!: HeroSystem;

  constructor() {
    super({ key: 'HeroScene' });
  }

  create() {
    const save = SaveManager.load();
    this.heroSystem = new HeroSystem(save);
    this.drawBackground();
    this.createTopBar();
    this.renderHeroRoster();
    this.createBottomNav();
  }

  private drawBackground() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x0d0d2a, 0x0d0d2a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private createTopBar() {
    this.add.rectangle(GAME_WIDTH / 2, 22, GAME_WIDTH, 44, 0x06060f, 0.9).setDepth(10);
    this.add.text(GAME_WIDTH / 2, 22, '⚔  Heroes', {
      fontFamily: 'Courier New', fontSize: '18px', color: '#f0c040',
    }).setOrigin(0.5).setDepth(11);
  }

  private renderHeroRoster() {
    const allHeroes = this.heroSystem.getAllHeroes();
    const cardW = (GAME_WIDTH - 30) / 2;
    const cardH = 130;
    const startY = 70;
    const pad = 10;

    allHeroes.forEach((hero, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = pad + col * (cardW + pad) + cardW / 2;
      const y = startY + row * (cardH + pad) + cardH / 2;
      this.createHeroCard(x, y, cardW, cardH, hero);
    });
  }

  private createHeroCard(
    x: number, y: number, w: number, h: number,
    hero: ReturnType<HeroSystem['getAllHeroes']>[number],
  ) {
    const cfg = HEROES_DATA[hero.heroClass];
    const isOwned = this.heroSystem.ownsHero(hero.id);
    const isActive = this.heroSystem.isActive(hero.id);

    const bg = this.add.rectangle(x, y, w, h, isOwned ? 0x1a1a3a : 0x0f0f1f)
      .setStrokeStyle(2, isActive ? 0xf0c040 : (isOwned ? 0x3a3a6a : 0x1a1a2a))
      .setInteractive({ useHandCursor: isOwned });

    // Use tinyrpg animated sprite when available, otherwise placeholder image
    const avatarX = x - w / 2 + 26;
    const avatarY = y;
    const spriteCfg = getHeroSprite(hero.heroClass);

    if (spriteCfg && this.textures.exists(spriteCfg.defaultTextureKey)) {
      const sprite = this.add.sprite(avatarX, avatarY, spriteCfg.defaultTextureKey)
        .setDisplaySize(40, 52);
      if (this.anims.exists(spriteCfg.idleAnimKey)) {
        sprite.play(spriteCfg.idleAnimKey);
      }
      if (!isOwned) sprite.setTint(0x444444);
    } else {
      // Fallback to placeholder texture
      const cls = hero.heroClass.toLowerCase();
      const key = this.textures.exists(`hero_${cls}`) ? `hero_${cls}` : 'hero_warrior';
      const img = this.add.image(avatarX, avatarY, key).setDisplaySize(32, 48);
      if (!isOwned) img.setTint(0x444444);
    }

    this.add.text(x - w / 2 + 56, y - 38, hero.name, {
      fontFamily: 'Courier New', fontSize: '13px',
      color: isOwned ? '#f0c040' : '#555555',
    });

    this.add.text(x - w / 2 + 56, y - 20, `${cfg?.className ?? hero.heroClass}  Lv${hero.level}`, {
      fontFamily: 'Courier New', fontSize: '10px', color: '#8888cc',
    });

    // Stars rarity
    const stars = '★'.repeat(hero.rarity) + '☆'.repeat(5 - hero.rarity);
    this.add.text(x - w / 2 + 56, y - 4, stars, {
      fontFamily: 'Courier New', fontSize: '11px', color: '#f0c040',
    });

    // Stats
    this.add.text(x - w / 2 + 56, y + 14, `ATK ${hero.attack}  DEF ${hero.defense}  HP ${hero.maxHp}`, {
      fontFamily: 'Courier New', fontSize: '9px', color: '#aaaacc',
    });

    if (!isOwned) {
      this.add.text(x, y + 38, `🔒 Unlock: 💰${hero.unlockCost}`, {
        fontFamily: 'Courier New', fontSize: '10px', color: '#888888',
      }).setOrigin(0.5);

      bg.on('pointerdown', () => this.tryUnlockHero(hero));
    } else {
      const activeLabel = isActive ? '✓ Active' : '+ Set Active';
      const activeBtn = this.add.text(x + w / 2 - 10, y + 38, activeLabel, {
        fontFamily: 'Courier New', fontSize: '10px',
        color: isActive ? '#44ff44' : '#aaaacc',
        backgroundColor: isActive ? '#003300' : '#111122',
        padding: { x: 4, y: 2 },
      }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

      activeBtn.on('pointerdown', () => {
        if (!isActive) {
          this.heroSystem.setActive(hero.id);
          SaveManager.save(this.heroSystem.getSave());
          this.scene.restart();
        }
      });
    }
  }

  private tryUnlockHero(hero: { id: string; unlockCost: number }) {
    const result = this.heroSystem.unlock(hero.id);
    if (result.success) {
      SaveManager.save(this.heroSystem.getSave());
      this.scene.restart();
    } else {
      this.showToast(result.reason ?? 'Cannot unlock');
    }
  }

  private showToast(msg: string) {
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, msg, {
      fontFamily: 'Courier New', fontSize: '14px', color: '#ff9999',
      backgroundColor: '#00000099', padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: t, alpha: 0, y: GAME_HEIGHT / 2 - 40, delay: 1200, duration: 600, onComplete: () => t.destroy() });
  }

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
    this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH, navH, 0x06060f, 0.95).setDepth(15).setStrokeStyle(1, 0x2a2a5a);
    const w = GAME_WIDTH / navItems.length;
    navItems.forEach((item, i) => {
      const x = w * i + w / 2;
      this.add.text(x, y, item.label, {
        fontFamily: 'Courier New', fontSize: '11px',
        color: item.scene === 'HeroScene' ? '#f0c040' : '#8888bb', align: 'center',
      }).setOrigin(0.5).setDepth(16).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { if (item.scene !== 'HeroScene') this.scene.start(item.scene); });
    });
  }
}
