import { describe, it, expect } from 'vitest';
import { Mage } from '../src/core/mage.js';
import { GAME_CONFIG } from '../src/config/gameConfig.js';

describe('Mage', () => {
  it('creates a Lv1 mage of given class', () => {
    const m = new Mage('FIRE', 1);
    expect(m.classId).toBe('FIRE');
    expect(m.level).toBe(1);
  });

  it('calculates damage with per-level steps (x2, x5 mythic L4, x3 transcendent L5)', () => {
    const base = GAME_CONFIG.classes.FIRE.damage;
    expect(new Mage('FIRE', 1).getDamage()).toBe(base);
    expect(new Mage('FIRE', 2).getDamage()).toBeCloseTo(base * 2);
    expect(new Mage('FIRE', 3).getDamage()).toBeCloseTo(base * 2 * 2);
    expect(new Mage('FIRE', 4).getDamage()).toBeCloseTo(base * 2 * 2 * 5);
    expect(new Mage('FIRE', 5).getDamage()).toBeCloseTo(base * 2 * 2 * 5 * 3);
  });

  it('calculates attack interval based on attack speed multiplier', () => {
    const lv1 = new Mage('FIRE', 1);
    const lv2 = new Mage('FIRE', 2);
    expect(lv1.getAttackIntervalMs()).toBeCloseTo(1000); // 1.0 atk/sec
    expect(lv2.getAttackIntervalMs()).toBeCloseTo(1000 / 1.1);
  });

  it('exposes the class config', () => {
    const m = new Mage('ICE', 1);
    expect(m.config.emoji).toBe('❄️');
    expect(m.config.effect).toBe('slow');
  });

  it('throws on unknown class', () => {
    expect(() => new Mage('UNKNOWN', 1)).toThrow();
  });
});
