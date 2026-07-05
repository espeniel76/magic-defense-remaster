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
    it('is empty initially', () => {
      expect(HeroStore.getOwnedCount('flame')).toBe(0);
      expect(HeroStore.isOwned('flame')).toBe(false);
    });
    it('stacks duplicates', () => {
      HeroStore.addHero('flame');
      HeroStore.addHero('flame');
      expect(HeroStore.getOwnedCount('flame')).toBe(2);
      expect(HeroStore.isOwned('flame')).toBe(true);
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

  describe('admin unlockAll', () => {
    it('owns every hero and grants a big pile of gems', () => {
      HeroStore.unlockAll();
      HEROES.forEach(h => expect(HeroStore.isOwned(h.id)).toBe(true));
      expect(HeroStore.getGems()).toBeGreaterThan(100000);
    });
  });
});
