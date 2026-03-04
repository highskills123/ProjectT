import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { BuildingSystem } from '../systems/BuildingSystem';
import { IdleSystem } from '../systems/IdleSystem';
import { SaveManager } from '../utils/SaveManager';
import { BUILDINGS_DATA } from '../data/buildings';
import type { BuildingConfig, PlacedBuilding } from '../data/buildings';

const GRID_COLS = 7;
const GRID_ROWS = 9;
const CELL = 64;
const MAP_OFFSET_X = (GAME_WIDTH - GRID_COLS * CELL) / 2;
const MAP_OFFSET_Y = 90;

export class TownScene extends Phaser.Scene {
  private buildingSystem!: BuildingSystem;
  private idleSystem!: IdleSystem;
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private buildingGroup!: Phaser.GameObjects.Group;
  private selectedCell: { col: number; row: number } | null = null;
  private buildPanel!: Phaser.GameObjects.Container;
  private buildPanelVisible = false;
  private highlightRect!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'TownScene' });
  }

  create() {
    const save = SaveManager.load();
    this.buildingSystem = new BuildingSystem(save);
    this.idleSystem     = new IdleSystem(save, this.buildingSystem);

    this.drawBackground();
    this.drawGrid();
    this.drawBuildings();
    this.createBuildPanel();
    this.createTopBar();
    this.setupGridInput();

    // Idle tick every second
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.idleSystem.tick();
        SaveManager.save(this.idleSystem.getSave());
        this.events.emit('resources-updated');
      },
    });

    // Bottom navigation
    this.createBottomNav();

    // Highlight rect
    this.highlightRect = this.add.rectangle(0, 0, CELL, CELL, 0xffffff, 0.15)
      .setStrokeStyle(2, 0xffffff, 0.6)
      .setVisible(false)
      .setDepth(10);
  }

  // ── Background ───────────────────────────────────────────────────────────
  private drawBackground() {
    // Sky
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x1a2a4a, 0x1a2a4a, 0x0a1525, 0x0a1525, 1);
    sky.fillRect(0, 0, GAME_WIDTH, MAP_OFFSET_Y);
    // Ground tiles
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const x = MAP_OFFSET_X + c * CELL;
        const y = MAP_OFFSET_Y + r * CELL;
        const key = (r + c) % 5 === 0 ? 'tile_dirt' : 'tile_grass';
        this.add.image(x + CELL / 2, y + CELL / 2, key);
      }
    }
  }

  private drawGrid() {
    this.gridGraphics = this.add.graphics().setDepth(5);
    this.gridGraphics.lineStyle(1, 0xffffff, 0.08);
    for (let c = 0; c <= GRID_COLS; c++) {
      const x = MAP_OFFSET_X + c * CELL;
      this.gridGraphics.lineBetween(x, MAP_OFFSET_Y, x, MAP_OFFSET_Y + GRID_ROWS * CELL);
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
      const y = MAP_OFFSET_Y + r * CELL;
      this.gridGraphics.lineBetween(MAP_OFFSET_X, y, MAP_OFFSET_X + GRID_COLS * CELL, y);
    }
  }

  private drawBuildings() {
    this.buildingGroup = this.add.group();
    const placed = this.buildingSystem.getPlacedBuildings();
    placed.forEach(b => this.renderBuilding(b));
  }

  private renderBuilding(b: PlacedBuilding) {
    const x = MAP_OFFSET_X + b.col * CELL + CELL / 2;
    const y = MAP_OFFSET_Y + b.row * CELL + CELL / 2;
    const cfg = BUILDINGS_DATA[b.type];
    const img = this.add.image(x, y, `building_${b.type}`)
      .setDisplaySize(CELL - 4, CELL - 4)
      .setDepth(6)
      .setData('building', b);
    this.buildingGroup.add(img);

    // Level badge
    const badge = this.add.text(x + 24, y - 24, `Lv${b.level}`, {
      fontFamily: 'Courier New',
      fontSize: '10px',
      color: '#f0c040',
      backgroundColor: '#00000088',
      padding: { x: 2, y: 1 },
    }).setDepth(7);
    this.buildingGroup.add(badge);

    // Building name tooltip
    img.setInteractive({ useHandCursor: true });
    img.on('pointerdown', () => this.showBuildingInfo(b, cfg));
  }

  // ── Build Panel ──────────────────────────────────────────────────────────
  private createBuildPanel() {
    const panelW = GAME_WIDTH - 20;
    const panelH = 260;
    const px = GAME_WIDTH / 2;
    const py = GAME_HEIGHT - panelH / 2 - 60;

    this.buildPanel = this.add.container(px, py).setDepth(20).setVisible(false);

    const bg = this.add.rectangle(0, 0, panelW, panelH, 0x0d0d25, 0.95)
      .setStrokeStyle(2, 0x4a4a8a);
    this.buildPanel.add(bg);

    const title = this.add.text(0, -panelH / 2 + 16, '🏗  Build', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#f0c040',
    }).setOrigin(0.5, 0);
    this.buildPanel.add(title);

    // Close button
    const closeBtn = this.add.text(panelW / 2 - 20, -panelH / 2 + 12, '✕', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#cc4444',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hideBuildPanel());
    this.buildPanel.add(closeBtn);

    // Scroll area: building cards
    const startX = -panelW / 2 + 70;
    const startY = -20;
    let idx = 0;
    for (const [type, cfg] of Object.entries(BUILDINGS_DATA)) {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const cx = startX + col * 110;
      const cy = startY + row * 90;
      this.createBuildCard(cx, cy, type, cfg);
      idx++;
    }
  }

  private createBuildCard(x: number, y: number, type: string, cfg: BuildingConfig) {
    const cardBg = this.add.rectangle(x, y, 100, 80, 0x1a1a3a)
      .setStrokeStyle(1, 0x3a3a6a)
      .setInteractive({ useHandCursor: true });
    this.buildPanel.add(cardBg);

    const icon = this.add.image(x, y - 16, `building_${type}`)
      .setDisplaySize(36, 36);
    this.buildPanel.add(icon);

    const label = this.add.text(x, y + 14, cfg.name, {
      fontFamily: 'Courier New',
      fontSize: '9px',
      color: '#ccccee',
    }).setOrigin(0.5);
    this.buildPanel.add(label);

    const costText = this.add.text(x, y + 28, `💰${cfg.buildCost.gold}`, {
      fontFamily: 'Courier New',
      fontSize: '9px',
      color: '#f0c040',
    }).setOrigin(0.5);
    this.buildPanel.add(costText);

    cardBg.on('pointerdown', () => {
      if (this.selectedCell) {
        const result = this.buildingSystem.build(
          type, this.selectedCell.col, this.selectedCell.row,
        );
        if (result.success) {
          this.buildingGroup.clear(true, true);
          this.drawBuildings();
          SaveManager.save(this.idleSystem.getSave());
          this.hideBuildPanel();
        } else {
          this.showToast(result.reason ?? 'Cannot build here');
        }
      }
    });
    cardBg.on('pointerover', () => { cardBg.fillColor = 0x2a2a5a; });
    cardBg.on('pointerout', () => { cardBg.fillColor = 0x1a1a3a; });
  }

  private showBuildPanel() {
    this.buildPanel.setVisible(true);
    this.buildPanelVisible = true;
    this.tweens.add({ targets: this.buildPanel, alpha: { from: 0, to: 1 }, duration: 200 });
  }

  private hideBuildPanel() {
    this.tweens.add({
      targets: this.buildPanel,
      alpha: 0,
      duration: 150,
      onComplete: () => { this.buildPanel.setVisible(false); this.buildPanelVisible = false; },
    });
  }

  // ── Grid input ───────────────────────────────────────────────────────────
  private setupGridInput() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.buildPanelVisible) return;
      const col = Math.floor((pointer.x - MAP_OFFSET_X) / CELL);
      const row = Math.floor((pointer.y - MAP_OFFSET_Y) / CELL);
      if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;

      this.selectedCell = { col, row };
      this.highlightRect
        .setPosition(MAP_OFFSET_X + col * CELL + CELL / 2, MAP_OFFSET_Y + row * CELL + CELL / 2)
        .setVisible(true);

      if (!this.buildingSystem.isCellOccupied(col, row)) {
        this.showBuildPanel();
      }
    });
  }

  // ── Building info popup ──────────────────────────────────────────────────
  private showBuildingInfo(b: PlacedBuilding, cfg: BuildingConfig) {
    const existing = this.children.getByName('binfo-overlay');
    if (existing) existing.destroy();

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const container = this.add.container(cx, cy).setName('binfo-overlay').setDepth(30);

    const bg = this.add.rectangle(0, 0, 280, 200, 0x0d0d25, 0.97)
      .setStrokeStyle(2, 0x5a5aaa);
    container.add(bg);

    const lines = [
      `${cfg.name}  Lv${b.level}`,
      ``,
      cfg.description,
      ``,
      `Production: ${JSON.stringify(cfg.production)}`,
      `Upgrade cost: 💰${cfg.upgradeCost(b.level).gold}`,
    ];
    lines.forEach((line, i) => {
      container.add(this.add.text(0, -80 + i * 22, line, {
        fontFamily: 'Courier New',
        fontSize: i === 0 ? '14px' : '11px',
        color: i === 0 ? '#f0c040' : '#ccccee',
        wordWrap: { width: 260 },
      }).setOrigin(0.5, 0));
    });

    // Upgrade button
    const upgBtn = this.add.rectangle(0, 80, 120, 32, 0x1e5e1e)
      .setStrokeStyle(1, 0x4eba4e)
      .setInteractive({ useHandCursor: true });
    container.add(upgBtn);
    container.add(this.add.text(0, 80, '⬆ Upgrade', {
      fontFamily: 'Courier New', fontSize: '13px', color: '#7fff7f',
    }).setOrigin(0.5));

    upgBtn.on('pointerdown', () => {
      const res = this.buildingSystem.upgrade(b.col, b.row);
      if (res.success) {
        SaveManager.save(this.idleSystem.getSave());
        container.destroy();
        this.buildingGroup.clear(true, true);
        this.drawBuildings();
      } else {
        this.showToast(res.reason ?? 'Cannot upgrade');
      }
    });

    // Close
    const close = this.add.text(128, -90, '✕', {
      fontFamily: 'Courier New', fontSize: '18px', color: '#cc4444',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => container.destroy());
    container.add(close);
  }

  // ── Top bar ──────────────────────────────────────────────────────────────
  private createTopBar() {
    const bar = this.add.container(0, 0).setDepth(15);
    const bg = this.add.rectangle(GAME_WIDTH / 2, 22, GAME_WIDTH, 44, 0x06060f, 0.9);
    bar.add(bg);

    const resources = ['gold', 'food', 'wood', 'stone', 'mana'];
    resources.forEach((res, i) => {
      const x = 24 + i * 90;
      bar.add(this.add.image(x, 22, `icon_${res}`).setDisplaySize(16, 16));
      const txt = this.add.text(x + 10, 22, '0', {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#e0e0ff',
      }).setOrigin(0, 0.5).setName(`res_${res}`);
      bar.add(txt);
    });

    // Update resource display
    this.events.on('resources-updated', () => {
      const save = SaveManager.load();
      resources.forEach(res => {
        const txt = bar.getByName(`res_${res}`) as Phaser.GameObjects.Text;
        if (txt) txt.setText(String(Math.floor(save.resources[res] ?? 0)));
      });
    });
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
    const bg = this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH, navH, 0x06060f, 0.95)
      .setDepth(15).setStrokeStyle(1, 0x2a2a5a);

    const w = GAME_WIDTH / navItems.length;
    navItems.forEach((item, i) => {
      const x = w * i + w / 2;
      const btn = this.add.text(x, y, item.label, {
        fontFamily: 'Courier New',
        fontSize: '11px',
        color: item.scene === 'TownScene' ? '#f0c040' : '#8888bb',
        align: 'center',
      }).setOrigin(0.5).setDepth(16).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        if (item.scene !== 'TownScene') {
          this.scene.start(item.scene);
        }
      });
    });
  }

  // ── Toast notification ───────────────────────────────────────────────────
  private showToast(message: string) {
    const toast = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, message, {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: '#ff9999',
      backgroundColor: '#00000099',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setDepth(50);

    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: GAME_HEIGHT / 2 - 40,
      delay: 1200,
      duration: 600,
      onComplete: () => toast.destroy(),
    });
  }
}
