import {
  START_GEMS, PARTY_SIZE, HERO_BY_ID, HEROES,
  GEM_STORAGE_KEY, OWNED_STORAGE_KEY, PARTY_STORAGE_KEY,
} from '../config/heroConfig.js';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore (quota 등)
  }
}

export const HeroStore = {
  // ── 젬 ──
  getGems() {
    try {
      const raw = localStorage.getItem(GEM_STORAGE_KEY);
      if (raw === null) return START_GEMS; // 최초 실행 시 지급
      const n = parseInt(raw, 10);
      return Number.isFinite(n) && n >= 0 ? n : START_GEMS;
    } catch {
      return START_GEMS;
    }
  },
  setGems(n) {
    try { localStorage.setItem(GEM_STORAGE_KEY, String(Math.max(0, Math.floor(n)))); } catch { /* ignore */ }
  },
  addGems(n) {
    this.setGems(this.getGems() + n);
  },
  spendGems(n) {
    const cur = this.getGems();
    if (cur < n) return false;
    this.setGems(cur - n);
    return true;
  },

  // ── 보유 영웅 (id → 개수) ──
  getOwned() {
    return readJSON(OWNED_STORAGE_KEY, {});
  },
  getOwnedCount(id) {
    return this.getOwned()[id] ?? 0;
  },
  isOwned(id) {
    return this.getOwnedCount(id) > 0;
  },
  addHero(id) {
    if (!HERO_BY_ID[id]) return;
    const owned = this.getOwned();
    owned[id] = (owned[id] ?? 0) + 1;
    writeJSON(OWNED_STORAGE_KEY, owned);
  },

  // ── 파티 (최대 PARTY_SIZE명, heroId 배열) ──
  getParty() {
    const p = readJSON(PARTY_STORAGE_KEY, []);
    return Array.isArray(p) ? p.slice(0, PARTY_SIZE) : [];
  },
  setParty(arr) {
    writeJSON(PARTY_STORAGE_KEY, (arr ?? []).slice(0, PARTY_SIZE));
  },
  isInParty(id) {
    return this.getParty().includes(id);
  },
  addToParty(id) {
    if (!this.isOwned(id)) return false;
    const party = this.getParty();
    if (party.includes(id)) return false;
    if (party.length >= PARTY_SIZE) return false;
    party.push(id);
    this.setParty(party);
    return true;
  },
  removeFromParty(id) {
    const party = this.getParty().filter(x => x !== id);
    this.setParty(party);
  },
  toggleParty(id) {
    if (this.isInParty(id)) { this.removeFromParty(id); return false; }
    return this.addToParty(id);
  },

  // 관리자: 모든 영웅 보유 + 젬 대량 지급
  unlockAll() {
    const owned = this.getOwned();
    HEROES.forEach(h => { owned[h.id] = Math.max(1, owned[h.id] ?? 0); });
    writeJSON(OWNED_STORAGE_KEY, owned);
    this.setGems(999999);
  },
};
