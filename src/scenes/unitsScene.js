import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { HEROES, RARITIES, PARTY_SIZE } from '../config/heroConfig.js';
import { HERO_BY_ID } from '../config/heroConfig.js';
import { HeroStore } from '../core/heroStore.js';
import { addNavBar } from '../render/navBar.js';
import { drawHeroFigure, traitText } from '../render/heroFigure.js';
import { drawMythicFigure } from '../render/boardView.js';

export class UnitsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UnitsScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.add.rectangle(0, 0, w, h, 0x0f1419).setOrigin(0);

    this.add.text(w / 2, h * 0.045, '영웅', {
      fontFamily: GAME_CONFIG.font.family, fontSize: '44px', color: '#ffd700',
    }).setOrigin(0.5);

    // 관리자: 전체 해금 버튼
    const admin = this.add.rectangle(w * 0.85, h * 0.045, w * 0.24, h * 0.038, 0x7a1f1f)
      .setStrokeStyle(2, 0xff6b6b).setInteractive({ useHandCursor: true });
    this.add.text(w * 0.85, h * 0.045, '전체 해금', {
      fontFamily: GAME_CONFIG.font.family, fontSize: '20px', color: '#ffdede',
    }).setOrigin(0.5);
    admin.on('pointerup', () => { HeroStore.unlockAll(); this.scene.restart(); });

    // ── 내 파티 (5 슬롯) ──
    this.add.text(w / 2, h * 0.10, `내 파티 (${HeroStore.getParty().length}/${PARTY_SIZE})`, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5);

    const party = HeroStore.getParty();
    const slotW = w * 0.165;
    const slotGap = w * 0.02;
    const totalW = PARTY_SIZE * slotW + (PARTY_SIZE - 1) * slotGap;
    const startX = (w - totalW) / 2 + slotW / 2;
    const slotY = h * 0.17;
    for (let i = 0; i < PARTY_SIZE; i++) {
      const cx = startX + i * (slotW + slotGap);
      const heroId = party[i];
      const bg = this.add.rectangle(cx, slotY, slotW, slotW, heroId ? 0x2a3a5a : 0x1a2233)
        .setStrokeStyle(3, heroId ? RARITIES[HERO_BY_ID[heroId].rarity].color : 0x3a4a6a);
      if (heroId) {
        const hero = HERO_BY_ID[heroId];
        this.add.circle(cx, slotY - slotW * 0.06, slotW * 0.24, RARITIES[hero.rarity].color)
          .setStrokeStyle(2, 0xffffff, 0.4);
        this.add.text(cx, slotY + slotW * 0.32, hero.name, {
          fontFamily: GAME_CONFIG.font.family, fontSize: '18px', color: '#ffffff',
        }).setOrigin(0.5);
        bg.setInteractive({ useHandCursor: true })
          .on('pointerup', () => { HeroStore.removeFromParty(heroId); this.scene.restart(); });
      } else {
        this.add.text(cx, slotY, '+', {
          fontFamily: GAME_CONFIG.font.family, fontSize: '40px', color: '#3a4a6a',
        }).setOrigin(0.5);
      }
    }

    // ── 보유/미보유 영웅 도감 ──
    this.add.text(w * 0.06, h * 0.255, '영웅 도감', {
      fontFamily: GAME_CONFIG.font.family, fontSize: '24px', color: '#ffffff',
    }).setOrigin(0, 0.5);
    this.add.text(w * 0.94, h * 0.255, '탭해서 파티에 넣기', {
      fontFamily: GAME_CONFIG.font.family, fontSize: '18px', color: '#8a93a6',
    }).setOrigin(1, 0.5);

    const cols = 4;
    const gridTop = h * 0.30;
    const gridBottom = h * 0.885; // 하단 탭 위
    const cardW = w * 0.216;
    const cardH = (gridBottom - gridTop) / Math.ceil(HEROES.length / cols) - 10;
    const colGap = (w - cols * cardW) / (cols + 1);
    HEROES.forEach((hero, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = colGap + cardW / 2 + col * (cardW + colGap);
      const cy = gridTop + cardH / 2 + row * (cardH + 10);
      this._heroCard(cx, cy, cardW, cardH, hero);
    });

    addNavBar(this, 'units');
  }

  _heroCard(cx, cy, cardW, cardH, hero) {
    const owned = HeroStore.getOwnedCount(hero.id);
    const inParty = HeroStore.isInParty(hero.id);
    const rarity = RARITIES[hero.rarity];

    const bg = this.add.rectangle(cx, cy, cardW, cardH, owned ? 0x222c40 : 0x161d2b)
      .setStrokeStyle(inParty ? 5 : 3, owned ? rarity.color : 0x2a3446);

    if (owned) {
      this.add.circle(cx, cy - cardH * 0.16, cardW * 0.17, rarity.color).setStrokeStyle(2, 0xffffff, 0.35);
      this.add.text(cx, cy + cardH * 0.18, hero.name, {
        fontFamily: GAME_CONFIG.font.family, fontSize: '19px', color: rarity.textColor,
      }).setOrigin(0.5);
      this.add.text(cx, cy + cardH * 0.36, owned > 1 ? `보유 ${owned}` : rarity.name, {
        fontFamily: GAME_CONFIG.font.family, fontSize: '15px', color: '#9aa3b5',
      }).setOrigin(0.5);
      if (inParty) {
        this.add.text(cx, cy - cardH * 0.40, '파티', {
          fontFamily: GAME_CONFIG.font.family, fontSize: '16px', color: '#2ecc71', fontStyle: 'bold',
        }).setOrigin(0.5);
      }
      bg.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        this._showPreview(hero);
      });
    } else {
      // 미보유: 실루엣
      this.add.circle(cx, cy - cardH * 0.10, cardW * 0.15, 0x2a3446);
      this.add.text(cx, cy - cardH * 0.10, '?', {
        fontFamily: GAME_CONFIG.font.family, fontSize: '36px', color: '#4a5468', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.add.text(cx, cy + cardH * 0.30, '미보유', {
        fontFamily: GAME_CONFIG.font.family, fontSize: '15px', color: '#4a5468',
      }).setOrigin(0.5);
    }
  }

  // 영웅 미리보기 네모 칸: 공격력·특성 표시 후 [장착]/[해제] 버튼으로 확정
  _showPreview(hero) {
    const w = this.scale.width, h = this.scale.height;
    const rarity = RARITIES[hero.rarity];
    const cfg = GAME_CONFIG.classes[hero.classId];
    const layer = [];
    const close = () => layer.forEach(o => o.destroy());

    // 바깥 탭 → 닫기
    const dim = this.add.rectangle(0, 0, w, h, 0x000000, 0.72).setOrigin(0).setDepth(400)
      .setInteractive();
    dim.on('pointerup', close);
    layer.push(dim);

    // 미리보기 네모 칸
    const boxW = w * 0.72, boxH = h * 0.46;
    const bx = w / 2, by = h * 0.46;
    const box = this.add.rectangle(bx, by, boxW, boxH, 0x1a2438)
      .setStrokeStyle(5, rarity.color).setDepth(401)
      .setInteractive(); // 박스 내부 탭은 닫힘 방지
    layer.push(box);

    const top = by - boxH / 2;

    // 마법사 피규어: 신화 아트가 있으면 그걸, 없으면 기본 도형
    const figY = top + boxH * 0.24;
    const mythic = drawMythicFigure(this, bx, figY, boxW * 0.10, hero.classId);
    layer.push((mythic ?? drawHeroFigure(this, bx, figY, boxW * 0.13, cfg)).setDepth(402));

    // 이름 + 등급
    layer.push(this.add.text(bx, top + boxH * 0.44, hero.name, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '30px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(402));
    layer.push(this.add.text(bx, top + boxH * 0.55, rarity.name, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '18px', color: rarity.textColor,
    }).setOrigin(0.5).setDepth(402));

    // 스탯: 공격력 / 공격속도 / 특성
    const statY = top + boxH * 0.66;
    layer.push(this.add.text(bx, statY, `공격력  ${cfg.damage}     공격속도  ${cfg.atkPerSec}/초`, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '20px', color: '#ffd77a',
    }).setOrigin(0.5).setDepth(402));
    layer.push(this.add.text(bx, statY + boxH * 0.09, `특성 · ${traitText(cfg)}`, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '19px', color: '#9fd0ff',
      align: 'center', wordWrap: { width: boxW * 0.88 },
    }).setOrigin(0.5).setDepth(402));

    // 장착/해제 버튼
    const inParty = HeroStore.isInParty(hero.id);
    const partyFull = HeroStore.getParty().length >= PARTY_SIZE;
    const canEquip = inParty || !partyFull;
    const btnColor = inParty ? 0x7a1f1f : (canEquip ? 0x1f7a3a : 0x333b4a);
    const btnLabel = inParty ? '해제' : (canEquip ? '장착' : '파티 가득 참');
    const btnY = by + boxH / 2 + h * 0.05;
    const btn = this.add.rectangle(bx, btnY, boxW * 0.5, h * 0.06, btnColor)
      .setStrokeStyle(3, 0xffffff, 0.4).setDepth(402);
    layer.push(btn);
    layer.push(this.add.text(bx, btnY, btnLabel, {
      fontFamily: GAME_CONFIG.font.family, fontSize: '24px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(403));

    if (inParty || canEquip) {
      btn.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        HeroStore.toggleParty(hero.id);
        close();
        this.scene.restart();
      });
    }
  }
}
