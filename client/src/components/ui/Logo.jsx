import React from 'react';

export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect width="64" height="64" rx="14" className="fill-ink dark:fill-mist" />
        <path
          d="M10 40 L32 16 L54 40"
          stroke="#B5541F"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 40 L18 50 L46 50 L46 40"
          className="stroke-paper dark:stroke-onyx"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display text-[15px] font-semibold leading-tight tracking-tight">
        Northline
        <span className="block -mt-0.5 text-[10px] font-normal uppercase tracking-[0.2em] text-ink-soft dark:text-mist-soft">
          Roofing &amp; Exteriors
        </span>
      </span>
    </div>
  );
}
