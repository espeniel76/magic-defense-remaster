import { GAME_CONFIG } from '../config/gameConfig.js';

export class WaveManager {
  constructor(mode = 'normal') {
    this.mode = mode;
    this.currentWave = 0;
    this.spawnsLeft = 0;
    this.spawnedThisWave = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 0;
    this.intermission = false;
    this.intermissionTimer = 0;
    this.enemiesCleared = false;
    this.recentLaneHistory = [];
    this.started = false;
  }

  start() {
    this.started = true;
    this.startNextWave();
  }

  startNextWave() {
    this.currentWave += 1;
    const cfg = GAME_CONFIG.wave;
    const isBoss = this.isBossWave(this.currentWave);
    if (isBoss) {
      this.spawnsLeft = 1; // single boss for boss waves
    } else {
      this.spawnsLeft = cfg.baseCount + (this.currentWave - 1) * cfg.countIncrement;
    }
    this.spawnedThisWave = 0;
    this.spawnInterval = Math.max(
      cfg.minSpawnInterval,
      cfg.baseSpawnInterval - (this.currentWave - 1) * cfg.spawnIntervalDecrement
    );
    this.spawnTimer = this.spawnInterval;
    this.intermission = false;
    this.intermissionTimer = 0;
    this.enemiesCleared = false;
  }

  isInIntermission() {
    return this.intermission;
  }

  getCurrentWave() {
    return this.currentWave;
  }

  notifyEnemiesCleared() {
    this.enemiesCleared = true;
  }

  computeSkeletonRatio(wave) {
    const cfg = GAME_CONFIG.wave;
    if (wave >= cfg.skeletonMidWave) return cfg.skeletonMidRatio;
    if (wave >= cfg.skeletonStartWave) return cfg.skeletonStartRatio;
    return 0;
  }

  pickLane() {
    const cfg = GAME_CONFIG.wave;
    const laneCount = GAME_CONFIG.lanes.count;
    let lane;
    let attempts = 0;
    do {
      lane = Math.floor(Math.random() * laneCount);
      attempts += 1;
      if (attempts > 10) break;
    } while (this.recentLaneHistory.length >= cfg.maxConsecutiveSameLane &&
             this.recentLaneHistory.slice(-cfg.maxConsecutiveSameLane).every(l => l === lane));
    this.recentLaneHistory.push(lane);
    if (this.recentLaneHistory.length > cfg.maxConsecutiveSameLane + 1) {
      this.recentLaneHistory.shift();
    }
    return lane;
  }

  isBossWave(wave) {
    const interval = GAME_CONFIG.wave.bossInterval;
    return wave > 0 && wave % interval === 0;
  }

  pickType() {
    if (this.isBossWave(this.currentWave)) return 'BOSS';
    const specialMode = this.mode === 'hard' || this.mode === 'hell';
    if (specialMode && Math.random() < GAME_CONFIG.hardMode.eliteSpawnRatio) {
      // In hell mode, half the elite rolls become TITAN instead.
      if (this.mode === 'hell' && Math.random() < 0.5) return 'TITAN';
      return 'ELITE';
    }
    const ratio = this.computeSkeletonRatio(this.currentWave);
    return Math.random() < ratio ? 'SKELETON' : 'GOBLIN';
  }

  update(dtMs) {
    const result = { spawns: [], waveEnded: false, waveStarted: false };
    if (!this.started) return result;

    if (this.intermission) {
      if (this.enemiesCleared) {
        this.intermissionTimer += dtMs;
        if (this.intermissionTimer >= GAME_CONFIG.wave.intermissionMs) {
          this.startNextWave();
          result.waveStarted = true;
        }
      }
      return result;
    }

    if (this.spawnsLeft <= 0) {
      this.intermission = true;
      result.waveEnded = true;
      return result;
    }

    this.spawnTimer += dtMs;
    while (this.spawnTimer >= this.spawnInterval && this.spawnsLeft > 0) {
      this.spawnTimer -= this.spawnInterval;
      const typeId = this.pickType();
      const lane = (typeId === 'BOSS')
        ? Math.floor(GAME_CONFIG.lanes.count / 2)  // middle lane for boss
        : this.pickLane();
      result.spawns.push({ typeId, lane, wave: this.currentWave });
      this.spawnsLeft -= 1;
      this.spawnedThisWave += 1;
    }

    if (this.spawnsLeft <= 0) {
      this.intermission = true;
      result.waveEnded = true;
    }

    return result;
  }
}
