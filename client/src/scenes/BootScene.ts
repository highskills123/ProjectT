import Phaser from 'phaser';

/**
 * BootScene – very first scene; creates placeholder graphics so the game
 * works even before real assets are placed in assets/.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Generate procedural placeholder textures so the game boots without
    // real asset files.  Replace with actual sprite sheets once you copy
    // the tinyrpg and Free-Undead-Tileset assets into client/assets/.
    this.generatePlaceholderTextures();
  }

  create() {
    this.scene.start('PreloadScene');
  }

  private generatePlaceholderTextures() {
    const g = this.make.graphics({ x: 0, y: 0 });

    // ── Tile placeholder (32×32 grass-green) ────────────────────────────
    g.clear();
    g.fillStyle(0x3a6b35);
    g.fillRect(0, 0, 32, 32);
    g.lineStyle(1, 0x2a5025);
    g.strokeRect(0, 0, 32, 32);
    g.generateTexture('tile_grass', 32, 32);

    // ── Dirt tile ───────────────────────────────────────────────────────
    g.clear();
    g.fillStyle(0x8b6914);
    g.fillRect(0, 0, 32, 32);
    g.lineStyle(1, 0x6b4f10);
    g.strokeRect(0, 0, 32, 32);
    g.generateTexture('tile_dirt', 32, 32);

    // ── Water tile ──────────────────────────────────────────────────────
    g.clear();
    g.fillStyle(0x1a4a8a);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('tile_water', 32, 32);

    // ── Character placeholder (16×32) ───────────────────────────────────
    const heroColors: Record<string, number> = {
      warrior: 0x4169e1,
      mage:    0x9400d3,
      archer:  0x228b22,
      elf:     0x00ced1,
    };
    for (const [cls, color] of Object.entries(heroColors)) {
      g.clear();
      // body
      g.fillStyle(color);
      g.fillRect(4, 8, 8, 14);
      // head
      g.fillStyle(0xffe0b2);
      g.fillCircle(8, 6, 5);
      g.generateTexture(`hero_${cls}`, 16, 32);
    }

    // ── Enemy placeholder (16×32) ────────────────────────────────────────
    const enemyColors: Record<string, number> = {
      skeleton:  0xeeeeee,
      zombie:    0x6a9a3a,
      vampire:   0x8b0000,
      lich:      0xaaaaff,
      werewolf:  0x8b5e3c,
      dragonling:0xff6600,
      boss:      0xff4500,
    };
    for (const [type, color] of Object.entries(enemyColors)) {
      g.clear();
      g.fillStyle(color);
      g.fillRect(4, 8, 8, 14);
      g.fillStyle(0x222222);
      g.fillCircle(8, 6, 5);
      g.generateTexture(`enemy_${type}`, 16, 32);
    }

    // ── Building placeholders (64×64) ────────────────────────────────────
    const buildings: Record<string, number> = {
      castle:    0x8b7355,
      barracks:  0x8b4513,
      farm:      0x90ee90,
      mine:      0x696969,
      lumber:    0x8b4513,
      market:    0xffd700,
      blacksmith:0x444444,
      mage_tower:0x9400d3,
      wall:      0xa9a9a9,
      tavern:    0xcd853f,
    };
    for (const [name, color] of Object.entries(buildings)) {
      g.clear();
      g.fillStyle(color);
      g.fillRect(4, 20, 56, 40);
      // roof
      g.fillStyle(Phaser.Display.Color.IntegerToColor(color).darken(20).color);
      g.fillTriangle(32, 2, 4, 22, 60, 22);
      g.generateTexture(`building_${name}`, 64, 64);
    }

    // ── UI elements ──────────────────────────────────────────────────────
    // Panel background
    g.clear();
    g.fillStyle(0x1a1a2e, 0.92);
    g.fillRoundedRect(0, 0, 200, 80, 8);
    g.lineStyle(2, 0x4a4a7a);
    g.strokeRoundedRect(0, 0, 200, 80, 8);
    g.generateTexture('ui_panel', 200, 80);

    // Button normal
    g.clear();
    g.fillStyle(0x2a4a8a);
    g.fillRoundedRect(0, 0, 160, 40, 6);
    g.lineStyle(2, 0x5a8aca);
    g.strokeRoundedRect(0, 0, 160, 40, 6);
    g.generateTexture('btn_normal', 160, 40);

    // Button hover/active
    g.clear();
    g.fillStyle(0x3a6aba);
    g.fillRoundedRect(0, 0, 160, 40, 6);
    g.lineStyle(2, 0x7aaafa);
    g.strokeRoundedRect(0, 0, 160, 40, 6);
    g.generateTexture('btn_hover', 160, 40);

    // Resource icons (16×16)
    const resources: Record<string, number> = {
      gold:   0xffd700,
      food:   0x7cfc00,
      wood:   0x8b4513,
      stone:  0x808080,
      mana:   0x00bfff,
      gems:   0xff69b4,
    };
    for (const [res, color] of Object.entries(resources)) {
      g.clear();
      g.fillStyle(color);
      g.fillCircle(8, 8, 7);
      g.lineStyle(1, 0xffffff, 0.3);
      g.strokeCircle(8, 8, 7);
      g.generateTexture(`icon_${res}`, 16, 16);
    }

    // Avatar placeholder (48×48)
    g.clear();
    g.fillStyle(0x333366);
    g.fillCircle(24, 24, 24);
    g.fillStyle(0xffd700);
    g.fillCircle(24, 18, 10);
    g.generateTexture('avatar_placeholder', 48, 48);

    // Map cell highlight
    g.clear();
    g.fillStyle(0xffffff, 0.15);
    g.fillRect(0, 0, 64, 64);
    g.lineStyle(2, 0xffffff, 0.5);
    g.strokeRect(0, 0, 64, 64);
    g.generateTexture('cell_highlight', 64, 64);

    g.destroy();
  }
}
