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
    const { levelDamageStep, mythicDamageStep, transcendentDamageStep } = GAME_CONFIG.mage;
    let mult = 1;
    for (let lv = 2; lv <= this.level; lv++) {
      let step = levelDamageStep;
      if (lv === 4) step = mythicDamageStep;
      else if (lv === 5) step = transcendentDamageStep;
      mult *= step;
    }
    return this.config.damage * mult;
  }

  getAttackIntervalMs() {
    const { levelAttackSpeedMultiplier } = GAME_CONFIG.mage;
    const atkPerSec = this.config.atkPerSec * Math.pow(levelAttackSpeedMultiplier, this.level - 1);
    return 1000 / atkPerSec;
  }
}
