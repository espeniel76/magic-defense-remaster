import { describe, it, expect } from 'vitest';
import { pickRarity, drawHero } from '../src/core/gacha.js';
import { HERO_BY_ID, GACHA_BOX_BY_ID } from '../src/config/heroConfig.js';

// 큐에 넣은 값을 순서대로 반환하는 결정론적 rng
function seqRng(values) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('gacha', () => {
  describe('pickRarity', () => {
    const odds = { common: 0.85, rare: 0.15 };
    it('returns the first rarity for a low roll', () => {
      expect(pickRarity(odds, 0)).toBe('common');
      expect(pickRarity(odds, 0.84)).toBe('common');
    });
    it('returns the next rarity past the threshold', () => {
      expect(pickRarity(odds, 0.85)).toBe('rare');
      expect(pickRarity(odds, 0.99)).toBe('rare');
    });
    it('never falls through even at roll ~1 (float safety)', () => {
      expect(pickRarity(odds, 0.9999999)).toBe('rare');
    });
  });

  describe('drawHero', () => {
    it('draws a hero of the rolled rarity', () => {
      // rng: 첫 호출 = 등급 롤, 둘째 = 풀 인덱스
      const common = drawHero('silver', seqRng([0.5, 0]));
      expect(HERO_BY_ID[common].rarity).toBe('common');
      const rare = drawHero('silver', seqRng([0.9, 0]));
      expect(HERO_BY_ID[rare].rarity).toBe('rare');
    });

    it('always returns a valid hero id for every box', () => {
      for (const boxId of Object.keys(GACHA_BOX_BY_ID)) {
        for (let i = 0; i < 50; i++) {
          const id = drawHero(boxId);
          expect(HERO_BY_ID[id]).toBeDefined();
        }
      }
    });

    it('only yields rarities allowed by the box odds', () => {
      const allowed = new Set(Object.keys(GACHA_BOX_BY_ID.gold.odds));
      for (let i = 0; i < 100; i++) {
        const id = drawHero('gold');
        expect(allowed.has(HERO_BY_ID[id].rarity)).toBe(true);
      }
    });

    it('throws on unknown box', () => {
      expect(() => drawHero('nope')).toThrow();
    });
  });
});
