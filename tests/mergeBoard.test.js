import { describe, it, expect } from 'vitest';
import { MergeBoard } from '../src/core/mergeBoard.js';
import { Mage } from '../src/core/mage.js';

describe('MergeBoard', () => {
  it('starts with all cells empty', () => {
    const b = new MergeBoard();
    expect(b.cols).toBe(4);
    expect(b.rows).toBe(4);
    expect(b.getEmptyCells().length).toBe(16);
    expect(b.getMageAt(0, 0)).toBeNull();
  });

  it('places a mage at an empty cell', () => {
    const b = new MergeBoard();
    const m = new Mage('FIRE', 1);
    expect(b.placeMage(m, 1, 2)).toBe(true);
    expect(b.getMageAt(1, 2)).toBe(m);
    expect(b.getEmptyCells().length).toBe(15);
  });

  it('refuses to place when cell is occupied', () => {
    const b = new MergeBoard();
    b.placeMage(new Mage('FIRE', 1), 0, 0);
    expect(b.placeMage(new Mage('ICE', 1), 0, 0)).toBe(false);
  });

  it('places at a random empty cell', () => {
    const b = new MergeBoard();
    const m = new Mage('FIRE', 1);
    const placed = b.placeAtRandomEmpty(m);
    expect(placed).not.toBeNull();
    expect(b.getMageAt(placed.col, placed.row)).toBe(m);
  });

  it('returns null when board is full and no random placement possible', () => {
    const b = new MergeBoard();
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) b.placeMage(new Mage('FIRE', 1), c, r);
    expect(b.placeAtRandomEmpty(new Mage('ICE', 1))).toBeNull();
  });

  it('merges same class + same level into level+1', () => {
    const b = new MergeBoard();
    const m1 = new Mage('FIRE', 2);
    const m2 = new Mage('FIRE', 2);
    b.placeMage(m1, 0, 0);
    b.placeMage(m2, 1, 0);
    const result = b.tryMerge(0, 0, 1, 0);
    expect(result.ok).toBe(true);
    expect(result.newMage.classId).toBe('FIRE');
    expect(result.newMage.level).toBe(3);
    expect(b.getMageAt(0, 0)).toBeNull();
    expect(b.getMageAt(1, 0)).toBe(result.newMage);
  });

  it('refuses merge on different class', () => {
    const b = new MergeBoard();
    b.placeMage(new Mage('FIRE', 2), 0, 0);
    b.placeMage(new Mage('ICE', 2), 1, 0);
    const result = b.tryMerge(0, 0, 1, 0);
    expect(result.ok).toBe(false);
    expect(b.getMageAt(0, 0).classId).toBe('FIRE');
  });

  it('refuses merge on different level', () => {
    const b = new MergeBoard();
    b.placeMage(new Mage('FIRE', 1), 0, 0);
    b.placeMage(new Mage('FIRE', 2), 1, 0);
    expect(b.tryMerge(0, 0, 1, 0).ok).toBe(false);
  });

  it('refuses merge at max level', () => {
    const b = new MergeBoard();
    b.placeMage(new Mage('FIRE', 5), 0, 0);
    b.placeMage(new Mage('FIRE', 5), 1, 0);
    expect(b.tryMerge(0, 0, 1, 0).ok).toBe(false);
  });

  it('moves mage from one cell to another empty cell', () => {
    const b = new MergeBoard();
    const m = new Mage('FIRE', 1);
    b.placeMage(m, 0, 0);
    expect(b.moveMage(0, 0, 2, 3)).toBe(true);
    expect(b.getMageAt(0, 0)).toBeNull();
    expect(b.getMageAt(2, 3)).toBe(m);
  });

  it('refuses to move to occupied cell (use tryMerge instead)', () => {
    const b = new MergeBoard();
    b.placeMage(new Mage('FIRE', 1), 0, 0);
    b.placeMage(new Mage('ICE', 1), 1, 0);
    expect(b.moveMage(0, 0, 1, 0)).toBe(false);
  });

  it('iterates all mages with their positions', () => {
    const b = new MergeBoard();
    const m1 = new Mage('FIRE', 1);
    const m2 = new Mage('ICE', 1);
    b.placeMage(m1, 0, 0);
    b.placeMage(m2, 3, 3);
    const all = b.allMages();
    expect(all.length).toBe(2);
    const positions = all.map(({ col, row }) => `${col},${row}`).sort();
    expect(positions).toEqual(['0,0', '3,3']);
  });
});
