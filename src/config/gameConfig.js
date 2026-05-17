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
    FIRE:      { id: 'FIRE',      emoji: '🔥',  color: '#e74c3c', damage: 10, atkPerSec: 1.0,  effect: 'single' },
    ICE:       { id: 'ICE',       emoji: '❄️',  color: '#5dade2', damage: 5,  atkPerSec: 1.5,  effect: 'slow',  slowFactor: 0.3, slowDuration: 2000 },
    LIGHTNING: { id: 'LIGHTNING', emoji: '⚡',  color: '#f4d03f', damage: 4,  atkPerSec: 1.2,  effect: 'chain', chainCount: 2, chainDamageRatio: 0.5 },
    EARTH:     { id: 'EARTH',     emoji: '🌍',  color: '#a0522d', damage: 3,  atkPerSec: 1.5,  effect: 'aoe',   aoeRadius: 1.5, stunDuration: 500 },
  },
  enemies: {
    GOBLIN:   { id: 'GOBLIN',   emoji: '👹', hp: 20, speed: 1.0, baseDamage: 1 },
    SKELETON: { id: 'SKELETON', emoji: '💀', hp: 10, speed: 2.0, baseDamage: 1 },
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
  },
  lane: {
    enemyMoveDistancePerSecond: 120,
    laneLengthPixels: 480,
  },
  save: {
    storageKey: 'magicDefense.bestWave',
  },
  font: {
    family: '"Noto Sans KR", system-ui, sans-serif',
  },
};
