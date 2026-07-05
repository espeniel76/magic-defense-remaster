import { describe, it, expect, beforeEach } from 'vitest';
import { SaveStore } from '../src/core/saveStore.js';

describe('SaveStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns 0 when no record stored', () => {
    expect(SaveStore.getBestWave()).toBe(0);
  });

  it('saves and retrieves best wave', () => {
    SaveStore.saveBestWave(7);
    expect(SaveStore.getBestWave()).toBe(7);
  });

  it('only updates if new wave is higher', () => {
    SaveStore.saveBestWave(10);
    SaveStore.saveBestWave(5);
    expect(SaveStore.getBestWave()).toBe(10);
  });

  it('updates when new wave is higher', () => {
    SaveStore.saveBestWave(3);
    SaveStore.saveBestWave(8);
    expect(SaveStore.getBestWave()).toBe(8);
  });

  it('handles corrupted storage gracefully', () => {
    localStorage.setItem('magicDefense.bestWave', 'not-a-number');
    expect(SaveStore.getBestWave()).toBe(0);
  });

  describe('per-stage best', () => {
    it('returns 0 for a stage with no record', () => {
      expect(SaveStore.getStageBest(0)).toBe(0);
      expect(SaveStore.getStageBest(3)).toBe(0);
    });

    it('saves and retrieves a stage best', () => {
      SaveStore.saveStageBest(2, 17);
      expect(SaveStore.getStageBest(2)).toBe(17);
    });

    it('only updates a stage when the new wave is higher', () => {
      SaveStore.saveStageBest(1, 20);
      SaveStore.saveStageBest(1, 8);
      expect(SaveStore.getStageBest(1)).toBe(20);
      SaveStore.saveStageBest(1, 33);
      expect(SaveStore.getStageBest(1)).toBe(33);
    });

    it('keeps each stage record independent', () => {
      SaveStore.saveStageBest(0, 10);
      SaveStore.saveStageBest(4, 50);
      expect(SaveStore.getStageBest(0)).toBe(10);
      expect(SaveStore.getStageBest(4)).toBe(50);
      expect(SaveStore.getStageBest(2)).toBe(0);
    });

    it('handles corrupted stage storage gracefully', () => {
      localStorage.setItem('magicDefense.stageBest.0', 'garbage');
      expect(SaveStore.getStageBest(0)).toBe(0);
    });
  });
});
