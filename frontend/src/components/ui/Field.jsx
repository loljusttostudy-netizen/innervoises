import React from 'react';

export function Field({ label, children, hint }) {
  return (
    <div className="w-full">
      {label && (
        <p className="text-[12px] font-medium text-text mb-1.5">{label}</p>
      )}
      {children}
      {hint && <p className="text-[11px] text-muted mt-1">{hint}</p>}
    </div>
  );
}
