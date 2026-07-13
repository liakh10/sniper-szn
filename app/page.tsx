"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CA, TICKER, X_URL, NOXA_URL, DEX_URL, isRealCA } from "./config";
import { XIcon, ComboIcon, TrophyIcon } from "./art/icons";
import { crosshairSvg } from "./art/board";
import { getSfx } from "./sfx";
import { getMusic } from "./music";
import { getBestScore, getBestCombo } from "./store";
import Enter from "./Enter";

const GameCanvas = dynamic(() => import("./game/GameCanvas"), { ssr: false });

const NAV = [
  { href: "#play", label: "Snipe" },
  { href: "#how", label: "How" },
  { href: "#records", label: "Records" },
  { href: "/docs", label: "Docs" },
];

const HOW = [
  ["Watch the board", "New tokens hit the trending board every second. Each one starts as a NEW PAIR — nobody knows yet if it moons or rugs."],
  ["Tap the green pumps", "When a card turns green it's pumping — tap fast to snipe it. Snipe a fresh card early for a bigger, riskier payout, and grab gold blue-chips."],
  ["Never touch a rug", "Red card = rug pull. Tap one and the run ends instantly. Missing a pump costs nothing — greed and misclicks are the only way to die."],
];

const NOTES = [
  { h: "wtf is this", b: "The trending board is a slot machine. Sixteen thousand tokens a day, and your finger is the only thing between a snipe and a rug." },
  { h: "the chain", b: "Built for Robinhood Chain, where retail piled in and the board never stopped moving. $SNIPE runs on that chaos." },
  { h: "the rug", b: "One red card ends everything. No stop-loss, no undo. Reflexes and restraint — that's the whole edge." },
];

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function BrandMark() {
  const svg = useMemo(() => crosshairSvg("#16c784", "#f5b70a"), []);
  return <span className="brand-mascot" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function CABlock() {
  const [copied, setCopied] = useState(false);
  const real = isRealCA();
  const copy = () => navigator.clipboard?.writeText(CA).then(() => { setCopied(true); getSfx().click(); setTimeout(() => setCopied(false), 1400); }).catch(() => {});
  return (
    <div className="ca">
      <span className="ca-label">CA</span>
      <code className="ca-value">{real ? CA : "SOON"}</code>
      {real && <button className="ca-copy" onClick={copy}>{copied ? "copied" : "copy"}</button>}
    </div>
  );
}

function BuyLinks({ small }: { small?: boolean }) {
  const cls = small ? "btn btn-sm" : "btn";
  return (
    <div className="buy">
      <a className={`${cls} btn-neon`} href={isRealCA() ? NOXA_URL + CA : NOXA_URL} target="_blank" rel="noreferrer">NOXA</a>
      <a className={`${cls} btn-ghost`} href={isRealCA() ? DEX_URL + CA : DEX_URL} target="_blank" rel="noreferrer">DexScreener</a>
    </div>
  );
}

function Records() {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  useEffect(() => {
    const refresh = () => { setScore(getBestScore()); setCombo(getBestCombo()); };
    refresh();
    window.addEventListener("snipe:update", refresh);
    window.addEventListener("snipe:awake", refresh);
    window.addEventListener("focus", refresh);
    return () => { window.removeEventListener("snipe:update", refresh); window.removeEventListener("snipe:awake", refresh); window.removeEventListener("focus", refresh); };
  }, []);
  return (
    <div className="records">
      <div className="record-card reveal"><TrophyIcon size={26} /><b>{score.toLocaleString()}</b><span>best score</span></div>
      <div className="record-card reveal"><ComboIcon size={22} /><b>{combo}×</b><span>best streak</span></div>
    </div>
  );
}

export default function Home() {
  useReveal();
  const [muted, setMutedState] = useState(false);
  useEffect(() => {
    const onAwake = () => setMutedState(getMusic().muted);
    window.addEventListener("snipe:awake", onAwake);
    return () => window.removeEventListener("snipe:awake", onAwake);
  }, []);
  const toggleMute = () => { const m = !muted; setMutedState(m); getMusic().setMuted(m); getSfx().setEnabled(!m); if (!m) getMusic().play(); };

  return (
    <>
      <Enter />
      <main>
        <header className="nav">
          <a href="#top" className="brand"><BrandMark /> <b>Sniper Szn</b> <span className="brand-ticker">{TICKER}</span></a>
          <nav className="nav-links">{NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</nav>
          <div className="nav-actions">
            <button className="icon-btn" onClick={toggleMute} title="sound">{muted ? "off" : "on"}</button>
            <a href={X_URL} target="_blank" rel="noreferrer" className="icon-btn" aria-label="X"><XIcon size={15} /></a>
            <a href="#play" className="btn btn-neon btn-sm">Snipe</a>
          </div>
        </header>

        <section id="top" className="hero">
          <span className="pill reveal">reflex sniper · on Robinhood Chain</span>
          <h1 className="hero-title reveal">SNIPER SZN</h1>
          <p className="hero-sub reveal">Watch the board. Tap the green pumps. Never touch a rug.</p>
          <div id="play" className="reveal"><GameCanvas /></div>
          <div className="hero-token reveal"><CABlock /><BuyLinks small /></div>
        </section>

        <section id="how" className="section">
          <div className="section-head reveal"><span className="pill">How to Snipe</span><h2 className="section-title">Watch. Tap. Survive.</h2></div>
          <div className="how">
            {HOW.map(([h, b], i) => (
              <div className="how-item reveal" key={h}><span className="how-n">{i + 1}</span><h3>{h}</h3><p>{b}</p></div>
            ))}
          </div>
        </section>

        <section id="records" className="section section-roster">
          <div className="section-head reveal"><span className="pill">Records</span><h2 className="section-title">Your best run</h2><p className="section-lead">Best score and longest snipe streak, saved on your device.</p></div>
          <Records />
        </section>

        <section id="notes" className="section">
          <div className="section-head reveal"><span className="pill">Notes</span><h2 className="section-title">Trench notes</h2></div>
          <div className="notes-wall">
            {NOTES.map((n, i) => <article className={`note note-${i % 3} reveal`} key={n.h}><h3>{n.h}</h3><p>{n.b}</p></article>)}
          </div>
        </section>

        <footer className="footer">
          <div className="footer-top reveal">
            <a href="#top" className="brand"><BrandMark /> <b>Sniper Szn</b></a>
            <div className="footer-links"><a href="#play">Snipe</a><a href="#how">How</a><a href="#records">Records</a><a href="/docs">Docs</a><a href={X_URL} target="_blank" rel="noreferrer" className="footer-x" aria-label="X"><XIcon size={14} /></a></div>
          </div>
          <div className="footer-buy reveal"><CABlock /><BuyLinks small /></div>
          <p className="footer-bottom">© {new Date().getFullYear()} {TICKER} · snipe responsibly</p>
        </footer>
      </main>
    </>
  );
}
