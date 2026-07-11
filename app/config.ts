// Token / Contract Address config. On launch, replace CA with the real address,
// commit & push — the site picks it up automatically (GitHub → Vercel auto-deploy).
// NOTE: this one game targets Robinhood Chain (EVM L2, chain id 4663), not Solana —
// the launchpad/DEX links below are chain-specific, not the hub's usual pump.fun/dexscreener-solana.
export const CA: string = "SOON"; // Replace with real CA on launch
export const TICKER = "$SNIPE";
export const TOKEN_NAME = "Sniper Szn";
export const X_URL = "https://x.com/soon"; // Replace with your X handle

// CA block: CA + NOXA (Robinhood Chain's launchpad) + DexScreener. Link tails pull the CA variable.
export const NOXA_URL = "https://fun.noxa.fi/robinhood/";
export const DEX_URL = "https://dexscreener.com/robinhood/";

export function isRealCA(): boolean {
  return CA !== "SOON" && CA.trim() !== "";
}
