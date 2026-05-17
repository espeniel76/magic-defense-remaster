import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class BoardView {
  constructor(scene, x, y, width, height, board) {
    this.scene = scene;
    this.board = board;
    this.area = { x, y, width, height };
    this.cells = []; // [col][row] = { rect, mageSprite|null }
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
        this.cells[c][r] = { rect, x: cx, y: cy, mageText: null };
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
    const mage = this.board.getMageAt(c, r);
    if (cell.mageText) {
      cell.mageText.destroy();
      cell.mageText = null;
    }
    if (cell.levelText) {
      cell.levelText.destroy();
      cell.levelText = null;
    }
    if (!mage) return;
    cell.mageText = this.scene.add.text(cell.x, cell.y, mage.config.emoji, {
      fontSize: `${Math.floor(this.cellSize * 0.6)}px`,
    }).setOrigin(0.5);
    cell.levelText = this.scene.add.text(cell.x + this.cellSize / 2 - 4, cell.y + this.cellSize / 2 - 4, `L${mage.level}`, {
      fontSize: `${Math.floor(this.cellSize * 0.22)}px`,
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { left: 4, right: 4 },
    }).setOrigin(1);
  }

  getCellCenter(col, row) {
    const cell = this.cells[col]?.[row];
    return cell ? { x: cell.x, y: cell.y } : null;
  }

  // Returns {col, row} | null
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
