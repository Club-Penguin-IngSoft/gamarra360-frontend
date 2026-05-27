/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      /* ── Tipografía ─────────────────────────────────────────────────── */
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      // Pesos con nombres semánticos (font-regular, font-medium, etc.)
      fontWeight: {
        thin:       '100',
        extralight: '200',
        light:      '300',
        regular:    '400',
        medium:     '500',
        semibold:   '600',
        bold:       '700',
        extrabold:  '800',
        black:      '900',
      },

      // Escala tipográfica completa — cada entrada incluye lineHeight y
      // letterSpacing para que una sola clase aplique los tres valores.
      // Uso: text-h1, text-body-md, text-label-sm, text-caption1, etc.
      fontSize: {
        // Headings (px → rem, base 16px)
        'h1': ['4rem',     { lineHeight: '4.25rem',   letterSpacing: '-0.5px'  }], // 64/68
        'h2': ['3.5rem',   { lineHeight: '3.75rem',   letterSpacing: '-0.4px'  }], // 56/60
        'h3': ['3rem',     { lineHeight: '3.25rem',   letterSpacing: '-0.3px'  }], // 48/52
        'h4': ['2.5rem',   { lineHeight: '2.75rem',   letterSpacing: '-0.2px'  }], // 40/44
        'h5': ['2rem',     { lineHeight: '2.25rem',   letterSpacing: '-0.15px' }], // 32/36
        'h6': ['1.5rem',   { lineHeight: '1.75rem',   letterSpacing: '0'       }], // 24/28

        // Titles
        'title1': ['1.25rem',   { lineHeight: '1.5rem',    letterSpacing: '-0.8px'  }], // 20/24
        'title2': ['1.125rem',  { lineHeight: '1.375rem',  letterSpacing: '-0.8px'  }], // 18/22
        'title3': ['1rem',      { lineHeight: '1.25rem',   letterSpacing: '-0.6px'  }], // 16/20
        'title4': ['0.875rem',  { lineHeight: '1.125rem',  letterSpacing: '-0.4px'  }], // 14/18

        // Body (letterSpacing = 0)
        'body-xl': ['1rem',      { lineHeight: '1.25rem',   letterSpacing: '0' }], // 16/20
        'body-lg': ['0.9375rem', { lineHeight: '1.1875rem', letterSpacing: '0' }], // 15/19
        'body-md': ['0.875rem',  { lineHeight: '1.125rem',  letterSpacing: '0' }], // 14/18
        'body-sm': ['0.8125rem', { lineHeight: '1.0625rem', letterSpacing: '0' }], // 13/17
        'body-xs': ['0.75rem',   { lineHeight: '1rem',      letterSpacing: '0' }], // 12/16

        // Labels (mismos tamaños que body, distinto letterSpacing)
        'label-xl': ['1rem',      { lineHeight: '1.0625rem', letterSpacing: '-0.18px' }], // 16/17
        'label-lg': ['0.9375rem', { lineHeight: '1.1875rem', letterSpacing: '-0.18px' }], // 15/19
        'label-md': ['0.875rem',  { lineHeight: '1.125rem',  letterSpacing: '-0.16px' }], // 14/18
        'label-sm': ['0.8125rem', { lineHeight: '1.0625rem', letterSpacing: '-0.16px' }], // 13/17
        'label-xs': ['0.75rem',   { lineHeight: '1rem',      letterSpacing: '-0.12px' }], // 12/16

        // Captions
        'caption1': ['0.625rem',  { lineHeight: '0.875rem',  letterSpacing: '0' }], // 10/14
        'caption2': ['0.5625rem', { lineHeight: '0.8125rem', letterSpacing: '0' }], // 9/13
      },

      /* ── Paletas base (Kigen — tokens.base.colors) ──────────────────── */
      colors: {
        magenta: {
          50:  '#fcedf1',
          100: '#f8d2dc',
          200: '#f2a7bc',
          300: '#ed7da1',
          400: '#ea4b88',
          500: '#c83771', // mainColor
          600: '#a92d5f',
          700: '#802046',
          800: '#54112c',
          900: '#260411',
        },
        midnightBlue: {
          50:  '#eff0f8',
          100: '#d7d9ee',
          200: '#b1b7de',
          300: '#9099d0',
          400: '#707dc2',
          500: '#5464ae',
          600: '#414e8a',
          700: '#303a69', // primaryColor1
          800: '#20284b',
          900: '#0b1023',
        },
        mantis: {
          50:  '#d5fcc3',
          100: '#a5f56f',
          200: '#91d962',
          300: '#81c056',
          400: '#71aa4b', // primaryColor2
          500: '#629440',
          600: '#4d7632',
          700: '#375522',
          800: '#203412',
          900: '#091404',
        },
        gold: {
          50:  '#feefd1',
          100: '#fde29f',
          200: '#f5cd40', // primaryColor3
          300: '#dfba39',
          400: '#c1a130',
          500: '#a08526',
          600: '#7d681c',
          700: '#5a4a11',
          800: '#372d07',
          900: '#161001',
        },
        gray: {
          50:  '#f7f7f7',
          100: '#ededed',
          200: '#e4e6e7',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
        red: {
          50:  '#fff0ef',
          100: '#f5c2c7',
          200: '#ea868f',
          300: '#e04956',
          400: '#d50d1e',
          500: '#dc3545',
          600: '#b02a37',
          700: '#842029',
          800: '#58151c',
          900: '#2c0b0e',
        },
        green: {
          50:  '#effff5',
          100: '#d1e7dd',
          200: '#a3cfbb',
          300: '#75b798',
          400: '#479f76',
          500: '#198754',
          600: '#146c43',
          700: '#0f5132',
          800: '#0a3622',
          900: '#051b11',
        },
        yellow: {
          50:  '#fffbec',
          100: '#fff3cd',
          200: '#ffe69c',
          300: '#ffda6a',
          400: '#ffcd39',
          500: '#ffc107',
          600: '#cc9a06',
          700: '#997404',
          800: '#664d03',
          900: '#332701',
        },
        orange: {
          50:  '#ffe1c9',
          100: '#ffe5d0',
          200: '#fecba1',
          300: '#feb272',
          400: '#fd9843',
          500: '#fd7e14',
          600: '#ca6510',
          700: '#984c0c',
          800: '#653208',
          900: '#331904',
        },
        cyan: {
          50:  '#eafeff',
          100: '#cff4fc',
          200: '#9eeaf9',
          300: '#6edff6',
          400: '#3dd5f3',
          500: '#0dcaf0',
          600: '#0aa2c0',
          700: '#087990',
          800: '#055160',
          900: '#032830',
        },
        teal: {
          50:  '#e9fff5',
          100: '#c7f0db',
          200: '#8fe1b7',
          300: '#57d193',
          400: '#1fc26f',
          500: '#20c997',
          600: '#1aa179',
          700: '#13795b',
          800: '#0d503c',
          900: '#06281e',
        },
        purple: {
          50:  '#f4efff',
          100: '#e2d9f3',
          200: '#c5b3e6',
          300: '#a98eda',
          400: '#8c68cd',
          500: '#6f42c1',
          600: '#59359a',
          700: '#432874',
          800: '#2c1a4d',
          900: '#160d27',
        },

        /* ── Aliases semánticos (tokens.Light.alias) ─────────────────── */

        // Acento principal → magenta (mainColor)
        primario: {
          DEFAULT: '#c83771', // magenta.500
          hover:   '#a92d5f', // magenta.600
          pressed: '#802046', // magenta.700
          claro:   '#fcedf1', // magenta.50  — fondos, rings
          medio:   '#f2a7bc', // magenta.200
        },

        // Aliases para compatibilidad con componentes existentes de frontend
        brand: {
          50:  '#fcedf1',
          100: '#f8d2dc',
          200: '#f2a7bc',
          300: '#ed7da1',
          400: '#ea4b88',
          500: '#c83771',
          600: '#a92d5f',
          700: '#802046',
          800: '#54112c',
          900: '#260411',
        },

        // Azul marino → midnightBlue (primaryColor1)
        marino: {
          DEFAULT: '#303a69', // midnightBlue.700
          claro:   '#414e8a', // midnightBlue.600
          oscuro:  '#20284b', // midnightBlue.800
        },

        // Neutrales → gray de Kigen
        neutro: {
          50:  '#f7f7f7',
          100: '#ededed',
          200: '#e4e6e7',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },

        ink: {
          50:  '#f7f7f7',
          100: '#ededed',
          200: '#e4e6e7',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },

        surface: {
          DEFAULT: '#ffffff',
          muted: '#f7f7f7',
          soft: '#f0f1f3',
          tag: '#e4e6e7',
        },

        // Estados semánticos
        exito: {
          DEFAULT: '#146c43', // green.600  — bg sólido
          claro:   '#effff5', // green.50   — bg suave
          texto:   '#146c43', // green.600
        },
        error: {
          DEFAULT: '#b02a37', // red.600    — bg sólido
          claro:   '#fff0ef', // red.50     — bg suave
          texto:   '#b02a37', // red.600
        },
        advertencia: {
          DEFAULT: '#ca6510', // orange.600 — bg sólido
          claro:   '#fffbec', // yellow.50  — bg suave
          texto:   '#984c0c', // orange.700
        },
        info: {
          DEFAULT: '#087990', // cyan.700   — bg sólido
          claro:   '#eafeff', // cyan.50    — bg suave
          texto:   '#055160', // cyan.800
        },
        oferta: {
          DEFAULT: '#1aa179', // teal.600
          claro:   '#e9fff5', // teal.50
          texto:   '#13795b', // teal.700
        },
      },

      /* ── Espaciado (valores únicos no presentes en Tailwind por defecto) ─ */
      spacing: {
        100: '6.25rem', // 100px
        120: '7.5rem',  // 120px
      },

      /* ── Bordes redondeados ──────────────────────────────────────────── */
      borderRadius: {
        none:    '0',        // Kigen: none
        input:   '0.75rem',  // 12px — inputs y botones
        tarjeta: '1rem',     // 16px — cards
        modal:   '1.25rem',  // 20px — modals
        full:    '9999px',   // Kigen: full — pill / circular
      },

      /* ── Sombras ─────────────────────────────────────────────────────── */
      boxShadow: {
        primario: '0 4px 14px rgba(200,55,113,0.35)',       // magenta.500
        tarjeta:  '2px 4px 16px 0px rgba(0,0,0,0.10)',     // Kigen cardShadow
        modal:    '0 20px 60px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
};
