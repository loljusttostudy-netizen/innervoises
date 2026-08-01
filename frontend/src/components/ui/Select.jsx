import React from 'react';

export function Select({ options = [], className = '', ...props }) {
  return (
    <select
      className={`w-full px-3.5 py-2.5 bg-y2k-surface border border-y2k-border text-y2k-text text-sm font-semibold shadow-y2k-sm outline-none rounded-lg focus:shadow-y2k transition-all ${className}`}
      {...props}
    >
      {options.map((opt) => {
        const val = typeof opt === 'object' ? opt.value : opt;
        const label = typeof opt === 'object' ? opt.label : opt;
        return (
          <option key={val} value={val} className="bg-y2k-surface text-y2k-text">
            {label}
          </option>
        );
      })}
    </select>
  );
}
