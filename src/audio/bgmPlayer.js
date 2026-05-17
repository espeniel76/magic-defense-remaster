// Procedural ambient BGM using Web Audio API.
// Supports multiple tracks (chord progressions + tone).

const TRACKS = {
  // Bright sine pad — Am → F → C → G
  default: {
    chords: [
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [261.63, 329.63, 392.00], // C
      [196.00, 246.94, 293.66], // G
    ],
    type: 'sine',
    beatSec: 3.5,
    gain: 0.05,
  },
  // Dark sawtooth pad — low minor cycle for hell mode
  hell: {
    chords: [
      [ 87.31, 110.00, 138.59], // low Fm
      [ 73.42,  92.50, 116.54], // low Dm
      [ 82.41, 103.83, 130.81], // low Em
      [ 65.41,  82.41, 103.83], // low Cm
    ],
    type: 'sawtooth',
    beatSec: 4.5,
    gain: 0.04,
  },
};

export class BgmPlayer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.timer = null;
    this.running = false;
    this.currentTrack = null;
  }

  start(trackName = 'default') {
    if (this.running && this.currentTrack === trackName) return;
    if (this.running) this.stop();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const track = TRACKS[trackName] ?? TRACKS.default;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = track.gain;
    this.masterGain.connect(this.ctx.destination);
    this.running = true;
    this.currentTrack = trackName;
    this._scheduleLoop(track);
  }

  stop() {
    this.running = false;
    this.currentTrack = null;
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

  _scheduleLoop(track) {
    if (!this.running || !this.ctx) return;
    const { chords, type, beatSec } = track;
    let idx = 0;
    const playChord = () => {
      if (!this.running || !this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const chord = chords[idx % chords.length];
      for (const freq of chord) {
        const osc = ctx.createOscillator();
        osc.type = type;
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
