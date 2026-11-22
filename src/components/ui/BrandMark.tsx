import React from 'react';

/** New Horizon mark: a sun rising over a horizon line, in the dawn gradient. */
export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="nh-dawn" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#f5a524" />
          <stop offset="0.5" stopColor="#f0517a" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#12151d" />
      <path d="M14 40a18 18 0 0 1 36 0Z" fill="url(#nh-dawn)" />
      <rect x="10" y="42" width="44" height="3" rx="1.5" fill="url(#nh-dawn)" />
      <rect x="18" y="49" width="28" height="2.5" rx="1.25" fill="#f4f1ea" opacity="0.35" />
    </svg>
  );
}
