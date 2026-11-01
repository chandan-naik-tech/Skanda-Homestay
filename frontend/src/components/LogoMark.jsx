import { useId } from 'react';

/**
 * The homestay logo mark: a house under a morning sun, standing above a wave (a coastal, welcoming home), on a blue disc.
 * `animated` draws it stroke by stroke (used for the launch screen and the section-change flash).
 * The same artwork is in public/logo.svg and public/favicon.svg.
 */
export default function LogoMark({ animated = false, size = 42, className = '' }) {
  const id = `lm${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg className={`logomark ${animated ? 'logomark--draw' : ''} ${className}`} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="8" y1="6" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#48A9E6" />
          <stop offset="1" stopColor="#125A94" />
        </linearGradient>
      </defs>
      <circle className="lm-disc" cx="32" cy="32" r="32" fill={`url(#${id})`} />
      <circle className="lm-sun" cx="44.5" cy="14.5" r="4" fill="#fff" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path className="lm-roof" pathLength="1" d="M13 35 32 18 51 35" stroke="#fff" strokeWidth="4.5" />
        <path className="lm-body" pathLength="1" d="M19 31v16h26V31" stroke="#fff" strokeWidth="4.5" />
        <path className="lm-door" pathLength="1" d="M28 47v-6a4 4 0 0 1 8 0v6" stroke="#fff" strokeWidth="3.5" />
        <path className="lm-wave" pathLength="1" d="M14 55q4.5-4 9 0t9 0 9 0 9 0" stroke="#BFE3FF" strokeWidth="3" />
      </g>
    </svg>
  );
}
