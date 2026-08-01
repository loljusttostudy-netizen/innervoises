import React, { createContext, useContext, useState, useEffect } from 'react';

export const ASTRYX_THEMES = [
  {
    id: 'stone-professional',
    name: 'Stone Professional',
    tagline: 'Warm Stone Neutral & Elegant',
    description: 'Clean, professional design with soft warm stone background (#F3F2EE), ultra-faint borders, and 12px rounded corners.',
    isDark: false,
    swatches: ['#F3F2EE', '#FFFFFF', '#262626', '#E6E4DF'],
    colors: {
      bg: '#F3F2EE',
      surface: '#FFFFFF',
      text: '#262626',
      muted: '#737373',
      border: '#E6E4DF',
      green: '#DCFCE7',
      greenDark: '#15803D',
      red: '#FEE2E2',
      redDark: '#B91C1C',
      yellow: '#FEF9C3',
      yellowDark: '#A16207',
      blue: '#E0F2FE',
      blueDark: '#0369A1',
      pink: '#FCE7F3',
      purple: '#F3E8FF',
      purpleDark: '#6B21A8',
      orange: '#FFEDD5',
      teal: '#CCFBF1',
      gray: '#F4F4F5'
    }
  },
  {
    id: 'astryx-original',
    name: 'Astryx Y2K (Original)',
    tagline: 'Retro Brutalist Lavender',
    description: 'The signature Y2K aesthetic with pastel lavender background, bold 2px black borders, 4px solid drop shadows, and sharp 0px corners.',
    isDark: false,
    swatches: ['#CCCFFA', '#2F292E', '#C5E17A', '#FFC8E0'],
    colors: {
      bg: '#CCCFFA',
      surface: '#FFFFFF',
      text: '#2d241b',
      muted: '#675d52',
      border: '#2F292E',
      green: '#C5E17A',
      greenDark: '#3a5500',
      red: '#FFC5C3',
      redDark: '#8b1d24',
      yellow: '#FFE08A',
      yellowDark: '#614400',
      blue: '#B8E0FF',
      blueDark: '#004e74',
      pink: '#FFC8E0',
      purple: '#DDD0FF',
      purpleDark: '#453080',
      orange: '#FFCCA0',
      teal: '#A8EED0',
      gray: '#ede0d4'
    }
  }
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [activeThemeId, setActiveThemeId] = useState(() => {
    const saved = localStorage.getItem('astryx-theme');
    return saved && ASTRYX_THEMES.some(t => t.id === saved) ? saved : 'stone-professional';
  });

  const activeTheme = ASTRYX_THEMES.find(t => t.id === activeThemeId) || ASTRYX_THEMES[0];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeThemeId);
    localStorage.setItem('astryx-theme', activeThemeId);
  }, [activeThemeId]);

  const changeTheme = (id) => {
    if (ASTRYX_THEMES.some(t => t.id === id)) {
      setActiveThemeId(id);
    }
  };

  return (
    <ThemeContext.Provider value={{ activeThemeId, activeTheme, changeTheme, themes: ASTRYX_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
