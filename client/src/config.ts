import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { TownScene } from './scenes/TownScene';
import { BattleScene } from './scenes/BattleScene';
import { HeroScene } from './scenes/HeroScene';
import { ResearchScene } from './scenes/ResearchScene';
import { AllianceScene } from './scenes/AllianceScene';
import { UIScene } from './scenes/UIScene';

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 854;

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0a0a1a',
  parent: document.body,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    TownScene,
    BattleScene,
    HeroScene,
    ResearchScene,
    AllianceScene,
    UIScene,
  ],
  render: {
    pixelArt: true,
    antialias: false,
  },
};
