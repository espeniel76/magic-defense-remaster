import { GAME_CONFIG } from '../config/gameConfig.js';

export class Enemy {
  constructor(typeId, wave, lane) {
    const config = GAME_CONFIG.enemies[typeId];
    if (!config) {
      throw new Error(`Unknown enemy type: ${typeId}`);
    }
    this.typeId = typeId;
    this.wave = wave;
    this.lane = lane;
    this.config = config;
    const hpScale = Math.pow(GAME_CONFIG.wave.hpScalePerWave, wave - 1);
    this.hp = config.hp * hpScale;
    this.maxHp = this.hp;
    this.position = 0; // 0..1 along lane
    this.slowFactor = 1;
    this.slowUntil = 0;
    this.stunUntil = 0;
    this.elapsedMs = 0;
  }

  isDead() {
    return this.hp <= 0;
  }

  takeDamage(amount) {
    this.hp -= amount;
  }

  applySlow(factor, durationMs) {
    if (factor < this.slowFactor) {
      this.slowFactor = factor;
    }
    const expireAt = this.elapsedMs + durationMs;
    if (expireAt > this.slowUntil) {
      this.slowUntil = expireAt;
    }
  }

  applyStun(durationMs) {
    const expireAt = this.elapsedMs + durationMs;
    if (expireAt > this.stunUntil) {
      this.stunUntil = expireAt;
    }
  }

  getCurrentSpeed() {
    if (this.elapsedMs < this.stunUntil) return 0;
    const slow = this.elapsedMs < this.slowUntil ? this.slowFactor : 1;
    return this.config.speed * slow;
  }

  update(dtMs) {
    this.elapsedMs += dtMs;
    // Reset slow if expired
    if (this.elapsedMs >= this.slowUntil) {
      this.slowFactor = 1;
    }
    const speed = this.getCurrentSpeed();
    const moveDistance = (speed * GAME_CONFIG.lane.enemyMoveDistancePerSecond * dtMs) / 1000;
    this.position += moveDistance / GAME_CONFIG.lane.laneLengthPixels;
    if (this.position > 1) this.position = 1;
  }
}
