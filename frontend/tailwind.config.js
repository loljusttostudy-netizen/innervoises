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
          bg: 'var(--y2k-bg)',
          surface: 'var(--y2k-surface)',
          text: 'var(--y2k-text)',
          muted: 'var(--y2k-muted)',
          border: 'var(--y2k-border)',
          accent: 'var(--y2k-accent)',
          green: 'var(--y2k-green)',
          greenDark: 'var(--y2k-greenDark)',
          red: 'var(--y2k-red)',
          redDark: 'var(--y2k-redDark)',
          yellow: 'var(--y2k-yellow)',
          yellowDark: 'var(--y2k-yellowDark)',
          blue: 'var(--y2k-blue)',
          blueDark: 'var(--y2k-blueDark)',
          pink: 'var(--y2k-pink)',
          purple: 'var(--y2k-purple)',
          purpleDark: 'var(--y2k-purpleDark)',
          orange: 'var(--y2k-orange)',
          teal: 'var(--y2k-teal)',
          gray: 'var(--y2k-gray)'
        }
      },
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Crimson Text"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'none': '0px',
        'y2k': 'var(--y2k-radius, 0px)',
      },
      boxShadow: {
        'y2k-sm': 'var(--y2k-shadow-sm)',
        'y2k': 'var(--y2k-shadow)',
        'y2k-lg': 'var(--y2k-shadow-lg)',
      }
    },
  },
  plugins: [],
}
