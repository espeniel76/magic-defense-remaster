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
    this.stageIndex = data?.stageIndex ?? 0;
    this.difficulty = GAME_CONFIG.difficulties.find(d => d.id === data?.difficultyId)
      ?? GAME_CONFIG.difficulties.find(d => d.id === GAME_CONFIG.defaultDifficultyId);
  }

  create() {
    SaveStore.saveBestWave(this.reachedWave);
    SaveStore.saveStageBest(this.stageIndex, this.reachedWave);
    const w = this.scale.width;
    const h = this.scale.height;
    const stage = GAME_CONFIG.stages[this.stageIndex];
    const clearWave = GAME_CONFIG.wave.stageClearWave;

    const title = this.isVictory ? '승리!' : '게임 오버';
    const titleColor = this.isVictory ? '#ffd700' : '#e74c3c';
    this.add.text(w / 2, h * 0.3, title, {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '72px',
      color: titleColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (this.isVictory) {
      this.add.text(w / 2, h * 0.45, `${stage.name} · ${this.difficulty.name} 클리어!`, {
        fontFamily: GAME_CONFIG.font.family,
        fontSize: '36px',
        color: '#ffffff',
      }).setOrigin(0.5);
    } else {
      this.add.text(w / 2, h * 0.45, `웨이브 ${this.reachedWave} / ${clearWave} 까지 버팀`, {
        fontFamily: GAME_CONFIG.font.family,
        fontSize: '36px',
        color: '#ffffff',
      }).setOrigin(0.5);
    }

    this.add.text(w / 2, h * 0.55, `${stage.name} 최고 기록: ${SaveStore.getStageBest(this.stageIndex)} / ${clearWave}`, {
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
