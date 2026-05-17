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
