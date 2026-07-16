import { Chakra_Petch, Inter, Space_Mono } from "next/font/google";

// Trench Sniper identity — a techno HUD/terminal display (Chakra Petch), unused
// elsewhere in the hub (distinct from Anton / Space Grotesk / Bangers / Bungee /
// Orbitron / Titan One / Fredoka / Cinzel / Bricolage / Baloo / Fraunces). Space
// Mono drives the screener digits/tickers (JetBrains & IBM Plex Mono are taken).
export const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
export const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});
export const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});
