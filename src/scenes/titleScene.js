import Phaser from 'phaser';
import { SaveStore } from '../core/saveStore.js';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { bgm } from '../audio/bgmPlayer.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.add.text(w / 2, h * 0.25, '매직디펜스', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '72px',
      color: '#ffd700',
    }).setOrigin(0.5);

    const best = SaveStore.getBestWave();
    this.add.text(w / 2, h * 0.42, `최고 기록: 웨이브 ${best}`, {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // 시작 button — Normal mode
    const startBtn = this.add.rectangle(w / 2, h * 0.6, 360, 100, 0x3d6dba).setInteractive();
    this.add.text(w / 2, h * 0.6, '시작', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '40px',
      color: '#ffffff',
    }).setOrigin(0.5);
    startBtn.on('pointerup', () => {
      bgm.start();
      this.scene.start('GameScene', { mode: 'normal' });
    });

    // 어려움 button — Hard mode
    const hardBtn = this.add.rectangle(w / 2, h * 0.75, 360, 100, 0xC0392B).setInteractive();
    this.add.text(w / 2, h * 0.75, '어려움', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '40px',
      color: '#ffffff',
    }).setOrigin(0.5);
    hardBtn.on('pointerup', () => {
      bgm.start();
      this.scene.start('GameScene', { mode: 'hard' });
    });
  }
}
