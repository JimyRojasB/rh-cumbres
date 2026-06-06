/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta Cumbres Monumental
        navy: {
          50:  '#e8eef5',
          100: '#c5d3e4',
          200: '#9fb5cf',
          300: '#7897ba',
          400: '#5980aa',
          500: '#3a6999',
          600: '#2d5585',
          700: '#1e3a5c',   // primary
          800: '#152d48',
          900: '#0d1e30',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',   // accent
          600: '#d97706',
        },
        construction: {
          beige:  '#c8a882',
          green:  '#5a8a5a',
          orange: '#d4622a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(30,58,92,0.10)',
        'card-hover': '0 6px 20px rgba(30,58,92,0.18)',
      },
    },
  },
  plugins: [],
}
