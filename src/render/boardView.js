import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

const MAGE_LABELS = { FIRE: '불', ICE: '얼음', LIGHTNING: '전기', EARTH: '땅', POISON: '독', WIND: '바람' };

function hexToInt(hex) {
  return parseInt(hex.replace('#', ''), 16);
}

function drawFilledStar(g, cx, cy, outerR, innerR, color, points = 5) {
  g.fillStyle(color, 1);
  g.beginPath();
  const total = points * 2;
  for (let i = 0; i < total; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.fillPath();
}

function drawDiamond(g, cx, cy, w, h, color) {
  g.fillStyle(color, 1);
  g.beginPath();
  g.moveTo(cx, cy - h / 2);
  g.lineTo(cx + w / 2, cy);
  g.lineTo(cx, cy + h / 2);
  g.lineTo(cx - w / 2, cy);
  g.closePath();
  g.fillPath();
}

function drawDownTriangle(g, cx, cy, w, h, color) {
  g.fillStyle(color, 1);
  g.beginPath();
  g.moveTo(cx - w / 2, cy);
  g.lineTo(cx + w / 2, cy);
  g.lineTo(cx, cy + h);
  g.closePath();
  g.fillPath();
}

function drawHexagon(g, cx, cy, r, color) {
  g.fillStyle(color, 1);
  g.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.fillPath();
}

function drawInvertedTrapezoid(g, cx, cy, topW, bottomW, h, color) {
  g.fillStyle(color, 1);
  g.beginPath();
  g.moveTo(cx - topW / 2, cy - h / 2);
  g.lineTo(cx + topW / 2, cy - h / 2);
  g.lineTo(cx + bottomW / 2, cy + h / 2);
  g.lineTo(cx - bottomW / 2, cy + h / 2);
  g.closePath();
  g.fillPath();
}

function drawWindCurl(g, cx, cy, r, thickness, color) {
  g.lineStyle(thickness, color, 1);
  // Outer arc (270 degrees of a curl)
  g.beginPath();
  const segments = 24;
  const startAngle = -Math.PI / 2;
  const endAngle = Math.PI;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = startAngle + (endAngle - startAngle) * t;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.strokePath();
}

function buildMythicWind(scene, size) {
  const BODY = 0xe0e0e0;
  const HAT  = 0xa8a8a8;
  const BAND = 0x88b4d6;
  const ACCENT = 0xffffff;
  const CURL = 0xb8d8ee;

  const container = scene.add.container(0, 0);

  // Floating wind curls around the body
  const curls = scene.add.graphics();
  drawWindCurl(curls, -size * 1.30, -size * 0.40, size * 0.30, size * 0.10, CURL);
  drawWindCurl(curls,  size * 1.30, -size * 0.20, size * 0.28, size * 0.10, CURL);
  drawWindCurl(curls,  0,            size * 1.25, size * 0.32, size * 0.10, CURL);

  // Body
  const body = scene.add.circle(0, size * 0.15, size, BODY);

  // Hat triangle
  const hat = scene.add.graphics();
  hat.fillStyle(HAT, 1);
  hat.beginPath();
  hat.moveTo(0, -size * 1.55);
  hat.lineTo(-size * 0.55, -size * 0.55);
  hat.lineTo( size * 0.55, -size * 0.55);
  hat.closePath();
  hat.fillPath();

  // Swirl ornament on hat face
  const hatSwirl = scene.add.graphics();
  drawWindCurl(hatSwirl, 0, -size * 0.95, size * 0.18, size * 0.08, ACCENT);

  // Hat band
  const band = scene.add.rectangle(0, -size * 0.45, size * 1.40, size * 0.22, BAND);

  // Forehead swirl
  const foreheadSwirl = scene.add.graphics();
  drawWindCurl(foreheadSwirl, 0, -size * 0.22, size * 0.12, size * 0.06, BAND);

  // Eyes
  const eyeL = scene.add.circle(-size * 0.36, size * 0.10, size * 0.24, 0xffffff);
  const eyeR = scene.add.circle( size * 0.36, size * 0.10, size * 0.24, 0xffffff);

  container.add([curls, body, hat, hatSwirl, band, foreheadSwirl, eyeL, eyeR]);
  return container;
}

function buildMythicPoison(scene, size) {
  const BODY = 0x7b5de2;
  const HAT  = 0xd597e8;
  const DEEP = 0x5238d6;
  const ORB  = 0xf9b742;
  const LINE = 0x222222;

  const container = scene.add.container(0, 0);

  // Floating orbs with thin black bar (left + right of body)
  const orbL = scene.add.circle(-size * 1.30, size * 0.20, size * 0.30, ORB);
  const barL = scene.add.rectangle(-size * 1.30, size * 0.20, size * 0.06, size * 0.55, LINE);
  const orbR = scene.add.circle( size * 1.40, -size * 0.50, size * 0.30, ORB);
  const barR = scene.add.rectangle( size * 1.40, -size * 0.50, size * 0.06, size * 0.55, LINE);

  // Body
  const body = scene.add.circle(0, size * 0.15, size, BODY);

  // Hat
  const hat = scene.add.graphics();
  hat.fillStyle(HAT, 1);
  hat.beginPath();
  hat.moveTo(0, -size * 1.55);
  hat.lineTo(-size * 0.55, -size * 0.55);
  hat.lineTo( size * 0.55, -size * 0.55);
  hat.closePath();
  hat.fillPath();

  // Small inverted trapezoid on hat face
  const hatTrap = scene.add.graphics();
  drawInvertedTrapezoid(hatTrap, 0, -size * 0.82, size * 0.28, size * 0.18, size * 0.20, DEEP);

  // Hat band
  const band = scene.add.rectangle(0, -size * 0.45, size * 1.45, size * 0.24, DEEP);

  // Forehead trapezoid between eyes
  const foreheadTrap = scene.add.graphics();
  drawInvertedTrapezoid(foreheadTrap, 0, -size * 0.20, size * 0.26, size * 0.16, size * 0.18, DEEP);

  // Eyes
  const eyeL = scene.add.circle(-size * 0.36, size * 0.15, size * 0.24, 0xffffff);
  const eyeR = scene.add.circle( size * 0.36, size * 0.15, size * 0.24, 0xffffff);

  container.add([orbL, barL, orbR, barR, body, hat, hatTrap, band, foreheadTrap, eyeL, eyeR]);
  return container;
}

function drawArch(g, cx, cy, w, h, color) {
  g.fillStyle(color, 1);
  g.beginPath();
  const r = w / 2;
  const archCenterY = cy - h / 2 + r;
  g.moveTo(cx - w / 2, cy + h / 2);
  g.lineTo(cx - w / 2, archCenterY);
  const segments = 12;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const angle = Math.PI - t * Math.PI;
    const x = cx + Math.cos(angle) * r;
    const y = archCenterY - Math.sin(angle) * r;
    g.lineTo(x, y);
  }
  g.lineTo(cx + w / 2, cy + h / 2);
  g.closePath();
  g.fillPath();
}

function buildMythicIce(scene, size) {
  const BODY = 0x3fb8e8;
  const HAT  = 0x5b6fe0;
  const ARCH = 0x9fdcef;
  const ORB  = 0x6b7ce5;
  const STAFF = 0xffd24d;
  const TRIA = 0x1d4dad;
  const TEAL = 0x6de8d0;

  const container = scene.add.container(0, 0);

  // Floating dark blue triangles
  const aura = scene.add.graphics();
  drawDownTriangle(aura, -size * 1.30, -size * 1.10, size * 0.36, size * 0.50, TRIA);
  drawDownTriangle(aura,  size * 1.40, -size * 0.55, size * 0.32, size * 0.45, TRIA);
  drawDownTriangle(aura,  0,            size * 1.30, size * 0.32, size * 0.50, TRIA);

  // Yellow staff (behind body)
  const staff = scene.add.graphics();
  staff.lineStyle(size * 0.10, STAFF, 1);
  staff.beginPath();
  staff.moveTo(-size * 1.20, -size * 0.55);
  staff.lineTo(-size * 0.50, size * 0.95);
  staff.strokePath();
  const orb = scene.add.circle(-size * 1.20, -size * 0.55, size * 0.20, ORB);

  // Body
  const body = scene.add.circle(0, size * 0.15, size, BODY);

  // Hat
  const hat = scene.add.graphics();
  hat.fillStyle(HAT, 1);
  hat.beginPath();
  hat.moveTo(0, -size * 1.55);
  hat.lineTo(-size * 0.55, -size * 0.55);
  hat.lineTo( size * 0.55, -size * 0.55);
  hat.closePath();
  hat.fillPath();

  // Arch ornament on hat
  const hatArch = scene.add.graphics();
  drawArch(hatArch, 0, -size * 0.95, size * 0.26, size * 0.42, ARCH);

  // Forehead teal triangle (small, pointing up)
  const forehead = scene.add.graphics();
  forehead.fillStyle(TEAL, 1);
  forehead.beginPath();
  forehead.moveTo(0, -size * 0.32);
  forehead.lineTo(-size * 0.13, -size * 0.12);
  forehead.lineTo( size * 0.13, -size * 0.12);
  forehead.closePath();
  forehead.fillPath();

  // Eyes
  const eyeL = scene.add.circle(-size * 0.36, size * 0.10, size * 0.24, 0xffffff);
  const eyeR = scene.add.circle( size * 0.36, size * 0.10, size * 0.24, 0xffffff);

  container.add([aura, staff, orb, body, hat, hatArch, forehead, eyeL, eyeR]);
  return container;
}

function buildMythicFire(scene, size) {
  const BODY = 0xee2222;
  const PINK = 0xf8a8a8;

  const container = scene.add.container(0, 0);

  // Floating triangles around the body (drawn first → behind body)
  const aura = scene.add.graphics();
  drawDownTriangle(aura, -size * 1.30, -size * 0.55, size * 0.34, size * 0.45, BODY);
  drawDownTriangle(aura, -size * 1.25,  size * 0.50, size * 0.28, size * 0.40, BODY);
  drawDownTriangle(aura,  size * 1.20, -size * 0.30, size * 0.30, size * 0.42, BODY);
  drawDownTriangle(aura,  size * 1.30,  size * 0.45, size * 0.30, size * 0.42, BODY);

  const body = scene.add.circle(0, size * 0.15, size, BODY);

  // Hat triangle
  const hat = scene.add.graphics();
  hat.fillStyle(BODY, 1);
  hat.beginPath();
  hat.moveTo(0, -size * 1.55);
  hat.lineTo(-size * 0.52, -size * 0.55);
  hat.lineTo( size * 0.52, -size * 0.55);
  hat.closePath();
  hat.fillPath();

  // Hexagon on hat face
  const hatHex = scene.add.graphics();
  drawHexagon(hatHex, 0, -size * 1.00, size * 0.18, PINK);

  // Hat band
  const band = scene.add.rectangle(0, -size * 0.5, size * 1.30, size * 0.22, PINK);

  // Forehead hexagon
  const foreheadHex = scene.add.graphics();
  drawHexagon(foreheadHex, 0, -size * 0.22, size * 0.13, PINK);

  // Eyes
  const eyeL = scene.add.circle(-size * 0.36, size * 0.10, size * 0.24, 0xffffff);
  const eyeR = scene.add.circle( size * 0.36, size * 0.10, size * 0.24, 0xffffff);

  container.add([aura, body, hat, hatHex, band, foreheadHex, eyeL, eyeR]);
  return container;
}

function buildMythicEarth(scene, size) {
  const BODY = 0xb8e966;
  const HAT  = 0x5bbe48;
  const BAND = 0x22c42b;
  const DIA  = 0x22c42b;

  const container = scene.add.container(0, 0);

  const body = scene.add.circle(0, size * 0.15, size, BODY);

  // Hat triangle (pointing up)
  const hat = scene.add.graphics();
  hat.fillStyle(HAT, 1);
  hat.beginPath();
  hat.moveTo(0, -size * 1.55);
  hat.lineTo(-size * 0.55, -size * 0.55);
  hat.lineTo( size * 0.55, -size * 0.55);
  hat.closePath();
  hat.fillPath();

  // Hat band
  const band = scene.add.rectangle(0, -size * 0.5, size * 1.35, size * 0.22, BAND);

  // Diamond on hat face
  const hatDiamond = scene.add.graphics();
  drawDiamond(hatDiamond, 0, -size * 1.05, size * 0.32, size * 0.32, DIA);

  // Forehead diamond between eyes
  const foreheadDiamond = scene.add.graphics();
  drawDiamond(foreheadDiamond, 0, -size * 0.22, size * 0.22, size * 0.22, DIA);

  // Eyes
  const eyeL = scene.add.circle(-size * 0.36, size * 0.10, size * 0.24, 0xffffff);
  const eyeR = scene.add.circle( size * 0.36, size * 0.10, size * 0.24, 0xffffff);

  // Spikes (4 small triangles under the eyes)
  const spikes = scene.add.graphics();
  drawDownTriangle(spikes, -size * 0.55, size * 0.45, size * 0.18, size * 0.30, BAND);
  drawDownTriangle(spikes, -size * 0.20, size * 0.45, size * 0.16, size * 0.26, BAND);
  drawDownTriangle(spikes,  size * 0.20, size * 0.45, size * 0.16, size * 0.26, BAND);
  drawDownTriangle(spikes,  size * 0.55, size * 0.45, size * 0.18, size * 0.30, BAND);

  container.add([body, hat, band, hatDiamond, foreheadDiamond, eyeL, eyeR, spikes]);
  return container;
}

function buildMythicWizard(scene, size) {
  const BODY  = 0xf8b945;
  const HAT   = 0xf89f44;
  const BAND  = 0xf48438;
  const EYE_R = 0xee8a2e;
  const WAND  = 0x6b4423;
  const STAR  = 0xfacf5a;
  const STAR2 = 0xfff39c;
  const DARK  = 0x4d2c0d;

  const container = scene.add.container(0, 0);

  // Wand (drawn behind body, on the left)
  const wand = scene.add.graphics();
  wand.lineStyle(size * 0.12, WAND, 1);
  wand.beginPath();
  wand.moveTo(-size * 0.85, size * 0.6);
  wand.lineTo(-size * 1.45, -size * 0.6);
  wand.strokePath();
  drawFilledStar(wand, -size * 1.55, -size * 0.75, size * 0.32, size * 0.14, STAR);
  drawFilledStar(wand, -size * 1.55, -size * 0.75, size * 0.16, size * 0.08, STAR2);

  // Body
  const body = scene.add.circle(0, size * 0.15, size, BODY);

  // Eyes (left white, right orange — matches the design)
  const eyeL = scene.add.circle(-size * 0.36, size * 0.10, size * 0.24, 0xffffff);
  const eyeR = scene.add.circle( size * 0.36, size * 0.10, size * 0.24, EYE_R);

  // Hat triangle
  const hat = scene.add.graphics();
  hat.fillStyle(HAT, 1);
  hat.beginPath();
  hat.moveTo(0, -size * 1.55);
  hat.lineTo(-size * 0.62, -size * 0.55);
  hat.lineTo( size * 0.62, -size * 0.55);
  hat.closePath();
  hat.fillPath();

  // Hat band
  const band = scene.add.rectangle(0, -size * 0.50, size * 1.45, size * 0.22, BAND);

  // 6-point dark star on hat
  const hatStar = scene.add.graphics();
  drawFilledStar(hatStar, 0, -size * 1.05, size * 0.22, size * 0.10, DARK, 6);

  container.add([wand, body, eyeL, eyeR, hat, band, hatStar]);
  return container;
}

export class BoardView {
  constructor(scene, x, y, width, height, board) {
    this.scene = scene;
    this.board = board;
    this.area = { x, y, width, height };
    this.cells = [];
    this.cellSize = Math.floor(Math.min(width / board.cols, height / board.rows) * 0.9);
    this.gap = 8;
    const totalW = board.cols * this.cellSize + (board.cols - 1) * this.gap;
    const totalH = board.rows * this.cellSize + (board.rows - 1) * this.gap;
    this.originX = x + (width - totalW) / 2;
    this.originY = y + (height - totalH) / 2;

    for (let c = 0; c < board.cols; c++) {
      this.cells[c] = [];
      for (let r = 0; r < board.rows; r++) {
        const cx = this.originX + c * (this.cellSize + this.gap) + this.cellSize / 2;
        const cy = this.originY + r * (this.cellSize + this.gap) + this.cellSize / 2;
        const rect = scene.add.rectangle(cx, cy, this.cellSize, this.cellSize, 0x2d4565).setStrokeStyle(2, 0x3a5d8f);
        this.cells[c][r] = { rect, x: cx, y: cy, container: null, levelText: null };
      }
    }
  }

  refreshAll() {
    for (let c = 0; c < this.board.cols; c++) {
      for (let r = 0; r < this.board.rows; r++) {
        this._refreshCell(c, r);
      }
    }
  }

  _refreshCell(c, r) {
    const cell = this.cells[c][r];
    if (cell.container) { cell.container.destroy(); cell.container = null; }
    if (cell.levelText) { cell.levelText.destroy(); cell.levelText = null; }

    const mage = this.board.getMageAt(c, r);
    if (!mage) return;

    const bodyColor = hexToInt(mage.config.color);
    const hatColor = hexToInt(mage.config.hatColor ?? mage.config.color);
    const size = this.cellSize * 0.4;
    const level = mage.level;
    const mythicBuilders = {
      LIGHTNING: buildMythicWizard,
      EARTH: buildMythicEarth,
      FIRE: buildMythicFire,
      ICE: buildMythicIce,
      POISON: buildMythicPoison,
      WIND: buildMythicWind,
    };
    const mythicBuilder = level >= 4 ? mythicBuilders[mage.config.id] : null;

    let container;
    if (mythicBuilder) {
      container = mythicBuilder(this.scene, size);
      container.x = cell.x;
      container.y = cell.y;
      // Transcendent (L5) ring around the mage
      if (level >= 5) {
        const ring = this.scene.add.circle(0, size * 0.15, size * 1.55, 0xff66ff, 0);
        ring.setStrokeStyle(4, 0xff66ff, 0.9);
        container.addAt(ring, 0);
        const aura = this.scene.add.circle(0, size * 0.15, size * 1.45, 0xff66ff, 0.15);
        container.addAt(aura, 0);
      }
    } else {
      container = this.scene.add.container(cell.x, cell.y);

      const body = this.scene.add.circle(0, size * 0.15, size, bodyColor);
      body.setStrokeStyle(2, 0xffffff);

      const hat = this.scene.add.graphics();
      hat.fillStyle(hatColor, 1);
      hat.beginPath();
      hat.moveTo(0, -size * 1.5);
      hat.lineTo(-size * 0.6, -size * 0.7);
      hat.lineTo(size * 0.6, -size * 0.7);
      hat.closePath();
      hat.fillPath();

      const starCount = Math.min(4, level - 1);
      const starPositions = [
        { x: 0,            y: -size * 1.15, r: size * 0.10 },
        { x: 0,            y: -size * 0.85, r: size * 0.08 },
        { x: -size * 0.25, y: -size * 1.00, r: size * 0.08 },
        { x:  size * 0.25, y: -size * 1.00, r: size * 0.08 },
      ];
      for (let i = 0; i < starCount; i++) {
        const p = starPositions[i];
        drawFilledStar(hat, p.x, p.y, p.r, p.r * 0.45, 0xffffff);
      }
      container.add(hat);
      container.add(body);

      const eyeRadius = size * 0.24;
      const eyeY = size * 0.05;
      const eyeOffsetX = size * 0.36;
      const eyeL = this.scene.add.circle(-eyeOffsetX, eyeY, eyeRadius, 0xffffff);
      const eyeR = this.scene.add.circle(eyeOffsetX, eyeY, eyeRadius, 0xffffff);
      container.add([eyeL, eyeR]);
    }

    // Visual scale by level
    const scaleMap = { 1: 1.0, 2: 1.1, 3: 1.22, 4: 1.35, 5: 1.55 };
    const scale = scaleMap[level] ?? 1.0;
    container.setScale(scale);

    // Draggable hit area (un-scaled coords; setSize is independent of scale)
    const hitW = size * 2.2;
    const hitH = size * 2.8;
    container.setSize(hitW, hitH);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-hitW / 2, -hitH / 2 + size * 0.1, hitW, hitH),
      Phaser.Geom.Rectangle.Contains
    );
    container.setData('col', c);
    container.setData('row', r);
    this.scene.input.setDraggable(container);

    cell.container = container;

    // Level badge
    cell.levelText = this.scene.add.text(
      cell.x + this.cellSize / 2 - 4,
      cell.y + this.cellSize / 2 - 4,
      `L${mage.level}`,
      {
        fontFamily: GAME_CONFIG.font.family,
        fontSize: `${Math.floor(this.cellSize * 0.22)}px`,
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { left: 4, right: 4 },
      }
    ).setOrigin(1);
  }

  getCellCenter(col, row) {
    const cell = this.cells[col]?.[row];
    return cell ? { x: cell.x, y: cell.y } : null;
  }

  getCellAt(worldX, worldY) {
    for (let c = 0; c < this.board.cols; c++) {
      for (let r = 0; r < this.board.rows; r++) {
        const cell = this.cells[c][r];
        const halfSize = this.cellSize / 2;
        if (worldX >= cell.x - halfSize && worldX <= cell.x + halfSize &&
            worldY >= cell.y - halfSize && worldY <= cell.y + halfSize) {
          return { col: c, row: r };
        }
      }
    }
    return null;
  }
}
