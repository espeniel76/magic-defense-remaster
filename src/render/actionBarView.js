import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class ActionBarView {
  constructor(scene, x, y, width, height) {
    this.scene = scene;
    this.bg = scene.add.rectangle(x, y, width, height, 0x2a3548).setOrigin(0);

    const padding = 16;
    const availW = width - padding * 4;
    const summonW = availW * 0.55;
    const sellW = availW * 0.22;
    const speedW = availW * 0.23;
    const btnH = height * 0.7;

    const summonX = x + padding + summonW / 2;
    const summonY = y + height / 2;
    this.summonBg = scene.add.rectangle(summonX, summonY, summonW, btnH, 0x3d6dba).setInteractive();
    this.summonLabel = scene.add.text(summonX, summonY, '소환 (50G)', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '26px', color: '#ffffff',
    }).setOrigin(0.5);

    const sellX = x + padding * 2 + summonW + sellW / 2;
    const sellY = y + height / 2;
    this.sellBg = scene.add.rectangle(sellX, sellY, sellW, btnH, 0x6a4a3d);
    this.sellLabel = scene.add.text(sellX, sellY, '판매', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5);
    this.sellArea = { x: sellX, y: sellY, w: sellW, h: btnH };

    const speedX = x + padding * 3 + summonW + sellW + speedW / 2;
    const speedY = y + height / 2;
    this.speedBg = scene.add.rectangle(speedX, speedY, speedW, btnH, 0x555555).setInteractive();
    this.speedLabel = scene.add.text(speedX, speedY, '1x', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '26px', color: '#ffffff',
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

  setSellPreview(amount) {
    this.sellBg.setFillStyle(0xc0392b);
    this.sellLabel.setText(`+${amount}G`);
  }

  clearSellPreview() {
    this.sellBg.setFillStyle(0x6a4a3d);
    this.sellLabel.setText('판매');
  }

  isPointInSellZone(x, y) {
    const a = this.sellArea;
    return x >= a.x - a.w / 2 && x <= a.x + a.w / 2 &&
           y >= a.y - a.h / 2 && y <= a.y + a.h / 2;
  }
}
