import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants/GameConfig';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { CharacterCustomScene } from './scenes/CharacterCustomScene';
import { GameScene } from './scenes/GameScene';
import { VillageScene } from './scenes/VillageScene';
import { UIScene } from './scenes/UIScene';
import { SleepTransitionScene } from './scenes/SleepTransitionScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: '#1a1a2e',
  pixelArt: true,   // disables antialiasing — critical for 8-bit look
  antialias: false,
  roundPixels: true,
  scene: [
    BootScene,              // generates all textures, then starts MainMenuScene
    MainMenuScene,          // title screen: New Game / Continue
    CharacterCustomScene,   // appearance picker, then starts GameScene
    GameScene,              // main farm world
    VillageScene,           // village with NPCs, shop, dialog
    UIScene,                // parallel HUD overlay
    SleepTransitionScene,   // fade + day card + autosave
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  input: {
    mouse: {
      preventDefaultDown: false,
      preventDefaultUp: false,
    },
  },
};

const game = new Phaser.Game(config);

// Expose for debugging in dev tools
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__FARM_GAME__ = game;
}

export default game;
