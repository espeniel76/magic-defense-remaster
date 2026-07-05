// 영웅 수집 메타 데이터 — 로스터, 등급, 소환(뽑기) 박스.
// (전투 연결은 아직 없음. 화면/수집 기능 먼저.)

export const RARITIES = {
  common:    { id: 'common',    name: '일반', color: 0x9E9E9E, textColor: '#cfcfcf' },
  rare:      { id: 'rare',      name: '희귀', color: 0x2196F3, textColor: '#8fd0ff' },
  epic:      { id: 'epic',      name: '에픽', color: 0x9C27B0, textColor: '#e0a6ff' },
  legendary: { id: 'legendary', name: '전설', color: 0xFF9800, textColor: '#ffcf7a' },
};

// 등급 순서(낮음→높음)
export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary'];

export const HEROES = [
  // 일반 — 기본 4원소 마법사
  { id: 'flame',    name: '화염 마법사', rarity: 'common' },
  { id: 'ice',      name: '얼음 마법사', rarity: 'common' },
  { id: 'electric', name: '전기 마법사', rarity: 'common' },
  { id: 'earth',    name: '땅 마법사',   rarity: 'common' },
  // 희귀 — 특수 원소 마법사
  { id: 'wind',     name: '바람 마법사', rarity: 'rare' },
  { id: 'poison',   name: '맹독 마법사', rarity: 'rare' },
  { id: 'sand',     name: '모래 마법사', rarity: 'rare' },
  { id: 'acid',     name: '산성 마법사', rarity: 'rare' },
  // 에픽
  { id: 'matrix',   name: '매트릭스', rarity: 'epic' },
  { id: 'thunder',  name: '천둥',     rarity: 'epic' },
  { id: 'lava',     name: '용암',     rarity: 'epic' },
  // 전설
  { id: 'summoner',   name: '소환술사',    rarity: 'legendary' },
  { id: 'contractor', name: '계약자',      rarity: 'legendary' },
  { id: 'apostle',    name: '멸망의 사도', rarity: 'legendary' },
  { id: 'executor',   name: '최고집행관',  rarity: 'legendary' },
  { id: 'watcher',    name: '주시자',      rarity: 'legendary' },
];

export const HERO_BY_ID = Object.fromEntries(HEROES.map(h => [h.id, h]));

// 소환 박스: 비용(젬) + 등급별 확률(합 1.0)
export const GACHA_BOXES = [
  { id: 'silver',    name: '실버 소환',    accent: 0xB0BEC5, cost: 100,  odds: { common: 0.85, rare: 0.15 } },
  { id: 'gold',      name: '골드 소환',    accent: 0xFFD54F, cost: 300,  odds: { common: 0.40, rare: 0.50, epic: 0.10 } },
  { id: 'premium',   name: '프리미엄 소환', accent: 0x2196F3, cost: 800,  odds: { rare: 0.40, epic: 0.50, legendary: 0.10 } },
  { id: 'legendary', name: '레전더리 소환', accent: 0xE53935, cost: 2000, odds: { epic: 0.50, legendary: 0.50 } },
];

export const GACHA_BOX_BY_ID = Object.fromEntries(GACHA_BOXES.map(b => [b.id, b]));

export const PARTY_SIZE = 5;
export const START_GEMS = 3000;
export const GEM_STORAGE_KEY = 'magicDefense.gems';
export const OWNED_STORAGE_KEY = 'magicDefense.heroesOwned';
export const PARTY_STORAGE_KEY = 'magicDefense.party';
