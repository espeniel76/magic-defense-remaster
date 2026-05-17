import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class StatusBarView {
  constructor(scene, x, y, width, height) {
    this.scene = scene;
    this.bg = scene.add.rectangle(x, y, width, height, 0x2a3548).setOrigin(0);

    const padding = 24;
    const leftOffset = 110; // leaves room for home button in top-left
    const fontSize = '28px';
    const style = { fontFamily: GAME_CONFIG.font.family, fontSize, color: '#ffffff' };

    this.hpText = scene.add.text(x + leftOffset, y + height / 2, 'HP 0', style).setOrigin(0, 0.5);
    this.waveText = scene.add.text(x + width / 2, y + height / 2, '웨이브 1', style).setOrigin(0.5);
    this.goldText = scene.add.text(x + width - padding, y + height / 2, 'G 0', style).setOrigin(1, 0.5);
  }

  setHp(hp) { this.hpText.setText(`HP ${hp}`); }
  setWave(w) { this.waveText.setText(`웨이브 ${w}`); }
  setGold(g) { this.goldText.setText(`G ${g}`); }
}
