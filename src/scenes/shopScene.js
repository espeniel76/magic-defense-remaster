import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { GACHA_BOXES, RARITIES, HERO_BY_ID } from '../config/heroConfig.js';
import { HeroStore } from '../core/heroStore.js';
import { drawHero } from '../core/gacha.js';
import { addNavBar } from '../render/navBar.js';

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

    // 소환 박스 2×2
    const boxW = w * 0.43;
    const boxH = h * 0.30;
    const colX = [w * 0.275, w * 0.725];
    const rowY = [h * 0.35, h * 0.68];
    GACHA_BOXES.forEach((box, i) => {
      this._summonBox(colX[i % 2], rowY[Math.floor(i / 2)], boxW, boxH, box);
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

  _showResult(heroId) {
    const w = this.scale.width, h = this.scale.height;
    const hero = HERO_BY_ID[heroId];
    const rarity = RARITIES[hero.rarity];
    const layer = [];

    const dim = this.add.rectangle(0, 0, w, h, 0x000000, 0.72).setOrigin(0).setDepth(300)
      .setInteractive();
    layer.push(dim);

    layer.push(this.add.text(w / 2, h * 0.30, `${rarity.name} 영웅 획득!`, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '32px', color: rarity.textColor, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(301));

    const card = this.add.rectangle(w / 2, h * 0.50, w * 0.5, h * 0.26, 0x222c40)
      .setStrokeStyle(6, rarity.color).setDepth(301);
    layer.push(card);
    layer.push(this.add.circle(w / 2, h * 0.47, 54, rarity.color).setStrokeStyle(5, 0xffffff, 0.6).setDepth(302));
    layer.push(this.add.text(w / 2, h * 0.575, hero.name, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '34px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(302));

    layer.push(this.add.text(w / 2, h * 0.68, '탭하여 닫기', {
      fontFamily: GAME_CONFIG.font.family, fontSize: '22px', color: '#8a93a6',
    }).setOrigin(0.5).setDepth(301));

    dim.on('pointerup', () => layer.forEach(o => o.destroy()));
  }
}
