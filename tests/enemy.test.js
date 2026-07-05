import { describe, it, expect } from 'vitest';
import { Enemy } from '../src/core/enemy.js';
import { GAME_CONFIG } from '../src/config/gameConfig.js';

describe('Enemy', () => {
  it('creates an enemy with base hp/speed scaled by wave', () => {
    const e = new Enemy('GOBLIN', 1, 0); // wave 1, lane 0
    expect(e.typeId).toBe('GOBLIN');
    expect(e.lane).toBe(0);
    expect(e.hp).toBeGreaterThan(0);
    expect(e.isDead()).toBe(false);
  });

  it('exposes the wave number it was spawned in', () => {
    const e = new Enemy('GOBLIN', 7, 2);
    expect(e.wave).toBe(7);
  });

  it('scales hp by the configured wave multiplier', () => {
    const w1 = new Enemy('GOBLIN', 1, 0);
    const w5 = new Enemy('GOBLIN', 5, 0);
    expect(w5.hp).toBeCloseTo(w1.hp * Math.pow(GAME_CONFIG.wave.hpScalePerWave, 4));
  });

  it('takes damage and marks dead at 0 hp', () => {
    const e = new Enemy('SKELETON', 1, 1);
    const initialHp = e.hp;
    e.takeDamage(initialHp - 1);
    expect(e.isDead()).toBe(false);
    e.takeDamage(2);
    expect(e.isDead()).toBe(true);
  });

  it('starts at position 0 and advances when updated', () => {
    const e = new Enemy('GOBLIN', 1, 0);
    expect(e.position).toBe(0);
    e.update(1000); // 1 second
    expect(e.position).toBeGreaterThan(0);
  });

  it('applies slow effect that wears off after duration', () => {
    const e = new Enemy('GOBLIN', 1, 0);
    const baseSpeed = e.getCurrentSpeed();
    e.applySlow(0.5, 1000);
    expect(e.getCurrentSpeed()).toBeCloseTo(baseSpeed * 0.5);
    e.update(1001);
    expect(e.getCurrentSpeed()).toBeCloseTo(baseSpeed);
  });

  it('stuns enemy (speed = 0) for given duration', () => {
    const e = new Enemy('GOBLIN', 1, 0);
    e.applyStun(500);
    expect(e.getCurrentSpeed()).toBe(0);
    e.update(501);
    expect(e.getCurrentSpeed()).toBeGreaterThan(0);
  });

  it('applies optional hpMultiplier to base HP', () => {
    const normal = new Enemy('GOBLIN', 1, 0);
    const tougher = new Enemy('GOBLIN', 1, 0, 1.5);
    expect(tougher.hp).toBeCloseTo(normal.hp * 1.5);
  });
});
