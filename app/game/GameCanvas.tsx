"use client";

import { useEffect, useRef, useState } from "react";
import { Game, SLOTS, type Card } from "./engine";
import { ScoreIcon, ComboIcon, SnipeIcon, TrophyIcon } from "../art/icons";
import { getSfx } from "../sfx";
import { getMusic } from "../music";
import { getBestScore, saveBestScore, saveBestCombo } from "../store";

interface Hud { phase: "idle" | "playing" | "over"; score: number; combo: number; bestCombo: number; snipes: number; rekt: boolean; }
const IDLE_HUD: Hud = { phase: "idle", score: 0, combo: 0, bestCombo: 0, snipes: 0, rekt: false };

const COLS = 2, ROWS = 3; // SLOTS = 6
const C = { bg: "#0b0e14", card: "#141922", cardLo: "#10141c", grid: "#1c2230", ink: "#e6ebf2", inkSoft: "#7a8494", green: "#16c784", red: "#ea3943", gold: "#f5b70a", gray: "#3a4454" };

function slotRect(slot: number, W: number, H: number) {
  const pad = Math.min(W, H) * 0.03;
  const cw = (W - pad * (COLS + 1)) / COLS;
  const ch = (H - pad * (ROWS + 1)) / ROWS;
  const col = slot % COLS, row = Math.floor(slot / COLS);
  return { x: pad + col * (cw + pad), y: pad + row * (ch + pad), w: cw, h: ch };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}

function drawCard(ctx: CanvasRenderingContext2D, c: Card, W: number, H: number, now: number) {
  const r = slotRect(c.slot, W, H);
  let scale = 1, alpha = 1;
  if (c.popAt != null) { const a = (now - c.popAt) / 200; scale = 1 + a * 0.25; alpha = Math.max(0, 1 - a); }
  else if (now - c.bornAt < 140) { scale = 0.9 + ((now - c.bornAt) / 140) * 0.1; }

  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy); ctx.scale(scale, scale); ctx.translate(-cx, -cy);

  const border = c.status === "pump" ? C.green : c.status === "rug" ? C.red : c.status === "blue" ? C.gold : C.gray;
  const accent = c.status === "rug" ? C.red : c.status === "blue" ? C.gold : c.status === "pump" ? C.green : C.inkSoft;

  ctx.fillStyle = C.card;
  roundRect(ctx, r.x, r.y, r.w, r.h, Math.min(r.w, r.h) * 0.09); ctx.fill();
  ctx.lineWidth = c.status === "fresh" ? 1.4 : 2.2; ctx.strokeStyle = border; ctx.stroke();

  const pad = r.w * 0.09;
  const fMono = (s: number) => `700 ${Math.round(s)}px var(--font-mono), monospace`;
  // ticker
  ctx.fillStyle = C.ink; ctx.font = fMono(r.h * 0.15); ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillText(c.status === "fresh" ? "NEW PAIR" : c.visual.ticker, r.x + pad, r.y + pad);
  // mcap
  ctx.fillStyle = C.inkSoft; ctx.font = `400 ${Math.round(r.h * 0.1)}px var(--font-mono), monospace`;
  ctx.fillText(c.status === "fresh" ? "minted just now" : `MC ${c.visual.mcap}`, r.x + pad, r.y + pad + r.h * 0.19);

  // sparkline
  const sx = r.x + pad, sy = r.y + r.h * 0.5, sw = r.w - pad * 2, sh = r.h * 0.3;
  if (c.status === "fresh") {
    ctx.fillStyle = C.gray; ctx.font = `700 ${Math.round(r.h * 0.24)}px var(--font-display), sans-serif`;
    ctx.textAlign = "center"; ctx.fillText("?", cx, r.y + r.h * 0.5);
  } else {
    const pts = c.visual.spark;
    ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.lineJoin = "round";
    ctx.beginPath();
    pts.forEach((p, i) => { const px = sx + (i / (pts.length - 1)) * sw; const py = sy + sh - p * sh; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
    ctx.stroke();
    // pct
    ctx.fillStyle = accent; ctx.font = fMono(r.h * 0.15); ctx.textAlign = "right"; ctx.textBaseline = "bottom";
    ctx.fillText(c.visual.pctText, r.x + r.w - pad, r.y + r.h - pad);
  }
  ctx.restore();
}

export default function GameCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [hud, setHud] = useState<Hud>(IDLE_HUD);
  const [best, setBest] = useState(() => getBestScore());
  const [flash, setFlash] = useState<"snipe" | "blue" | "rug" | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;

    const game = new Game(); gameRef.current = game;
    const s = getSfx();
    game.onSnipe = (blue) => { if (blue) { s.blue(); setFlash("blue"); } else { s.snipe(); setFlash("snipe"); } setTimeout(() => setFlash(null), 150); };
    game.onRug = () => {
      s.rug(); setFlash("rug");
      const nb = saveBestScore(game.score); saveBestCombo(game.bestCombo);
      if (nb) setBest(game.score); else setBest(getBestScore());
      window.dispatchEvent(new Event("snipe:update"));
    };

    if (process.env.NODE_ENV !== "production") (window as unknown as { __game?: Game }).__game = game;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0;

    const hit = (clientX: number, clientY: number) => {
      const g = gameRef.current; if (!g || g.phase !== "playing") return;
      const r = canvas.getBoundingClientRect();
      const x = (clientX - r.left) / Math.max(1, r.width) * W;
      const y = (clientY - r.top) / Math.max(1, r.height) * H;
      // topmost card whose slot rect contains the point
      for (let i = g.cards.length - 1; i >= 0; i--) {
        const c = g.cards[i]; if (c.popAt != null) continue;
        const sr = slotRect(c.slot, W, H);
        if (x >= sr.x && x <= sr.x + sr.w && y >= sr.y && y <= sr.y + sr.h) { g.tap(c.id); return; }
      }
    };
    const down = (e: PointerEvent) => hit(e.clientX, e.clientY);
    canvas.addEventListener("pointerdown", down);

    let last = "";
    const syncHud = () => {
      const st = game.state();
      const key = `${st.phase}|${st.score}|${st.combo}|${st.bestCombo}|${st.snipes}|${st.rekt}`;
      if (key !== last) { last = key; setHud({ phase: st.phase, score: st.score, combo: st.combo, bestCombo: st.bestCombo, snipes: st.snipes, rekt: st.rekt }); }
    };

    let raf = 0, prev = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(50, now - prev); prev = now;
      const r = wrap.getBoundingClientRect();
      W = r.width; H = r.height;
      const wantW = Math.round(W * dpr), wantH = Math.round(H * dpr);
      if (canvas.width !== wantW || canvas.height !== wantH) {
        canvas.width = wantW; canvas.height = wantH; canvas.style.width = W + "px"; canvas.style.height = H + "px";
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

      // empty-slot placeholders
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      for (let i = 0; i < SLOTS; i++) { const sr = slotRect(i, W, H); roundRect(ctx, sr.x, sr.y, sr.w, sr.h, Math.min(sr.w, sr.h) * 0.09); ctx.stroke(); }

      game.update(dt);
      for (const c of game.cards) drawCard(ctx, c, W, H, performance.now());

      syncHud();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(raf); canvas.removeEventListener("pointerdown", down); };
  }, []);

  const start = () => { getSfx().start(); try { getMusic().play(); } catch { /* */ } gameRef.current?.start(); };

  return (
    <div className="game">
      <div className="game-hud">
        <div className="hud-score"><ScoreIcon size={17} /> {hud.score.toLocaleString()}</div>
        {hud.combo >= 2 && <div className="hud-combo"><ComboIcon size={15} /> {hud.combo}× streak</div>}
        <div className="hud-snipes"><SnipeIcon size={15} /> {hud.snipes}</div>
        <div className="hud-best"><TrophyIcon size={14} /> best {best.toLocaleString()}</div>
      </div>

      <div className="game-stage" ref={wrapRef}>
        <canvas ref={canvasRef} className="game-canvas" />
        {flash && <div className={`snipe-flash flash-${flash}`} />}

        {hud.phase === "idle" && (
          <div className="game-overlay">
            <h3>Snipe the pumps.</h3>
            <p>New tokens hit the board every second. Tap the green pumps to snipe them, grab the gold blue-chips — but touch one red rug and you&apos;re done.</p>
            <button className="btn btn-neon btn-lg" onClick={start}>Load up</button>
          </div>
        )}
        {hud.phase === "over" && (
          <div className="game-overlay">
            <h3>{hud.rekt ? "RUGGED." : "Session over."}</h3>
            <div className="over-row"><span><ScoreIcon size={17} /> {hud.score.toLocaleString()}</span><span><ComboIcon size={15} /> {hud.bestCombo}× best streak</span></div>
            <p className="over-best">{hud.score >= best && hud.score > 0 ? "new sniper record!" : `best ${best.toLocaleString()}`}</p>
            <button className="btn btn-neon btn-lg" onClick={start}>Run it back</button>
          </div>
        )}
      </div>
    </div>
  );
}
