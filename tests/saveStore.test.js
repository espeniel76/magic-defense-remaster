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
});
