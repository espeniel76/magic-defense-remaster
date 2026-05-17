import { GAME_CONFIG } from '../config/gameConfig.js';

export class EnemyLane {
  constructor() {
    this.laneCount = GAME_CONFIG.lanes.count;
    this.lanes = Array.from({ length: this.laneCount }, () => []);
  }

  spawn(enemy) {
    if (enemy.lane < 0 || enemy.lane >= this.laneCount) return;
    this.lanes[enemy.lane].push(enemy);
  }

  enemiesInLane(lane) {
    return this.lanes[lane] || [];
  }

  allEnemies() {
    return this.lanes.flat();
  }

  getFrontmostInLane(lane) {
    const list = this.enemiesInLane(lane);
    if (list.length === 0) return null;
    let best = list[0];
    for (const e of list) {
      if (e.position > best.position) best = e;
    }
    return best;
  }

  update(dtMs) {
    const reached = [];
    const killed = [];
    for (let i = 0; i < this.laneCount; i++) {
      const remaining = [];
      for (const e of this.lanes[i]) {
        e.update(dtMs);
        if (e.isDead()) {
          killed.push(e);
          continue;
        }
        if (e.position >= 1) {
          reached.push(e);
          continue;
        }
        remaining.push(e);
      }
      this.lanes[i] = remaining;
    }
    return { reached, killed };
  }
}
