import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

function hexToInt(hex) {
  return parseInt(hex.replace('#', ''), 16);
}

function fillCubicBezierShape(g, segments) {
  g.beginPath();
  let first = true;
  for (const seg of segments) {
    const [p0x, p0y, c1x, c1y, c2x, c2y, p1x, p1y] = seg;
    if (first) {
      g.moveTo(p0x, p0y);
      first = false;
    }
    const curve = new Phaser.Curves.CubicBezier(
      new Phaser.Math.Vector2(p0x, p0y),
      new Phaser.Math.Vector2(c1x, c1y),
      new Phaser.Math.Vector2(c2x, c2y),
      new Phaser.Math.Vector2(p1x, p1y),
    );
    const points = curve.getPoints(16);
    for (const pt of points) g.lineTo(pt.x, pt.y);
  }
  g.closePath();
  g.fillPath();
}

export function buildEnemyDisplaySprite(scene, typeId, wave = 1) {
  const cfg = GAME_CONFIG.enemies[typeId];
  if (!cfg) throw new Error(`Unknown enemy type: ${typeId}`);
  const color = hexToInt(cfg.color);
  const isBoss = typeId === 'BOSS';
  const isElite = typeId === 'ELITE';
  const isTitan = typeId === 'TITAN';
  const isLateWave = wave >= 16;
  const r = isBoss ? 50 : (isTitan ? 70 : (isElite ? 40 : 30));

  const container = scene.add.container(0, 0);
  const horns = scene.add.graphics();
  horns.fillStyle(color, 1);

  if (isBoss || isLateWave) {
    // left horn: two cubic-bezier segments forming the outer + inner curve
    fillCubicBezierShape(horns, [
      [-r * 0.55, -r * 0.55, -r * 0.95, -r * 1.0, -r * 0.6, -r * 1.6, -r * 0.2, -r * 1.9],
      [-r * 0.2,  -r * 1.9,  -r * 0.05, -r * 1.5, -r * 0.2, -r * 1.0, -r * 0.15, -r * 0.55],
    ]);
    // right horn (mirror)
    fillCubicBezierShape(horns, [
      [r * 0.55, -r * 0.55, r * 0.95, -r * 1.0, r * 0.6, -r * 1.6, r * 0.2, -r * 1.9],
      [r * 0.2,  -r * 1.9,  r * 0.05, -r * 1.5, r * 0.2, -r * 1.0, r * 0.15, -r * 0.55],
    ]);
    if (isBoss) {
      // center crown spike
      fillCubicBezierShape(horns, [
        [-r * 0.2, -r * 0.55, -r * 0.35, -r * 1.4, -r * 0.1, -r * 2.0, 0,       -r * 2.2],
        [0,        -r * 2.2,  r * 0.1,   -r * 2.0, r * 0.35, -r * 1.4, r * 0.2, -r * 0.55],
      ]);
    }
  } else {
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

  const body = scene.add.circle(0, 0, r, color);
  body.setStrokeStyle(isBoss ? 3 : 2, 0x000000);

  const eyeR = r * 0.30;
  const eyeY = r * 0.05;
  const eyeOffsetX = r * 0.40;
  const eyeL = scene.add.circle(-eyeOffsetX, eyeY, eyeR, 0xffffff);
  const eyeRight = scene.add.circle(eyeOffsetX, eyeY, eyeR, 0xffffff);

  container.add([horns, body, eyeL, eyeRight]);

  if (isElite) body.setStrokeStyle(3, 0xffffff);
  if (isTitan) body.setStrokeStyle(4, 0xffffff);

  return { container, radius: r };
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
    const { container, radius: r } = buildEnemyDisplaySprite(this.scene, enemy.typeId, enemy.wave);

    // HP bar (under horns, above body)
    const isBoss = enemy.typeId === 'BOSS';
    const barW = isBoss ? 80 : 40;
    const barH = isBoss ? 6 : 4;
    const barY = isBoss ? -r * 2.5 : -r * 1.7;
    const hpBarBg = this.scene.add.rectangle(0, barY, barW, barH, 0x000000)
      .setStrokeStyle(1, 0xffffff);
    const hpBarFg = this.scene.add.rectangle(-barW / 2, barY, barW, barH, 0x2ecc71)
      .setOrigin(0, 0.5);
    container.add([hpBarBg, hpBarFg]);
    container._hpBarFg = hpBarFg;
    container._hpBarMaxW = barW;

    const isElite = enemy.typeId === 'ELITE';
    const isTitan = enemy.typeId === 'TITAN';
    const isLateWave = enemy.wave >= 16;
    if (isLateWave && !isBoss && !isElite && !isTitan) {
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
