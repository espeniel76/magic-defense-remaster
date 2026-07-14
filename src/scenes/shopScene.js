import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { GACHA_BOXES, RARITIES, HERO_BY_ID } from '../config/heroConfig.js';
import { HeroStore } from '../core/heroStore.js';
import { drawHero } from '../core/gacha.js';
import { addNavBar } from '../render/navBar.js';
import { drawHeroFigure } from '../render/heroFigure.js';
import { drawMythicFigure } from '../render/boardView.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.add.rectangle(0, 0, w, h, 0x0f1419).setOrigin(0);

    this.add.text(w / 2, h * 0.045, '뽑기', {
      fontFamily: GAME_CONFIG.font.family, fontSize: '44px', color: '#ffd700',
    }).setOrigin(0.5);

    // 젬 잔액
    this._gemsText = this.add.text(w / 2, h * 0.11, `젬 ${HeroStore.getGems()}`, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '34px', color: '#7ee787', fontStyle: 'bold',
    }).setOrigin(0.5);

    // 소환 박스 — 일반 4개는 2×2, 신화 소환은 맨 아래 가로 2배 폭.
    const normalBoxes = GACHA_BOXES.filter(b => !b.wide);
    const wideBoxes = GACHA_BOXES.filter(b => b.wide);

    const boxW = w * 0.43;
    const boxH = h * 0.24;
    const colX = [w * 0.275, w * 0.725];
    const rowY = [h * 0.30, h * 0.56];
    normalBoxes.forEach((box, i) => {
      this._summonBox(colX[i % 2], rowY[Math.floor(i / 2)], boxW, boxH, box);
    });
    wideBoxes.forEach((box) => {
      this._wideSummonBox(w / 2, h * 0.80, w * 0.88, h * 0.16, box);
    });

    addNavBar(this, 'shop');
  }

  _summonBox(cx, cy, boxW, boxH, box) {
    const bg = this.add.rectangle(cx, cy, boxW, boxH, 0x1c2740)
      .setStrokeStyle(4, box.accent)
      .setInteractive({ useHandCursor: true });

    // 이모지 대신 등급색 원형 아이콘
    this.add.circle(cx, cy - boxH * 0.29, 24, box.accent).setStrokeStyle(3, 0xffffff, 0.45);
    this.add.text(cx, cy - boxH * 0.04, box.name, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '24px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(cx, cy + boxH * 0.12, `젬 ${box.cost}`, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '22px', color: '#7ee787',
    }).setOrigin(0.5);

    const oddsStr = Object.entries(box.odds)
      .map(([r, p]) => `${RARITIES[r].name} ${Math.round(p * 100)}%`).join('  ');
    this.add.text(cx, cy + boxH * 0.28, oddsStr, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '14px', color: '#8a93a6',
      align: 'center', wordWrap: { width: boxW * 0.9 },
    }).setOrigin(0.5);

    this.add.text(cx, cy + boxH * 0.43, '탭하여 소환', {
      fontFamily: GAME_CONFIG.font.family, fontSize: '16px', color: '#ffd700',
    }).setOrigin(0.5);

    bg.on('pointerup', () => this._pull(box, bg));
  }

  // 신화 소환 — 가로로 긴 특별 박스 (전설 90% / 신화 10%)
  _wideSummonBox(cx, cy, boxW, boxH, box) {
    // 은은한 붉은 글로우
    this.add.rectangle(cx, cy, boxW + 14, boxH + 14, box.accent, 0.14);
    const bg = this.add.rectangle(cx, cy, boxW, boxH, 0x2a1620)
      .setStrokeStyle(5, box.accent)
      .setInteractive({ useHandCursor: true });

    // 좌측 등급 아이콘
    const iconX = cx - boxW * 0.36;
    this.add.circle(iconX, cy, boxH * 0.30, box.accent).setStrokeStyle(3, 0xffffff, 0.5);

    // 중앙: 이름 + 확률
    this.add.text(cx, cy - boxH * 0.20, box.name, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '30px', color: '#ff8a80', fontStyle: 'bold',
    }).setOrigin(0.5);
    const oddsStr = Object.entries(box.odds)
      .map(([r, p]) => `${RARITIES[r].name} ${Math.round(p * 100)}%`).join('    ');
    this.add.text(cx, cy + boxH * 0.18, oddsStr, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '18px', color: '#e0c0c0',
    }).setOrigin(0.5);

    // 우측: 비용 + 탭 안내
    const rX = cx + boxW * 0.36;
    this.add.text(rX, cy - boxH * 0.16, `젬 ${box.cost}`, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '24px', color: '#7ee787', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(rX, cy + boxH * 0.20, '탭하여 소환', {
      fontFamily: GAME_CONFIG.font.family, fontSize: '16px', color: '#ffd700',
    }).setOrigin(0.5);

    bg.on('pointerup', () => this._pull(box, bg));
  }

  _pull(box, bg) {
    if (!HeroStore.spendGems(box.cost)) {
      // 젬 부족 → 흔들기 + 안내
      const ox = bg.x;
      this.tweens.add({ targets: bg, x: ox + 8, duration: 50, yoyo: true, repeat: 3, onComplete: () => { bg.x = ox; } });
      this._flash('젬이 부족해요');
      return;
    }
    const heroId = drawHero(box.id);
    HeroStore.addHero(heroId);
    this._gemsText.setText(`젬 ${HeroStore.getGems()}`);
    this._showResult(heroId);
  }

  _flash(msg) {
    const w = this.scale.width, h = this.scale.height;
    const t = this.add.text(w / 2, h * 0.20, msg, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '28px', color: '#ff6b6b', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(200);
    this.tweens.add({ targets: t, y: h * 0.15, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  // 캡슐 연출: 3번 클릭 → 캡슐이 반으로 쪼개지며 마법사 공개
  _showResult(heroId) {
    const w = this.scale.width, h = this.scale.height;
    const hero = HERO_BY_ID[heroId];
    const rarity = RARITIES[hero.rarity];
    const classConfig = GAME_CONFIG.classes[hero.classId];
    const cx = w / 2, cy = h * 0.46;
    const R = w * 0.20;               // 캡슐 반지름
    const layer = [];

    const dim = this.add.rectangle(0, 0, w, h, 0x000000, 0.78).setOrigin(0).setDepth(300)
      .setInteractive();
    layer.push(dim);

    // 안내 문구
    const guide = this.add.text(cx, h * 0.20, '캡슐을 3번 탭하세요!', {
      fontFamily: GAME_CONFIG.font.family, fontSize: '30px', color: '#ffd700', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(310);
    layer.push(guide);

    // 마법사 피규어(처음엔 캡슐 뒤에 숨겨둠). 전설·신화는 전용 신화 아트로.
    const figure = (drawMythicFigure(this, cx, cy, R * 0.48, hero.classId)
      ?? drawHeroFigure(this, cx, cy, R * 0.62, classConfig)).setDepth(303).setAlpha(0);
    layer.push(figure);

    // 캡슐(두 반쪽) — 위/아래 반원 조각
    const seamColor = 0xffffff;
    const topHalf = this.add.arc(cx, cy, R, 180, 360, false, rarity.color)
      .setStrokeStyle(4, seamColor, 0.8).setDepth(305);
    const bottomHalf = this.add.arc(cx, cy, R, 0, 180, false, 0xf0f0f0)
      .setStrokeStyle(4, seamColor, 0.8).setDepth(305);
    const seam = this.add.rectangle(cx, cy, R * 2, R * 0.10, seamColor, 0.9).setDepth(306);
    const shine = this.add.circle(cx - R * 0.35, cy - R * 0.35, R * 0.18, 0xffffff, 0.35).setDepth(306);
    layer.push(topHalf, bottomHalf, seam, shine);

    const capsuleParts = [topHalf, bottomHalf, seam, shine];
    let clicks = 0;
    let opened = false;

    dim.on('pointerup', () => {
      if (opened) { layer.forEach(o => o.destroy()); return; }
      clicks++;
      if (clicks < 3) {
        // 흔들기 + 균열 느낌 (yoyo로 원위치 복귀)
        this.tweens.add({
          targets: capsuleParts, x: `+=${clicks % 2 === 0 ? -10 : 10}`,
          duration: 55, yoyo: true, repeat: 3,
        });
        this.tweens.add({ targets: capsuleParts, scaleX: 1.08, scaleY: 0.92, duration: 80, yoyo: true });
        return;
      }
      // 3번째 → 쪼개짐
      opened = true;
      guide.setText('');
      this.tweens.add({ targets: [topHalf], y: cy - R * 1.4, alpha: 0, angle: -20, duration: 420, ease: 'Back.in' });
      this.tweens.add({ targets: [bottomHalf], y: cy + R * 1.4, alpha: 0, angle: 20, duration: 420, ease: 'Back.in' });
      this.tweens.add({ targets: [seam, shine], alpha: 0, duration: 200 });

      // 번쩍임
      const flash = this.add.circle(cx, cy, R * 1.4, 0xffffff, 0.9).setDepth(304);
      layer.push(flash);
      this.tweens.add({ targets: flash, alpha: 0, scale: 1.6, duration: 400 });

      // 마법사 등장
      figure.setScale(0.4);
      this.tweens.add({ targets: figure, alpha: 1, scale: 1, duration: 350, ease: 'Back.out', delay: 120 });

      // 등급/이름/닫기 안내
      layer.push(this.add.text(cx, h * 0.20, `${rarity.name} 영웅 획득!`, {
        fontFamily: GAME_CONFIG.font.family, fontSize: '32px', color: rarity.textColor, fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(310).setAlpha(0).setName('resultTitle'));
      layer.push(this.add.text(cx, h * 0.63, hero.name, {
        fontFamily: GAME_CONFIG.font.family, fontSize: '34px', color: '#ffffff', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(310).setAlpha(0));
      layer.push(this.add.text(cx, h * 0.72, '탭하여 닫기', {
        fontFamily: GAME_CONFIG.font.family, fontSize: '22px', color: '#8a93a6',
      }).setOrigin(0.5).setDepth(310).setAlpha(0));
      const reveals = layer.filter(o => o.setAlpha && o.alpha === 0 && o !== figure);
      this.tweens.add({ targets: reveals, alpha: 1, duration: 300, delay: 250 });
    });
  }
}
