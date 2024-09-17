import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        'b1': '#684528',
        'b1-light': '#8C6D4D',
        'b2': '#B09472',
        'b3': '#E5BC8F',
        'b4': '#EED9BF',
        'g1': '#3D5540',
        'g2': '#7D9277',
        'g3': '#A9CF9F',
        'error': 'rgb(248, 113, 113, .6)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'shimmer1': {
          '0%': { transform: 'translateX(165%) skewX(-45deg)' },
          '12%': { transform: 'translateX(-50%) skewX(-45deg)' },
          '75%': { transform: 'translateX(-50%) skewX(-45deg)' },
          '100%': { transform: 'translateX(165%) skewX(-45deg)' },
        },
        'shimmer2': {
          '0%': { transform: 'translateX(115%) skewX(-45deg)' },
          '12%': { transform: 'translateX(-100%) skewX(-45deg)' },
          '75%': { transform: 'translateX(-100%) skewX(-45deg)' },
          '100%': { transform: 'translateX(115%) skewX(-45deg)' },
        },
        'shimmer3': {
          '0%': { transform: 'translateX(57.5%) skewX(-45deg)' },
          '12%': { transform: 'translateX(-157.5%) skewX(-45deg)' },
          '75%': { transform: 'translateX(-157.5%) skewX(-45deg)' },
          '100%': { transform: 'translateX(57.5%) skewX(-45deg)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shimmer1': 'shimmer1 10s infinite',
        'shimmer2': 'shimmer2 10s infinite',
        'shimmer3': 'shimmer3 10s infinite',
        'scale-in': 'scale-in 2s ease-out',
        'scale-in-fast': 'scale-in 0.1s ease-out',
        'scale-out': 'scale-out 2s ease-out',
        'scale-out-fast': 'scale-out 0.1s ease-out',
      },
      transitionDelay: {
        400: '400ms',
      },
      rotate: {
        30: '30deg',
        210: '210deg',
      },
      dropShadow: {
        text: '0 1.2px 1.2px rgba(0,0,0,1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
