import Phaser from 'phaser';
import { SaveStore } from '../core/saveStore.js';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { bgm } from '../audio/bgmPlayer.js';

export class Stage2TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Stage2TitleScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.add.text(w / 2, h * 0.20, '스테이지 2', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '72px',
      color: '#ff8c42',
    }).setOrigin(0.5);

    const best = SaveStore.getBestWave();
    this.add.text(w / 2, h * 0.32, `최고 기록: 웨이브 ${best}`, {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.40, '(준비중)', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '24px',
      color: '#888888',
    }).setOrigin(0.5);

    const buttons = [
      { y: 0.55, label: '보통 모드',  color: 0x3d6dba, mode: 'normal' },
      { y: 0.70, label: '어려움 모드', color: 0xC0392B, mode: 'hard'   },
      { y: 0.85, label: '지옥 모드',   color: 0x4A148C, mode: 'hell'   },
    ];

    for (const { y, label, color, mode } of buttons) {
      const btn = this.add.rectangle(w / 2, h * y, 360, 100, color)
        .setInteractive(new Phaser.Geom.Rectangle(-30, -30, 420, 160), Phaser.Geom.Rectangle.Contains);
      this.add.text(w / 2, h * y, label, {
        fontFamily: GAME_CONFIG.font.family,
        fontSize: '40px',
        color: '#ffffff',
      }).setOrigin(0.5);
      btn.on('pointerup', () => {
        bgm.start(mode);
        this.scene.start('GameScene', { mode, stage: 2 });
      });
    }

    // Right arrow → back to Stage 1
    const arrow = this.add.text(w - 50, h * 0.50, '→', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '60px',
      color: '#ffffff',
    }).setOrigin(0.5);
    const hit = this.add.rectangle(w - 50, h * 0.50, 120, 160, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerup', () => this.scene.start('TitleScene'));
    this.add.text(w - 50, h * 0.50 + 50, '스테이지 1', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '18px',
      color: '#aaaaaa',
    }).setOrigin(0.5);
  }
}
