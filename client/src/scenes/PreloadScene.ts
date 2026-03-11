import Phaser from 'phaser';
import { TINY_SPRITES } from '../data/sprites';

/**
 * PreloadScene – loads real asset files when present.
 *
 * Asset placement guide (copy your files here):
 *
 *   client/assets/sprites/tiny/<CharacterName>/  ← per-character tinyrpg sheets
 *   client/assets/tilesets/                      ← Free-Undead-Tileset PNG sheets
 *   client/assets/ui/                            ← UI elements
 *   client/assets/audio/                         ← music & sfx
 *
 * Each character folder must contain:
 *   <CharacterName>.png          – combined idle + walk + attack sheet
 *   <CharacterName>-Attack01.png – dedicated attack-1 sheet
 *   <CharacterName>-Attack02.png – dedicated attack-2 sheet  (if applicable)
 *
 * If any file is missing the game falls back to the procedural
 * placeholders generated in BootScene, so the game always boots.
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

    // ── Tinyrpg character sprite sheets ──────────────────────────────────
    // Each character defined in data/sprites.ts is loaded here.
    // Files are skipped silently if not present; placeholders remain active.
    for (const cfg of Object.values(TINY_SPRITES)) {
      for (const sheet of cfg.sheets) {
        this.load.spritesheet(
          sheet.textureKey,
          `assets/${sheet.path}`,
          { frameWidth: sheet.frameWidth, frameHeight: sheet.frameHeight },
        );
      }
    }

    // ── Tileset from Free-Undead-Tileset ──────────────────────────────────
    this.load.image('tileset',  'assets/tilesets/tileset.png');
    this.load.image('objects',  'assets/tilesets/objects.png');
    this.load.image('walls',    'assets/tilesets/walls.png');
    this.load.image('dungeon',  'assets/tilesets/dungeon.png');

    // ── UI assets ─────────────────────────────────────────────────────────
    this.load.image('ui_panel_img', 'assets/ui/panel.png');
    this.load.image('ui_button',    'assets/ui/button.png');
    this.load.image('ui_icons',     'assets/ui/icons.png');
    this.load.image('ui_frame',     'assets/ui/frame.png');

    // ── Audio ─────────────────────────────────────────────────────────────
    this.load.audio('bgm_town',   'assets/audio/bgm_town.mp3');
    this.load.audio('bgm_battle', 'assets/audio/bgm_battle.mp3');
    this.load.audio('bgm_menu',   'assets/audio/bgm_menu.mp3');
    this.load.audio('sfx_click',  'assets/audio/sfx_click.mp3');
    this.load.audio('sfx_build',  'assets/audio/sfx_build.mp3');
    this.load.audio('sfx_levelup','assets/audio/sfx_levelup.mp3');
    this.load.audio('sfx_victory','assets/audio/sfx_victory.mp3');

    // Suppress file-not-found errors for optional assets so the game boots
    // even when asset files have not been copied into the assets directory.
    this.load.on('loaderror', () => { /* silently ignore missing files */ });
  }

  create() {
    // Register all sprite-sheet animations now that textures are loaded.
    this.createCharacterAnimations();
    this.scene.start('MainMenuScene');
  }

  /**
   * For every tinyrpg sheet that was successfully loaded, register its
   * Phaser animations so scenes can call sprite.play('key').
   */
  private createCharacterAnimations() {
    for (const cfg of Object.values(TINY_SPRITES)) {
      for (const sheet of cfg.sheets) {
        // Skip if the texture was not loaded (file was missing)
        if (!this.textures.exists(sheet.textureKey)) continue;

        // Phaser adds a synthetic '__BASE' frame to every texture, so
        // frameTotal includes it; subtract 1 to get the real frame count.
        const totalFrames = this.textures.get(sheet.textureKey).frameTotal - 1;
        const framesPerRow = Math.floor(
          this.textures.get(sheet.textureKey).source[0].width / sheet.frameWidth,
        );

        for (const anim of sheet.animations) {
          // Skip if animation already registered (scene restarts)
          if (this.anims.exists(anim.key)) continue;

          const startFrame = anim.row * framesPerRow;
          const endFrame   = Math.min(startFrame + anim.frameCount - 1, totalFrames);

          if (startFrame > totalFrames) continue; // row out of range – skip

          this.anims.create({
            key:       anim.key,
            frames:    this.anims.generateFrameNumbers(sheet.textureKey, {
              start: startFrame,
              end:   endFrame,
            }),
            frameRate: anim.frameRate,
            repeat:    anim.repeat,
          });
        }
      }
    }
  }
}
