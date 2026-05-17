import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { StatusBarView } from '../render/statusBarView.js';
import { MergeBoard } from '../core/mergeBoard.js';
import { BoardView } from '../render/boardView.js';
import { ActionBarView } from '../render/actionBarView.js';
import { EconomyManager } from '../core/economyManager.js';
import { Mage } from '../core/mage.js';
import { EnemyLane } from '../core/enemyLane.js';
import { LaneView } from '../render/laneView.js';
import { Enemy } from '../core/enemy.js';
import { WaveManager } from '../core/waveManager.js';
import { AttackResolver } from '../core/attackResolver.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.isGameOver = false;
    const w = this.scale.width;
    const h = this.scale.height;

    const STATUS_H = Math.round(h * 0.08);
    const LANE_H = Math.round(h * 0.40);
    const BOARD_H = Math.round(h * 0.40);
    const ACTION_H = h - STATUS_H - LANE_H - BOARD_H;

    this.statusBar = new StatusBarView(this, 0, 0, w, STATUS_H);
    this.statusBar.setHp(GAME_CONFIG.player.startHp);
    this.statusBar.setWave(1);
    this.statusBar.setGold(GAME_CONFIG.player.startGold);

    // Lane area
    this.add.rectangle(0, STATUS_H, w, LANE_H, 0x3a2818).setOrigin(0);
    this.enemyLane = new EnemyLane();
    this.laneView = new LaneView(this, 0, STATUS_H, w, LANE_H, this.enemyLane);

    // Board area
    this.add.rectangle(0, STATUS_H + LANE_H, w, BOARD_H, 0x1a2540).setOrigin(0);
    this.board = new MergeBoard();
    this.boardView = new BoardView(this, 0, STATUS_H + LANE_H, w, BOARD_H, this.board);
    this.boardView.refreshAll();

    this.attackResolver = new AttackResolver(this.board, this.enemyLane);

    this.waveManager = new WaveManager();
    this.waveManager.start();
    this.hp = GAME_CONFIG.player.startHp;
    this.statusBar.setHp(this.hp);
    this.statusBar.setWave(this.waveManager.getCurrentWave());

    // Action bar
    this.actionBar = new ActionBarView(this, 0, STATUS_H + LANE_H + BOARD_H, w, ACTION_H);
    this.economy = new EconomyManager();
    this.statusBar.setGold(this.economy.getGold());
    this.actionBar.setSummonCost(this.economy.getSummonCost());

    this.actionBar.onSummon = () => this.handleSummon();
    this.speedMultiplier = 1;
    this.actionBar.onSpeedToggle = () => {
      this.speedMultiplier = this.speedMultiplier === 1 ? 2 : 1;
      this.actionBar.setSpeed(this.speedMultiplier);
    };

    this.input.on('drag', (_pointer, obj, x, y) => {
      obj.x = x;
      obj.y = y;
    });

    this.input.on('dragend', (_pointer, obj) => {
      const fromCol = obj.getData('col');
      const fromRow = obj.getData('row');
      const target = this.boardView.getCellAt(obj.x, obj.y);
      if (!target) {
        this.boardView.refreshAll();
        return;
      }
      if (target.col === fromCol && target.row === fromRow) {
        this.boardView.refreshAll();
        return;
      }
      const targetMage = this.board.getMageAt(target.col, target.row);
      if (targetMage === null) {
        this.board.moveMage(fromCol, fromRow, target.col, target.row);
      } else {
        const merge = this.board.tryMerge(fromCol, fromRow, target.col, target.row);
        if (merge.ok) {
          // brief scale pulse on target cell
          const center = this.boardView.getCellCenter(target.col, target.row);
          const pulse = this.add.circle(center.x, center.y, 50, 0xffd700, 0.6);
          this.tweens.add({
            targets: pulse, alpha: 0, scale: 2, duration: 300,
            onComplete: () => pulse.destroy(),
          });
        }
      }
      this.boardView.refreshAll();
      this.actionBar.setSummonEnabled(this.economy.canSummon() && this.board.getEmptyCells().length > 0);
    });
  }

  handleSummon() {
    if (!this.economy.canSummon() || this.board.getEmptyCells().length === 0) {
      // shake the summon button
      const btn = this.actionBar.summonBg;
      const originalX = btn.x;
      this.tweens.add({
        targets: btn, x: originalX + 6, duration: 50, yoyo: true, repeat: 3,
        onComplete: () => { btn.x = originalX; },
      });
      return;
    }
    const ids = ['FIRE', 'ICE', 'LIGHTNING', 'EARTH'];
    const pick = ids[Math.floor(Math.random() * ids.length)];
    const mage = new Mage(pick, 1);
    const cell = this.board.placeAtRandomEmpty(mage);
    if (!cell) return;
    this.economy.spendSummon();
    this.statusBar.setGold(this.economy.getGold());
    this.actionBar.setSummonCost(this.economy.getSummonCost());
    this.actionBar.setSummonEnabled(this.economy.canSummon() && this.board.getEmptyCells().length > 0);
    this.boardView.refreshAll();
  }

  update(_time, dtMs) {
    if (this.isGameOver) return;
    const effectiveDt = dtMs * this.speedMultiplier;
    this.economy.update(effectiveDt);

    // Wave: spawn enemies
    const wave = this.waveManager.update(effectiveDt);
    for (const spawn of wave.spawns) {
      this.enemyLane.spawn(new Enemy(spawn.typeId, spawn.wave, spawn.lane));
    }
    if (wave.waveStarted) {
      this.statusBar.setWave(this.waveManager.getCurrentWave());
    }

    // Mage attacks
    const attacks = this.attackResolver.update(effectiveDt);
    for (const atk of attacks) {
      this._renderAttackFx(atk);
    }

    // Enemy movement and base reach
    const laneResult = this.enemyLane.update(effectiveDt);
    for (const reached of laneResult.reached) {
      this.hp -= reached.config.baseDamage;
      this.statusBar.setHp(Math.max(0, this.hp));
      if (this.hp <= 0) {
        this.triggerGameOver();
        return;
      }
    }
    for (const _killed of laneResult.killed) {
      this.economy.rewardKill();
    }

    // Notify wave manager when no enemies remain (for intermission)
    if (this.waveManager.isInIntermission() && this.enemyLane.allEnemies().length === 0) {
      this.waveManager.notifyEnemiesCleared();
    }

    this.laneView.refresh();
    this.statusBar.setGold(this.economy.getGold());
    this.actionBar.setSummonEnabled(this.economy.canSummon() && this.board.getEmptyCells().length > 0);
  }

  _renderAttackFx(atk) {
    const fromCells = this.board.magesInColumn(atk.mageCol);
    if (fromCells.length === 0) return;
    const from = this.boardView.getCellCenter(fromCells[0].col, fromCells[0].row);
    if (!from) return;
    const toWorld = this.laneView.laneToWorld(atk.primaryTarget.lane, atk.primaryTarget.position);
    const colorMap = {
      single: 0xe74c3c, slow: 0x5dade2, chain: 0xf4d03f, aoe: 0xa0522d,
    };
    const color = colorMap[atk.type] ?? 0xffffff;
    const line = this.add.line(0, 0, from.x, from.y, toWorld.x, toWorld.y, color, 0.9)
      .setOrigin(0, 0)
      .setLineWidth(3);
    this.tweens.add({ targets: line, alpha: 0, duration: 200, onComplete: () => line.destroy() });

    for (const sec of atk.secondaryTargets) {
      const sw = this.laneView.laneToWorld(sec.lane, sec.position);
      const l2 = this.add.line(0, 0, toWorld.x, toWorld.y, sw.x, sw.y, color, 0.7).setOrigin(0,0).setLineWidth(2);
      this.tweens.add({ targets: l2, alpha: 0, duration: 200, onComplete: () => l2.destroy() });
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    this.scene.start('GameOverScene', { wave: this.waveManager.getCurrentWave() });
  }
}
