import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 bg-white border-2 border-y2k-border text-y2k-text text-sm font-medium placeholder:text-y2k-muted/60 shadow-y2k-sm outline-none focus:bg-amber-50/20 focus:shadow-y2k transition-all ${className}`}
      {...props}
    />
  );
}
