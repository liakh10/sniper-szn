// Authored art + helpers for the trending-board screener: procedural meme
// tickers, a mini sparkline generator, a card renderer, and the sniper
// crosshair SVG. No photos — everything is drawn in code.

// Sniper crosshair — used as the brand mark and the splash mascot.
export function crosshairSvg(ring: string, dot: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="46" fill="none" stroke="${ring}" stroke-width="4"/>
    <circle cx="60" cy="60" r="30" fill="none" stroke="${ring}" stroke-width="2" opacity="0.5"/>
    <path d="M60 6v26M60 88v26M6 60h26M88 60h26" stroke="${ring}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="60" cy="60" r="5" fill="${dot}"/>
  </svg>`;
}

// Meme-ticker generator — evokes the sent screenshot without lifting real logos.
const ROOTS = ["ROTH", "WIF", "PEPE", "BONK", "DOGE", "HOOD", "CHAD", "GM", "NGMI", "MOON", "APE", "GOOSE",
  "TREMP", "VLAD", "SEED", "BOOR", "FIGS", "TYLEE", "NOXA", "BULL", "WOJAK", "MILADY", "SIGMA", "COPE",
  "FOMO", "REKT", "LAMBO", "DIAMOND", "PAPER", "SAFU", "DEGEN", "PUMP", "SNIPE", "HODL", "4663"];
const SUFFIX = ["", "", "", "2.0", "INU", "AI", "X", "COIN", "FI", "DAO", "69", "CTO", "ROBIN"];

export function randomTicker(): string {
  const r = ROOTS[Math.floor(Math.random() * ROOTS.length)];
  const s = SUFFIX[Math.floor(Math.random() * SUFFIX.length)];
  const t = s ? `${r}${s.length <= 3 && Math.random() < 0.5 ? "" : " "}${s}` : r;
  return t.slice(0, 10).toUpperCase();
}

export function randomMcap(): string {
  const v = Math.random();
  const n = v < 0.5 ? Math.random() * 9 + 1 : Math.random() * 90 + 10; // 1..99
  const unit = v < 0.5 ? "K" : "K";
  return `$${n.toFixed(1)}${unit}`;
}

// A short random price path, biased up (pump), down (rug) or flat (fresh).
export function makeSpark(dir: 1 | -1 | 0, n = 14): number[] {
  const pts: number[] = [];
  let y = 0.5;
  for (let i = 0; i < n; i++) {
    const drift = dir * 0.06;
    y += drift + (Math.random() - 0.5) * 0.09;
    y = Math.max(0.05, Math.min(0.95, y));
    pts.push(y);
  }
  return pts;
}

export interface CardVisual {
  ticker: string;
  mcap: string;
  spark: number[];
  pctText: string;
}

export function makeCardVisual(dir: 1 | -1 | 0): CardVisual {
  const pct = dir === 0 ? 0 : dir * (Math.floor(Math.random() * 400) + 20);
  return {
    ticker: randomTicker(),
    mcap: randomMcap(),
    spark: makeSpark(dir),
    pctText: dir === 0 ? "· · ·" : `${pct > 0 ? "+" : ""}${pct}%`,
  };
}
