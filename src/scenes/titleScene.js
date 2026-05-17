import Phaser from 'phaser';
import { SaveStore } from '../core/saveStore.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.add.text(w / 2, h * 0.3, '매직디펜스', {
      fontSize: '72px',
      color: '#ffd700',
    }).setOrigin(0.5);

    const best = SaveStore.getBestWave();
    this.add.text(w / 2, h * 0.45, `최고 기록: 웨이브 ${best}`, {
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const btn = this.add.rectangle(w / 2, h * 0.7, 360, 100, 0x3d6dba).setInteractive();
    this.add.text(w / 2, h * 0.7, '시작', {
      fontSize: '40px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btn.on('pointerup', () => this.scene.start('GameScene'));
  }
}
