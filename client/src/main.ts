import Phaser from 'phaser';
import { GAME_CONFIG } from './config';

window.addEventListener('load', () => {
  const game = new Phaser.Game(GAME_CONFIG);

  // Resize handler for mobile
  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    game.scale.resize(w, h);
  };
  window.addEventListener('resize', resize);
  resize();
});
