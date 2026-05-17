import { GAME_CONFIG } from '../config/gameConfig.js';

export class AttackResolver {
  constructor(board, lane) {
    this.board = board;
    this.lane = lane;
    this.elapsedMs = 0;
  }

  update(dtMs) {
    this.elapsedMs += dtMs;
    const attackEvents = [];
    for (const { mage, col } of this.board.allMages()) {
      const interval = mage.getAttackIntervalMs();
      if (this.elapsedMs - mage.lastAttackAt < interval) continue;
      const target = this.lane.getFrontmostOfAll();
      if (!target) continue;
      mage.lastAttackAt = this.elapsedMs;
      const damage = mage.getDamage();
      target.takeDamage(damage);
      const evt = { mageCol: col, primaryTarget: target, secondaryTargets: [], type: mage.config.effect };
      // Note on slow semantics: GAME_CONFIG.classes.ICE.slowFactor = 0.3 means
      // "slow the enemy by 30%", so the resulting speed multiplier is (1 - 0.3) = 0.7.
      // Enemy.applySlow(factor, durationMs) interprets factor as the speed multiplier itself.
      switch (mage.config.effect) {
        case 'single':
          break;
        case 'slow':
          target.applySlow(1 - mage.config.slowFactor, mage.config.slowDuration);
          break;
        case 'chain': {
          const chainDmg = Math.floor(damage * mage.config.chainDamageRatio);
          const others = this.lane.allEnemies().filter(e => e !== target && !e.isDead());
          others.sort((a, b) => this._distSq(target, a) - this._distSq(target, b));
          const chained = others.slice(0, mage.config.chainCount);
          for (const e of chained) {
            e.takeDamage(chainDmg);
            evt.secondaryTargets.push(e);
          }
          break;
        }
        case 'aoe': {
          const radius = mage.config.aoeRadius;
          const others = this.lane.allEnemies().filter(e => e !== target && !e.isDead());
          for (const e of others) {
            if (this._distLaneUnits(target, e) <= radius) {
              e.takeDamage(damage);
              e.applyStun(mage.config.stunDuration);
              evt.secondaryTargets.push(e);
            }
          }
          target.applyStun(mage.config.stunDuration);
          break;
        }
      }
      attackEvents.push(evt);
    }
    return attackEvents;
  }

  // lane-unit distance: 1 unit = 1 column or 1 quarter of lane length
  _distLaneUnits(a, b) {
    const dx = a.lane - b.lane;
    const dy = (a.position - b.position) * 4; // lane length ~ 4 units deep
    return Math.sqrt(dx * dx + dy * dy);
  }

  _distSq(a, b) {
    const dx = a.lane - b.lane;
    const dy = (a.position - b.position) * 4;
    return dx * dx + dy * dy;
  }
}
