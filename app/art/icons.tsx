import type { CSSProperties, FC } from "react";

type P = { size?: number; className?: string; style?: CSSProperties };

export const ScoreIcon: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M3 16l5-6 4 3 9-9" fill="none" stroke="#16c784" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 4h6v6" fill="none" stroke="#16c784" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ComboIcon: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#f5b70a" />
  </svg>
);

export const SnipeIcon: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <circle cx="12" cy="12" r="8" fill="none" stroke="#16c784" strokeWidth="1.8" />
    <path d="M12 1v5M12 18v5M1 12h5M18 12h5" stroke="#16c784" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="12" r="1.8" fill="#16c784" />
  </svg>
);

export const TrophyIcon: FC<P> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" fill="none" stroke="#f5b70a" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5" fill="none" stroke="#f5b70a" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M10 15h4v3h-4z" fill="none" stroke="#f5b70a" strokeWidth="1.8" /><path d="M8 21h8" stroke="#f5b70a" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const XIcon: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="M3 3l7.6 9.9L3.4 21h2.3l5.8-6.7L16.6 21H21l-8-10.4L20.4 3h-2.3l-5.4 6.2L7.7 3H3Z" fill="currentColor" />
  </svg>
);
