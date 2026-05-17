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
    this.enemySprites = new Map();
    this.laneBackgrounds = [];

    const initialColor = GAME_CONFIG.zones[0].color;
    for (let i = 0; i < this.laneCount; i++) {
      const lx = x + i * this.laneWidth;
      const rect = scene.add.rectangle(
        lx + this.laneWidth / 2,
        y + height / 2,
        this.laneWidth - 4,
        height,
        initialColor,
      ).setStrokeStyle(2, 0x000000);
      this.laneBackgrounds.push(rect);
    }
  }

  setBackgroundColor(color) {
    for (const rect of this.laneBackgrounds) {
      rect.fillColor = color;
    }
  }

  laneToWorld(laneIdx, position) {
    const x = this.area.x + laneIdx * this.laneWidth + this.laneWidth / 2;
    const y = this.area.y + position * this.area.height;
    return { x, y };
  }

  _buildEnemySprite(enemy) {
    const color = hexToInt(enemy.config.color ?? '#888888');
    const isBoss = enemy.typeId === 'BOSS';
    const isLateWave = enemy.wave >= 16;
    const r = isBoss ? 50 : 30;

    const container = this.scene.add.container(0, 0);

    const horns = this.scene.add.graphics();
    horns.fillStyle(color, 1);

    if (isBoss || isLateWave) {
      // Flame-like horns (curved)
      // Left flame
      horns.beginPath();
      horns.moveTo(-r * 0.55, -r * 0.55);
      horns.bezierCurveTo(-r * 0.95, -r * 1.0, -r * 0.6, -r * 1.6, -r * 0.2, -r * 1.9);
      horns.bezierCurveTo(-r * 0.05, -r * 1.5, -r * 0.2, -r * 1.0, -r * 0.15, -r * 0.55);
      horns.closePath();
      horns.fillPath();
      // Right flame
      horns.beginPath();
      horns.moveTo(r * 0.55, -r * 0.55);
      horns.bezierCurveTo(r * 0.95, -r * 1.0, r * 0.6, -r * 1.6, r * 0.2, -r * 1.9);
      horns.bezierCurveTo(r * 0.05, -r * 1.5, r * 0.2, -r * 1.0, r * 0.15, -r * 0.55);
      horns.closePath();
      horns.fillPath();
      if (isBoss) {
        // Center flame (third spike)
        horns.beginPath();
        horns.moveTo(-r * 0.2, -r * 0.55);
        horns.bezierCurveTo(-r * 0.35, -r * 1.4, -r * 0.1, -r * 2.0, 0, -r * 2.2);
        horns.bezierCurveTo(r * 0.1, -r * 2.0, r * 0.35, -r * 1.4, r * 0.2, -r * 0.55);
        horns.closePath();
        horns.fillPath();
      }
    } else {
      // Standard pointed horns
      horns.beginPath();
      horns.moveTo(-r * 0.45, -r * 1.4);
      horns.lineTo(-r * 0.75, -r * 0.6);
      horns.lineTo(-r * 0.15, -r * 0.6);
      horns.closePath();
      horns.fillPath();
      horns.beginPath();
      horns.moveTo(r * 0.45, -r * 1.4);
      horns.lineTo(r * 0.15, -r * 0.6);
      horns.lineTo(r * 0.75, -r * 0.6);
      horns.closePath();
      horns.fillPath();
    }

    // Body
    const body = this.scene.add.circle(0, 0, r, color);
    body.setStrokeStyle(isBoss ? 3 : 2, 0x000000);

    // Eyes
    const eyeRsize = r * 0.30;
    const eyeY = r * 0.05;
    const eyeOffsetX = r * 0.40;
    const eyeL = this.scene.add.circle(-eyeOffsetX, eyeY, eyeRsize, 0xffffff);
    const eyeRight = this.scene.add.circle(eyeOffsetX, eyeY, eyeRsize, 0xffffff);

    // HP bar (under horns, above body)
    const barW = isBoss ? 80 : 40;
    const barH = isBoss ? 6 : 4;
    const barY = isBoss ? -r * 2.5 : -r * 1.7;
    const hpBarBg = this.scene.add.rectangle(0, barY, barW, barH, 0x000000)
      .setStrokeStyle(1, 0xffffff);
    const hpBarFg = this.scene.add.rectangle(-barW / 2, barY, barW, barH, 0x2ecc71)
      .setOrigin(0, 0.5);

    container.add([horns, body, eyeL, eyeRight, hpBarBg, hpBarFg]);

    // Stash HP bar refs for refresh updates
    container._hpBarFg = hpBarFg;
    container._hpBarMaxW = barW;

    if (isLateWave && !isBoss) {
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
      // Body alpha based on HP (slight visual cue)
      sprite.setAlpha(enemy.hp / enemy.maxHp * 0.4 + 0.6);
      // HP bar update
      if (sprite._hpBarFg) {
        const ratio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
        sprite._hpBarFg.width = sprite._hpBarMaxW * ratio;
        // Color shift: green > yellow > red
        let barColor;
        if (ratio > 0.6) barColor = 0x2ecc71;       // green
        else if (ratio > 0.3) barColor = 0xf1c40f;  // yellow
        else barColor = 0xe74c3c;                    // red
        sprite._hpBarFg.fillColor = barColor;
      }
    }
  }
}
