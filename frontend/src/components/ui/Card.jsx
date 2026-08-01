import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-y2k-surface text-y2k-text border border-y2k-border shadow-y2k p-5 transition-all rounded-xl ${
        hover ? 'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-y2k-lg cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
