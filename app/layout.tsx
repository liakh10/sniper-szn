import type { Metadata } from "next";
import "./globals.css";
import { TICKER, TOKEN_NAME } from "./config";
import { display, sans, mono } from "./fonts";

export const metadata: Metadata = {
  title: TICKER, // tab title is always just the ticker
  description: `${TOKEN_NAME} — watch the board, tap the green pumps, never touch a rug. A reflex sniper for the trenches, on Robinhood Chain.`,
};

export const viewport = { themeColor: "#0b0e14" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
