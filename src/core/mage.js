import { GAME_CONFIG } from '../config/gameConfig.js';

export class Mage {
  constructor(classId, level) {
    const config = GAME_CONFIG.classes[classId];
    if (!config) {
      throw new Error(`Unknown mage class: ${classId}`);
    }
    this.classId = classId;
    this.level = level;
    this.config = config;
    this.lastAttackAt = 0;
  }

  getDamage() {
    const { levelDamageMultiplier } = GAME_CONFIG.mage;
    return this.config.damage * Math.pow(levelDamageMultiplier, this.level - 1);
  }

  getAttackIntervalMs() {
    const { levelAttackSpeedMultiplier } = GAME_CONFIG.mage;
    const atkPerSec = this.config.atkPerSec * Math.pow(levelAttackSpeedMultiplier, this.level - 1);
    return 1000 / atkPerSec;
  }
}
