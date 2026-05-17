import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { buildEnemyDisplaySprite } from '../render/laneView.js';

const MONSTERS = [
  { id: 'GOBLIN',   appears: '모든 모드 등장' },
  { id: 'SKELETON', appears: '웨이브 5+ (모든 모드)' },
  { id: 'ELITE',    appears: '어려움 / 지옥 모드' },
  { id: 'TITAN',    appears: '지옥 모드 전용' },
  { id: 'BOSS',     appears: '10 웨이브마다 등장' },
];

export class MonsterCodexScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MonsterCodexScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.cameras.main.setBackgroundColor('#0f1419');

    this.add.text(w / 2, 80, '몬스터 도감', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);

    const startY = 180;
    const rowH = 200;
    const spriteX = 130;
    const textX = 250;

    for (let i = 0; i < MONSTERS.length; i++) {
      const m = MONSTERS[i];
      const cfg = GAME_CONFIG.enemies[m.id];
      const rowY = startY + i * rowH;
      const centerY = rowY + rowH / 2;

      // Sprite — scaled down so the largest monsters fit the row
      const { container, radius } = buildEnemyDisplaySprite(this, m.id, 1);
      container.x = spriteX;
      container.y = centerY + radius * 0.25; // body sits a bit lower so horns fit
      const targetH = rowH * 0.7;
      const naturalH = radius * 3.2; // horns + body
      const scale = Math.min(1, targetH / naturalH);
      container.setScale(scale);

      // Name
      this.add.text(textX, rowY + 30, cfg.displayName, {
        fontFamily: GAME_CONFIG.font.family,
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#ffffff',
      }).setOrigin(0, 0);

      // Stats line
      this.add.text(textX, rowY + 80, `HP ${cfg.hp} · 속도 ${cfg.speed} · 데미지 ${cfg.baseDamage}`, {
        fontFamily: GAME_CONFIG.font.family,
        fontSize: '22px',
        color: '#bdc3c7',
      }).setOrigin(0, 0);

      // Appears
      this.add.text(textX, rowY + 120, m.appears, {
        fontFamily: GAME_CONFIG.font.family,
        fontSize: '22px',
        color: '#7fbcff',
      }).setOrigin(0, 0);

      // Divider line under each row
      this.add.rectangle(w / 2, rowY + rowH - 4, w - 80, 1, 0x2a3548);
    }

    // Back button
    const btn = this.add.rectangle(w / 2, h - 90, 280, 90, 0x3d6dba).setInteractive();
    this.add.text(w / 2, h - 90, '돌아가기', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '34px',
      color: '#ffffff',
    }).setOrigin(0.5);
    btn.on('pointerup', () => this.scene.start('TitleScene'));
  }
}
