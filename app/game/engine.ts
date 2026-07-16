// Trench Sniper — reflex tap over a trending board. Cards spawn into a fixed grid
// of slots, start "fresh" (unknown), then reveal as "pump" (green) or "rug"
// (red). Tapping a pump snipes it for points; tapping a rug is instant REKT
// (one-mistake rule). A missed pump just expires with no penalty. A rare
// "blue" card pays a big bonus.

import { makeCardVisual, type CardVisual } from "../art/board";

export type CardStatus = "fresh" | "pump" | "rug" | "blue";

export interface Card {
  id: number;
  slot: number;          // grid slot index
  status: CardStatus;
  revealDir: 1 | -1;     // what a fresh card reveals into (pump/rug); blue counts as pump
  isBlue: boolean;
  bornAt: number;        // ms
  revealAt: number;      // ms when fresh -> revealed
  expireAt: number;      // ms when it leaves
  visual: CardVisual;
  sniped: boolean;
  popAt: number | null;  // set on snipe, drives pop-out anim then removal
}

export type Phase = "idle" | "playing" | "over";

export const SLOTS = 6; // 2 cols x 3 rows on desktop; engine is layout-agnostic
const FRESH_MS = 700;
const LIFE_MS = 1700;      // total on-board time before expiry
const BASE_SPAWN_MS = 620;
const MIN_SPAWN_MS = 300;
const RAMP = 1 / 45000;    // spawn speed-up per ms
const BLUE_CHANCE = 0.08;
const RUG_SHARE = 0.42;    // of non-blue reveals, share that are rugs
const FRESH_RUG_ODDS = 0.3; // tapping a fresh card: chance it was a rug

let uid = 1;

export class Game {
  phase: Phase = "idle";
  score = 0;
  combo = 0;
  bestCombo = 0;
  snipes = 0;
  rekt = false;
  cards: Card[] = [];

  private now = 0;
  private spawnAcc = 0;

  onSnipe?: (blue: boolean) => void;
  onRug?: () => void;

  start() {
    this.phase = "playing";
    this.score = 0; this.combo = 0; this.bestCombo = 0; this.snipes = 0; this.rekt = false;
    this.cards = [];
    this.now = 0; this.spawnAcc = 0;
  }

  private freeSlots(): number[] {
    const used = new Set(this.cards.filter((c) => c.popAt == null).map((c) => c.slot));
    const out: number[] = [];
    for (let i = 0; i < SLOTS; i++) if (!used.has(i)) out.push(i);
    return out;
  }

  private spawn() {
    const free = this.freeSlots();
    if (!free.length) return;
    const slot = free[Math.floor(Math.random() * free.length)];
    const isBlue = Math.random() < BLUE_CHANCE;
    const dir: 1 | -1 = isBlue ? 1 : Math.random() < RUG_SHARE ? -1 : 1;
    this.cards.push({
      id: uid++, slot, status: "fresh", revealDir: dir, isBlue,
      bornAt: this.now, revealAt: this.now + FRESH_MS, expireAt: this.now + LIFE_MS,
      visual: makeCardVisual(0), sniped: false, popAt: null,
    });
  }

  private reveal(c: Card) {
    c.status = c.isBlue ? "blue" : c.revealDir === 1 ? "pump" : "rug";
    c.visual = makeCardVisual(c.revealDir);
  }

  tap(id: number) {
    if (this.phase !== "playing") return;
    const c = this.cards.find((x) => x.id === id && !x.sniped && x.popAt == null);
    if (!c) return;

    // Resolve based on true nature (fresh cards gamble on their hidden reveal).
    let hitRug: boolean;
    if (c.status === "fresh") {
      // early snipe: gamble. Rugs always rug; pumps have a small fake-out chance.
      hitRug = c.revealDir === -1 ? true : Math.random() < FRESH_RUG_ODDS - (c.isBlue ? 1 : 0);
    } else {
      hitRug = c.status === "rug";
    }

    if (hitRug) {
      this.phase = "over"; this.rekt = true; this.combo = 0;
      this.onRug?.();
      return;
    }

    // successful snipe
    c.sniped = true; c.popAt = this.now;
    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.snipes++;
    const early = c.status === "fresh";
    const comboMult = 1 + Math.min(this.combo, 20) * 0.1;
    const base = c.isBlue ? 150 : early ? 40 : 25;
    this.score += Math.round(base * comboMult);
    this.onSnipe?.(c.isBlue);
  }

  update(dtMs: number) {
    if (this.phase !== "playing") return;
    this.now += dtMs;

    this.spawnAcc += dtMs;
    const gap = Math.max(MIN_SPAWN_MS, BASE_SPAWN_MS - this.now * RAMP * BASE_SPAWN_MS);
    if (this.spawnAcc >= gap) { this.spawnAcc = 0; this.spawn(); }

    for (const c of this.cards) {
      if (c.status === "fresh" && this.now >= c.revealAt) this.reveal(c);
      // a missed pump breaking the run's flow doesn't reset combo; only rugs/taps do
    }
    this.cards = this.cards.filter((c) => {
      if (c.popAt != null) return this.now - c.popAt < 200;
      return this.now < c.expireAt;
    });
  }

  state() {
    return {
      phase: this.phase, score: this.score, combo: this.combo, bestCombo: this.bestCombo,
      snipes: this.snipes, rekt: this.rekt, cardCount: this.cards.length,
    };
  }

  // dev-only headless helpers, mirrored on window.__game
  debugAdvance(dtMs: number) { this.update(dtMs); }
  debugTap(id: number) { this.tap(id); }
  debugSpawnKind(kind: CardStatus, slot = 0) {
    const isBlue = kind === "blue";
    const dir: 1 | -1 = kind === "rug" ? -1 : 1;
    const c: Card = {
      id: uid++, slot, status: kind === "fresh" ? "fresh" : kind, revealDir: dir, isBlue,
      bornAt: this.now, revealAt: this.now + FRESH_MS, expireAt: this.now + LIFE_MS,
      visual: makeCardVisual(kind === "fresh" ? 0 : dir), sniped: false, popAt: null,
    };
    this.cards.push(c);
    return c.id;
  }
}
