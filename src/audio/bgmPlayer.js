// Procedural BGM using Web Audio API. Three tracks for three modes.

const TRACKS = {
  // 보통: cheerful piano (C-G-Am-F, classic pop progression)
  normal: {
    chords: [
      [261.63, 329.63, 392.00, 523.25], // C  + high C
      [196.00, 246.94, 392.00, 493.88], // G  + high B
      [220.00, 261.63, 329.63, 440.00], // Am + high A
      [174.61, 220.00, 261.63, 349.23], // F  + high F
    ],
    type: 'triangle',
    beatSec: 2.0,
    gain: 0.07,
    envelope: 'piano',
  },
  // 어려움: tense / dramatic strings (Dm-Bb-F-C, square pulse)
  hard: {
    chords: [
      [146.83, 174.61, 220.00], // Dm
      [116.54, 174.61, 233.08], // Bb
      [174.61, 220.00, 261.63], // F
      [130.81, 164.81, 196.00], // C
    ],
    type: 'square',
    beatSec: 2.5,
    gain: 0.035,
    envelope: 'pulse',
  },
  // 지옥: dark sawtooth pad (low minor cycle)
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
    envelope: 'pad',
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

  start(trackName = 'normal') {
    if (this.running && this.currentTrack === trackName) return;
    if (this.running) this.stop();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const track = TRACKS[trackName] ?? TRACKS.normal;
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
    const { chords, type, beatSec, envelope } = track;
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

        if (envelope === 'piano') {
          // Quick attack, exponential decay — plucky piano feel
          env.gain.linearRampToValueAtTime(1, now + 0.015);
          env.gain.exponentialRampToValueAtTime(0.001, now + beatSec * 0.95);
        } else if (envelope === 'pulse') {
          // Staccato pulse — tense / dramatic
          env.gain.linearRampToValueAtTime(0.6, now + 0.04);
          env.gain.exponentialRampToValueAtTime(0.001, now + Math.min(0.9, beatSec * 0.55));
        } else {
          // Pad — slow attack, sustained
          env.gain.linearRampToValueAtTime(0.8, now + 0.8);
          env.gain.linearRampToValueAtTime(0, now + beatSec);
        }

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

export const bgm = new BgmPlayer();
