import Phaser from 'phaser';
import { SaveStore } from '../core/saveStore.js';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { bgm } from '../audio/bgmPlayer.js';
import { addNavBar } from '../render/navBar.js';

// 스테이지 선택 화면 (홈). 좌우로 밀거나 화살표로 스테이지(맵)를 넘기고,
// 플레이 버튼으로 그 스테이지를 시작한다. 씬 key는 'TitleScene' 유지.
export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.stages = GAME_CONFIG.stages;
    this.stageIndex = 0;

    // 게임 이름 (상단)
    this.add.text(w / 2, h * 0.07, '매직 디펜스 리마스터', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '46px',
      color: '#ffd700',
    }).setOrigin(0.5);

    // 스테이지 번호 표시 + 좌우 화살표
    this.indexLabel = this.add.text(w / 2, h * 0.19, '', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '30px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.leftArrow = this._makeArrow(w * 0.12, h * 0.44, '‹', -1);
    this.rightArrow = this._makeArrow(w * 0.88, h * 0.44, '›', 1);

    // 스테이지 카드 (컨테이너 — 넘길 때 슬라이드 애니메이션)
    const cardW = w * 0.72;
    const cardH = h * 0.32;
    this.card = this.add.container(w / 2, h * 0.44);
    this.cardBg = this.add.rectangle(0, 0, cardW, cardH, 0xffffff)
      .setStrokeStyle(6, 0x000000, 0.3);
    this.captionText = this.add.text(0, -cardH * 0.34, 'STAGE', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '30px', color: '#ffffff', stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);
    this.numText = this.add.text(0, -cardH * 0.13, '', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '92px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 7,
    }).setOrigin(0.5);
    this.nameText = this.add.text(0, cardH * 0.15, '', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '54px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.bestText = this.add.text(0, cardH * 0.35, '', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '24px', color: '#ffffff', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);
    this.card.add([this.cardBg, this.captionText, this.numText, this.nameText, this.bestText]);

    // 스와이프 힌트
    this.add.text(w / 2, h * 0.62, '← 밀어서 스테이지 이동 →', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '22px', color: '#888888',
    }).setOrigin(0.5);

    // 난이도 선택 (기본 = 어려움, 지금까지의 밸런스)
    this.difficulties = GAME_CONFIG.difficulties;
    this.difficultyIndex = Math.max(0,
      this.difficulties.findIndex(d => d.id === GAME_CONFIG.defaultDifficultyId));
    this._makeDifficultyRow(h * 0.665);

    // 플레이 버튼
    const playBtn = this.add.rectangle(w / 2, h * 0.75, w * 0.6, 120, 0x2ecc71)
      .setInteractive(new Phaser.Geom.Rectangle(-30, -30, w * 0.6 + 60, 180), Phaser.Geom.Rectangle.Contains);
    this.add.text(w / 2, h * 0.75, '▶  플레이', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '44px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    playBtn.on('pointerup', () => this._startStage());

    // 스와이프(드래그)로 스테이지 넘기기
    this.input.on('pointerdown', (p) => { this._downX = p.x; });
    this.input.on('pointerup', (p) => {
      if (this._downX == null) return;
      const dx = p.x - this._downX;
      this._downX = null;
      if (Math.abs(dx) < 60) return;       // 탭은 무시 (버튼/화살표 클릭 보호)
      this._change(dx < 0 ? 1 : -1);        // 왼쪽으로 밀면 다음 스테이지
    });

    this._renderStage(0);

    addNavBar(this, 'play');
  }

  _makeDifficultyRow(y) {
    const w = this.scale.width;
    const n = this.difficulties.length;
    const slot = (w * 0.92) / n;
    const startX = w * 0.04;
    this.diffButtons = this.difficulties.map((d, i) => {
      const cx = startX + slot * (i + 0.5);
      const bg = this.add.rectangle(cx, y, slot * 0.9, 58, d.color, 1)
        .setStrokeStyle(3, 0xffffff, 0.6)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(cx, y, d.name, {
        fontFamily: GAME_CONFIG.font.family, fontSize: '24px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);
      bg.on('pointerup', () => this._selectDifficulty(i));
      return { bg, label, color: d.color };
    });
    this._selectDifficulty(this.difficultyIndex);
  }

  _selectDifficulty(i) {
    this.difficultyIndex = i;
    this.diffButtons.forEach((b, idx) => {
      const on = idx === i;
      b.bg.setFillStyle(b.color, on ? 1 : 0.25);
      b.bg.setStrokeStyle(on ? 4 : 2, 0xffffff, on ? 0.95 : 0.3);
      b.label.setColor(on ? '#ffffff' : '#c8c8c8');
      b.label.setScale(on ? 1.0 : 0.9);
    });
  }

  _makeArrow(x, y, glyph, delta) {
    const arrow = this.add.text(x, y, glyph, {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '80px', color: '#ffffff',
    }).setOrigin(0.5)
      .setInteractive(new Phaser.Geom.Rectangle(-40, -60, 120, 160), Phaser.Geom.Rectangle.Contains);
    arrow.on('pointerup', () => this._change(delta));
    return arrow;
  }

  _change(delta) {
    const next = Phaser.Math.Clamp(this.stageIndex + delta, 0, this.stages.length - 1);
    if (next === this.stageIndex) return;
    this.stageIndex = next;
    this._renderStage(next, delta > 0 ? 1 : -1);
  }

  _renderStage(i, dir = 0) {
    const s = this.stages[i];
    const clearWave = GAME_CONFIG.wave.stageClearWave;
    const best = SaveStore.getStageBest(i);

    this.cardBg.setFillStyle(s.color, 1);
    this.numText.setText(String(i + 1));
    this.nameText.setText(s.name);
    this.bestText.setText(
      best >= clearWave ? '✓ 클리어!'
      : best > 0 ? `최고 웨이브 ${best} / ${clearWave}`
      : '아직 도전 안 함'
    );
    this.indexLabel.setText(`${i + 1} / ${this.stages.length}`);
    this.leftArrow.setAlpha(i === 0 ? 0.25 : 1);
    this.rightArrow.setAlpha(i === this.stages.length - 1 ? 0.25 : 1);

    if (dir !== 0) {
      const w = this.scale.width;
      this.card.x = w / 2 + dir * w * 0.5;
      this.tweens.add({ targets: this.card, x: w / 2, duration: 180, ease: 'Quad.out' });
    }
  }

  _startStage() {
    const s = this.stages[this.stageIndex];
    const difficulty = this.difficulties[this.difficultyIndex];
    bgm.start(s.tier);
    this.scene.start('GameScene', {
      stageIndex: this.stageIndex,
      difficultyId: difficulty.id,
    });
  }
}
