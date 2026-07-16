"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CA, TICKER, PUMP_URL, DEX_URL, isRealCA } from "../config";
import { crosshairSvg } from "../art/board";

const SECTIONS = [
  { id: "overview", label: "What is Trench Sniper?" },
  { id: "controls", label: "Gameplay & Controls" },
  { id: "cards", label: "Card States" },
  { id: "scoring", label: "Scoring & Combos" },
  { id: "token", label: `${TICKER} Token` },
  { id: "local", label: "Local & Free" },
  { id: "roadmap", label: "Roadmap" },
  { id: "faq", label: "FAQ" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="docs-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function BrandMark() {
  const svg = useMemo(() => crosshairSvg("#16c784", "#f5b70a"), []);
  return <span className="brand-mascot" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default function DocsContent() {
  const [active, setActive] = useState("overview");
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) setActive(e.target.id); },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    for (const s of SECTIONS) { const el = refs.current[s.id]; if (el) io.observe(el); }
    return () => io.disconnect();
  }, []);

  const real = isRealCA();

  return (
    <>
      <header className="nav">
        <Link href="/#top" className="brand"><BrandMark /> <b>Trench Sniper</b> <span className="brand-ticker">{TICKER}</span></Link>
        <nav className="nav-links">
          <Link href="/#play">Snipe</Link>
          <Link href="/#how">How</Link>
          <Link href="/#records">Records</Link>
          <span className="docs-nav-crumb">Docs</span>
        </nav>
        <div className="nav-actions">
          <Link href="/#play" className="btn btn-neon btn-sm">Snipe</Link>
        </div>
      </header>

      <div className="docs-shell">
        <aside className="docs-side">
          <span className="docs-kicker">Field Manual</span>
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={`docs-nav-link ${active === s.id ? "active" : ""}`}>{s.label}</a>
          ))}
        </aside>

        <main className="docs-main">
          <div className="docs-hero">
            <h1>Trench Sniper Docs</h1>
            <p>Everything about the reflex-tap board, scoring, and {TICKER} — in one page.</p>
          </div>

          <section id="overview" ref={(el) => { refs.current.overview = el; }} className="docs-section">
            <h2>What is Trench Sniper?</h2>
            <p>
              Trench Sniper is a reflex-tap trending-board game, playable instantly in the browser — no
              download, no signup. New token cards spawn into a fixed grid every second; tap the pumps,
              never touch a rug.
            </p>
            <div className="docs-table">
              <Row label="Ticker">{TICKER} (Solana, fair launch)</Row>
              <Row label="Format">Single-player reflex-tap grid, one-mistake-and-you&apos;re-rekt</Row>
              <Row label="Grid">6 slots on a fixed board</Row>
              <Row label="Cost to play">Free, unlimited, no wallet required</Row>
            </div>
          </section>

          <section id="controls" ref={(el) => { refs.current.controls = el; }} className="docs-section">
            <h2>Gameplay & Controls</h2>
            <p>One input: tap a card. What it turns out to be decides everything.</p>
            <div className="docs-table">
              <Row label="Tap a card">Snipes it if it&apos;s a pump or blue-chip; ends the run instantly if it&apos;s a rug</Row>
              <Row label="Tap a fresh card">A gamble — it hasn&apos;t revealed yet, so you&apos;re betting on what it turns into</Row>
              <Row label="Ignore a card">Missing a pump costs nothing — cards that go untapped simply expire</Row>
              <Row label="Game over">One rug tap ends the run — there&apos;s no second chance</Row>
            </div>
          </section>

          <section id="cards" ref={(el) => { refs.current.cards = el; }} className="docs-section">
            <h2>Card States</h2>
            <p>Every card starts unknown, then reveals into one of three outcomes.</p>
            <div className="docs-table">
              <Row label="Fresh (grey)">Just spawned, hasn&apos;t revealed — sniping it early is a gamble with worse odds than a revealed card</Row>
              <Row label="Pump (green)">Revealed safe — tap it for a snipe</Row>
              <Row label="Rug (red)">Revealed unsafe — tapping it ends the run</Row>
              <Row label="Blue-chip (gold)">Rare, always safe, pays a much bigger bonus than a regular pump</Row>
            </div>
          </section>

          <section id="scoring" ref={(el) => { refs.current.scoring = el; }} className="docs-section">
            <h2>Scoring & Combos</h2>
            <p>Early snipes and blue-chips pay more, and a clean streak multiplies everything.</p>
            <div className="docs-table">
              <Row label="Regular snipe">25 points on a revealed pump, 40 for sniping one still fresh</Row>
              <Row label="Blue-chip snipe">150 points, regardless of when you tap it</Row>
              <Row label="Combo">Each successful snipe raises a multiplier, up to a cap around 20</Row>
              <Row label="Best score / best streak">Both saved locally — only new records overwrite them</Row>
            </div>
          </section>

          <section id="token" ref={(el) => { refs.current.token = el; }} className="docs-section">
            <h2>{TICKER} Token</h2>
            <p>The game has no in-game currency or shop — {TICKER} is a separate community token that doesn&apos;t affect gameplay, card spawns, or scoring in any way.</p>
            <div className="docs-table">
              <Row label="Chain">Solana</Row>
              <Row label="Contract">{real ? <code className="mono">{CA}</code> : "SOON — not launched yet"}</Row>
              <Row label="Launch style">Fair launch on Pump Fun, no presale, no team allocation</Row>
              <Row label="Buy links">
                <a href={real ? PUMP_URL + CA : PUMP_URL} target="_blank" rel="noreferrer">Pump Fun</a>
                {" · "}
                <a href={real ? DEX_URL + CA : DEX_URL} target="_blank" rel="noreferrer">DexScreener</a>
              </Row>
            </div>
          </section>

          <section id="local" ref={(el) => { refs.current.local = el; }} className="docs-section">
            <h2>Local & Free</h2>
            <p>No backend, no account, no wallet gate on the game itself. Your records live only in this browser.</p>
            <div className="docs-table">
              <Row label="Storage">Best score and best streak saved to this browser&apos;s localStorage</Row>
              <Row label="Device-local">Clearing site data or switching browsers/devices resets your records</Row>
              <Row label="No leaderboard">Scores aren&apos;t submitted anywhere — Records is a personal record only</Row>
            </div>
            <p className="docs-note">Cross-device syncing, shared leaderboards, and any real-money mechanic are not built — see Roadmap below.</p>
          </section>

          <section id="roadmap" ref={(el) => { refs.current.roadmap = el; }} className="docs-section">
            <h2>Roadmap</h2>
            <div className="docs-table">
              <Row label="Live">Reflex-tap board, fresh/pump/rug/blue-chip cards, combo scoring, local best score & streak</Row>
              <Row label="Planned">New card types, alternate board sizes/speeds</Row>
              <Row label="Token">{TICKER} fair launch — CA appears here and on the buy links the moment it&apos;s live</Row>
            </div>
          </section>

          <section id="faq" ref={(el) => { refs.current.faq = el; }} className="docs-section">
            <h2>FAQ</h2>
            <dl className="docs-faq">
              <dt>Do I need a wallet to play?</dt>
              <dd>No. Trench Sniper is fully playable free, with no connection of any kind.</dd>
              <dt>Is tapping a fresh card always risky?</dt>
              <dd>Yes — it hasn&apos;t revealed yet, so there&apos;s always a chance it turns out to be a rug.</dd>
              <dt>Is {TICKER} live yet?</dt>
              <dd>Not yet. The contract address on this page reads &quot;SOON&quot; until it launches.</dd>
              <dt>Does a missed pump hurt my score?</dt>
              <dd>No — letting a card expire untapped has no penalty at all.</dd>
            </dl>
          </section>
        </main>
      </div>
    </>
  );
}
