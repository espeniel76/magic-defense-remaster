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
    const r = 24; // body radius (was 16)

    const container = this.scene.add.container(0, 0);

    // Horns drawn with Graphics — precise absolute coords
    const horns = this.scene.add.graphics();
    horns.fillStyle(color, 1);
    // Left horn
    horns.beginPath();
    horns.moveTo(-r * 0.45, -r * 1.4);   // tip
    horns.lineTo(-r * 0.75, -r * 0.6);   // bottom-left
    horns.lineTo(-r * 0.15, -r * 0.6);   // bottom-right
    horns.closePath();
    horns.fillPath();
    // Right horn
    horns.beginPath();
    horns.moveTo(r * 0.45, -r * 1.4);    // tip
    horns.lineTo(r * 0.15, -r * 0.6);    // bottom-left
    horns.lineTo(r * 0.75, -r * 0.6);    // bottom-right
    horns.closePath();
    horns.fillPath();

    // Body
    const body = this.scene.add.circle(0, 0, r, color);
    body.setStrokeStyle(2, 0x000000);

    // Eyes
    const eyeR = r * 0.22;
    const eyeY = r * 0.1;
    const eyeOffsetX = r * 0.4;
    const eyeL = this.scene.add.circle(-eyeOffsetX, eyeY, eyeR, 0xffffff);
    const eyeRight = this.scene.add.circle(eyeOffsetX, eyeY, eyeR, 0xffffff);

    container.add([horns, body, eyeL, eyeRight]);

    // Enemies in late waves are larger and more menacing
    if (enemy.wave >= 16) {
      container.setScale(1.4);
    }
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
