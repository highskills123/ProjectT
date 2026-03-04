import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { ResearchSystem } from '../systems/ResearchSystem';
import { SaveManager } from '../utils/SaveManager';
import { RESEARCH_TREE, ResearchNode } from '../data/research';

export class ResearchScene extends Phaser.Scene {
  private researchSystem!: ResearchSystem;

  constructor() {
    super({ key: 'ResearchScene' });
  }

  create() {
    const save = SaveManager.load();
    this.researchSystem = new ResearchSystem(save);
    this.drawBackground();
    this.createTopBar();
    this.renderTree();
    this.createBottomNav();
  }

  private drawBackground() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x060618, 0x060618, 0x0c0c28, 0x0c0c28, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private createTopBar() {
    this.add.rectangle(GAME_WIDTH / 2, 22, GAME_WIDTH, 44, 0x06060f, 0.9).setDepth(10);
    this.add.text(GAME_WIDTH / 2, 22, '⚗  Research', {
      fontFamily: 'Courier New', fontSize: '18px', color: '#f0c040',
    }).setOrigin(0.5).setDepth(11);
  }

  private renderTree() {
    const categories = [...new Set(Object.values(RESEARCH_TREE).map(n => n.category))];
    const tabW = GAME_WIDTH / categories.length;

    categories.forEach((cat, ci) => {
      // Category tab
      const tx = tabW * ci + tabW / 2;
      const tab = this.add.rectangle(tx, 58, tabW - 4, 26, 0x1a1a3a)
        .setStrokeStyle(1, 0x3a3a6a).setInteractive({ useHandCursor: true });
      this.add.text(tx, 58, cat, {
        fontFamily: 'Courier New', fontSize: '11px', color: '#aaaacc',
      }).setOrigin(0.5);

      // Nodes in this category
      const nodes = Object.values(RESEARCH_TREE).filter(n => n.category === cat);
      nodes.forEach((node, ni) => {
        const col = ni % 3;
        const row = Math.floor(ni / 3);
        const nx = 40 + col * 130;
        const ny = 90 + row * 110;
        this.renderResearchNode(nx, ny, node);
      });
    });
  }

  private renderResearchNode(x: number, y: number, node: ResearchNode) {
    const completed = this.researchSystem.isCompleted(node.id);
    const available = this.researchSystem.isAvailable(node.id);

    const color = completed ? 0x1a3a1a : (available ? 0x1a1a3a : 0x0f0f1f);
    const stroke = completed ? 0x44aa44 : (available ? 0x3a3a8a : 0x1a1a3a);

    const bg = this.add.rectangle(x, y, 110, 90, color)
      .setStrokeStyle(2, stroke)
      .setInteractive({ useHandCursor: available && !completed });

    this.add.text(x, y - 28, node.icon, {
      fontFamily: 'Courier New', fontSize: '20px',
    }).setOrigin(0.5);

    this.add.text(x, y - 6, node.name, {
      fontFamily: 'Courier New', fontSize: '10px',
      color: completed ? '#44ff44' : (available ? '#ccccff' : '#555566'),
      wordWrap: { width: 100 },
      align: 'center',
    }).setOrigin(0.5);

    const level = this.researchSystem.getLevel(node.id);
    this.add.text(x, y + 12, `Lv ${level}/${node.maxLevel}`, {
      fontFamily: 'Courier New', fontSize: '9px', color: '#888899',
    }).setOrigin(0.5);

    this.add.text(x, y + 26, `💰${node.costPerLevel.gold}`, {
      fontFamily: 'Courier New', fontSize: '9px', color: '#f0c040',
    }).setOrigin(0.5);

    if (available && !completed) {
      bg.on('pointerover', () => { bg.fillColor = 0x2a2a5a; });
      bg.on('pointerout', () => { bg.fillColor = color; });
      bg.on('pointerdown', () => {
        const result = this.researchSystem.research(node.id);
        if (result.success) {
          SaveManager.save(this.researchSystem.getSave());
          this.scene.restart();
        } else {
          this.showToast(result.reason ?? 'Cannot research');
        }
      });
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
        color: item.scene === 'ResearchScene' ? '#f0c040' : '#8888bb', align: 'center',
      }).setOrigin(0.5).setDepth(16).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { if (item.scene !== 'ResearchScene') this.scene.start(item.scene); });
    });
  }
}
