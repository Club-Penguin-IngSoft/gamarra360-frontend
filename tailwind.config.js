/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDF2F6',
          100: '#FCE7EF',
          500: '#C83771',
          600: '#A92D5F',
          700: '#B90037',
          900: '#260411',
        },
        ink: {
          900: '#212529',
          800: '#2D2F31',
          700: '#495057',
          500: '#6C757D',
          400: '#ADB5BD',
          200: '#CED4DA',
          100: '#DEE2E6',
          50: '#EDEDED',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F7F7F7',
          soft: '#F0F1F3',
          tag: '#E4E6E7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        17: '4.25rem', // 68px — tamaño del logo grande en footer
      },
    },
  },
  plugins: [],
};
