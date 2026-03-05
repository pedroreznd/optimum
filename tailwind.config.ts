import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          base: '#080808',
          surface: '#0d0d0d',
          overlay: '#1a1a1a',
        },
        border: {
          subtle: '#1f1f1f',
          muted: '#3f3f46',
        },
        text: {
          primary: '#f5f5f5',
          secondary: '#71717a',
          muted: '#3f3f46',
        },
        accent: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
        },
        positive: '#22c55e',
        negative: '#ef4444',
        warning: '#f59e0b',
        brand: {
          50: '#eef2ff',
          500: '#4f46e5',
          700: '#3730a3',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
