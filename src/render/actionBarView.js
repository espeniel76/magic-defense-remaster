import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class ActionBarView {
  constructor(scene, x, y, width, height) {
    this.scene = scene;
    this.bg = scene.add.rectangle(x, y, width, height, 0x2a3548).setOrigin(0);

    const padding = 24;
    const btnW = (width - padding * 3) * 0.7;
    const speedBtnW = (width - padding * 3) * 0.3;
    const btnH = height * 0.7;

    const summonX = x + padding + btnW / 2;
    const summonY = y + height / 2;
    this.summonBg = scene.add.rectangle(summonX, summonY, btnW, btnH, 0x3d6dba).setInteractive();
    this.summonLabel = scene.add.text(summonX, summonY, '소환 (50G)', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5);

    const speedX = x + padding * 2 + btnW + speedBtnW / 2;
    const speedY = y + height / 2;
    this.speedBg = scene.add.rectangle(speedX, speedY, speedBtnW, btnH, 0x555555).setInteractive();
    this.speedLabel = scene.add.text(speedX, speedY, '1x', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5);

    this.summonBg.on('pointerup', () => this.onSummon && this.onSummon());
    this.speedBg.on('pointerup', () => this.onSpeedToggle && this.onSpeedToggle());
  }

  setSummonCost(cost) {
    this.summonLabel.setText(`소환 (${cost}G)`);
  }

  setSummonEnabled(enabled) {
    this.summonBg.setFillStyle(enabled ? 0x3d6dba : 0x555555);
    if (enabled) this.summonBg.setInteractive();
    else this.summonBg.disableInteractive();
  }

  setSpeed(mult) {
    this.speedLabel.setText(`${mult}x`);
  }
}
