/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        y2k: {
          bg: '#CCCFFA',
          surface: '#FFFFFF',
          text: '#2d241b',
          muted: '#675d52',
          border: '#2F292E',
          accent: '#2d241b',
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
      },
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Crimson Text"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'none': '0px',
        'y2k': '0px', // Astryx Y2K Theme uses 0px radii for brutalist Y2K pop
      },
      boxShadow: {
        'y2k-sm': '2px 2px 0px #2F292E',
        'y2k': '4px 4px 0px #2F292E',
        'y2k-lg': '6px 6px 0px #2F292E',
      }
    },
  },
  plugins: [],
}
