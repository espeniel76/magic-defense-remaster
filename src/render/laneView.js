import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class LaneView {
  constructor(scene, x, y, width, height, lane) {
    this.scene = scene;
    this.lane = lane;
    this.area = { x, y, width, height };
    this.laneCount = lane.laneCount;
    this.laneWidth = width / this.laneCount;
    this.enemySprites = new Map(); // enemy -> Phaser.Text

    // Draw lane backgrounds
    for (let i = 0; i < this.laneCount; i++) {
      const lx = x + i * this.laneWidth;
      scene.add.rectangle(lx + this.laneWidth / 2, y + height / 2, this.laneWidth - 4, height, 0x4a2e1a)
        .setStrokeStyle(2, 0x6a4828);
    }
  }

  // Convert (lane, position 0..1) to world (x, y)
  laneToWorld(laneIdx, position) {
    const x = this.area.x + laneIdx * this.laneWidth + this.laneWidth / 2;
    const y = this.area.y + position * this.area.height;
    return { x, y };
  }

  refresh() {
    const aliveEnemies = new Set(this.lane.allEnemies());
    // Remove sprites for dead/gone enemies
    for (const [enemy, sprite] of this.enemySprites) {
      if (!aliveEnemies.has(enemy)) {
        sprite.destroy();
        this.enemySprites.delete(enemy);
      }
    }
    // Update or create sprites for alive enemies
    for (const enemy of aliveEnemies) {
      const { x, y } = this.laneToWorld(enemy.lane, enemy.position);
      let sprite = this.enemySprites.get(enemy);
      if (!sprite) {
        sprite = this.scene.add.text(x, y, enemy.config.emoji, {
          fontSize: '36px',
        }).setOrigin(0.5);
        this.enemySprites.set(enemy, sprite);
      } else {
        sprite.x = x;
        sprite.y = y;
      }
      // HP bar (simple) — alpha indicates health
      sprite.setAlpha(enemy.hp / enemy.maxHp * 0.6 + 0.4);
    }
  }
}
