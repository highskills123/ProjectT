import Phaser from 'phaser';

/**
 * UIScene – always-on HUD overlay (runs in parallel with main scenes).
 * Currently minimal; expand to add global notifications, online status, etc.
 */
export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // Online status dot (top-right corner)
    const dot = this.add.circle(this.scale.width - 12, 12, 5, 0x44aa44).setDepth(100);
    this.add.text(this.scale.width - 22, 12, 'ONLINE', {
      fontFamily: 'Courier New', fontSize: '9px', color: '#44aa44',
    }).setOrigin(1, 0.5).setDepth(100);
  }
}
