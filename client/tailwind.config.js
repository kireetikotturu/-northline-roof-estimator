/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F2F5F5',
        'paper-dim': '#E7EBEB',
        surface: '#FFFFFF',
        ink: '#141B1E',
        'ink-soft': '#4B565B',
        onyx: '#0D1214',
        'onyx-soft': '#171F22',
        'onyx-card': '#141B1E',
        mist: '#EDF1F1',
        'mist-soft': '#9AA6A9',
        copper: {
          50: '#FBF0E7',
          100: '#F5DBC4',
          200: '#EABB92',
          300: '#DE9860',
          400: '#CC7A3D',
          500: '#B5541F',
          600: '#98431A',
          700: '#7A3616',
          800: '#5C2810',
          900: '#3D1A0B',
        },
        slate2: {
          400: '#7C93A0',
          500: '#5A7382',
          600: '#3E5C6C',
          700: '#2E4551',
          800: '#22333C',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,27,30,0.04), 0 8px 24px -8px rgba(20,27,30,0.10)',
        'soft-dark': '0 1px 2px rgba(0,0,0,0.3), 0 8px 30px -10px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(181,84,31,0.15), 0 8px 30px -8px rgba(181,84,31,0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'draw': {
          '0%': { strokeDashoffset: 'var(--dash, 600)' },
          '100%': { strokeDashoffset: 0 },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        draw: 'draw 1.4s cubic-bezier(0.65,0,0.35,1) forwards',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      backgroundImage: {
        blueprint:
          'linear-gradient(rgba(122,54,22,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(122,54,22,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '36px 36px',
      },
    },
  },
  plugins: [],
};
