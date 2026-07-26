import React from 'react';

const TONES = {
  green: 'bg-y2k-green text-y2k-greenDark border-y2k-greenDark',
  red: 'bg-y2k-red text-y2k-redDark border-y2k-redDark',
  amber: 'bg-y2k-yellow text-y2k-yellowDark border-y2k-yellowDark',
  yellow: 'bg-y2k-yellow text-y2k-yellowDark border-y2k-yellowDark',
  blue: 'bg-y2k-blue text-y2k-blueDark border-y2k-blueDark',
  purple: 'bg-y2k-purple text-y2k-purpleDark border-y2k-border',
  pink: 'bg-y2k-pink text-pink-900 border-y2k-border',
  gray: 'bg-y2k-gray text-y2k-text border-y2k-border',
  muted: 'bg-y2k-gray text-y2k-text border-y2k-border',
  primary: 'bg-y2k-text text-y2k-bg border-y2k-border',
};

export function Pill({ children, tone = 'gray', className = '' }) {
  const toneStyle = TONES[tone] || TONES.gray;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 border text-xs font-bold font-sans uppercase tracking-wide ${toneStyle} ${className}`}
    >
      {children}
    </span>
  );
}
