import { describe, it, expect } from 'vitest';
import { AttackResolver } from '../src/core/attackResolver.js';
import { MergeBoard } from '../src/core/mergeBoard.js';
import { EnemyLane } from '../src/core/enemyLane.js';
import { Mage } from '../src/core/mage.js';
import { Enemy } from '../src/core/enemy.js';

function setup() {
  const board = new MergeBoard();
  const lane = new EnemyLane();
  const ar = new AttackResolver(board, lane);
  return { board, lane, ar };
}

describe('AttackResolver - targeting', () => {
  it('a mage in column C targets enemies only in lane C', () => {
    const { board, lane, ar } = setup();
    const fire = new Mage('FIRE', 1);
    board.placeMage(fire, 2, 0);
    const enemyInOtherLane = new Enemy('GOBLIN', 1, 0);
    enemyInOtherLane.position = 0.5;
    lane.spawn(enemyInOtherLane);
    const attacks = ar.update(2000);
    expect(attacks.length).toBe(0);
  });

  it('does nothing if no enemy in column', () => {
    const { board, ar } = setup();
    board.placeMage(new Mage('FIRE', 1), 1, 0);
    expect(ar.update(2000).length).toBe(0);
  });
});

describe('AttackResolver - FIRE', () => {
  it('damages frontmost enemy in same column', () => {
    const { board, lane, ar } = setup();
    const fire = new Mage('FIRE', 1);
    board.placeMage(fire, 1, 0);
    const a = new Enemy('GOBLIN', 1, 1);
    a.position = 0.3;
    const b = new Enemy('GOBLIN', 1, 1);
    b.position = 0.6;
    lane.spawn(a);
    lane.spawn(b);
    const initialB = b.hp;
    ar.update(1000);
    expect(b.hp).toBe(initialB - fire.getDamage());
    expect(a.hp).toBeGreaterThan(0);
  });
});

describe('AttackResolver - ICE', () => {
  it('damages and applies slow', () => {
    const { board, lane, ar } = setup();
    const ice = new Mage('ICE', 1);
    board.placeMage(ice, 0, 0);
    const e = new Enemy('GOBLIN', 1, 0);
    e.position = 0.5;
    lane.spawn(e);
    const baseSpeed = e.getCurrentSpeed();
    ar.update(1000);
    expect(e.getCurrentSpeed()).toBeLessThan(baseSpeed);
  });
});

describe('AttackResolver - LIGHTNING', () => {
  it('damages primary + chains to up to 2 more enemies anywhere', () => {
    const { board, lane, ar } = setup();
    const lt = new Mage('LIGHTNING', 1);
    board.placeMage(lt, 0, 0);
    const primary = new Enemy('GOBLIN', 1, 0);
    primary.position = 0.5;
    const chainA = new Enemy('GOBLIN', 1, 1);
    chainA.position = 0.5;
    const chainB = new Enemy('GOBLIN', 1, 2);
    chainB.position = 0.5;
    const chainC = new Enemy('GOBLIN', 1, 3);
    chainC.position = 0.5;
    lane.spawn(primary);
    lane.spawn(chainA);
    lane.spawn(chainB);
    lane.spawn(chainC);
    const primaryStart = primary.hp;
    ar.update(1000);
    expect(primary.hp).toBe(primaryStart - lt.getDamage());
    const halfDmgEnemies = [chainA, chainB, chainC].filter(
      e => e.hp === e.maxHp - Math.floor(lt.getDamage() * 0.5)
    );
    expect(halfDmgEnemies.length).toBe(2);
  });
});

describe('AttackResolver - EARTH', () => {
  it('damages primary + AoE in radius + applies stun', () => {
    const { board, lane, ar } = setup();
    const earth = new Mage('EARTH', 1);
    board.placeMage(earth, 1, 0);
    const primary = new Enemy('GOBLIN', 1, 1);
    primary.position = 0.5;
    const nearby = new Enemy('GOBLIN', 1, 2);
    nearby.position = 0.5;
    const far = new Enemy('GOBLIN', 1, 3);
    far.position = 0.1;
    lane.spawn(primary);
    lane.spawn(nearby);
    lane.spawn(far);
    ar.update(1000);
    expect(primary.hp).toBeLessThan(primary.maxHp);
    expect(nearby.hp).toBeLessThan(nearby.maxHp);
    expect(far.hp).toBe(far.maxHp);
    expect(primary.getCurrentSpeed()).toBe(0);
  });
});

describe('AttackResolver - cooldown', () => {
  it('does not attack twice within attack interval', () => {
    const { board, lane, ar } = setup();
    const fire = new Mage('FIRE', 1);
    board.placeMage(fire, 0, 0);
    const e = new Enemy('GOBLIN', 1, 0);
    e.position = 0.5;
    lane.spawn(e);
    const startHp = e.hp;
    ar.update(500);
    ar.update(400);
    expect(e.hp).toBe(startHp);
    ar.update(200);
    expect(e.hp).toBe(startHp - fire.getDamage());
  });
});
