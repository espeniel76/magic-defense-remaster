import { GAME_CONFIG } from '../config/gameConfig.js';

export class EconomyManager {
  constructor() {
    this.gold = GAME_CONFIG.player.startGold;
    this.goldAccumulator = 0;
    this.summonCount = 0;
  }

  getGold() {
    return this.gold;
  }

  getSummonCost() {
    return GAME_CONFIG.summon.baseCost + this.summonCount * GAME_CONFIG.summon.costIncrement;
  }

  canSummon() {
    return this.gold >= this.getSummonCost();
  }

  spendSummon() {
    const cost = this.getSummonCost();
    if (this.gold < cost) return false;
    this.gold -= cost;
    this.summonCount += 1;
    return true;
  }

  rewardKill() {
    this.gold += GAME_CONFIG.player.goldPerKill;
  }

  update(dtMs) {
    this.goldAccumulator += (GAME_CONFIG.player.goldPerSecond * dtMs) / 1000;
    const whole = Math.floor(this.goldAccumulator);
    if (whole > 0) {
      this.gold += whole;
      this.goldAccumulator -= whole;
    }
  }
}
