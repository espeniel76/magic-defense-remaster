import { describe, it, expect } from 'vitest';
import { EconomyManager } from '../src/core/economyManager.js';

describe('EconomyManager', () => {
  it('starts with config start gold', () => {
    const em = new EconomyManager();
    expect(em.getGold()).toBe(100);
  });

  it('accumulates gold over time', () => {
    const em = new EconomyManager();
    em.update(1000); // +10
    expect(em.getGold()).toBe(110);
    em.update(500); // +5 (cumulative)
    expect(em.getGold()).toBe(115);
  });

  it('summon cost starts at 50 and increments by 5 each summon', () => {
    const em = new EconomyManager();
    expect(em.getSummonCost()).toBe(50);
    em.spendSummon();                  // gold: 100→50, count=1
    expect(em.getSummonCost()).toBe(55);
    em.update(3000);                   // +6 gold → 56, enough for cost 55
    em.spendSummon();                  // gold: 56→1, count=2
    expect(em.getSummonCost()).toBe(60);
  });

  it('can summon only when gold >= cost', () => {
    const em = new EconomyManager();
    expect(em.canSummon()).toBe(true);
    em.spendSummon();
    expect(em.getGold()).toBe(50);
    expect(em.canSummon()).toBe(false); // need 55, have 50
  });

  it('refuses spendSummon if cannot afford', () => {
    const em = new EconomyManager();
    em.spendSummon(); // gold=50, cost=55
    expect(em.spendSummon()).toBe(false);
    expect(em.getGold()).toBe(50);
    expect(em.getSummonCost()).toBe(55);
  });

  it('rewards kill', () => {
    const em = new EconomyManager();
    em.rewardKill();
    expect(em.getGold()).toBe(101);
  });

  it('applies goldMultiplier to both income and kill rewards', () => {
    const em = new EconomyManager(2);
    em.update(1000); // +10 base × 2 = +20
    expect(em.getGold()).toBe(120);
    em.rewardKill(); // +1 base × 2 = +2
    expect(em.getGold()).toBe(122);
  });
});
