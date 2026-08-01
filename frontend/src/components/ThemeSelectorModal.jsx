import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { Modal } from './ui/Modal.jsx';
import { Sparkles, Check, Moon, Sun } from 'lucide-react';

export function ThemeSelectorModal({ isOpen, onClose }) {
  const { activeThemeId, changeTheme, themes } = useTheme();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Astryx Aesthetic Theme Suite"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-y2k-bg border-2 border-y2k-border text-xs font-bold text-y2k-text">
          <Sparkles size={18} className="shrink-0 text-y2k-text" />
          <span>
            Choose a signature Astryx theme below to instantly re-skin your entire billing platform!
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
          {themes.map((theme) => {
            const isActive = theme.id === activeThemeId;
            return (
              <div
                key={theme.id}
                onClick={() => changeTheme(theme.id)}
                className={`p-3 border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  isActive
                    ? 'border-y2k-border bg-y2k-surface shadow-y2k scale-[1.01]'
                    : 'border-y2k-border/60 bg-y2k-surface/90 hover:border-y2k-border hover:shadow-y2k-sm'
                }`}
                style={{
                  borderWidth: isActive ? '3px' : '2px'
                }}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-black text-xs text-y2k-text uppercase tracking-tight">
                      {theme.isDark ? <Moon size={14} className="text-y2k-purpleDark" /> : <Sun size={14} className="text-y2k-yellowDark" />}
                      <span>{theme.name}</span>
                    </div>
                    {isActive ? (
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-y2k-green text-y2k-greenDark border border-y2k-greenDark flex items-center gap-1">
                        <Check size={10} /> Active
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-y2k-bg text-y2k-muted border border-y2k-border">
                        {theme.isDark ? 'Dark' : 'Light'}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-bold text-y2k-muted leading-tight">
                    {theme.tagline}
                  </p>
                  <p className="text-[10px] text-y2k-muted/80 line-clamp-2">
                    {theme.description}
                  </p>
                </div>

                {/* Swatch Previews */}
                <div className="flex items-center justify-between pt-2 border-t border-y2k-border/30">
                  <div className="flex items-center gap-1.5">
                    {theme.swatches.map((colorHex, idx) => (
                      <div
                        key={idx}
                        className="w-5 h-5 border border-black/40 shadow-sm"
                        style={{ backgroundColor: colorHex }}
                        title={colorHex}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      changeTheme(theme.id);
                    }}
                    className={`px-2.5 py-1 text-[10px] font-extrabold uppercase transition-colors border ${
                      isActive
                        ? 'bg-y2k-text text-y2k-bg border-y2k-border'
                        : 'bg-y2k-bg text-y2k-text border-y2k-border hover:bg-y2k-green hover:text-y2k-greenDark'
                    }`}
                  >
                    {isActive ? 'Selected' : 'Apply'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
