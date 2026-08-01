import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-y2k-surface text-y2k-text border border-y2k-border shadow-y2k-lg p-6 rounded-xl animate-scaleIn">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-y2k-border">
          <h3 className="text-lg font-bold text-y2k-text">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-y2k-text hover:bg-y2k-bg border border-y2k-border rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
