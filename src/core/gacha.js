import { HEROES, GACHA_BOX_BY_ID } from '../config/heroConfig.js';

// odds: { rarity: probability } (합 1.0). roll ∈ [0,1) → 당첨 등급.
export function pickRarity(odds, roll) {
  let acc = 0;
  const entries = Object.entries(odds);
  for (const [rarity, p] of entries) {
    acc += p;
    if (roll < acc) return rarity;
  }
  return entries[entries.length - 1][0]; // 부동소수 안전망: 마지막 등급
}

// 박스에서 영웅 하나 뽑기 → heroId. rng는 테스트용 주입 가능(기본 Math.random).
export function drawHero(boxId, rng = Math.random) {
  const box = GACHA_BOX_BY_ID[boxId];
  if (!box) throw new Error(`Unknown gacha box: ${boxId}`);
  const rarity = pickRarity(box.odds, rng());
  const pool = HEROES.filter(h => h.rarity === rarity);
  return pool[Math.floor(rng() * pool.length)].id;
}
