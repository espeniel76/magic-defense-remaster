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
    const r = 30; // body radius (was 24)
    const isLateWave = enemy.wave >= 16;

    const container = this.scene.add.container(0, 0);

    const horns = this.scene.add.graphics();
    horns.fillStyle(color, 1);

    if (isLateWave) {
      // Flame-like horns (curved teardrop). Two flames, one per side.
      // Left flame
      horns.beginPath();
      horns.moveTo(-r * 0.55, -r * 0.55);
      horns.bezierCurveTo(
        -r * 0.95, -r * 1.0,
        -r * 0.6, -r * 1.6,
        -r * 0.2, -r * 1.9
      );
      horns.bezierCurveTo(
        -r * 0.05, -r * 1.5,
        -r * 0.2, -r * 1.0,
        -r * 0.15, -r * 0.55
      );
      horns.closePath();
      horns.fillPath();
      // Right flame (mirror)
      horns.beginPath();
      horns.moveTo(r * 0.55, -r * 0.55);
      horns.bezierCurveTo(
        r * 0.95, -r * 1.0,
        r * 0.6, -r * 1.6,
        r * 0.2, -r * 1.9
      );
      horns.bezierCurveTo(
        r * 0.05, -r * 1.5,
        r * 0.2, -r * 1.0,
        r * 0.15, -r * 0.55
      );
      horns.closePath();
      horns.fillPath();
    } else {
      // Standard pointed horns (straight triangles)
      // Left horn
      horns.beginPath();
      horns.moveTo(-r * 0.45, -r * 1.4);
      horns.lineTo(-r * 0.75, -r * 0.6);
      horns.lineTo(-r * 0.15, -r * 0.6);
      horns.closePath();
      horns.fillPath();
      // Right horn
      horns.beginPath();
      horns.moveTo(r * 0.45, -r * 1.4);
      horns.lineTo(r * 0.15, -r * 0.6);
      horns.lineTo(r * 0.75, -r * 0.6);
      horns.closePath();
      horns.fillPath();
    }

    // Body
    const body = this.scene.add.circle(0, 0, r, color);
    body.setStrokeStyle(2, 0x000000);

    // Eyes — bigger (was 0.22, now 0.30)
    const eyeR = r * 0.30;
    const eyeY = r * 0.05;
    const eyeOffsetX = r * 0.40;
    const eyeL = this.scene.add.circle(-eyeOffsetX, eyeY, eyeR, 0xffffff);
    const eyeRight = this.scene.add.circle(eyeOffsetX, eyeY, eyeR, 0xffffff);

    container.add([horns, body, eyeL, eyeRight]);

    if (isLateWave) {
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
