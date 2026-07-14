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
    const { levelDamageStep, mythicDamageStep, transcendentDamageStep, rarityDamageMultiplier } = GAME_CONFIG.mage;
    let mult = 1;
    for (let lv = 2; lv <= this.level; lv++) {
      let step = levelDamageStep;
      if (lv === 4) step = mythicDamageStep;
      else if (lv === 5) step = transcendentDamageStep;
      mult *= step;
    }
    // 등급 배수 — 높은 등급 영웅일수록 기본 데미지가 확실히 세다.
    const rarityMult = rarityDamageMultiplier?.[this.config.rarity] ?? 1;
    return this.config.damage * mult * rarityMult;
  }

  getAttackIntervalMs() {
    const { levelAttackSpeedMultiplier } = GAME_CONFIG.mage;
    const atkPerSec = this.config.atkPerSec * Math.pow(levelAttackSpeedMultiplier, this.level - 1);
    return 1000 / atkPerSec;
  }
}
