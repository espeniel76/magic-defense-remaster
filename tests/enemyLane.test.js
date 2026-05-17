import { describe, it, expect } from 'vitest';
import { EnemyLane } from '../src/core/enemyLane.js';
import { Enemy } from '../src/core/enemy.js';

describe('EnemyLane', () => {
  it('has 4 lanes, all empty initially', () => {
    const el = new EnemyLane();
    expect(el.laneCount).toBe(4);
    for (let i = 0; i < 4; i++) {
      expect(el.enemiesInLane(i)).toEqual([]);
    }
  });

  it('spawns an enemy into a specific lane', () => {
    const el = new EnemyLane();
    const e = new Enemy('GOBLIN', 1, 2);
    el.spawn(e);
    expect(el.enemiesInLane(2)).toContain(e);
    expect(el.allEnemies()).toContain(e);
  });

  it('updates all enemies and emits reached-base for those reaching position 1', () => {
    const el = new EnemyLane();
    const e = new Enemy('GOBLIN', 1, 0);
    e.position = 0.99;
    el.spawn(e);
    const events = el.update(1000); // long dt to push past 1.0
    expect(events.reached.length).toBe(1);
    expect(events.reached[0]).toBe(e);
    expect(el.allEnemies()).not.toContain(e);
  });

  it('removes dead enemies and reports them as killed', () => {
    const el = new EnemyLane();
    const e = new Enemy('GOBLIN', 1, 0);
    el.spawn(e);
    e.takeDamage(e.hp);
    const events = el.update(16);
    expect(events.killed.length).toBe(1);
    expect(el.allEnemies()).not.toContain(e);
  });

  it('returns frontmost enemy of a lane (closest to base)', () => {
    const el = new EnemyLane();
    const a = new Enemy('GOBLIN', 1, 1);
    a.position = 0.3;
    const b = new Enemy('GOBLIN', 1, 1);
    b.position = 0.7;
    const c = new Enemy('GOBLIN', 1, 1);
    c.position = 0.5;
    el.spawn(a);
    el.spawn(b);
    el.spawn(c);
    expect(el.getFrontmostInLane(1)).toBe(b);
  });

  it('returns null for frontmost in empty lane', () => {
    const el = new EnemyLane();
    expect(el.getFrontmostInLane(0)).toBeNull();
  });
});
