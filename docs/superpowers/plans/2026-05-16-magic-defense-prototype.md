# 매직디펜스 프로토타입 구현 계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phaser 3 + Vite로 머지(합치기)형 마법 디펜스 모바일 프로토타입을 구현해, PC 브라우저와 안드로이드 크롬 모두에서 플레이 가능하게 만든다.

**Architecture:** 게임 로직(순수 함수/데이터 모델)과 렌더링(Phaser Scene/Sprite)을 분리한다. 순수 로직은 Vitest로 단위 테스트하고, Phaser 의존 코드는 브라우저에서 수동 검증한다. 모듈 간 통신은 Phaser의 EventEmitter를 사용.

**Tech Stack:** Node.js 20+, Phaser 3.88, Vite 5, Vitest 2, vanilla JavaScript (ES2022)

**Spec:** [docs/superpowers/specs/2026-05-16-magic-defense-design.md](../specs/2026-05-16-magic-defense-design.md)

---

## 파일 구조

```
매직디펜스/
├── index.html                       # HTML 엔트리
├── package.json                     # npm scripts + 의존성
├── vite.config.js                   # Vite 설정 (host 노출)
├── vitest.config.js                 # Vitest 설정
├── .gitignore
├── README.md                        # (기존 파일 — 건드리지 않음)
├── docs/superpowers/                # (기존 — 건드리지 않음)
├── src/
│   ├── main.js                      # Phaser 게임 인스턴스 생성
│   ├── config/
│   │   └── gameConfig.js            # 모든 밸런스 수치
│   ├── core/                        # ★ 순수 로직 (Phaser 의존 없음)
│   │   ├── mage.js                  # Mage 클래스
│   │   ├── enemy.js                 # Enemy 클래스
│   │   ├── mergeBoard.js            # 보드 상태 + 머지 규칙
│   │   ├── enemyLane.js             # 4개 레인 상태
│   │   ├── economyManager.js        # 골드 관리
│   │   ├── waveManager.js           # 웨이브/스폰 스케줄
│   │   ├── attackResolver.js        # 데미지·효과 계산
│   │   └── saveStore.js             # localStorage 래퍼
│   ├── scenes/
│   │   ├── titleScene.js            # 타이틀 화면
│   │   ├── gameScene.js             # 메인 게임 화면
│   │   └── gameOverScene.js         # 게임 오버 화면
│   ├── render/                      # ★ Phaser 시각화 레이어
│   │   ├── boardView.js             # 머지 보드 그리기 + 드래그
│   │   ├── laneView.js              # 적 레인 그리기
│   │   ├── statusBarView.js         # 상태바
│   │   └── actionBarView.js         # 액션바 (소환·속도 버튼)
│   └── events.js                    # 이벤트 이름 상수
└── tests/
    ├── mage.test.js
    ├── enemy.test.js
    ├── mergeBoard.test.js
    ├── enemyLane.test.js
    ├── economyManager.test.js
    ├── waveManager.test.js
    ├── attackResolver.test.js
    └── saveStore.test.js
```

**핵심 분리 원칙:**
- `core/` — Phaser 의존 없음, 100% 순수 로직, Vitest로 테스트
- `render/` — Phaser Scene/Sprite, `core/` 모듈을 받아서 시각화만 담당
- `scenes/` — Phaser Scene 클래스, `core/`와 `render/`를 조립

---

## Phase 0: 환경 셋업

### Task 0.1: Git 초기화 + .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: git 저장소 초기화**

```bash
git init
git config core.autocrlf false
```

Expected: `Initialized empty Git repository in c:/Users/Administrator/git/매직디펜스/.git/`

- [ ] **Step 2: .gitignore 작성**

```
node_modules/
dist/
.vite/
.DS_Store
*.log
.superpowers/
```

- [ ] **Step 3: 첫 커밋 (기존 파일들 보존)**

```bash
git add .gitignore README.md docs/
git commit -m "chore: initial commit with spec and plan"
```

---

### Task 0.2: npm 프로젝트 + 의존성 설치

**Files:**
- Create: `package.json`

- [ ] **Step 1: package.json 작성**

```json
{
  "name": "magic-defense",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Phaser, Vite, Vitest 설치**

```bash
npm install phaser@^3.88.0
npm install -D vite@^5.4.0 vitest@^2.1.0 jsdom@^25.0.0
```

Expected: `node_modules/` 생성, `package-lock.json` 생성, 콘솔에 4개 패키지 added 메시지.

- [ ] **Step 3: 설치 확인**

```bash
node -e "console.log(require('./package.json').dependencies)"
```

Expected: phaser 버전이 표시됨.

- [ ] **Step 4: 커밋**

```bash
git add package.json package-lock.json
git commit -m "chore: install phaser, vite, vitest"
```

---

### Task 0.3: Vite 설정 (폰에서 접속 가능하게 host 노출)

**Files:**
- Create: `vite.config.js`

- [ ] **Step 1: vite.config.js 작성**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    target: 'es2022',
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add vite.config.js
git commit -m "chore: vite config with network host exposed"
```

---

### Task 0.4: Vitest 설정

**Files:**
- Create: `vitest.config.js`

- [ ] **Step 1: vitest.config.js 작성**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['tests/**/*.test.js'],
  },
});
```

- [ ] **Step 2: 커밋**

```bash
git add vitest.config.js
git commit -m "chore: vitest config with jsdom"
```

---

### Task 0.5: 최소 동작하는 Phaser 빈 화면

**Files:**
- Create: `index.html`
- Create: `src/main.js`

- [ ] **Step 1: index.html 작성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <title>매직디펜스</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #0f1419;
      overflow: hidden;
      touch-action: none;
    }
    #game {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div id="game"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: src/main.js 작성 (Phaser 게임만 띄우기)**

```js
import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0f1419',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 1280,
  },
  scene: {
    create() {
      this.add.text(360, 640, '매직디펜스', {
        fontSize: '64px',
        color: '#ffffff',
      }).setOrigin(0.5);
    },
  },
};

new Phaser.Game(config);
```

- [ ] **Step 3: 개발 서버 실행 및 수동 확인**

```bash
npm run dev
```

Expected: `Local: http://localhost:5173/` 와 `Network: http://192.168.x.x:5173/` 표시.

브라우저로 `http://localhost:5173/` 접속 → 검정 배경에 "매직디펜스" 텍스트가 가운데 보여야 함. 폰 크롬으로 Network URL 접속해도 동일하게 보여야 함.

- [ ] **Step 4: 서버 중지 후 커밋**

Ctrl+C로 dev 서버 중지.

```bash
git add index.html src/main.js
git commit -m "feat: initial phaser scene with title text"
```

---

## Phase 1: Config (밸런스 수치 한 곳에 모음)

### Task 1.1: gameConfig.js 작성

**Files:**
- Create: `src/config/gameConfig.js`

- [ ] **Step 1: gameConfig.js 작성**

```js
export const GAME_CONFIG = {
  display: {
    width: 720,
    height: 1280,
  },
  board: {
    cols: 4,
    rows: 4,
  },
  lanes: {
    count: 4,
  },
  player: {
    startHp: 20,
    startGold: 100,
    goldPerSecond: 2,
    goldPerKill: 1,
  },
  summon: {
    baseCost: 50,
    costIncrement: 5,
  },
  mage: {
    maxLevel: 5,
    levelDamageMultiplier: 2,
    levelAttackSpeedMultiplier: 1.1,
  },
  classes: {
    FIRE:      { id: 'FIRE',      emoji: '🔥',  color: '#e74c3c', damage: 10, atkPerSec: 1.0,  effect: 'single' },
    ICE:       { id: 'ICE',       emoji: '❄️',  color: '#5dade2', damage: 5,  atkPerSec: 1.5,  effect: 'slow',  slowFactor: 0.3, slowDuration: 2000 },
    LIGHTNING: { id: 'LIGHTNING', emoji: '⚡',  color: '#f4d03f', damage: 4,  atkPerSec: 1.2,  effect: 'chain', chainCount: 2, chainDamageRatio: 0.5 },
    EARTH:     { id: 'EARTH',     emoji: '🌍',  color: '#a0522d', damage: 3,  atkPerSec: 1.5,  effect: 'aoe',   aoeRadius: 1.5, stunDuration: 500 },
  },
  enemies: {
    GOBLIN:   { id: 'GOBLIN',   emoji: '👹', hp: 20, speed: 1.0, baseDamage: 1 },
    SKELETON: { id: 'SKELETON', emoji: '💀', hp: 10, speed: 2.0, baseDamage: 1 },
  },
  wave: {
    baseCount: 10,
    countIncrement: 2,
    baseSpawnInterval: 1500,
    spawnIntervalDecrement: 50,
    minSpawnInterval: 400,
    intermissionMs: 5000,
    hpScalePerWave: 1.15,
    skeletonStartWave: 5,
    skeletonStartRatio: 0.3,
    skeletonMidWave: 10,
    skeletonMidRatio: 0.5,
    maxConsecutiveSameLane: 3,
  },
  lane: {
    enemyMoveDistancePerSecond: 120,
    laneLengthPixels: 480,
  },
  save: {
    storageKey: 'magicDefense.bestWave',
  },
};
```

- [ ] **Step 2: 커밋**

```bash
git add src/config/gameConfig.js
git commit -m "feat: game config with all balance numbers"
```

---

## Phase 2: 순수 로직 모듈 (TDD)

### Task 2.1: events.js — 이벤트 이름 상수

**Files:**
- Create: `src/events.js`

- [ ] **Step 1: events.js 작성**

```js
export const EVENTS = {
  ENEMY_REACHED_BASE: 'enemy:reached-base',
  ENEMY_KILLED: 'enemy:killed',
  MAGE_SUMMONED: 'mage:summoned',
  MAGE_MERGED: 'mage:merged',
  MAGE_ATTACKED: 'mage:attacked',
  WAVE_STARTED: 'wave:started',
  WAVE_ENDED: 'wave:ended',
  GAME_OVER: 'game:over',
  GOLD_CHANGED: 'gold:changed',
  HP_CHANGED: 'hp:changed',
};
```

- [ ] **Step 2: 커밋**

```bash
git add src/events.js
git commit -m "feat: event name constants"
```

---

### Task 2.2: Mage 엔티티 (TDD)

**Files:**
- Create: `tests/mage.test.js`
- Create: `src/core/mage.js`

- [ ] **Step 1: 실패 테스트 작성**

```js
// tests/mage.test.js
import { describe, it, expect } from 'vitest';
import { Mage } from '../src/core/mage.js';
import { GAME_CONFIG } from '../src/config/gameConfig.js';

describe('Mage', () => {
  it('creates a Lv1 mage of given class', () => {
    const m = new Mage('FIRE', 1);
    expect(m.classId).toBe('FIRE');
    expect(m.level).toBe(1);
  });

  it('calculates damage based on level multiplier', () => {
    const base = GAME_CONFIG.classes.FIRE.damage;
    const lv1 = new Mage('FIRE', 1);
    const lv3 = new Mage('FIRE', 3);
    expect(lv1.getDamage()).toBe(base);
    expect(lv3.getDamage()).toBe(base * 2 * 2); // lv3 = base * 2^(3-1)
  });

  it('calculates attack interval based on attack speed multiplier', () => {
    const lv1 = new Mage('FIRE', 1);
    const lv2 = new Mage('FIRE', 2);
    expect(lv1.getAttackIntervalMs()).toBeCloseTo(1000); // 1.0 atk/sec
    expect(lv2.getAttackIntervalMs()).toBeCloseTo(1000 / 1.1);
  });

  it('exposes the class config', () => {
    const m = new Mage('ICE', 1);
    expect(m.config.emoji).toBe('❄️');
    expect(m.config.effect).toBe('slow');
  });

  it('throws on unknown class', () => {
    expect(() => new Mage('UNKNOWN', 1)).toThrow();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

```bash
npm run test
```

Expected: 5개 테스트 모두 FAIL — "Cannot find module '../src/core/mage.js'" 또는 유사한 에러.

- [ ] **Step 3: src/core/mage.js 구현**

```js
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
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test
```

Expected: 5개 테스트 모두 PASS.

- [ ] **Step 5: 커밋**

```bash
git add tests/mage.test.js src/core/mage.js
git commit -m "feat: Mage entity with damage/interval calculation"
```

---

### Task 2.3: Enemy 엔티티 (TDD)

**Files:**
- Create: `tests/enemy.test.js`
- Create: `src/core/enemy.js`

- [ ] **Step 1: 실패 테스트 작성**

```js
// tests/enemy.test.js
import { describe, it, expect } from 'vitest';
import { Enemy } from '../src/core/enemy.js';

describe('Enemy', () => {
  it('creates an enemy with base hp/speed scaled by wave', () => {
    const e = new Enemy('GOBLIN', 1, 0); // wave 1, lane 0
    expect(e.typeId).toBe('GOBLIN');
    expect(e.lane).toBe(0);
    expect(e.hp).toBeGreaterThan(0);
    expect(e.isDead()).toBe(false);
  });

  it('scales hp by wave multiplier 1.15', () => {
    const w1 = new Enemy('GOBLIN', 1, 0);
    const w5 = new Enemy('GOBLIN', 5, 0);
    expect(w5.hp).toBeCloseTo(w1.hp * Math.pow(1.15, 4));
  });

  it('takes damage and marks dead at 0 hp', () => {
    const e = new Enemy('SKELETON', 1, 1);
    const initialHp = e.hp;
    e.takeDamage(initialHp - 1);
    expect(e.isDead()).toBe(false);
    e.takeDamage(2);
    expect(e.isDead()).toBe(true);
  });

  it('starts at position 0 and advances when updated', () => {
    const e = new Enemy('GOBLIN', 1, 0);
    expect(e.position).toBe(0);
    e.update(1000); // 1 second
    expect(e.position).toBeGreaterThan(0);
  });

  it('applies slow effect that wears off after duration', () => {
    const e = new Enemy('GOBLIN', 1, 0);
    const baseSpeed = e.getCurrentSpeed();
    e.applySlow(0.5, 1000);
    expect(e.getCurrentSpeed()).toBeCloseTo(baseSpeed * 0.5);
    e.update(1001);
    expect(e.getCurrentSpeed()).toBeCloseTo(baseSpeed);
  });

  it('stuns enemy (speed = 0) for given duration', () => {
    const e = new Enemy('GOBLIN', 1, 0);
    e.applyStun(500);
    expect(e.getCurrentSpeed()).toBe(0);
    e.update(501);
    expect(e.getCurrentSpeed()).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

```bash
npm run test
```

Expected: 모두 FAIL.

- [ ] **Step 3: src/core/enemy.js 구현**

```js
import { GAME_CONFIG } from '../config/gameConfig.js';

export class Enemy {
  constructor(typeId, wave, lane) {
    const config = GAME_CONFIG.enemies[typeId];
    if (!config) {
      throw new Error(`Unknown enemy type: ${typeId}`);
    }
    this.typeId = typeId;
    this.lane = lane;
    this.config = config;
    const hpScale = Math.pow(GAME_CONFIG.wave.hpScalePerWave, wave - 1);
    this.hp = Math.ceil(config.hp * hpScale);
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
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test
```

Expected: 6개 테스트 모두 PASS.

- [ ] **Step 5: 커밋**

```bash
git add tests/enemy.test.js src/core/enemy.js
git commit -m "feat: Enemy entity with hp scaling, slow/stun effects"
```

---

### Task 2.4: MergeBoard 데이터 모델 (TDD)

**Files:**
- Create: `tests/mergeBoard.test.js`
- Create: `src/core/mergeBoard.js`

- [ ] **Step 1: 실패 테스트 작성**

```js
// tests/mergeBoard.test.js
import { describe, it, expect } from 'vitest';
import { MergeBoard } from '../src/core/mergeBoard.js';
import { Mage } from '../src/core/mage.js';

describe('MergeBoard', () => {
  it('starts with all cells empty', () => {
    const b = new MergeBoard();
    expect(b.cols).toBe(4);
    expect(b.rows).toBe(4);
    expect(b.getEmptyCells().length).toBe(16);
    expect(b.getMageAt(0, 0)).toBeNull();
  });

  it('places a mage at an empty cell', () => {
    const b = new MergeBoard();
    const m = new Mage('FIRE', 1);
    expect(b.placeMage(m, 1, 2)).toBe(true);
    expect(b.getMageAt(1, 2)).toBe(m);
    expect(b.getEmptyCells().length).toBe(15);
  });

  it('refuses to place when cell is occupied', () => {
    const b = new MergeBoard();
    b.placeMage(new Mage('FIRE', 1), 0, 0);
    expect(b.placeMage(new Mage('ICE', 1), 0, 0)).toBe(false);
  });

  it('places at a random empty cell', () => {
    const b = new MergeBoard();
    const m = new Mage('FIRE', 1);
    const placed = b.placeAtRandomEmpty(m);
    expect(placed).not.toBeNull();
    expect(b.getMageAt(placed.col, placed.row)).toBe(m);
  });

  it('returns null when board is full and no random placement possible', () => {
    const b = new MergeBoard();
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) b.placeMage(new Mage('FIRE', 1), c, r);
    expect(b.placeAtRandomEmpty(new Mage('ICE', 1))).toBeNull();
  });

  it('merges same class + same level into level+1', () => {
    const b = new MergeBoard();
    const m1 = new Mage('FIRE', 2);
    const m2 = new Mage('FIRE', 2);
    b.placeMage(m1, 0, 0);
    b.placeMage(m2, 1, 0);
    const result = b.tryMerge(0, 0, 1, 0);
    expect(result.ok).toBe(true);
    expect(result.newMage.classId).toBe('FIRE');
    expect(result.newMage.level).toBe(3);
    expect(b.getMageAt(0, 0)).toBeNull();
    expect(b.getMageAt(1, 0)).toBe(result.newMage);
  });

  it('refuses merge on different class', () => {
    const b = new MergeBoard();
    b.placeMage(new Mage('FIRE', 2), 0, 0);
    b.placeMage(new Mage('ICE', 2), 1, 0);
    const result = b.tryMerge(0, 0, 1, 0);
    expect(result.ok).toBe(false);
    expect(b.getMageAt(0, 0).classId).toBe('FIRE');
  });

  it('refuses merge on different level', () => {
    const b = new MergeBoard();
    b.placeMage(new Mage('FIRE', 1), 0, 0);
    b.placeMage(new Mage('FIRE', 2), 1, 0);
    expect(b.tryMerge(0, 0, 1, 0).ok).toBe(false);
  });

  it('refuses merge at max level', () => {
    const b = new MergeBoard();
    b.placeMage(new Mage('FIRE', 5), 0, 0);
    b.placeMage(new Mage('FIRE', 5), 1, 0);
    expect(b.tryMerge(0, 0, 1, 0).ok).toBe(false);
  });

  it('moves mage from one cell to another empty cell', () => {
    const b = new MergeBoard();
    const m = new Mage('FIRE', 1);
    b.placeMage(m, 0, 0);
    expect(b.moveMage(0, 0, 2, 3)).toBe(true);
    expect(b.getMageAt(0, 0)).toBeNull();
    expect(b.getMageAt(2, 3)).toBe(m);
  });

  it('refuses to move to occupied cell (use tryMerge instead)', () => {
    const b = new MergeBoard();
    b.placeMage(new Mage('FIRE', 1), 0, 0);
    b.placeMage(new Mage('ICE', 1), 1, 0);
    expect(b.moveMage(0, 0, 1, 0)).toBe(false);
  });

  it('iterates all mages with their positions', () => {
    const b = new MergeBoard();
    const m1 = new Mage('FIRE', 1);
    const m2 = new Mage('ICE', 1);
    b.placeMage(m1, 0, 0);
    b.placeMage(m2, 3, 3);
    const all = b.allMages();
    expect(all.length).toBe(2);
    const positions = all.map(({ col, row }) => `${col},${row}`).sort();
    expect(positions).toEqual(['0,0', '3,3']);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

```bash
npm run test
```

- [ ] **Step 3: src/core/mergeBoard.js 구현**

```js
import { GAME_CONFIG } from '../config/gameConfig.js';
import { Mage } from './mage.js';

export class MergeBoard {
  constructor() {
    this.cols = GAME_CONFIG.board.cols;
    this.rows = GAME_CONFIG.board.rows;
    // grid[col][row] = Mage | null
    this.grid = Array.from({ length: this.cols }, () => Array(this.rows).fill(null));
  }

  isInBounds(col, row) {
    return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
  }

  getMageAt(col, row) {
    if (!this.isInBounds(col, row)) return null;
    return this.grid[col][row];
  }

  placeMage(mage, col, row) {
    if (!this.isInBounds(col, row)) return false;
    if (this.grid[col][row] !== null) return false;
    this.grid[col][row] = mage;
    return true;
  }

  removeMage(col, row) {
    if (!this.isInBounds(col, row)) return null;
    const m = this.grid[col][row];
    this.grid[col][row] = null;
    return m;
  }

  getEmptyCells() {
    const empties = [];
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (this.grid[c][r] === null) empties.push({ col: c, row: r });
      }
    }
    return empties;
  }

  placeAtRandomEmpty(mage) {
    const empties = this.getEmptyCells();
    if (empties.length === 0) return null;
    const pick = empties[Math.floor(Math.random() * empties.length)];
    this.placeMage(mage, pick.col, pick.row);
    return pick;
  }

  tryMerge(fromCol, fromRow, toCol, toRow) {
    const a = this.getMageAt(fromCol, fromRow);
    const b = this.getMageAt(toCol, toRow);
    if (!a || !b) return { ok: false, reason: 'empty' };
    if (a === b) return { ok: false, reason: 'same' };
    if (a.classId !== b.classId) return { ok: false, reason: 'diff-class' };
    if (a.level !== b.level) return { ok: false, reason: 'diff-level' };
    if (a.level >= GAME_CONFIG.mage.maxLevel) return { ok: false, reason: 'max-level' };
    const newMage = new Mage(a.classId, a.level + 1);
    this.grid[fromCol][fromRow] = null;
    this.grid[toCol][toRow] = newMage;
    return { ok: true, newMage };
  }

  moveMage(fromCol, fromRow, toCol, toRow) {
    const a = this.getMageAt(fromCol, fromRow);
    if (!a) return false;
    if (!this.isInBounds(toCol, toRow)) return false;
    if (this.grid[toCol][toRow] !== null) return false;
    this.grid[toCol][toRow] = a;
    this.grid[fromCol][fromRow] = null;
    return true;
  }

  allMages() {
    const out = [];
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const m = this.grid[c][r];
        if (m) out.push({ mage: m, col: c, row: r });
      }
    }
    return out;
  }

  magesInColumn(col) {
    if (col < 0 || col >= this.cols) return [];
    const out = [];
    for (let r = 0; r < this.rows; r++) {
      const m = this.grid[col][r];
      if (m) out.push({ mage: m, col, row: r });
    }
    return out;
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test
```

Expected: MergeBoard 12개 테스트 + 이전 11개 = 총 PASS.

- [ ] **Step 5: 커밋**

```bash
git add tests/mergeBoard.test.js src/core/mergeBoard.js
git commit -m "feat: MergeBoard with place/merge/move operations"
```

---

### Task 2.5: EnemyLane (TDD)

**Files:**
- Create: `tests/enemyLane.test.js`
- Create: `src/core/enemyLane.js`

- [ ] **Step 1: 실패 테스트 작성**

```js
// tests/enemyLane.test.js
import { describe, it, expect } from 'vitest';
import { EnemyLane } from '../src/core/enemyLane.js';
import { Enemy } from '../src/core/enemy.js';

describe('EnemyLane', () => {
  it('has 4 lanes, all empty initially', () => {
    const el = new EnemyLane();
    expect(el.laneCount).toBe(4);
    for (let i = 0; i < 4; i++) {
      expect(el.enemiesInLane(i)).toEqual([]);
    }
  });

  it('spawns an enemy into a specific lane', () => {
    const el = new EnemyLane();
    const e = new Enemy('GOBLIN', 1, 2);
    el.spawn(e);
    expect(el.enemiesInLane(2)).toContain(e);
    expect(el.allEnemies()).toContain(e);
  });

  it('updates all enemies and emits reached-base for those reaching position 1', () => {
    const el = new EnemyLane();
    const e = new Enemy('GOBLIN', 1, 0);
    e.position = 0.99;
    el.spawn(e);
    const events = el.update(1000); // long dt to push past 1.0
    expect(events.reached.length).toBe(1);
    expect(events.reached[0]).toBe(e);
    expect(el.allEnemies()).not.toContain(e);
  });

  it('removes dead enemies and reports them as killed', () => {
    const el = new EnemyLane();
    const e = new Enemy('GOBLIN', 1, 0);
    el.spawn(e);
    e.takeDamage(e.hp);
    const events = el.update(16);
    expect(events.killed.length).toBe(1);
    expect(el.allEnemies()).not.toContain(e);
  });

  it('returns frontmost enemy of a lane (closest to base)', () => {
    const el = new EnemyLane();
    const a = new Enemy('GOBLIN', 1, 1);
    a.position = 0.3;
    const b = new Enemy('GOBLIN', 1, 1);
    b.position = 0.7;
    const c = new Enemy('GOBLIN', 1, 1);
    c.position = 0.5;
    el.spawn(a);
    el.spawn(b);
    el.spawn(c);
    expect(el.getFrontmostInLane(1)).toBe(b);
  });

  it('returns null for frontmost in empty lane', () => {
    const el = new EnemyLane();
    expect(el.getFrontmostInLane(0)).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

```bash
npm run test
```

- [ ] **Step 3: src/core/enemyLane.js 구현**

```js
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
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test
```

- [ ] **Step 5: 커밋**

```bash
git add tests/enemyLane.test.js src/core/enemyLane.js
git commit -m "feat: EnemyLane manages 4 lanes, returns reached/killed events"
```

---

### Task 2.6: EconomyManager (TDD)

**Files:**
- Create: `tests/economyManager.test.js`
- Create: `src/core/economyManager.js`

- [ ] **Step 1: 실패 테스트 작성**

```js
// tests/economyManager.test.js
import { describe, it, expect } from 'vitest';
import { EconomyManager } from '../src/core/economyManager.js';

describe('EconomyManager', () => {
  it('starts with config start gold', () => {
    const em = new EconomyManager();
    expect(em.getGold()).toBe(100);
  });

  it('accumulates gold over time', () => {
    const em = new EconomyManager();
    em.update(1000); // +2
    expect(em.getGold()).toBe(102);
    em.update(500); // +1 (cumulative)
    expect(em.getGold()).toBe(103);
  });

  it('summon cost starts at 50 and increments by 5 each summon', () => {
    const em = new EconomyManager();
    expect(em.getSummonCost()).toBe(50);
    em.spendSummon();
    expect(em.getSummonCost()).toBe(55);
    em.spendSummon();
    expect(em.getSummonCost()).toBe(60);
  });

  it('can summon only when gold >= cost', () => {
    const em = new EconomyManager();
    expect(em.canSummon()).toBe(true);
    em.spendSummon();
    expect(em.getGold()).toBe(50);
    expect(em.canSummon()).toBe(false); // need 55, have 50
  });

  it('refuses spendSummon if cannot afford', () => {
    const em = new EconomyManager();
    em.spendSummon(); // gold=50, cost=55
    expect(em.spendSummon()).toBe(false);
    expect(em.getGold()).toBe(50);
    expect(em.getSummonCost()).toBe(55);
  });

  it('rewards kill', () => {
    const em = new EconomyManager();
    em.rewardKill();
    expect(em.getGold()).toBe(101);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

```bash
npm run test
```

- [ ] **Step 3: src/core/economyManager.js 구현**

```js
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
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test
```

- [ ] **Step 5: 커밋**

```bash
git add tests/economyManager.test.js src/core/economyManager.js
git commit -m "feat: EconomyManager gold accrual + summon cost scaling"
```

---

### Task 2.7: WaveManager (TDD)

**Files:**
- Create: `tests/waveManager.test.js`
- Create: `src/core/waveManager.js`

- [ ] **Step 1: 실패 테스트 작성**

```js
// tests/waveManager.test.js
import { describe, it, expect, vi } from 'vitest';
import { WaveManager } from '../src/core/waveManager.js';

describe('WaveManager', () => {
  it('starts at wave 1 with intermission false', () => {
    const wm = new WaveManager();
    wm.start();
    expect(wm.getCurrentWave()).toBe(1);
  });

  it('returns enemy type and lane on each spawn tick after interval', () => {
    const wm = new WaveManager();
    wm.start();
    // first spawn should be ready immediately or after interval; we update by interval
    const spawn = wm.update(1500);
    expect(spawn.spawns.length).toBeGreaterThanOrEqual(1);
    expect(['GOBLIN', 'SKELETON']).toContain(spawn.spawns[0].typeId);
    expect(spawn.spawns[0].lane).toBeGreaterThanOrEqual(0);
    expect(spawn.spawns[0].lane).toBeLessThan(4);
  });

  it('wave 1 spawns 10 enemies total then enters intermission', () => {
    const wm = new WaveManager();
    wm.start();
    let total = 0;
    // simulate plenty of time
    for (let i = 0; i < 30; i++) {
      const r = wm.update(2000);
      total += r.spawns.length;
      if (r.waveEnded) break;
    }
    expect(total).toBe(10);
    expect(wm.isInIntermission()).toBe(true);
  });

  it('after intermission moves to wave 2 with +2 spawns', () => {
    const wm = new WaveManager();
    wm.start();
    // burn through wave 1 spawns
    for (let i = 0; i < 30 && !wm.isInIntermission(); i++) wm.update(2000);
    expect(wm.isInIntermission()).toBe(true);
    // notify all enemies killed to allow intermission start
    wm.notifyEnemiesCleared();
    // wait out intermission
    wm.update(5001);
    expect(wm.getCurrentWave()).toBe(2);
    // count wave 2 spawns
    let total = 0;
    for (let i = 0; i < 30; i++) {
      const r = wm.update(2000);
      total += r.spawns.length;
      if (r.waveEnded) break;
    }
    expect(total).toBe(12);
  });

  it('skeleton ratio is 0 before wave 5', () => {
    const wm = new WaveManager();
    wm.start();
    // stub Math.random to always pick "skeleton if allowed" (>=1 - ratio)
    const orig = Math.random;
    Math.random = vi.fn(() => 0.99);
    const ratio = wm.computeSkeletonRatio(3);
    expect(ratio).toBe(0);
    Math.random = orig;
  });

  it('skeleton ratio is 0.3 at wave 5', () => {
    const wm = new WaveManager();
    expect(wm.computeSkeletonRatio(5)).toBe(0.3);
  });

  it('skeleton ratio is 0.5 at wave 10', () => {
    const wm = new WaveManager();
    expect(wm.computeSkeletonRatio(10)).toBe(0.5);
  });

  it('prevents 4 enemies in same lane consecutively', () => {
    const wm = new WaveManager();
    wm.start();
    // run wave; collect first 4 spawn lanes
    const lanes = [];
    for (let i = 0; i < 30 && lanes.length < 4; i++) {
      const r = wm.update(2000);
      for (const s of r.spawns) lanes.push(s.lane);
    }
    // verify no 4 consecutive same
    for (let i = 0; i < lanes.length - 3; i++) {
      expect(lanes[i] === lanes[i+1] && lanes[i] === lanes[i+2] && lanes[i] === lanes[i+3]).toBe(false);
    }
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

```bash
npm run test
```

- [ ] **Step 3: src/core/waveManager.js 구현**

```js
import { GAME_CONFIG } from '../config/gameConfig.js';

export class WaveManager {
  constructor() {
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
    this.spawnsLeft = cfg.baseCount + (this.currentWave - 1) * cfg.countIncrement;
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

  pickType() {
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
      result.spawns.push({
        typeId: this.pickType(),
        lane: this.pickLane(),
        wave: this.currentWave,
      });
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
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test
```

- [ ] **Step 5: 커밋**

```bash
git add tests/waveManager.test.js src/core/waveManager.js
git commit -m "feat: WaveManager handles wave progression and spawn scheduling"
```

---

### Task 2.8: SaveStore (TDD)

**Files:**
- Create: `tests/saveStore.test.js`
- Create: `src/core/saveStore.js`

- [ ] **Step 1: 실패 테스트 작성**

```js
// tests/saveStore.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { SaveStore } from '../src/core/saveStore.js';

describe('SaveStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns 0 when no record stored', () => {
    expect(SaveStore.getBestWave()).toBe(0);
  });

  it('saves and retrieves best wave', () => {
    SaveStore.saveBestWave(7);
    expect(SaveStore.getBestWave()).toBe(7);
  });

  it('only updates if new wave is higher', () => {
    SaveStore.saveBestWave(10);
    SaveStore.saveBestWave(5);
    expect(SaveStore.getBestWave()).toBe(10);
  });

  it('updates when new wave is higher', () => {
    SaveStore.saveBestWave(3);
    SaveStore.saveBestWave(8);
    expect(SaveStore.getBestWave()).toBe(8);
  });

  it('handles corrupted storage gracefully', () => {
    localStorage.setItem('magicDefense.bestWave', 'not-a-number');
    expect(SaveStore.getBestWave()).toBe(0);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

```bash
npm run test
```

- [ ] **Step 3: src/core/saveStore.js 구현**

```js
import { GAME_CONFIG } from '../config/gameConfig.js';

const KEY = GAME_CONFIG.save.storageKey;

export const SaveStore = {
  getBestWave() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw === null) return 0;
      const n = parseInt(raw, 10);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    } catch {
      return 0;
    }
  },

  saveBestWave(wave) {
    try {
      const current = this.getBestWave();
      if (wave > current) {
        localStorage.setItem(KEY, String(wave));
      }
    } catch {
      // ignore (e.g., quota)
    }
  },
};
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test
```

- [ ] **Step 5: 커밋**

```bash
git add tests/saveStore.test.js src/core/saveStore.js
git commit -m "feat: SaveStore for best wave persistence"
```

---

### Task 2.9: AttackResolver (TDD)

각 클래스의 공격 효과를 순수 함수로 분리. MergeBoard와 EnemyLane을 받아 데미지·효과 적용.

**Files:**
- Create: `tests/attackResolver.test.js`
- Create: `src/core/attackResolver.js`

- [ ] **Step 1: 실패 테스트 작성**

```js
// tests/attackResolver.test.js
import { describe, it, expect } from 'vitest';
import { AttackResolver } from '../src/core/attackResolver.js';
import { MergeBoard } from '../src/core/mergeBoard.js';
import { EnemyLane } from '../src/core/enemyLane.js';
import { Mage } from '../src/core/mage.js';
import { Enemy } from '../src/core/enemy.js';

function setup() {
  const board = new MergeBoard();
  const lane = new EnemyLane();
  const ar = new AttackResolver(board, lane);
  return { board, lane, ar };
}

describe('AttackResolver - targeting', () => {
  it('a mage in column C targets enemies only in lane C', () => {
    const { board, lane, ar } = setup();
    const fire = new Mage('FIRE', 1);
    board.placeMage(fire, 2, 0);
    const enemyInOtherLane = new Enemy('GOBLIN', 1, 0);
    enemyInOtherLane.position = 0.5;
    lane.spawn(enemyInOtherLane);
    // simulate time well past cooldown
    const attacks = ar.update(2000);
    expect(attacks.length).toBe(0);
  });

  it('does nothing if no enemy in column', () => {
    const { board, ar } = setup();
    board.placeMage(new Mage('FIRE', 1), 1, 0);
    expect(ar.update(2000).length).toBe(0);
  });
});

describe('AttackResolver - FIRE', () => {
  it('damages frontmost enemy in same column', () => {
    const { board, lane, ar } = setup();
    const fire = new Mage('FIRE', 1);
    board.placeMage(fire, 1, 0);
    const a = new Enemy('GOBLIN', 1, 1);
    a.position = 0.3;
    const b = new Enemy('GOBLIN', 1, 1);
    b.position = 0.6;
    lane.spawn(a);
    lane.spawn(b);
    const initialB = b.hp;
    ar.update(1000);
    expect(b.hp).toBe(initialB - fire.getDamage());
    expect(a.hp).toBeGreaterThan(0); // not the front
  });
});

describe('AttackResolver - ICE', () => {
  it('damages and applies slow', () => {
    const { board, lane, ar } = setup();
    const ice = new Mage('ICE', 1);
    board.placeMage(ice, 0, 0);
    const e = new Enemy('GOBLIN', 1, 0);
    e.position = 0.5;
    lane.spawn(e);
    const baseSpeed = e.getCurrentSpeed();
    ar.update(1000);
    expect(e.getCurrentSpeed()).toBeLessThan(baseSpeed);
  });
});

describe('AttackResolver - LIGHTNING', () => {
  it('damages primary + chains to up to 2 more enemies anywhere', () => {
    const { board, lane, ar } = setup();
    const lt = new Mage('LIGHTNING', 1);
    board.placeMage(lt, 0, 0);
    const primary = new Enemy('GOBLIN', 1, 0);
    primary.position = 0.5;
    const chainA = new Enemy('GOBLIN', 1, 1);
    chainA.position = 0.5;
    const chainB = new Enemy('GOBLIN', 1, 2);
    chainB.position = 0.5;
    const chainC = new Enemy('GOBLIN', 1, 3);
    chainC.position = 0.5;
    lane.spawn(primary);
    lane.spawn(chainA);
    lane.spawn(chainB);
    lane.spawn(chainC);
    const primaryStart = primary.hp;
    const chainAStart = chainA.hp;
    const chainBStart = chainB.hp;
    const chainCStart = chainC.hp;
    ar.update(1000);
    // primary takes full damage
    expect(primary.hp).toBe(primaryStart - lt.getDamage());
    // exactly 2 of the chain targets took half damage
    const halfDmgEnemies = [chainA, chainB, chainC].filter(
      e => e.hp === e.maxHp - Math.floor(lt.getDamage() * 0.5)
    );
    expect(halfDmgEnemies.length).toBe(2);
  });
});

describe('AttackResolver - EARTH', () => {
  it('damages primary + AoE in radius + applies stun', () => {
    const { board, lane, ar } = setup();
    const earth = new Mage('EARTH', 1);
    board.placeMage(earth, 1, 0);
    const primary = new Enemy('GOBLIN', 1, 1);
    primary.position = 0.5;
    const nearby = new Enemy('GOBLIN', 1, 2);
    nearby.position = 0.5; // adjacent lane, same depth
    const far = new Enemy('GOBLIN', 1, 3);
    far.position = 0.1; // too far
    lane.spawn(primary);
    lane.spawn(nearby);
    lane.spawn(far);
    ar.update(1000);
    expect(primary.hp).toBeLessThan(primary.maxHp);
    expect(nearby.hp).toBeLessThan(nearby.maxHp); // hit by aoe
    expect(far.hp).toBe(far.maxHp); // out of radius
    // primary is stunned
    expect(primary.getCurrentSpeed()).toBe(0);
  });
});

describe('AttackResolver - cooldown', () => {
  it('does not attack twice within attack interval', () => {
    const { board, lane, ar } = setup();
    const fire = new Mage('FIRE', 1);
    board.placeMage(fire, 0, 0);
    const e = new Enemy('GOBLIN', 1, 0);
    e.position = 0.5;
    lane.spawn(e);
    const startHp = e.hp;
    ar.update(500); // less than 1000ms interval
    ar.update(400);
    expect(e.hp).toBe(startHp); // not yet attacked (0+500+400 = 900 < 1000)
    ar.update(200); // total 1100
    expect(e.hp).toBe(startHp - fire.getDamage());
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

```bash
npm run test
```

- [ ] **Step 3: src/core/attackResolver.js 구현**

```js
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
      const target = this.lane.getFrontmostInLane(col);
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
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test
```

Expected: 모든 AttackResolver 테스트 PASS (타게팅 2개 + FIRE/ICE/LIGHTNING/EARTH 4개 + 쿨다운 1개 = 총 7개).

- [ ] **Step 5: 커밋**

```bash
git add tests/attackResolver.test.js src/core/attackResolver.js
git commit -m "feat: AttackResolver applies damage and effects per class"
```

---

## Phase 3: Scene 골격 및 씬 전환

### Task 3.1: 세 씬을 만들고 main.js에 등록

**Files:**
- Create: `src/scenes/titleScene.js`
- Create: `src/scenes/gameScene.js`
- Create: `src/scenes/gameOverScene.js`
- Modify: `src/main.js`

- [ ] **Step 1: src/scenes/titleScene.js 작성**

```js
import Phaser from 'phaser';
import { SaveStore } from '../core/saveStore.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.add.text(w / 2, h * 0.3, '매직디펜스', {
      fontSize: '72px',
      color: '#ffd700',
    }).setOrigin(0.5);

    const best = SaveStore.getBestWave();
    this.add.text(w / 2, h * 0.45, `최고 기록: 웨이브 ${best}`, {
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const btn = this.add.rectangle(w / 2, h * 0.7, 360, 100, 0x3d6dba).setInteractive();
    this.add.text(w / 2, h * 0.7, '시작', {
      fontSize: '40px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btn.on('pointerup', () => this.scene.start('GameScene'));
  }
}
```

- [ ] **Step 2: src/scenes/gameScene.js 작성 (임시 골격)**

```js
import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.add.text(w / 2, h / 2, 'GameScene\n(임시 골격)', {
      fontSize: '36px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    // Tap anywhere to end game (temporary)
    this.input.once('pointerdown', () => {
      this.scene.start('GameOverScene', { wave: 1 });
    });
  }
}
```

- [ ] **Step 3: src/scenes/gameOverScene.js 작성**

```js
import Phaser from 'phaser';
import { SaveStore } from '../core/saveStore.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.reachedWave = data.wave ?? 0;
  }

  create() {
    SaveStore.saveBestWave(this.reachedWave);
    const w = this.scale.width;
    const h = this.scale.height;

    this.add.text(w / 2, h * 0.3, '게임 오버', {
      fontSize: '64px',
      color: '#e74c3c',
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.45, `웨이브 ${this.reachedWave}까지 버팀`, {
      fontSize: '36px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.55, `최고 기록: ${SaveStore.getBestWave()}`, {
      fontSize: '28px',
      color: '#ffd700',
    }).setOrigin(0.5);

    const btn = this.add.rectangle(w / 2, h * 0.75, 360, 100, 0x3d6dba).setInteractive();
    this.add.text(w / 2, h * 0.75, '다시 시작', {
      fontSize: '40px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btn.on('pointerup', () => this.scene.start('TitleScene'));
  }
}
```

- [ ] **Step 4: src/main.js 갱신 — 세 씬 등록**

```js
import Phaser from 'phaser';
import { TitleScene } from './scenes/titleScene.js';
import { GameScene } from './scenes/gameScene.js';
import { GameOverScene } from './scenes/gameOverScene.js';
import { GAME_CONFIG } from './config/gameConfig.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0f1419',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.display.width,
    height: GAME_CONFIG.display.height,
  },
  scene: [TitleScene, GameScene, GameOverScene],
};

new Phaser.Game(config);
```

- [ ] **Step 5: 수동 확인**

```bash
npm run dev
```

브라우저로 접속해서:
1. 타이틀 화면 보임 → "매직디펜스" 제목 + 최고 기록 0 + 시작 버튼
2. 시작 버튼 탭 → GameScene으로 이동, "GameScene (임시 골격)" 텍스트 보임
3. 화면 아무 곳 탭 → GameOverScene으로 이동, "게임 오버 / 웨이브 1까지 버팀 / 최고 기록 1" 표시
4. 다시 시작 탭 → 타이틀로 돌아오고 최고 기록이 1로 업데이트됨

- [ ] **Step 6: 커밋**

```bash
git add src/scenes/ src/main.js
git commit -m "feat: title/game/gameover scene skeletons with transitions"
```

---

## Phase 4: GameScene UI 골격

### Task 4.1: 영역 구분 + 상태바 더미

**Files:**
- Create: `src/render/statusBarView.js`
- Modify: `src/scenes/gameScene.js`

- [ ] **Step 1: src/render/statusBarView.js 작성**

```js
import Phaser from 'phaser';

export class StatusBarView {
  constructor(scene, x, y, width, height) {
    this.scene = scene;
    this.bg = scene.add.rectangle(x, y, width, height, 0x2a3548).setOrigin(0);

    const padding = 24;
    const fontSize = '28px';
    const style = { fontSize, color: '#ffffff' };

    this.hpText = scene.add.text(x + padding, y + height / 2, '❤️ HP 0', style).setOrigin(0, 0.5);
    this.waveText = scene.add.text(x + width / 2, y + height / 2, '웨이브 1', style).setOrigin(0.5);
    this.goldText = scene.add.text(x + width - padding, y + height / 2, '💰 0', style).setOrigin(1, 0.5);
  }

  setHp(hp) { this.hpText.setText(`❤️ HP ${hp}`); }
  setWave(w) { this.waveText.setText(`웨이브 ${w}`); }
  setGold(g) { this.goldText.setText(`💰 ${g}`); }
}
```

- [ ] **Step 2: src/scenes/gameScene.js 갱신**

```js
import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { StatusBarView } from '../render/statusBarView.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
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

    // Lane area placeholder
    this.add.rectangle(0, STATUS_H, w, LANE_H, 0x3a2818).setOrigin(0);
    this.add.text(w / 2, STATUS_H + LANE_H / 2, '적 레인 영역\n(다음 단계에서 구현)', {
      fontSize: '24px', color: '#aaaaaa', align: 'center',
    }).setOrigin(0.5);

    // Board area placeholder
    this.add.rectangle(0, STATUS_H + LANE_H, w, BOARD_H, 0x1a2540).setOrigin(0);
    this.add.text(w / 2, STATUS_H + LANE_H + BOARD_H / 2, '머지 보드\n(다음 단계)', {
      fontSize: '24px', color: '#aaaaaa', align: 'center',
    }).setOrigin(0.5);

    // Action bar placeholder
    this.add.rectangle(0, STATUS_H + LANE_H + BOARD_H, w, ACTION_H, 0x2a3548).setOrigin(0);
    this.add.text(w / 2, h - ACTION_H / 2, '액션바', {
      fontSize: '24px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // Temporary: tap empty area to game over
    this.input.on('pointerdown', (p) => {
      if (p.y > STATUS_H + LANE_H + BOARD_H + 20) return;
      this.scene.start('GameOverScene', { wave: 1 });
    });
  }
}
```

- [ ] **Step 3: 수동 확인**

```bash
npm run dev
```

화면이 4개 영역(상태바·적 레인·보드·액션바)으로 나뉘어 있고, 상태바에 "❤️ HP 20 / 웨이브 1 / 💰 100" 보임.

- [ ] **Step 4: 커밋**

```bash
git add src/render/statusBarView.js src/scenes/gameScene.js
git commit -m "feat: GameScene area layout with status bar"
```

---

### Task 4.2: 머지 보드 그리기 (빈 4×4 그리드)

**Files:**
- Create: `src/render/boardView.js`
- Modify: `src/scenes/gameScene.js`

- [ ] **Step 1: src/render/boardView.js 작성**

```js
import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class BoardView {
  constructor(scene, x, y, width, height, board) {
    this.scene = scene;
    this.board = board;
    this.area = { x, y, width, height };
    this.cells = []; // [col][row] = { rect, mageSprite|null }
    this.cellSize = Math.floor(Math.min(width / board.cols, height / board.rows) * 0.9);
    this.gap = 8;
    const totalW = board.cols * this.cellSize + (board.cols - 1) * this.gap;
    const totalH = board.rows * this.cellSize + (board.rows - 1) * this.gap;
    this.originX = x + (width - totalW) / 2;
    this.originY = y + (height - totalH) / 2;

    for (let c = 0; c < board.cols; c++) {
      this.cells[c] = [];
      for (let r = 0; r < board.rows; r++) {
        const cx = this.originX + c * (this.cellSize + this.gap) + this.cellSize / 2;
        const cy = this.originY + r * (this.cellSize + this.gap) + this.cellSize / 2;
        const rect = scene.add.rectangle(cx, cy, this.cellSize, this.cellSize, 0x2d4565).setStrokeStyle(2, 0x3a5d8f);
        this.cells[c][r] = { rect, x: cx, y: cy, mageText: null };
      }
    }
  }

  refreshAll() {
    for (let c = 0; c < this.board.cols; c++) {
      for (let r = 0; r < this.board.rows; r++) {
        this._refreshCell(c, r);
      }
    }
  }

  _refreshCell(c, r) {
    const cell = this.cells[c][r];
    const mage = this.board.getMageAt(c, r);
    if (cell.mageText) {
      cell.mageText.destroy();
      cell.mageText = null;
    }
    if (cell.levelText) {
      cell.levelText.destroy();
      cell.levelText = null;
    }
    if (!mage) return;
    cell.mageText = this.scene.add.text(cell.x, cell.y, mage.config.emoji, {
      fontSize: `${Math.floor(this.cellSize * 0.6)}px`,
    }).setOrigin(0.5);
    cell.levelText = this.scene.add.text(cell.x + this.cellSize / 2 - 4, cell.y + this.cellSize / 2 - 4, `L${mage.level}`, {
      fontSize: `${Math.floor(this.cellSize * 0.22)}px`,
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { left: 4, right: 4 },
    }).setOrigin(1);
  }

  getCellCenter(col, row) {
    const cell = this.cells[col]?.[row];
    return cell ? { x: cell.x, y: cell.y } : null;
  }

  // Returns {col, row} | null
  getCellAt(worldX, worldY) {
    for (let c = 0; c < this.board.cols; c++) {
      for (let r = 0; r < this.board.rows; r++) {
        const cell = this.cells[c][r];
        const halfSize = this.cellSize / 2;
        if (worldX >= cell.x - halfSize && worldX <= cell.x + halfSize &&
            worldY >= cell.y - halfSize && worldY <= cell.y + halfSize) {
          return { col: c, row: r };
        }
      }
    }
    return null;
  }
}
```

- [ ] **Step 2: src/scenes/gameScene.js 갱신 — BoardView 인스턴스화**

`gameScene.js`에서 보드 placeholder 부분을 다음으로 교체:

```js
import { MergeBoard } from '../core/mergeBoard.js';
import { BoardView } from '../render/boardView.js';
// (기존 imports 위에 추가)
```

`create()` 메서드의 보드 placeholder를 다음으로 교체:

```js
    // Board area
    this.add.rectangle(0, STATUS_H + LANE_H, w, BOARD_H, 0x1a2540).setOrigin(0);
    this.board = new MergeBoard();
    this.boardView = new BoardView(this, 0, STATUS_H + LANE_H, w, BOARD_H, this.board);
    this.boardView.refreshAll();
```

(기존 보드 placeholder 텍스트는 제거)

- [ ] **Step 3: 수동 확인**

`npm run dev` 실행 → 보드 영역에 4×4 빈 칸이 격자로 보여야 함. 칸들은 푸른 회색 사각형.

- [ ] **Step 4: 커밋**

```bash
git add src/render/boardView.js src/scenes/gameScene.js
git commit -m "feat: render 4x4 empty merge board grid"
```

---

### Task 4.3: 액션바 (소환 / 속도 버튼)

**Files:**
- Create: `src/render/actionBarView.js`
- Modify: `src/scenes/gameScene.js`

- [ ] **Step 1: src/render/actionBarView.js 작성**

```js
import Phaser from 'phaser';

export class ActionBarView {
  constructor(scene, x, y, width, height) {
    this.scene = scene;
    this.bg = scene.add.rectangle(x, y, width, height, 0x2a3548).setOrigin(0);

    const padding = 24;
    const btnW = (width - padding * 3) * 0.7;
    const speedBtnW = (width - padding * 3) * 0.3;
    const btnH = height * 0.7;

    const summonX = x + padding + btnW / 2;
    const summonY = y + height / 2;
    this.summonBg = scene.add.rectangle(summonX, summonY, btnW, btnH, 0x3d6dba).setInteractive();
    this.summonLabel = scene.add.text(summonX, summonY, '🧙 소환 (50G)', {
      fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5);

    const speedX = x + padding * 2 + btnW + speedBtnW / 2;
    const speedY = y + height / 2;
    this.speedBg = scene.add.rectangle(speedX, speedY, speedBtnW, btnH, 0x555555).setInteractive();
    this.speedLabel = scene.add.text(speedX, speedY, '⏩ 1x', {
      fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5);

    this.summonBg.on('pointerup', () => this.onSummon && this.onSummon());
    this.speedBg.on('pointerup', () => this.onSpeedToggle && this.onSpeedToggle());
  }

  setSummonCost(cost) {
    this.summonLabel.setText(`🧙 소환 (${cost}G)`);
  }

  setSummonEnabled(enabled) {
    this.summonBg.setFillStyle(enabled ? 0x3d6dba : 0x555555);
    if (enabled) this.summonBg.setInteractive();
    else this.summonBg.disableInteractive();
  }

  setSpeed(mult) {
    this.speedLabel.setText(`⏩ ${mult}x`);
  }
}
```

- [ ] **Step 2: src/scenes/gameScene.js — ActionBarView 인스턴스화**

기존 액션바 placeholder를 다음으로 교체. `create()` 끝부분에:

```js
    // Action bar
    this.actionBar = new ActionBarView(this, 0, STATUS_H + LANE_H + BOARD_H, w, ACTION_H);
    this.actionBar.onSummon = () => {
      console.log('[summon clicked]'); // 다음 태스크에서 실제 동작 연결
    };
    this.actionBar.onSpeedToggle = () => {
      console.log('[speed toggle]');
    };
```

`import` 추가:

```js
import { ActionBarView } from '../render/actionBarView.js';
```

기존 액션바 placeholder의 rectangle/text와 임시 게임오버 트리거(`this.input.on('pointerdown', ...)`)는 제거.

- [ ] **Step 3: 수동 확인**

`npm run dev` 실행 → 액션바에 파란색 "🧙 소환 (50G)" 버튼과 회색 "⏩ 1x" 버튼 보임. 클릭 시 콘솔에 로그 찍힘.

- [ ] **Step 4: 커밋**

```bash
git add src/render/actionBarView.js src/scenes/gameScene.js
git commit -m "feat: action bar with summon and speed buttons"
```

---

## Phase 5: 머지 보드 인터랙션

### Task 5.1: 소환 버튼 동작 (랜덤 마법사 생성)

**Files:**
- Modify: `src/scenes/gameScene.js`

- [ ] **Step 1: gameScene.js에 소환 로직 추가**

```js
import { EconomyManager } from '../core/economyManager.js';
import { Mage } from '../core/mage.js';
```

`create()`에 economy 추가 + 소환 핸들러 연결:

```js
    this.economy = new EconomyManager();
    this.statusBar.setGold(this.economy.getGold());
    this.actionBar.setSummonCost(this.economy.getSummonCost());

    this.actionBar.onSummon = () => this.handleSummon();
```

그리고 메서드 추가:

```js
  handleSummon() {
    if (!this.economy.canSummon()) return;
    if (this.board.getEmptyCells().length === 0) return;
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
```

`update()` 메서드 추가해서 골드 자동 누적:

```js
  update(_time, dtMs) {
    this.economy.update(dtMs);
    this.statusBar.setGold(this.economy.getGold());
    this.actionBar.setSummonEnabled(this.economy.canSummon() && this.board.getEmptyCells().length > 0);
  }
```

- [ ] **Step 2: 수동 확인**

`npm run dev` 실행:
1. 소환 버튼 클릭 → 보드에 랜덤 마법사(이모지 + L1) 등장, 골드 100 → 50
2. 또 클릭 → 골드 부족(50 < 55)이므로 비활성화. 잠시 기다리면 골드가 차서 다시 활성화.
3. 시간 지나면 골드가 +2/초 증가하는지 상태바 확인.

- [ ] **Step 3: 커밋**

```bash
git add src/scenes/gameScene.js
git commit -m "feat: summon button creates random mage and consumes gold"
```

---

### Task 5.2: 드래그로 마법사 이동/머지

**Files:**
- Modify: `src/render/boardView.js`
- Modify: `src/scenes/gameScene.js`

- [ ] **Step 1: boardView.js — 마법사 텍스트를 드래그 가능하게**

`_refreshCell` 메서드 안에서 `cell.mageText`를 만든 직후, 인터랙티브하게 만들고 데이터에 좌표 저장:

```js
    cell.mageText.setInteractive({ draggable: true });
    cell.mageText.setData('col', c);
    cell.mageText.setData('row', r);
    this.scene.input.setDraggable(cell.mageText);
```

(전체 메서드는 다음과 같이 되어야 함:)

```js
  _refreshCell(c, r) {
    const cell = this.cells[c][r];
    const mage = this.board.getMageAt(c, r);
    if (cell.mageText) { cell.mageText.destroy(); cell.mageText = null; }
    if (cell.levelText) { cell.levelText.destroy(); cell.levelText = null; }
    if (!mage) return;
    const text = this.scene.add.text(cell.x, cell.y, mage.config.emoji, {
      fontSize: `${Math.floor(this.cellSize * 0.6)}px`,
    }).setOrigin(0.5);
    text.setInteractive({ draggable: true });
    text.setData('col', c);
    text.setData('row', r);
    this.scene.input.setDraggable(text);
    cell.mageText = text;
    cell.levelText = this.scene.add.text(cell.x + this.cellSize / 2 - 4, cell.y + this.cellSize / 2 - 4, `L${mage.level}`, {
      fontSize: `${Math.floor(this.cellSize * 0.22)}px`,
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { left: 4, right: 4 },
    }).setOrigin(1);
  }
```

- [ ] **Step 2: gameScene.js — 드래그 이벤트 핸들러 등록**

`create()` 끝부분에 다음 추가:

```js
    this.input.on('drag', (_pointer, obj, x, y) => {
      obj.x = x;
      obj.y = y;
    });

    this.input.on('dragend', (_pointer, obj) => {
      const fromCol = obj.getData('col');
      const fromRow = obj.getData('row');
      const target = this.boardView.getCellAt(obj.x, obj.y);
      if (!target) {
        // dropped outside — snap back
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
        if (!merge.ok) {
          // refresh — snap back
        }
      }
      this.boardView.refreshAll();
      this.actionBar.setSummonEnabled(this.economy.canSummon() && this.board.getEmptyCells().length > 0);
    });
```

- [ ] **Step 3: 수동 확인**

`npm run dev` 실행:
1. 소환을 몇 번 해서 같은 종류 마법사 2명 만듦 (재시도 필요할 수 있음 — 4종 중 같은 게 나올 때까지)
2. 한 마법사를 드래그 → 빈 칸에 놓으면 이동
3. 같은 클래스+레벨 마법사 위에 놓으면 → Lv+1로 합쳐짐
4. 다른 클래스 위에 놓으면 → 제자리로 복귀
5. 화면 밖 드래그 → 제자리 복귀

- [ ] **Step 4: 커밋**

```bash
git add src/render/boardView.js src/scenes/gameScene.js
git commit -m "feat: drag to move/merge mages on board"
```

---

## Phase 6: 적 레인 + 웨이브 시스템

### Task 6.1: 적 레인 시각화

**Files:**
- Create: `src/render/laneView.js`
- Modify: `src/scenes/gameScene.js`

- [ ] **Step 1: src/render/laneView.js 작성**

```js
import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class LaneView {
  constructor(scene, x, y, width, height, lane) {
    this.scene = scene;
    this.lane = lane;
    this.area = { x, y, width, height };
    this.laneCount = lane.laneCount;
    this.laneWidth = width / this.laneCount;
    this.enemySprites = new Map(); // enemy -> Phaser.Text

    // Draw lane backgrounds
    for (let i = 0; i < this.laneCount; i++) {
      const lx = x + i * this.laneWidth;
      scene.add.rectangle(lx + this.laneWidth / 2, y + height / 2, this.laneWidth - 4, height, 0x4a2e1a)
        .setStrokeStyle(2, 0x6a4828);
    }
  }

  // Convert (lane, position 0..1) to world (x, y)
  laneToWorld(laneIdx, position) {
    const x = this.area.x + laneIdx * this.laneWidth + this.laneWidth / 2;
    const y = this.area.y + position * this.area.height;
    return { x, y };
  }

  refresh() {
    const aliveEnemies = new Set(this.lane.allEnemies());
    // Remove sprites for dead/gone enemies
    for (const [enemy, sprite] of this.enemySprites) {
      if (!aliveEnemies.has(enemy)) {
        sprite.destroy();
        this.enemySprites.delete(enemy);
      }
    }
    // Update or create sprites for alive enemies
    for (const enemy of aliveEnemies) {
      const { x, y } = this.laneToWorld(enemy.lane, enemy.position);
      let sprite = this.enemySprites.get(enemy);
      if (!sprite) {
        sprite = this.scene.add.text(x, y, enemy.config.emoji, {
          fontSize: '36px',
        }).setOrigin(0.5);
        this.enemySprites.set(enemy, sprite);
      } else {
        sprite.x = x;
        sprite.y = y;
      }
      // HP bar (simple)
      sprite.setAlpha(enemy.hp / enemy.maxHp * 0.6 + 0.4);
    }
  }
}
```

- [ ] **Step 2: gameScene.js — EnemyLane + LaneView 추가**

```js
import { EnemyLane } from '../core/enemyLane.js';
import { LaneView } from '../render/laneView.js';
```

`create()`의 적 레인 placeholder를 다음으로 교체:

```js
    // Lane area
    this.add.rectangle(0, STATUS_H, w, LANE_H, 0x3a2818).setOrigin(0);
    this.enemyLane = new EnemyLane();
    this.laneView = new LaneView(this, 0, STATUS_H, w, LANE_H, this.enemyLane);
```

`update(time, dtMs)`에 추가:

```js
    const laneResult = this.enemyLane.update(dtMs);
    this.laneView.refresh();
```

- [ ] **Step 3: 수동 확인 — 적 1마리 임시 스폰**

`gameScene.js` 상단에 import 추가 (다음 태스크에서도 계속 사용):

```js
import { Enemy } from '../core/enemy.js';
```

`create()` 끝에 다음 라인 **임시로** 추가 (다음 태스크에서 제거 예정):

```js
    this.time.delayedCall(500, () => this.enemyLane.spawn(new Enemy('GOBLIN', 1, 1)));
```

`npm run dev` → 0.5초 후 레인 1번(왼쪽에서 두 번째)에 👹이 위에서 천천히 내려와야 함.

- [ ] **Step 4: 임시 스폰 라인 제거**

위에서 추가한 `this.time.delayedCall(...)` 한 줄을 **삭제**. `Enemy` import는 그대로 유지.

- [ ] **Step 5: 커밋**

```bash
git add src/render/laneView.js src/scenes/gameScene.js
git commit -m "feat: render enemy lanes with moving enemy sprites"
```

---

### Task 6.2: WaveManager 통합 + 본진 도달 처리

**Files:**
- Modify: `src/scenes/gameScene.js`

- [ ] **Step 1: gameScene.js — WaveManager 인스턴스화**

```js
import { WaveManager } from '../core/waveManager.js';
import { Enemy } from '../core/enemy.js';
```

`create()`에 추가:

```js
    this.waveManager = new WaveManager();
    this.waveManager.start();
    this.hp = GAME_CONFIG.player.startHp;
    this.statusBar.setHp(this.hp);
    this.statusBar.setWave(this.waveManager.getCurrentWave());
```

`update(time, dtMs)` 갱신:

```js
  update(_time, dtMs) {
    if (this.isGameOver) return;
    this.economy.update(dtMs);

    // Wave: spawn enemies
    const wave = this.waveManager.update(dtMs);
    for (const spawn of wave.spawns) {
      this.enemyLane.spawn(new Enemy(spawn.typeId, spawn.wave, spawn.lane));
    }
    if (wave.waveStarted) {
      this.statusBar.setWave(this.waveManager.getCurrentWave());
    }

    // Enemy movement and base reach
    const laneResult = this.enemyLane.update(dtMs);
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

  triggerGameOver() {
    this.isGameOver = true;
    this.scene.start('GameOverScene', { wave: this.waveManager.getCurrentWave() });
  }
```

`create()` 시작 부분에 `this.isGameOver = false;` 추가.

- [ ] **Step 2: 수동 확인**

`npm run dev`:
1. 게임 시작하면 👹 적이 4개 레인 중 랜덤하게 위에서 내려오기 시작
2. 적이 레인 바닥에 닿으면 HP -1
3. 적 처치 보상 미구현 상태(공격 없으니 적이 안 죽음) — HP가 계속 깎이다가 0이 되면 게임 오버
4. 게임 오버 화면에서 도달 웨이브가 표시되고 최고 기록 갱신

- [ ] **Step 3: 커밋**

```bash
git add src/scenes/gameScene.js
git commit -m "feat: integrate wave manager with enemy spawn and base damage"
```

---

## Phase 7: 공격 + 이펙트

### Task 7.1: AttackResolver 통합

**Files:**
- Modify: `src/scenes/gameScene.js`

- [ ] **Step 1: gameScene.js — AttackResolver 통합**

```js
import { AttackResolver } from '../core/attackResolver.js';
```

`create()`에서 보드와 레인 만든 다음에:

```js
    this.attackResolver = new AttackResolver(this.board, this.enemyLane);
```

`update()` 안에서 wave spawn 처리 후, lane update **전에** 공격 처리:

```js
    // Mage attacks
    const attacks = this.attackResolver.update(dtMs);
    for (const atk of attacks) {
      this._renderAttackFx(atk);
    }
```

그리고 메서드 추가:

```js
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
```

- [ ] **Step 2: 수동 확인**

`npm run dev`:
1. 게임 시작 → 자동으로 적이 내려옴
2. 소환 버튼으로 마법사 몇 개 배치
3. 마법사 소환한 컬럼의 적이 공격받음 (색깔 선이 잠깐 보이고 적 알파값 줄어듦 → 죽으면 사라짐)
4. 적 처치 시 골드 +1 확인

- [ ] **Step 3: 커밋**

```bash
git add src/scenes/gameScene.js
git commit -m "feat: integrate attack resolver and render attack effects"
```

---

### Task 7.2: 속도 토글 (1x / 2x)

**Files:**
- Modify: `src/scenes/gameScene.js`

- [ ] **Step 1: gameScene.js에 속도 배율 추가**

`create()`에 추가:

```js
    this.speedMultiplier = 1;
    this.actionBar.onSpeedToggle = () => {
      this.speedMultiplier = this.speedMultiplier === 1 ? 2 : 1;
      this.actionBar.setSpeed(this.speedMultiplier);
    };
```

`update(time, dtMs)`에서 `dtMs` 사용하던 곳을 `effectiveDt`로 변경:

```js
  update(_time, dtMs) {
    if (this.isGameOver) return;
    const effectiveDt = dtMs * this.speedMultiplier;
    this.economy.update(effectiveDt);

    const wave = this.waveManager.update(effectiveDt);
    // ... (이하 모든 dtMs 사용처를 effectiveDt로 변경)
    const attacks = this.attackResolver.update(effectiveDt);
    // ...
    const laneResult = this.enemyLane.update(effectiveDt);
    // ...
  }
```

- [ ] **Step 2: 수동 확인**

`npm run dev`:
1. ⏩ 1x 버튼 클릭 → ⏩ 2x 로 바뀜
2. 적 이동, 공격, 골드 누적 모두 약 2배 빨라짐
3. 한 번 더 클릭 → ⏩ 1x

- [ ] **Step 3: 커밋**

```bash
git add src/scenes/gameScene.js
git commit -m "feat: speed toggle (1x/2x)"
```

---

## Phase 8: 마무리 + UX 다듬기

### Task 8.1: 머지 시 진동/스케일 피드백

**Files:**
- Modify: `src/scenes/gameScene.js`

- [ ] **Step 1: dragend 핸들러에서 머지 성공 시 트윈 추가**

`create()` 안 `dragend` 핸들러에서 머지 결과 처리 부분 갱신:

```js
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
```

- [ ] **Step 2: 수동 확인**

머지가 성공할 때 노란 원이 잠시 퍼지며 사라지는 시각 효과 확인.

- [ ] **Step 3: 커밋**

```bash
git add src/scenes/gameScene.js
git commit -m "feat: merge success visual feedback"
```

---

### Task 8.2: 소환 불가 시 빨간 피드백

**Files:**
- Modify: `src/scenes/gameScene.js`

- [ ] **Step 1: handleSummon에 실패 피드백 추가**

```js
  handleSummon() {
    if (!this.economy.canSummon() || this.board.getEmptyCells().length === 0) {
      // shake the summon button
      const btn = this.actionBar.summonBg;
      this.tweens.add({
        targets: btn, x: btn.x + 6, duration: 50, yoyo: true, repeat: 3,
        onComplete: () => { btn.x = btn.x; },
      });
      return;
    }
    // ... 기존 로직
  }
```

> 주의: 위 코드의 `actionBar.summonBg` 접근을 위해 `actionBarView.js`에서 `this.summonBg`가 클래스 프로퍼티로 공개되어 있는지 확인 (이미 그렇게 작성됨).

- [ ] **Step 2: 수동 확인**

골드 부족 또는 보드 가득 상태에서 소환 버튼 누르면 좌우로 잠깐 흔들림.

- [ ] **Step 3: 커밋**

```bash
git add src/scenes/gameScene.js
git commit -m "feat: shake summon button when cannot summon"
```

---

### Task 8.3: 보드 가득 시 소환 버튼 비활성화 시각 표시

이미 Task 5.1의 `setSummonEnabled()`이 처리. 추가 작업 없음. 동작 확인:

- [ ] **Step 1: 보드 16칸 모두 채워 보고 소환 버튼이 회색으로 비활성화되는지 확인**

빠르게 보드 채우려면 dev 환경에서 콘솔로 `for (let i=0;i<16;i++) phaserGame... ` 등 가능하지만, 실제 플레이로도 검증 가능.

- [ ] **Step 2: 별도 커밋 없음. 다음 태스크 진행.**

---

### Task 8.4: 최고 기록 갱신 메시지

**Files:**
- Modify: `src/scenes/gameOverScene.js`

- [ ] **Step 1: gameOverScene.js에서 신기록 시 강조**

`create()` 메서드 시작에서:

```js
    const prevBest = SaveStore.getBestWave();
    const isNewRecord = this.reachedWave > prevBest;
    SaveStore.saveBestWave(this.reachedWave);
```

그 후 "최고 기록" 라인 다음에:

```js
    if (isNewRecord) {
      this.add.text(w / 2, h * 0.62, '★ 신기록! ★', {
        fontSize: '40px', color: '#ffd700',
      }).setOrigin(0.5);
    }
```

- [ ] **Step 2: 수동 확인**

한 판 돌리고 게임 오버 → 신기록이면 노란 "★ 신기록! ★" 표시.

- [ ] **Step 3: 커밋**

```bash
git add src/scenes/gameOverScene.js
git commit -m "feat: highlight new record on game over"
```

---

## Phase 9: 모바일 테스트 및 최종 검수

### Task 9.1: PC 브라우저 풀 플레이스루

- [ ] **Step 1: dev 서버 실행 후 한 판 끝까지 플레이**

```bash
npm run dev
```

- [ ] **Step 2: 다음 체크리스트 확인**

다음 항목 모두 정상 동작:
1. 타이틀 → 시작 → 게임 → 게임오버 → 다시 시작 → 타이틀 흐름 끊김 없음
2. 보드에 4종 마법사(🔥❄️⚡🌍) 모두 소환됨
3. 같은 클래스+레벨 머지 성공 (Lv1+Lv1 → Lv2 등)
4. 다른 클래스/레벨 머지 실패 (원위치)
5. 각 마법사가 자기 컬럼의 적만 공격 (공격 선 색깔로 확인)
6. ❄️ 얼음 맞은 적이 느려짐
7. ⚡ 전기가 인접 적에게 체인 (선 2개 추가)
8. 🌍 땅이 광역 + 기절 (적 잠시 멈춤)
9. 웨이브가 진행됨에 따라 적이 많아지고 강해짐 (HP 증가, 스폰 빠름)
10. 웨이브 5 이후 💀 (해골) 등장
11. 적 처치 시 골드 +1
12. 자동 골드 +2/초
13. 소환 비용 +5씩 증가
14. 골드 부족/보드 가득 시 소환 버튼 비활성/흔들림
15. 속도 1x ↔ 2x 토글 동작
16. HP 0 → 게임 오버 → 도달 웨이브 표시 → 신기록이면 별 표시
17. 다시 시작 후 최고 기록이 유지됨 (새로고침 후에도)

- [ ] **Step 3: 한 번 더 새로 시작해서 localStorage 영속성 확인**

브라우저 새로고침 → 타이틀에 직전 최고 기록 표시 확인.

- [ ] **Step 4: 발견된 버그가 있으면 별도 태스크로 정리해서 수정 후 진행**

이 단계에서 버그 발견 시 위 phase 중 해당하는 곳으로 돌아가 수정.

---

### Task 9.2: 폰 크롬 접속 + 터치 테스트

- [ ] **Step 1: 폰과 PC가 같은 Wi-Fi에 연결되어 있는지 확인**

- [ ] **Step 2: dev 서버 실행**

```bash
npm run dev
```

출력에서 `Network: http://192.168.x.x:5173/` 같은 URL 확인.

- [ ] **Step 3: 폰 크롬으로 해당 URL 접속**

만약 폰에서 접속 안 되면:
- Windows 방화벽이 Vite(node) 인바운드를 차단했을 가능성. 방화벽 예외 추가.
- 라우터의 AP 격리 옵션이 켜져 있으면 같은 Wi-Fi라도 폰↔PC 통신 차단됨.

- [ ] **Step 4: 폰에서 다음 동작 확인**

1. 화면이 폰 세로 비율에 맞게 표시됨 (FIT 모드)
2. 시작 버튼 탭 작동
3. 보드 마법사 드래그 작동 (손가락으로 끌어 다른 칸에 놓기)
4. 머지 성공/실패 시각 피드백
5. 적 이동·공격 모두 부드럽게 (프레임 드랍 심하지 않음)
6. 게임 오버 → 다시 시작 흐름

- [ ] **Step 5: 폰에서 발견된 이슈가 있으면 수정**

자주 보이는 이슈:
- 드래그 시 페이지 자체가 스크롤됨 → `index.html`의 `touch-action: none` 확인
- 폰트 너무 작거나 큼 → `gameConfig.display.width`와 실제 화면 비율 확인
- 터치 시 더블탭 줌 → `index.html`의 viewport meta `user-scalable=no` 확인

- [ ] **Step 6: 모든 검증 통과 후 최종 커밋 (만약 수정사항 있다면)**

```bash
git add .
git commit -m "fix: mobile UX polish based on device testing"
```

---

### Task 9.3: README에 실행 방법 추가

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 기존 README.md 끝에 실행 방법 섹션 추가**

기존 내용은 보존하고, 끝에 다음 추가:

```markdown

---

## 실행 방법 (프로토타입)

### 사전 설치
- Node.js 20+ (https://nodejs.org)

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

브라우저로 표시된 `Local` URL 접속. 같은 Wi-Fi의 폰에선 `Network` URL로 접속.

### 테스트
```bash
npm run test
```

### 빌드 (정적 파일 생성)
```bash
npm run build
```

`dist/` 폴더에 결과물.
```

- [ ] **Step 2: 커밋**

```bash
git add README.md
git commit -m "docs: add prototype run instructions to README"
```

---

## 완료 기준

다음이 모두 만족하면 프로토타입 완료:

- [ ] 모든 단위 테스트 통과 (`npm run test`)
- [ ] PC 브라우저 풀 플레이스루 통과 (Task 9.1 체크리스트 17개)
- [ ] 폰 크롬에서 터치 동작 정상 (Task 9.2)
- [ ] 디자인 스펙(2026-05-16-magic-defense-design.md)의 "12장 성공 기준" 7개 항목 모두 충족

---

## 부록: 문제 발생 시 디버깅 힌트

| 증상 | 의심할 곳 |
|---|---|
| 보드에 마법사가 안 보임 | `BoardView._refreshCell()` 호출 누락, `boardView.refreshAll()` 호출 시점 |
| 적이 안 움직임 | `Enemy.update(dtMs)` 호출 누락, `dtMs` 단위 확인 (ms vs s) |
| 마법사가 공격 안 함 | `AttackResolver.update()` 호출 누락, 마법사가 같은 컬럼에 있는지 |
| 머지가 안 됨 | `MergeBoard.tryMerge()`의 ok=false 이유 콘솔로 찍어 확인 |
| 폰에서만 안 됨 | 방화벽, AP 격리, viewport meta, touch-action |
| 골드가 너무 빨리/느리게 참 | `GAME_CONFIG.player.goldPerSecond`, `update()`의 dtMs 단위 |
| 적이 너무 강함/약함 | `GAME_CONFIG.wave.hpScalePerWave`, `enemies.GOBLIN.hp` 조정 |

> 모든 밸런스 수치는 `src/config/gameConfig.js` 한 파일에 모여 있으므로, 게임 느낌 조정은 거기서.
