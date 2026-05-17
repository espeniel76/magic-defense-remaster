import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { StatusBarView } from '../render/statusBarView.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    const STATUS_H = Math.round(h * 0.08);
    const LANE_H = Math.round(h * 0.40);
    const BOARD_H = Math.round(h * 0.40);
    const ACTION_H = h - STATUS_H - LANE_H - BOARD_H;

    this.statusBar = new StatusBarView(this, 0, 0, w, STATUS_H);
    this.statusBar.setHp(GAME_CONFIG.player.startHp);
    this.statusBar.setWave(1);
    this.statusBar.setGold(GAME_CONFIG.player.startGold);

    // Lane area placeholder
    this.add.rectangle(0, STATUS_H, w, LANE_H, 0x3a2818).setOrigin(0);
    this.add.text(w / 2, STATUS_H + LANE_H / 2, '적 레인 영역\n(다음 단계에서 구현)', {
      fontSize: '24px', color: '#aaaaaa', align: 'center',
    }).setOrigin(0.5);

    // Board area placeholder
    this.add.rectangle(0, STATUS_H + LANE_H, w, BOARD_H, 0x1a2540).setOrigin(0);
    this.add.text(w / 2, STATUS_H + LANE_H + BOARD_H / 2, '머지 보드\n(다음 단계)', {
      fontSize: '24px', color: '#aaaaaa', align: 'center',
    }).setOrigin(0.5);

    // Action bar placeholder
    this.add.rectangle(0, STATUS_H + LANE_H + BOARD_H, w, ACTION_H, 0x2a3548).setOrigin(0);
    this.add.text(w / 2, h - ACTION_H / 2, '액션바', {
      fontSize: '24px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // Temporary: tap empty area to game over
    this.input.on('pointerdown', (p) => {
      if (p.y > STATUS_H + LANE_H + BOARD_H + 20) return;
      this.scene.start('GameOverScene', { wave: 1 });
    });
  }
}
