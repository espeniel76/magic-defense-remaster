import { describe, it, expect, vi } from 'vitest';
import { WaveManager } from '../src/core/waveManager.js';

describe('WaveManager', () => {
  it('starts at wave 1 with intermission false', () => {
    const wm = new WaveManager();
    wm.start();
    expect(wm.getCurrentWave()).toBe(1);
  });

  it('returns enemy type and lane on each spawn tick after interval', () => {
    const wm = new WaveManager();
    wm.start();
    const spawn = wm.update(1500);
    expect(spawn.spawns.length).toBeGreaterThanOrEqual(1);
    expect(['GOBLIN', 'SKELETON']).toContain(spawn.spawns[0].typeId);
    expect(spawn.spawns[0].lane).toBeGreaterThanOrEqual(0);
    expect(spawn.spawns[0].lane).toBeLessThan(4);
  });

  it('wave 1 spawns 10 enemies total then enters intermission', () => {
    const wm = new WaveManager();
    wm.start();
    let total = 0;
    for (let i = 0; i < 30; i++) {
      const r = wm.update(2000);
      total += r.spawns.length;
      if (r.waveEnded) break;
    }
    expect(total).toBe(10);
    expect(wm.isInIntermission()).toBe(true);
  });

  it('after intermission moves to wave 2 with +2 spawns', () => {
    const wm = new WaveManager();
    wm.start();
    for (let i = 0; i < 30 && !wm.isInIntermission(); i++) wm.update(2000);
    expect(wm.isInIntermission()).toBe(true);
    wm.notifyEnemiesCleared();
    wm.update(5001);
    expect(wm.getCurrentWave()).toBe(2);
    let total = 0;
    for (let i = 0; i < 30; i++) {
      const r = wm.update(2000);
      total += r.spawns.length;
      if (r.waveEnded) break;
    }
    expect(total).toBe(12);
  });

  it('skeleton ratio is 0 before wave 5', () => {
    const wm = new WaveManager();
    wm.start();
    const orig = Math.random;
    Math.random = vi.fn(() => 0.99);
    const ratio = wm.computeSkeletonRatio(3);
    expect(ratio).toBe(0);
    Math.random = orig;
  });

  it('skeleton ratio is 0.3 at wave 5', () => {
    const wm = new WaveManager();
    expect(wm.computeSkeletonRatio(5)).toBe(0.3);
  });

  it('skeleton ratio is 0.5 at wave 10', () => {
    const wm = new WaveManager();
    expect(wm.computeSkeletonRatio(10)).toBe(0.5);
  });

  it('prevents 4 enemies in same lane consecutively', () => {
    const wm = new WaveManager();
    wm.start();
    const lanes = [];
    for (let i = 0; i < 30 && lanes.length < 4; i++) {
      const r = wm.update(2000);
      for (const s of r.spawns) lanes.push(s.lane);
    }
    for (let i = 0; i < lanes.length - 3; i++) {
      expect(lanes[i] === lanes[i+1] && lanes[i] === lanes[i+2] && lanes[i] === lanes[i+3]).toBe(false);
    }
  });

  it('wave 10 is a boss wave with exactly 1 BOSS spawn', () => {
    const wm = new WaveManager();
    wm.currentWave = 9; // about to start wave 10
    wm.started = true;
    wm.startNextWave();
    expect(wm.getCurrentWave()).toBe(10);
    expect(wm.isBossWave(10)).toBe(true);
    let bossSpawns = 0;
    let totalSpawns = 0;
    for (let i = 0; i < 5; i++) {
      const r = wm.update(2000);
      for (const s of r.spawns) {
        totalSpawns += 1;
        if (s.typeId === 'BOSS') bossSpawns += 1;
      }
      if (r.waveEnded) break;
    }
    expect(totalSpawns).toBe(1);
    expect(bossSpawns).toBe(1);
  });

  it('wave 11 returns to normal enemy counts (no boss)', () => {
    const wm = new WaveManager();
    wm.currentWave = 10;
    wm.started = true;
    wm.startNextWave();
    expect(wm.getCurrentWave()).toBe(11);
    expect(wm.isBossWave(11)).toBe(false);
    let total = 0;
    let bossCount = 0;
    for (let i = 0; i < 80; i++) {
      const r = wm.update(2000);
      for (const s of r.spawns) {
        total += 1;
        if (s.typeId === 'BOSS') bossCount += 1;
      }
      if (r.waveEnded) break;
    }
    expect(total).toBe(30); // 10 + (11-1)*2
    expect(bossCount).toBe(0);
  });
});
