// Procedural ambient BGM using Web Audio API.
// No external audio file — generates a simple chord-loop pad.
export class BgmPlayer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.timer = null;
    this.running = false;
  }

  start() {
    if (this.running) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.05;
    this.masterGain.connect(this.ctx.destination);
    this.running = true;
    this._scheduleLoop();
  }

  stop() {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.masterGain = null;
    }
  }

  _scheduleLoop() {
    if (!this.running || !this.ctx) return;
    // A-minor → F → C → G progression (Am, F, C, G frequencies)
    const chords = [
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [261.63, 329.63, 392.00], // C
      [196.00, 246.94, 293.66], // G
    ];
    const beatSec = 3.5; // seconds per chord
    let idx = 0;
    const playChord = () => {
      if (!this.running || !this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const chord = chords[idx % chords.length];
      for (const freq of chord) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(0.8, now + 0.8);
        env.gain.linearRampToValueAtTime(0, now + beatSec);
        osc.connect(env).connect(this.masterGain);
        osc.start(now);
        osc.stop(now + beatSec);
      }
      idx += 1;
      this.timer = setTimeout(playChord, beatSec * 1000);
    };
    playChord();
  }
}

// Singleton — survives scene transitions.
export const bgm = new BgmPlayer();
