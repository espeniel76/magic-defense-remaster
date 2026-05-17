import Phaser from 'phaser';
import { TitleScene } from './scenes/titleScene.js';
import { GameScene } from './scenes/gameScene.js';
import { GameOverScene } from './scenes/gameOverScene.js';
import { MonsterCodexScene } from './scenes/monsterCodexScene.js';
import { GAME_CONFIG } from './config/gameConfig.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0f1419',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.display.width,
    height: GAME_CONFIG.display.height,
  },
  scene: [TitleScene, GameScene, GameOverScene, MonsterCodexScene],
};

new Phaser.Game(config);
