import { GAME_CONFIG } from '../config/gameConfig.js';

const KEY = GAME_CONFIG.save.storageKey;
const STAGE_PREFIX = GAME_CONFIG.save.stageBestPrefix;

function readWave(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeIfHigher(key, wave) {
  try {
    if (wave > readWave(key)) {
      localStorage.setItem(key, String(wave));
    }
  } catch {
    // ignore (e.g., quota)
  }
}

export const SaveStore = {
  getBestWave() {
    return readWave(KEY);
  },

  saveBestWave(wave) {
    writeIfHigher(KEY, wave);
  },

  // 스테이지별 최고 웨이브 (스테이지 선택 화면 카드에 표시)
  getStageBest(stageIndex) {
    return readWave(`${STAGE_PREFIX}${stageIndex}`);
  },

  saveStageBest(stageIndex, wave) {
    writeIfHigher(`${STAGE_PREFIX}${stageIndex}`, wave);
  },
};
