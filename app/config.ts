// Token / Contract Address config. On launch, replace CA with the real address,
// commit & push — the site picks it up automatically (GitHub → Vercel auto-deploy).
export const CA: string = "SOON"; // Replace with real CA on launch
export const TICKER = "$TRENCHPER";
export const TOKEN_NAME = "Trench Sniper";
export const X_URL = "https://x.com/soon"; // Replace with your X handle

// CA block: CA + pump.fun + DexScreener. Link tails pull the CA variable.
export const PUMP_URL = "https://pump.fun/coin/";
export const DEX_URL = "https://dexscreener.com/solana/";

export function isRealCA(): boolean {
  return CA !== "SOON" && CA.trim() !== "";
}
