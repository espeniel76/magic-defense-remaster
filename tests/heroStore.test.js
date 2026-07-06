import { describe, it, expect, beforeEach } from 'vitest';
import { HeroStore } from '../src/core/heroStore.js';
import { START_GEMS, PARTY_SIZE, HEROES } from '../src/config/heroConfig.js';

describe('HeroStore', () => {
  beforeEach(() => localStorage.clear());

  describe('gems', () => {
    it('starts with START_GEMS when unset', () => {
      expect(HeroStore.getGems()).toBe(START_GEMS);
    });
    it('spends gems when affordable, refuses otherwise', () => {
      HeroStore.setGems(500);
      expect(HeroStore.spendGems(300)).toBe(true);
      expect(HeroStore.getGems()).toBe(200);
      expect(HeroStore.spendGems(9999)).toBe(false);
      expect(HeroStore.getGems()).toBe(200);
    });
    it('adds gems', () => {
      HeroStore.setGems(100);
      HeroStore.addGems(50);
      expect(HeroStore.getGems()).toBe(150);
    });
  });

  describe('owned heroes', () => {
    it('non-common heroes are not owned initially', () => {
      expect(HeroStore.getOwnedCount('lava')).toBe(0);
      expect(HeroStore.isOwned('lava')).toBe(false);
    });
    it('common heroes are pre-unlocked', () => {
      ['flame', 'ice', 'electric', 'earth'].forEach(id => {
        expect(HeroStore.isOwned(id)).toBe(true);
      });
    });
    it('stacks duplicates', () => {
      HeroStore.addHero('wind');
      HeroStore.addHero('wind');
      expect(HeroStore.getOwnedCount('wind')).toBe(2);
      expect(HeroStore.isOwned('wind')).toBe(true);
    });
    it('ignores unknown hero ids', () => {
      HeroStore.addHero('not-a-hero');
      expect(HeroStore.getOwnedCount('not-a-hero')).toBe(0);
    });
  });

  describe('party', () => {
    beforeEach(() => {
      ['flame', 'ice', 'electric', 'earth', 'wind', 'poison'].forEach(h => HeroStore.addHero(h));
    });
    it('adds owned heroes up to PARTY_SIZE', () => {
      expect(HeroStore.addToParty('flame')).toBe(true);
      expect(HeroStore.getParty()).toEqual(['flame']);
    });
    it('refuses heroes not owned', () => {
      expect(HeroStore.addToParty('lava')).toBe(false);
    });
    it('refuses duplicates in party', () => {
      HeroStore.addToParty('flame');
      expect(HeroStore.addToParty('flame')).toBe(false);
      expect(HeroStore.getParty().length).toBe(1);
    });
    it('caps the party at PARTY_SIZE', () => {
      ['flame', 'ice', 'electric', 'earth', 'wind'].forEach(h => HeroStore.addToParty(h));
      expect(HeroStore.getParty().length).toBe(PARTY_SIZE);
      expect(HeroStore.addToParty('poison')).toBe(false);
    });
    it('removes and toggles', () => {
      HeroStore.addToParty('flame');
      HeroStore.removeFromParty('flame');
      expect(HeroStore.isInParty('flame')).toBe(false);
      expect(HeroStore.toggleParty('ice')).toBe(true);
      expect(HeroStore.isInParty('ice')).toBe(true);
      expect(HeroStore.toggleParty('ice')).toBe(false);
      expect(HeroStore.isInParty('ice')).toBe(false);
    });
  });

  describe('battle class pool', () => {
    it('falls back to common hero classes when party is empty', () => {
      expect(HeroStore.getParty()).toEqual([]);
      expect(HeroStore.getBattleClassIds().sort())
        .toEqual(['EARTH', 'FIRE', 'ICE', 'LIGHTNING'].sort());
    });
    it('maps party heroes to their in-game classIds', () => {
      HeroStore.addToParty('flame'); // common, pre-unlocked
      HeroStore.addHero('poison');   // rare — must be acquired first
      HeroStore.addToParty('poison');
      expect(HeroStore.getBattleClassIds().sort()).toEqual(['FIRE', 'POISON'].sort());
    });
  });

  describe('admin unlockAll', () => {
    it('owns every hero and grants a big pile of gems', () => {
      HeroStore.unlockAll();
      HEROES.forEach(h => expect(HeroStore.isOwned(h.id)).toBe(true));
      expect(HeroStore.getGems()).toBeGreaterThan(100000);
    });
  });
});
