/** @type {import('tailwindcss').Config} */
// Palette: "teal on paper" — off-white ground, deep teal accent, cool ink neutrals.
// The old scale names (navy / electric / lavender) are kept so every page picks up
// the new look without renaming classes; lavender now maps to the teal accent.
const teal = {
  50: '#ecf6f5',
  100: '#d4ebe9',
  200: '#a9d6d3',
  300: '#74bab7',
  400: '#3f9a98',
  500: '#1a7f7f',
  600: '#0d6b6e',
  700: '#06525c',
  800: '#08444c',
  900: '#0a3940',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Funnel Sans"', 'system-ui', 'sans-serif'],
        display: ['"Funnel Display"', '"Funnel Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: '#f7f9f8',
        surface: '#ebf0ee',
        navy: {
          50: '#f2f5f4',
          100: '#e3e9e7',
          200: '#cdd7d4',
          300: '#a6b5b1',
          400: '#788a86',
          500: '#5a6b68',
          600: '#45534f',
          700: '#333f3c',
          800: '#232d2b',
          900: '#14201e',
          950: '#0b1514',
        },
        electric: teal,
        lavender: teal,
      },
      boxShadow: {
        soft: '0 1px 2px rgb(11 21 20 / 0.05)',
        card: '0 1px 2px rgb(11 21 20 / 0.04), 0 6px 20px -12px rgb(11 21 20 / 0.12)',
        glow: '0 1px 2px rgb(11 21 20 / 0.05), 0 12px 28px -14px rgb(11 21 20 / 0.22)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'scale-in': 'scale-in 0.2s ease-out both',
        'slide-in-right': 'slide-in-right 0.3s ease-out both',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
    },
  },
  plugins: [],
};
