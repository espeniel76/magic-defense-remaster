import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

const MAGE_LABELS = { FIRE: '불', ICE: '얼음', LIGHTNING: '전기', EARTH: '땅' };

function hexToInt(hex) {
  return parseInt(hex.replace('#', ''), 16);
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

    const container = this.scene.add.container(cell.x, cell.y);

    // Body circle (slightly below container center to leave room for hat)
    const body = this.scene.add.circle(0, size * 0.15, size, bodyColor);
    body.setStrokeStyle(2, 0xffffff);

    // Hat drawn with Graphics (no auto-centering)
    const hat = this.scene.add.graphics();
    hat.fillStyle(hatColor, 1);
    hat.beginPath();
    hat.moveTo(0, -size * 1.5);              // top point
    hat.lineTo(-size * 0.6, -size * 0.7);    // bottom-left
    hat.lineTo(size * 0.6, -size * 0.7);     // bottom-right
    hat.closePath();
    hat.fillPath();

    // Eyes
    const eyeRadius = size * 0.18;
    const eyeY = size * 0.05;
    const eyeOffsetX = size * 0.35;
    const eyeL = this.scene.add.circle(-eyeOffsetX, eyeY, eyeRadius, 0xffffff);
    const eyeR = this.scene.add.circle(eyeOffsetX, eyeY, eyeRadius, 0xffffff);

    container.add([hat, body, eyeL, eyeR]);

    // Visual scale grows with level: L1 = 1.0, L2 = 1.1, L3 = 1.22, L4+ = 1.35
    const scaleMap = { 1: 1.0, 2: 1.1, 3: 1.22, 4: 1.35, 5: 1.45 };
    const scale = scaleMap[mage.level] ?? 1.0;
    container.setScale(scale);

    // Make container draggable
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
