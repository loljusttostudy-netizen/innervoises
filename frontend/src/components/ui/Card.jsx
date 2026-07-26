import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white border-2 border-y2k-border shadow-y2k p-5 transition-all ${
        hover ? 'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-y2k-lg cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
