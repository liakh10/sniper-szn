// Local persistence: best score + best combo streak + audio pref. Device-local.
const SCORE_KEY = "snipe_best_score";
const COMBO_KEY = "snipe_best_combo";
const MUTED_KEY = "snipe_muted";

export function getBestScore(): number { try { return Number(localStorage.getItem(SCORE_KEY) || "0") || 0; } catch { return 0; } }
export function saveBestScore(v: number): boolean {
  if (v <= getBestScore()) return false;
  try { localStorage.setItem(SCORE_KEY, String(Math.round(v))); return true; } catch { return false; }
}

export function getBestCombo(): number { try { return Number(localStorage.getItem(COMBO_KEY) || "0") || 0; } catch { return 0; } }
export function saveBestCombo(v: number): boolean {
  if (v <= getBestCombo()) return false;
  try { localStorage.setItem(COMBO_KEY, String(v)); return true; } catch { return false; }
}

export function getMuted(): boolean { try { return localStorage.getItem(MUTED_KEY) === "1"; } catch { return false; } }
export function setMuted(v: boolean) { try { localStorage.setItem(MUTED_KEY, v ? "1" : "0"); } catch { /* */ } }
