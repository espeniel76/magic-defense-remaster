import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

function hexToInt(hex) {
  return parseInt(hex.replace('#', ''), 16);
}

export class LaneView {
  constructor(scene, x, y, width, height, lane) {
    this.scene = scene;
    this.lane = lane;
    this.area = { x, y, width, height };
    this.laneCount = lane.laneCount;
    this.laneWidth = width / this.laneCount;
    this.enemySprites = new Map(); // enemy -> Phaser.Container

    for (let i = 0; i < this.laneCount; i++) {
      const lx = x + i * this.laneWidth;
      scene.add.rectangle(lx + this.laneWidth / 2, y + height / 2, this.laneWidth - 4, height, 0x4a2e1a)
        .setStrokeStyle(2, 0x6a4828);
    }
  }

  laneToWorld(laneIdx, position) {
    const x = this.area.x + laneIdx * this.laneWidth + this.laneWidth / 2;
    const y = this.area.y + position * this.area.height;
    return { x, y };
  }

  _buildEnemySprite(enemy) {
    const color = hexToInt(enemy.config.color ?? '#888888');
    const r = 16; // body radius

    const container = this.scene.add.container(0, 0);
    const body = this.scene.add.circle(0, 0, r, color);
    body.setStrokeStyle(2, 0x000000);

    // Two ear triangles
    const earBase = r * 0.6;
    const earHeight = r * 0.8;
    const earY = -r * 0.9;
    const earOffsetX = r * 0.55;
    const earL = this.scene.add.triangle(
      -earOffsetX, 0,
      0, -earHeight,
      -earBase / 2, 0,
      earBase / 2, 0,
      color
    );
    earL.y = earY;
    const earR = this.scene.add.triangle(
      earOffsetX, 0,
      0, -earHeight,
      -earBase / 2, 0,
      earBase / 2, 0,
      color
    );
    earR.y = earY;

    // Two eyes
    const eyeR = r * 0.22;
    const eyeY = r * 0.1;
    const eyeOffsetX = r * 0.4;
    const eyeL = this.scene.add.circle(-eyeOffsetX, eyeY, eyeR, 0xffffff);
    const eyeRight = this.scene.add.circle(eyeOffsetX, eyeY, eyeR, 0xffffff);

    container.add([earL, earR, body, eyeL, eyeRight]);
    return container;
  }

  refresh() {
    const aliveEnemies = new Set(this.lane.allEnemies());
    for (const [enemy, sprite] of this.enemySprites) {
      if (!aliveEnemies.has(enemy)) {
        sprite.destroy();
        this.enemySprites.delete(enemy);
      }
    }
    for (const enemy of aliveEnemies) {
      const { x, y } = this.laneToWorld(enemy.lane, enemy.position);
      let sprite = this.enemySprites.get(enemy);
      if (!sprite) {
        sprite = this._buildEnemySprite(enemy);
        this.enemySprites.set(enemy, sprite);
      }
      sprite.x = x;
      sprite.y = y;
      sprite.setAlpha(enemy.hp / enemy.maxHp * 0.6 + 0.4);
    }
  }
}
