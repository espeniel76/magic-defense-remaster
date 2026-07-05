export const GAME_CONFIG = {
  display: {
    width: 720,
    height: 1280,
  },
  board: {
    cols: 4,
    rows: 4,
  },
  lanes: {
    count: 4,
  },
  player: {
    startHp: 20,
    startGold: 100,
    goldPerSecond: 10,
    goldPerKill: 1,
  },
  summon: {
    baseCost: 50,
    costIncrement: 2,
  },
  sell: {
    byLevel: { 1: 30, 2: 60, 3: 120, 4: 300, 5: 600 },
  },
  mage: {
    maxLevel: 5,
    levelDamageStep: 2,            // ×2 per level up
    mythicDamageStep: 5,           // ×5 when reaching L4 (mythic)
    transcendentDamageStep: 3,     // ×3 when reaching L5 (transcendent)
    levelAttackSpeedMultiplier: 1.1,
  },
  classes: {
    FIRE:      { id: 'FIRE',      emoji: '🔥',  color: '#FF6B6B', hatColor: '#E74C3C', damage: 10, atkPerSec: 1.0,  effect: 'single' },
    ICE:       { id: 'ICE',       emoji: '❄️',  color: '#5DADE2', hatColor: '#2E5984', damage: 5,  atkPerSec: 1.5,  effect: 'slow',  slowFactor: 0.3, slowDuration: 2000 },
    LIGHTNING: { id: 'LIGHTNING', emoji: '⚡',  color: '#FFD93D', hatColor: '#F39C12', damage: 4,  atkPerSec: 1.2,  effect: 'chain', chainCount: 2, chainDamageRatio: 0.5 },
    EARTH:     { id: 'EARTH',     emoji: '🌍',  color: '#6DCE53', hatColor: '#2BB342', damage: 3,  atkPerSec: 1.5,  effect: 'aoe',   aoeRadius: 1.5, stunDuration: 500 },
    POISON:    { id: 'POISON',    emoji: '☠️',  color: '#7B5DE2', hatColor: '#D597E8', damage: 6,  atkPerSec: 1.4,  effect: 'poison', poisonRatio: 0.5, poisonTickMs: 1000, poisonDurationMs: 3000 },
    WIND:      { id: 'WIND',      emoji: '🌪️',  color: '#E0E0E0', hatColor: '#A8A8A8', damage: 3,  atkPerSec: 1.6,  effect: 'knockback', knockback: 0.15, mythicKnockback: 0.30 },
  },
  enemies: {
    GOBLIN:   { id: 'GOBLIN',   displayName: '일반',   emoji: '👹', color: '#E74C3C', hp: 10,  speed: 0.33, baseDamage: 1 },
    SKELETON: { id: 'SKELETON', displayName: '빠른',   emoji: '💀', color: '#9B59B6', hp: 5,   speed: 0.67, baseDamage: 1 },
    BOSS:     { id: 'BOSS',     displayName: '보스',   emoji: '👑', color: '#4A0E0E', hp: 200, speed: 0.13, baseDamage: 5 },
    ELITE:    { id: 'ELITE',    displayName: '정예',   emoji: '⭐', color: '#F1C40F', hp: 20,  speed: 0.33, baseDamage: 2 },
    TITAN:    { id: 'TITAN',    displayName: '거대',   emoji: '🔷', color: '#2196F3', hp: 30,  speed: 0.30, baseDamage: 3 },
  },
  wave: {
    baseCount: 15,
    countIncrement: 3,
    baseSpawnInterval: 1100,
    spawnIntervalDecrement: 50,
    minSpawnInterval: 400,
    intermissionMs: 5000,
    hpScalePerWave: 1.10, // 시뮬레이터 튜닝 결과: 전 스테이지 클리어 가능(뒤로 갈수록 어려움). 1.15는 사실상 불가능이었음.
    skeletonStartWave: 5,
    skeletonStartRatio: 0.3,
    skeletonMidWave: 10,
    skeletonMidRatio: 0.5,
    maxConsecutiveSameLane: 3,
    bossInterval: 10,
    stageClearWave: 50, // 이 웨이브의 보스를 잡으면 스테이지 클리어 (bossInterval * 5)
  },
  lane: {
    enemyMoveDistancePerSecond: 120,
    laneLengthPixels: 480,
  },
  zones: [
    { name: '초원', color: 0x4CAF50 },
    { name: '설원', color: 0xECEFF1 },
    { name: '화산', color: 0xE64A19 },
    { name: '바다', color: 0x29B6F6 },
    { name: '성',   color: 0x757575 },
  ],
  // 스테이지 = 맵 선택. 각 스테이지는 하나의 맵에서 50웨이브.
  // tier: WaveManager의 elite/titan 스폰 + BGM 트랙 + 골드배수를 재활용.
  // hpMultiplier: 뒤 스테이지일수록 적이 셈.
  stages: [
    { name: '초원', color: 0x4CAF50, hpMultiplier: 1.0,  tier: 'normal' },
    { name: '설원', color: 0xECEFF1, hpMultiplier: 1.3,  tier: 'normal' },
    { name: '화산', color: 0xE64A19, hpMultiplier: 1.6,  tier: 'hard'   },
    { name: '바다', color: 0x29B6F6, hpMultiplier: 2.0,  tier: 'hard'   },
    { name: '성',   color: 0x757575, hpMultiplier: 2.5,  tier: 'hell'   },
    // 실험실: 카드 미리보기는 연어색, 게임 안 배경은 레인별 연어색/회색 줄무늬.
    { name: '실험실', color: 0xFA8072, hpMultiplier: 2.6, tier: 'hell',
      stripes: [0x9E9E9E, 0xFA8072, 0xFA8072, 0x9E9E9E] },
  ],
  hardMode: {
    enemyHpMultiplier: 1.5,
    eliteSpawnRatio: 0.2,
  },
  hellMode: {
    enemyHpMultiplier: 2,
    goldMultiplier: 1.5,
    eliteSpawnRatio: 0.2,
  },
  save: {
    storageKey: 'magicDefense.bestWave',
    stageBestPrefix: 'magicDefense.stageBest.', // + stageIndex
  },
  font: {
    family: 'system-ui, -apple-system, "Noto Sans CJK KR", "Malgun Gothic", sans-serif',
  },
};
