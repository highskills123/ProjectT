import Phaser from 'phaser';

/**
 * PreloadScene – loads real asset files when present.
 *
 * Asset placement guide (copy your files here):
 *
 *   client/assets/sprites/   ← tinyrpg sprite sheets (.png + .json)
 *   client/assets/tilesets/  ← Free-Undead-Tileset PNG sheets
 *   client/assets/ui/        ← UI elements
 *   client/assets/audio/     ← music & sfx
 *
 * If files are missing the game will fall back to the procedural
 * placeholders generated in BootScene.
 */
export class PreloadScene extends Phaser.Scene {
  private loadingBar!: HTMLElement | null;
  private loadingText!: HTMLElement | null;
  private loadingDiv!: HTMLElement | null;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    this.loadingBar = document.getElementById('loading-bar');
    this.loadingText = document.getElementById('loading-text');
    this.loadingDiv = document.getElementById('loading');

    // Update HTML loading bar from Phaser progress events
    this.load.on('progress', (value: number) => {
      if (this.loadingBar) this.loadingBar.style.width = `${value * 100}%`;
      if (this.loadingText) this.loadingText.textContent = `Loading… ${Math.round(value * 100)}%`;
    });

    this.load.on('complete', () => {
      if (this.loadingDiv) this.loadingDiv.style.display = 'none';
    });

    // ── Attempt to load real assets ──────────────────────────────────────
    // These will silently fail if files don't exist yet; placeholders take over.

    // Sprite sheets from tinyrpg
    this.loadIfExists('sprites/characters.png', () =>
      this.load.spritesheet('characters', 'assets/sprites/characters.png', {
        frameWidth: 16, frameHeight: 32,
      })
    );

    this.loadIfExists('sprites/monsters.png', () =>
      this.load.spritesheet('monsters', 'assets/sprites/monsters.png', {
        frameWidth: 16, frameHeight: 16,
      })
    );

    // Tileset from Free-Undead-Tileset
    this.loadIfExists('tilesets/tileset.png', () =>
      this.load.image('tileset', 'assets/tilesets/tileset.png')
    );

    this.loadIfExists('tilesets/objects.png', () =>
      this.load.image('objects', 'assets/tilesets/objects.png')
    );

    // UI assets
    this.loadIfExists('ui/panel.png', () =>
      this.load.image('ui_panel_img', 'assets/ui/panel.png')
    );

    // Audio
    this.loadIfExists('audio/bgm_town.mp3', () =>
      this.load.audio('bgm_town', 'assets/audio/bgm_town.mp3')
    );
    this.loadIfExists('audio/bgm_battle.mp3', () =>
      this.load.audio('bgm_battle', 'assets/audio/bgm_battle.mp3')
    );
    this.loadIfExists('audio/sfx_click.mp3', () =>
      this.load.audio('sfx_click', 'assets/audio/sfx_click.mp3')
    );
  }

  create() {
    this.scene.start('MainMenuScene');
  }

  /** Only register a loader call if we can (files may not exist in dev) */
  private loadIfExists(_path: string, loader: () => void) {
    // In a real build we'd check the manifest; here we just try loading
    // and Phaser will fire a fileerror event (which we ignore).
    loader();
  }
}
