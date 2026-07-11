// Procedural loop — a nervy "screener" pulse: a driving sub bass, a scanning
// minor arp, and a tight hi-hat tick, built live with WebAudio (no mp3).
// Started by a user gesture (the launch splash).

export class MusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  playing = false;
  muted = false;
  private step = 0;

  private readonly bass = [98, 98, 98, 130.81, 87.31, 87.31, 116.54, 98]; // driving minor sub
  private readonly arp = [523.25, 622.25, 783.99, 622.25, 587.33, 698.46, 880, 698.46];

  private ensure(): boolean {
    if (this.ctx) return true;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.0001;
      this.master.connect(this.ctx.destination);
      return true;
    } catch { return false; }
  }

  private note(f: number, t: number, type: OscillatorType, vol: number, dur: number, filt?: number) {
    if (!this.ctx || !this.master) return;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = type; o.frequency.value = f;
    let node: AudioNode = o;
    if (filt) { const bf = this.ctx.createBiquadFilter(); bf.type = "lowpass"; bf.frequency.value = filt; o.connect(bf); node = bf; }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  }

  private hat(t: number) {
    if (!this.ctx || !this.master) return;
    const len = Math.floor(this.ctx.sampleRate * 0.03);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = this.ctx.createBufferSource(); s.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 6000;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.035, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t); s.stop(t + 0.04);
  }

  private tickFn = () => {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    if (this.step % 2 === 0) this.note(this.bass[Math.floor(this.step / 2) % this.bass.length], t, "sawtooth", 0.07, 0.2, 440);
    this.note(this.arp[this.step % this.arp.length], t, "square", 0.028, 0.09, 2200); // scanning arp
    if (this.step % 2 === 1) this.hat(t);
    this.step++;
  };

  play() {
    if (!this.ensure() || !this.ctx || !this.master) return;
    if (this.ctx.state === "suspended") this.ctx.resume();
    if (this.playing) return;
    this.playing = true;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), this.ctx.currentTime);
    this.master.gain.exponentialRampToValueAtTime(this.muted ? 0.0001 : 0.8, this.ctx.currentTime + 1.2);
    this.tickFn();
    this.timer = window.setInterval(this.tickFn, 150);
  }

  pause() {
    this.playing = false;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.ctx && this.master) { this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4); }
  }

  toggle() { if (this.playing) this.pause(); else this.play(); }
  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx && this.master) { this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.exponentialRampToValueAtTime(m ? 0.0001 : 0.8, this.ctx.currentTime + 0.3); }
  }
  dispose() { this.pause(); try { this.ctx?.close(); } catch { /* */ } this.ctx = null; }
}

let _music: MusicEngine | null = null;
export function getMusic(): MusicEngine {
  if (!_music) {
    _music = new MusicEngine();
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") (window as unknown as { __music?: MusicEngine }).__music = _music;
  }
  return _music;
}
