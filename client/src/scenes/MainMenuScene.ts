import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { SaveManager } from '../utils/SaveManager';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const cx = GAME_WIDTH / 2;

    // ── Background gradient ───────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x16163a, 0x16163a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Stars
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT * 0.6);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);
      const r = Phaser.Math.FloatBetween(0.5, 2);
      this.add.circle(x, y, r, 0xffffff, alpha);
    }

    // ── Title ─────────────────────────────────────────────────────────────
    this.add.text(cx, 120, 'PROJECT T', {
      fontFamily: 'Courier New',
      fontSize: '48px',
      color: '#f0c040',
      stroke: '#8b6000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, 175, 'Idle RPG • Build • Battle • Conquer', {
      fontFamily: 'Courier New',
      fontSize: '13px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    // ── Decorative divider ────────────────────────────────────────────────
    const line = this.add.graphics();
    line.lineStyle(2, 0xf0c040, 0.4);
    line.lineBetween(cx - 160, 200, cx + 160, 200);

    // ── Menu buttons ──────────────────────────────────────────────────────
    const hasSave = SaveManager.hasSave();
    const buttons = [
      { label: hasSave ? '▶  Continue' : '⚔  New Game', scene: 'TownScene', primary: true },
      { label: '🗺  Alliance',  scene: 'AllianceScene', primary: false },
      { label: '⚗  Research',  scene: 'ResearchScene', primary: false },
    ];

    buttons.forEach((btn, i) => {
      this.createMenuButton(cx, 300 + i * 80, btn.label, btn.primary, () => {
        if (!SaveManager.hasSave()) SaveManager.newGame();
        this.scene.start(btn.scene);
        this.scene.launch('UIScene');
      });
    });

    // Version tag
    this.add.text(GAME_WIDTH - 8, GAME_HEIGHT - 8, 'v0.1.0', {
      fontFamily: 'Courier New',
      fontSize: '11px',
      color: '#444466',
    }).setOrigin(1, 1);
  }

  private createMenuButton(
    x: number, y: number,
    label: string,
    primary: boolean,
    callback: () => void,
  ) {
    const w = 240, h = 52;
    const bg = this.add.rectangle(x, y, w, h, primary ? 0x1e3a6e : 0x161630)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, primary ? 0x5a8aca : 0x3a3a6a);

    const text = this.add.text(x, y, label, {
      fontFamily: 'Courier New',
      fontSize: primary ? '18px' : '16px',
      color: primary ? '#f0c040' : '#9090cc',
    }).setOrigin(0.5);

    bg.on('pointerover', () => {
      bg.fillColor = primary ? 0x2a4a8e : 0x202048;
      text.setColor('#ffffff');
    });
    bg.on('pointerout', () => {
      bg.fillColor = primary ? 0x1e3a6e : 0x161630;
      text.setColor(primary ? '#f0c040' : '#9090cc');
    });
    bg.on('pointerdown', callback);
  }
}
