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
    this.add.text(w / 2, h * 0.20, '매직디펜스', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '72px',
      color: '#ffd700',
    }).setOrigin(0.5);

    const best = SaveStore.getBestWave();
    this.add.text(w / 2, h * 0.32, `최고 기록: 웨이브 ${best}`, {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const buttons = [
      { y: 0.50, label: '보통 모드',  color: 0x3d6dba, mode: 'normal' },
      { y: 0.65, label: '어려움 모드', color: 0xC0392B, mode: 'hard'   },
      { y: 0.80, label: '지옥 모드',   color: 0x4A148C, mode: 'hell'   },
    ];

    for (const { y, label, color, mode } of buttons) {
      const btn = this.add.rectangle(w / 2, h * y, 360, 100, color).setInteractive();
      this.add.text(w / 2, h * y, label, {
        fontFamily: GAME_CONFIG.font.family,
        fontSize: '40px',
        color: '#ffffff',
      }).setOrigin(0.5);
      btn.on('pointerup', () => {
        bgm.start();
        this.scene.start('GameScene', { mode });
      });
    }
  }
}
