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
    costIncrement: 5,
  },
  mage: {
    maxLevel: 5,
    levelDamageMultiplier: 2,
    levelAttackSpeedMultiplier: 1.1,
  },
  classes: {
    FIRE:      { id: 'FIRE',      emoji: '🔥',  color: '#FF6B6B', hatColor: '#E74C3C', damage: 10, atkPerSec: 1.0,  effect: 'single' },
    ICE:       { id: 'ICE',       emoji: '❄️',  color: '#5DADE2', hatColor: '#2E5984', damage: 5,  atkPerSec: 1.5,  effect: 'slow',  slowFactor: 0.3, slowDuration: 2000 },
    LIGHTNING: { id: 'LIGHTNING', emoji: '⚡',  color: '#FFD93D', hatColor: '#F39C12', damage: 4,  atkPerSec: 1.2,  effect: 'chain', chainCount: 2, chainDamageRatio: 0.5 },
    EARTH:     { id: 'EARTH',     emoji: '🌍',  color: '#6DCE53', hatColor: '#2BB342', damage: 3,  atkPerSec: 1.5,  effect: 'aoe',   aoeRadius: 1.5, stunDuration: 500 },
  },
  enemies: {
    GOBLIN:   { id: 'GOBLIN',   emoji: '👹', color: '#E74C3C', hp: 20,  speed: 1.0, baseDamage: 1 },
    SKELETON: { id: 'SKELETON', emoji: '💀', color: '#9B59B6', hp: 10,  speed: 2.0, baseDamage: 1 },
    BOSS:     { id: 'BOSS',     emoji: '👑', color: '#4A0E0E', hp: 400, speed: 0.4, baseDamage: 5 },
  },
  wave: {
    baseCount: 10,
    countIncrement: 2,
    baseSpawnInterval: 1500,
    spawnIntervalDecrement: 50,
    minSpawnInterval: 400,
    intermissionMs: 5000,
    hpScalePerWave: 1.15,
    skeletonStartWave: 5,
    skeletonStartRatio: 0.3,
    skeletonMidWave: 10,
    skeletonMidRatio: 0.5,
    maxConsecutiveSameLane: 3,
    bossInterval: 10,
  },
  lane: {
    enemyMoveDistancePerSecond: 120,
    laneLengthPixels: 480,
  },
  zones: [
    { name: '초원', color: 0x4CAF50 },
    { name: '설원', color: 0xECEFF1 },
    { name: '화산', color: 0xC62828 },
    { name: '바다', color: 0x29B6F6 },
    { name: '성',   color: 0x757575 },
  ],
  save: {
    storageKey: 'magicDefense.bestWave',
  },
  font: {
    family: '"Noto Sans KR", system-ui, sans-serif',
  },
};
