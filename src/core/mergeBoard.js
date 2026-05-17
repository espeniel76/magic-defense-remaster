import { GAME_CONFIG } from '../config/gameConfig.js';
import { Mage } from './mage.js';

export class MergeBoard {
  constructor() {
    this.cols = GAME_CONFIG.board.cols;
    this.rows = GAME_CONFIG.board.rows;
    // grid[col][row] = Mage | null
    this.grid = Array.from({ length: this.cols }, () => Array(this.rows).fill(null));
  }

  isInBounds(col, row) {
    return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
  }

  getMageAt(col, row) {
    if (!this.isInBounds(col, row)) return null;
    return this.grid[col][row];
  }

  placeMage(mage, col, row) {
    if (!this.isInBounds(col, row)) return false;
    if (this.grid[col][row] !== null) return false;
    this.grid[col][row] = mage;
    return true;
  }

  removeMage(col, row) {
    if (!this.isInBounds(col, row)) return null;
    const m = this.grid[col][row];
    this.grid[col][row] = null;
    return m;
  }

  getEmptyCells() {
    const empties = [];
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (this.grid[c][r] === null) empties.push({ col: c, row: r });
      }
    }
    return empties;
  }

  placeAtRandomEmpty(mage) {
    const empties = this.getEmptyCells();
    if (empties.length === 0) return null;
    const pick = empties[Math.floor(Math.random() * empties.length)];
    this.placeMage(mage, pick.col, pick.row);
    return pick;
  }

  tryMerge(fromCol, fromRow, toCol, toRow) {
    const a = this.getMageAt(fromCol, fromRow);
    const b = this.getMageAt(toCol, toRow);
    if (!a || !b) return { ok: false, reason: 'empty' };
    if (a === b) return { ok: false, reason: 'same' };
    if (a.classId !== b.classId) return { ok: false, reason: 'diff-class' };
    if (a.level !== b.level) return { ok: false, reason: 'diff-level' };
    if (a.level >= GAME_CONFIG.mage.maxLevel) return { ok: false, reason: 'max-level' };
    const newMage = new Mage(a.classId, a.level + 1);
    this.grid[fromCol][fromRow] = null;
    this.grid[toCol][toRow] = newMage;
    return { ok: true, newMage };
  }

  moveMage(fromCol, fromRow, toCol, toRow) {
    const a = this.getMageAt(fromCol, fromRow);
    if (!a) return false;
    if (!this.isInBounds(toCol, toRow)) return false;
    if (this.grid[toCol][toRow] !== null) return false;
    this.grid[toCol][toRow] = a;
    this.grid[fromCol][fromRow] = null;
    return true;
  }

  allMages() {
    const out = [];
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const m = this.grid[c][r];
        if (m) out.push({ mage: m, col: c, row: r });
      }
    }
    return out;
  }

  magesInColumn(col) {
    if (col < 0 || col >= this.cols) return [];
    const out = [];
    for (let r = 0; r < this.rows; r++) {
      const m = this.grid[col][r];
      if (m) out.push({ mage: m, col, row: r });
    }
    return out;
  }
}
