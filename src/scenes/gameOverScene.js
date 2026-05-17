import Phaser from 'phaser';
import { SaveStore } from '../core/saveStore.js';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.reachedWave = data.wave ?? 0;
  }

  create() {
    SaveStore.saveBestWave(this.reachedWave);
    const w = this.scale.width;
    const h = this.scale.height;

    this.add.text(w / 2, h * 0.3, '게임 오버', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '64px',
      color: '#e74c3c',
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.45, `웨이브 ${this.reachedWave}까지 버팀`, {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '36px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.55, `최고 기록: ${SaveStore.getBestWave()}`, {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '28px',
      color: '#ffd700',
    }).setOrigin(0.5);

    const btn = this.add.rectangle(w / 2, h * 0.75, 360, 100, 0x3d6dba).setInteractive();
    this.add.text(w / 2, h * 0.75, '다시 시작', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '40px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btn.on('pointerup', () => this.scene.start('TitleScene'));
  }
}
