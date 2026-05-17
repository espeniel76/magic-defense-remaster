import Phaser from 'phaser';
import { SaveStore } from '../core/saveStore.js';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.reachedWave = data?.wave ?? 0;
    this.isVictory = data?.isVictory ?? false;
    this.mode = data?.mode ?? 'normal';
  }

  create() {
    SaveStore.saveBestWave(this.reachedWave);
    const w = this.scale.width;
    const h = this.scale.height;

    const title = this.isVictory ? '승리!' : '게임 오버';
    const titleColor = this.isVictory ? '#ffd700' : '#e74c3c';
    this.add.text(w / 2, h * 0.3, title, {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '72px',
      color: titleColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (this.isVictory) {
      const modeLabel = this.mode === 'hard' ? '어려움' : '일반';
      this.add.text(w / 2, h * 0.45, `${modeLabel} 모드 클리어!`, {
        fontFamily: GAME_CONFIG.font.family,
        fontSize: '36px',
        color: '#ffffff',
      }).setOrigin(0.5);
    } else {
      this.add.text(w / 2, h * 0.45, `웨이브 ${this.reachedWave}까지 버팀`, {
        fontFamily: GAME_CONFIG.font.family,
        fontSize: '36px',
        color: '#ffffff',
      }).setOrigin(0.5);
    }

    this.add.text(w / 2, h * 0.55, `최고 기록: ${SaveStore.getBestWave()}`, {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '28px',
      color: '#ffd700',
    }).setOrigin(0.5);

    const btn = this.add.rectangle(w / 2, h * 0.75, 360, 100, 0x3d6dba).setInteractive();
    this.add.text(w / 2, h * 0.75, '메인 화면', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '40px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btn.on('pointerup', () => this.scene.start('TitleScene'));
  }
}
