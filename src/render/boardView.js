import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

const MAGE_LABELS = { FIRE: '불', ICE: '얼음', LIGHTNING: '전기', EARTH: '땅' };

function hexToInt(hex) {
  return parseInt(hex.replace('#', ''), 16);
}

function drawFilledStar(g, cx, cy, outerR, innerR, color) {
  g.fillStyle(color, 1);
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.fillPath();
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

    const container = this.scene.add.container(cell.x, cell.y);

    // Body circle
    const body = this.scene.add.circle(0, size * 0.15, size, bodyColor);
    body.setStrokeStyle(2, 0xffffff);

    // Hat: drawn only for L1-L3, with progressive star decorations.
    if (level <= 3) {
      const hat = this.scene.add.graphics();
      hat.fillStyle(hatColor, 1);
      hat.beginPath();
      hat.moveTo(0, -size * 1.5);
      hat.lineTo(-size * 0.6, -size * 0.7);
      hat.lineTo(size * 0.6, -size * 0.7);
      hat.closePath();
      hat.fillPath();

      // Stars: L2 has 1 star near tip; L3 has 2 stars (one near tip, one mid-hat).
      const starCount = level - 1; // L1=0, L2=1, L3=2
      const starPositions = [
        { x: 0, y: -size * 1.15, r: size * 0.10 }, // upper star
        { x: 0, y: -size * 0.85, r: size * 0.08 }, // lower star
      ];
      for (let i = 0; i < starCount; i++) {
        const p = starPositions[i];
        drawFilledStar(hat, p.x, p.y, p.r, p.r * 0.45, 0xffffff);
      }

      container.add(hat);
    }

    // Body added AFTER hat so eyes overlay on body
    container.add(body);

    // Eyes (bigger — was 0.18, now 0.24)
    const eyeRadius = size * 0.24;
    const eyeY = size * 0.05;
    const eyeOffsetX = size * 0.36;
    const eyeL = this.scene.add.circle(-eyeOffsetX, eyeY, eyeRadius, 0xffffff);
    const eyeR = this.scene.add.circle(eyeOffsetX, eyeY, eyeRadius, 0xffffff);
    container.add([eyeL, eyeR]);

    // Visual scale by level
    const scaleMap = { 1: 1.0, 2: 1.1, 3: 1.22, 4: 1.35, 5: 1.45 };
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
