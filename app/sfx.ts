// Minimal WebAudio SFX — sharp screener blips for a sniper. Lazy after a gesture.
export class Sfx {
  private ctx: AudioContext | null = null;
  enabled = true;
  constructor() { try { this.enabled = localStorage.getItem("snipe_muted") !== "1"; } catch { /* */ } }
  private ac(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); } catch { this.enabled = false; return null; } }
    return this.ctx;
  }
  private blip(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
    const ac = this.ac(); if (!ac) return;
    const t = ac.currentTime; const o = ac.createOscillator(); const g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur);
  }
  private noise(dur: number, filt: number, vol: number, hp = false) {
    const ac = this.ac(); if (!ac) return;
    const t = ac.currentTime; const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ac.createBufferSource(); s.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = hp ? "highpass" : "lowpass"; f.frequency.value = filt;
    const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(ac.destination); s.start(t); s.stop(t + dur + 0.02);
  }
  setEnabled(b: boolean) { this.enabled = b; try { localStorage.setItem("snipe_muted", b ? "0" : "1"); } catch { /* */ } }

  snipe() { this.blip(880, 0.05, "square", 0.05, 1500); this.blip(1320, 0.05, "sine", 0.03, 1900); }  // clean hit
  blue() { [784, 1047, 1319, 1568].forEach((f, i) => setTimeout(() => this.blip(f, 0.1, "triangle", 0.055, f * 1.15), i * 42)); }
  rug() { this.noise(0.5, 900, 0.14); this.blip(120, 0.55, "sawtooth", 0.09, 32); }
  start() { [330, 440, 554, 740].forEach((f, i) => setTimeout(() => this.blip(f, 0.1, "square", 0.05, f * 1.2), i * 60)); }
  click() { this.blip(600, 0.04, "square", 0.04, 820); }
}
let _sfx: Sfx | null = null;
export function getSfx(): Sfx { if (!_sfx) _sfx = new Sfx(); return _sfx; }
