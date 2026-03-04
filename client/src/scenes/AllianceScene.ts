import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { NetworkManager } from '../utils/NetworkManager';
import { SaveManager } from '../utils/SaveManager';

export class AllianceScene extends Phaser.Scene {
  private networkManager!: NetworkManager;
  private allianceList: Array<{ id: string; name: string; members: number; power: number }> = [];

  constructor() {
    super({ key: 'AllianceScene' });
  }

  create() {
    this.networkManager = NetworkManager.getInstance();
    this.drawBackground();
    this.createTopBar();
    this.renderAlliancePanel();
    this.createBottomNav();
    this.loadAllianceData();
  }

  private drawBackground() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a18, 0x0a0a18, 0x060624, 0x060624, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private createTopBar() {
    this.add.rectangle(GAME_WIDTH / 2, 22, GAME_WIDTH, 44, 0x06060f, 0.9).setDepth(10);
    this.add.text(GAME_WIDTH / 2, 22, '🗺  Alliance', {
      fontFamily: 'Courier New', fontSize: '18px', color: '#f0c040',
    }).setOrigin(0.5).setDepth(11);
  }

  private renderAlliancePanel() {
    const save = SaveManager.load();
    const cx = GAME_WIDTH / 2;

    if (save.alliance) {
      // ── Existing alliance UI ──────────────────────────────────────────
      const alliance = save.alliance;
      this.add.text(cx, 70, alliance.name, {
        fontFamily: 'Courier New', fontSize: '20px', color: '#f0c040',
      }).setOrigin(0.5);

      this.add.text(cx, 96, `Members: ${alliance.memberCount}  Rank: #${alliance.rank}`, {
        fontFamily: 'Courier New', fontSize: '12px', color: '#aaaacc',
      }).setOrigin(0.5);

      const infos = [
        { label: 'Alliance Power', value: alliance.power.toLocaleString() },
        { label: 'Wins / Losses',  value: `${alliance.wins} / ${alliance.losses}` },
        { label: 'Tech Bonus',     value: `+${alliance.techBonus}%` },
        { label: 'Role',           value: save.allianceRole ?? 'Member' },
      ];

      infos.forEach((info, i) => {
        const y = 130 + i * 46;
        const bg = this.add.rectangle(cx, y, GAME_WIDTH - 40, 38, 0x0d0d28)
          .setStrokeStyle(1, 0x2a2a5a);
        this.add.text(cx - (GAME_WIDTH / 2 - 30), y, info.label, {
          fontFamily: 'Courier New', fontSize: '12px', color: '#8888cc',
        }).setOrigin(0, 0.5);
        this.add.text(cx + (GAME_WIDTH / 2 - 30), y, info.value, {
          fontFamily: 'Courier New', fontSize: '13px', color: '#f0c040',
        }).setOrigin(1, 0.5);
      });

      // Alliance chat placeholder
      this.add.text(cx, 380, '💬 Alliance Chat', {
        fontFamily: 'Courier New', fontSize: '14px', color: '#ccccff',
        backgroundColor: '#0d0d28',
        padding: { x: 8, y: 6 },
      }).setOrigin(0.5);

      this.add.text(cx, 440, '(Multiplayer chat requires server connection)', {
        fontFamily: 'Courier New', fontSize: '10px', color: '#555577',
      }).setOrigin(0.5);

      // Donate resources button
      this.createButton(cx, 530, 'Donate Resources', '#1a3a1a', '#4eba4e', () => {
        this.showToast('Feature coming soon in multiplayer update!');
      });

      // Leave button
      this.createButton(cx, 590, '🚪 Leave Alliance', '#3a0a0a', '#aa4444', () => {
        this.showToast('Are you sure? (Hold to confirm)');
      });
    } else {
      // ── No alliance yet ───────────────────────────────────────────────
      this.add.text(cx, 80, 'You are not in an Alliance', {
        fontFamily: 'Courier New', fontSize: '14px', color: '#888899',
      }).setOrigin(0.5);

      this.createButton(cx, 140, '⚔ Create Alliance', '#1a2a4a', '#5a8aca', () => {
        this.showCreateDialog();
      });

      this.createButton(cx, 200, '🔍 Browse Alliances', '#1a1a3a', '#3a3a8a', () => {
        this.showAllianceList();
      });

      // Alliance list area
      this.add.text(cx, 260, '── Top Alliances ──', {
        fontFamily: 'Courier New', fontSize: '13px', color: '#555577',
      }).setOrigin(0.5);

      // Placeholder rows until server data loads
      for (let i = 0; i < 5; i++) {
        const y = 300 + i * 50;
        const bg = this.add.rectangle(cx, y, GAME_WIDTH - 40, 42, 0x0d0d1f)
          .setStrokeStyle(1, 0x1a1a3a);
        this.add.text(cx - (GAME_WIDTH / 2 - 24), y - 8, `#${i + 1}  Alliance ${i + 1}`, {
          fontFamily: 'Courier New', fontSize: '12px', color: '#ccccee',
        }).setOrigin(0, 0.5);
        this.add.text(cx - (GAME_WIDTH / 2 - 24), y + 8, `Loading…`, {
          fontFamily: 'Courier New', fontSize: '10px', color: '#555566',
        }).setOrigin(0, 0.5).setName(`alliance_row_${i}`);

        const joinBtn = this.add.text(cx + (GAME_WIDTH / 2 - 24), y, 'Join >', {
          fontFamily: 'Courier New', fontSize: '11px',
          color: '#5a8aca', backgroundColor: '#0d1a28',
          padding: { x: 6, y: 3 },
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
        joinBtn.on('pointerdown', () => this.showToast('Connecting to server…'));
      }
    }
  }

  private createButton(x: number, y: number, label: string, bg: string, stroke: string, cb: () => void) {
    const bgRect = this.add.rectangle(x, y, 220, 42, parseInt(bg.replace('#', ''), 16))
      .setStrokeStyle(2, parseInt(stroke.replace('#', ''), 16))
      .setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, {
      fontFamily: 'Courier New', fontSize: '14px', color: stroke,
    }).setOrigin(0.5);
    bgRect.on('pointerdown', cb);
    bgRect.on('pointerover', () => bgRect.setAlpha(0.8));
    bgRect.on('pointerout', () => bgRect.setAlpha(1));
  }

  private showCreateDialog() {
    this.showToast('Alliance creation requires server. Start the server with: npm run dev');
  }

  private showAllianceList() {
    this.showToast('Loading alliance list from server…');
    this.networkManager.fetchAlliances().then(list => {
      list.forEach((a, i) => {
        const row = this.children.getByName(`alliance_row_${i}`) as Phaser.GameObjects.Text;
        if (row) row.setText(`Members: ${a.members}  Power: ${a.power.toLocaleString()}`);
      });
    }).catch(() => {
      this.showToast('Server offline. Alliance features require server.');
    });
  }

  private loadAllianceData() {
    // Async load – does not block rendering
    this.networkManager.fetchAlliances().then(list => {
      this.allianceList = list;
    }).catch(() => { /* server offline */ });
  }

  private showToast(msg: string) {
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, msg, {
      fontFamily: 'Courier New', fontSize: '13px', color: '#ffcc88',
      backgroundColor: '#00000099', padding: { x: 10, y: 6 },
      wordWrap: { width: GAME_WIDTH - 40 },
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: t, alpha: 0, y: GAME_HEIGHT / 2 - 40, delay: 2000, duration: 600, onComplete: () => t.destroy() });
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
        color: item.scene === 'AllianceScene' ? '#f0c040' : '#8888bb', align: 'center',
      }).setOrigin(0.5).setDepth(16).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { if (item.scene !== 'AllianceScene') this.scene.start(item.scene); });
    });
  }
}
