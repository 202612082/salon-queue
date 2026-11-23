/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#1F2937',
          light: '#2B3649',
          dark: '#111827',
          card: '#243042',
          border: '#374151',
        },
        gold: {
          DEFAULT: '#D4A017',
          hover: '#B8860B',
          light: '#F5BE38',
          glow: 'rgba(212, 160, 23, 0.25)',
          muted: '#927012',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'gold-sm': '0 0 10px rgba(212, 160, 23, 0.2)',
        'gold-md': '0 0 20px rgba(212, 160, 23, 0.35)',
        'gold-lg': '0 0 35px rgba(212, 160, 23, 0.5)',
      }
    },
  },
  plugins: [],
}
