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
import { HeroStore } from '../core/heroStore.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.stageIndex = data?.stageIndex ?? 0;
    this.stage = GAME_CONFIG.stages[this.stageIndex];
    const difficultyId = data?.difficultyId ?? GAME_CONFIG.defaultDifficultyId;
    this.difficulty = GAME_CONFIG.difficulties.find(d => d.id === difficultyId)
      ?? GAME_CONFIG.difficulties.find(d => d.id === GAME_CONFIG.defaultDifficultyId);
  }

  create() {
    this.isGameOver = false;
    // 적 HP = 스테이지 기본 배수 × 선택 난이도 배수.
    this.hpMultiplier = this.stage.hpMultiplier * this.difficulty.hpMultiplier;
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

    // Home button (top-left of status bar)
    const homeBtn = this.add.rectangle(50, STATUS_H / 2, 80, STATUS_H * 0.7, 0x555555)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);
    this.add.text(50, STATUS_H / 2, '홈', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(11);
    homeBtn.on('pointerup', () => {
      this.isGameOver = true;
      this.scene.start('TitleScene');
    });

    // Lane area — background/banner fixed to this stage's map
    this.add.rectangle(0, STATUS_H, w, LANE_H, 0x3a2818).setOrigin(0);
    this.enemyLane = new EnemyLane();
    this.laneView = new LaneView(this, 0, STATUS_H, w, LANE_H, this.enemyLane);
    if (this.stage.stripes) {
      this.laneView.setLaneColors(this.stage.stripes);
    } else {
      this.laneView.setBackgroundColor(this.stage.color);
    }

    // Stage/map name banner (over top of lane area)
    this.zoneText = this.add.text(w / 2, STATUS_H + 6, `${this.stage.name} · ${this.difficulty.name}`, {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5, 0);

    // Board area
    this.add.rectangle(0, STATUS_H + LANE_H, w, BOARD_H, 0x1a2540).setOrigin(0);
    this.board = new MergeBoard();
    this.boardView = new BoardView(this, 0, STATUS_H + LANE_H, w, BOARD_H, this.board);
    this.boardView.refreshAll();

    this.attackResolver = new AttackResolver(this.board, this.enemyLane);

    this.waveManager = new WaveManager(this.stage.tier);
    this.waveManager.start();
    this.hp = GAME_CONFIG.player.startHp;
    this.statusBar.setHp(this.hp);
    this.statusBar.setWave(this.waveManager.getCurrentWave());

    // Action bar
    this.actionBar = new ActionBarView(this, 0, STATUS_H + LANE_H + BOARD_H, w, ACTION_H);
    const stageGold = this.stage.tier === 'hell' ? GAME_CONFIG.hellMode.goldMultiplier : 1;
    const goldMultiplier = stageGold * this.difficulty.goldMultiplier;
    this.economy = new EconomyManager(goldMultiplier);
    this.statusBar.setGold(this.economy.getGold());
    this.actionBar.setSummonCost(this.economy.getSummonCost());

    this.actionBar.onSummon = () => this.handleSummon();
    this.speedMultiplier = 1;
    this.actionBar.onSpeedToggle = () => {
      const next = { 1: 2, 2: 4, 4: 8, 8: 16, 16: 1 };
      this.speedMultiplier = next[this.speedMultiplier] ?? 1;
      this.actionBar.setSpeed(this.speedMultiplier);
    };

    this.input.on('dragstart', (_pointer, obj) => {
      const fromCol = obj.getData('col');
      const fromRow = obj.getData('row');
      const m = this.board.getMageAt(fromCol, fromRow);
      if (m) this.actionBar.setSellPreview(this.economy.getSellValue(m.level));
    });

    this.input.on('drag', (_pointer, obj, x, y) => {
      obj.x = x;
      obj.y = y;
    });

    this.input.on('dragend', (_pointer, obj) => {
      this.actionBar.clearSellPreview();
      const fromCol = obj.getData('col');
      const fromRow = obj.getData('row');

      // Drop on sell zone?
      if (this.actionBar.isPointInSellZone(obj.x, obj.y)) {
        const m = this.board.getMageAt(fromCol, fromRow);
        if (m) {
          const refund = this.economy.sellMage(m.level);
          this.board.removeMage(fromCol, fromRow);
          this.statusBar.setGold(this.economy.getGold());
          // floating +Gold text near sell button
          const sx = this.actionBar.sellArea.x;
          const sy = this.actionBar.sellArea.y;
          const t = this.add.text(sx, sy - 30, `+${refund}G`, {
            fontFamily: GAME_CONFIG.font.family,
            fontSize: '28px', fontStyle: 'bold',
            color: '#ffd700', stroke: '#000000', strokeThickness: 4,
          }).setOrigin(0.5).setDepth(100);
          this.tweens.add({
            targets: t, y: sy - 80, alpha: 0, duration: 700,
            onComplete: () => t.destroy(),
          });
          this.boardView.refreshAll();
          this.actionBar.setSummonEnabled(this.economy.canSummon() && this.board.getEmptyCells().length > 0);
          return;
        }
      }

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
    // 소환 풀 = 내 파티 영웅들의 클래스 (파티가 비면 일반 영웅으로 폴백)
    const ids = HeroStore.getBattleClassIds();
    if (ids.length === 0) return;
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
      if (spawn.typeId === 'BOSS') this._showBossBanner();
      this.enemyLane.spawn(new Enemy(spawn.typeId, spawn.wave, spawn.lane, this.hpMultiplier));
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
    for (const tick of laneResult.ticks) {
      const w = this.laneView.laneToWorld(tick.enemy.lane, tick.enemy.position);
      this._showPoisonTickText(w.x, w.y, tick.damage);
    }
    for (const reached of laneResult.reached) {
      this.hp -= reached.config.baseDamage;
      this.statusBar.setHp(Math.max(0, this.hp));
      if (this.hp <= 0) {
        this.triggerGameOver();
        return;
      }
    }
    for (const killed of laneResult.killed) {
      this.economy.rewardKill();
      // 마지막(50웨이브) 보스를 잡으면 스테이지 클리어. 그 전 보스는 그냥 처치.
      if (killed.typeId === 'BOSS' &&
          this.waveManager.getCurrentWave() >= GAME_CONFIG.wave.stageClearWave) {
        this._triggerVictory();
        return;
      }
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

    const colorHex = atk.mage?.config.color ?? '#ffffff';
    const color = parseInt(colorHex.replace('#', ''), 16);
    const level = atk.mage?.level ?? 1;
    const tier = level >= 5 ? 'transcendent' : level >= 4 ? 'mythic' : 'normal';
    const radius = tier === 'transcendent' ? 24 : tier === 'mythic' ? 18 : 9;

    this._spawnProjectile(from.x, from.y, toWorld.x, toWorld.y, color, radius, () => {
      this._showDamageText(toWorld.x, toWorld.y, atk.primaryDamage, tier);
    });
    for (const sec of atk.secondaryTargets) {
      const sw = this.laneView.laneToWorld(sec.enemy.lane, sec.enemy.position);
      this._spawnProjectile(toWorld.x, toWorld.y, sw.x, sw.y, color, Math.max(5, Math.round(radius * 0.7)), () => {
        this._showDamageText(sw.x, sw.y, sec.damage, tier);
      });
    }
  }

  _spawnProjectile(x0, y0, x1, y1, color, radius, onArrive) {
    const ball = this.add.circle(x0, y0, radius, color);
    ball.setStrokeStyle(2, 0xffffff, 0.85);
    this.tweens.add({
      targets: ball,
      x: x1, y: y1,
      duration: 200,
      ease: 'Quad.out',
      onComplete: () => {
        ball.destroy();
        if (onArrive) onArrive();
      },
    });
  }

  _showPoisonTickText(x, y, damage) {
    const text = this.add.text(x, y - 14, String(Math.round(damage)), {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#9be38a',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 600,
      ease: 'Quad.out',
      onComplete: () => text.destroy(),
    });
  }

  _showDamageText(x, y, damage, tier = 'normal') {
    const styleByTier = {
      transcendent: { size: '46px', color: '#ff6cff' },
      mythic:       { size: '36px', color: '#ffd700' },
      normal:       { size: '26px', color: '#ffffff' },
    };
    const s = styleByTier[tier] ?? styleByTier.normal;
    const text = this.add.text(x, y - 20, String(Math.round(damage)), {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: s.size,
      fontStyle: 'bold',
      color: s.color,
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({
      targets: text,
      y: y - 70,
      alpha: 0,
      duration: 700,
      ease: 'Quad.out',
      onComplete: () => text.destroy(),
    });
  }

  _showBossBanner() {
    const w = this.scale.width;
    const h = this.scale.height;
    const text = this.add.text(w / 2, h * 0.35, '⚠ BOSS WAVE ⚠', {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#ff3344',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(1000).setAlpha(0);
    this.tweens.add({
      targets: text,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 1500,
      onComplete: () => text.destroy(),
    });
  }

  _triggerVictory() {
    this.isGameOver = true;
    this.scene.start('GameOverScene', {
      wave: this.waveManager.getCurrentWave(),
      isVictory: true,
      stageIndex: this.stageIndex,
      difficultyId: this.difficulty.id,
    });
  }

  triggerGameOver() {
    this.isGameOver = true;
    this.scene.start('GameOverScene', {
      wave: this.waveManager.getCurrentWave(),
      stageIndex: this.stageIndex,
      difficultyId: this.difficulty.id,
    });
  }
}
