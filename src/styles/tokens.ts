// Tokens del design system de Gamarra 360°
// Generado desde Kigen (2026-05-26) — espejo JS de tailwind.config.js
// Usar cuando se necesite un valor en style={{}}, interpolaciones o fuera de Tailwind.

/* ── Paletas base ────────────────────────────────────────────────────────── */

export const PALETA = {
  magenta: {
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
  midnightBlue: {
    50:  '#eff0f8',
    100: '#d7d9ee',
    200: '#b1b7de',
    300: '#9099d0',
    400: '#707dc2',
    500: '#5464ae',
    600: '#414e8a',
    700: '#303a69',
    800: '#20284b',
    900: '#0b1023',
  },
  mantis: {
    400: '#71aa4b',
  },
  gold: {
    200: '#f5cd40',
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
} as const;

/* ── Colores semánticos (aliases) ────────────────────────────────────────── */

export const COLORES = {
  // Acento principal (magenta)
  primario:         '#c83771', // magenta.500 — mainColor
  primarioHover:    '#a92d5f', // magenta.600
  primarioPressed:  '#802046', // magenta.700
  primarioClaro:    '#fcedf1', // magenta.50

  // Colores de marca secundarios
  marino:           '#303a69', // midnightBlue.700 — primaryColor1
  marinoClaro:      '#414e8a', // midnightBlue.600
  verde:            '#71aa4b', // mantis.400        — primaryColor2
  dorado:           '#f5cd40', // gold.200           — primaryColor3

  // Neutrales
  neutro50:         '#f7f7f7',
  neutro100:        '#ededed',
  neutro200:        '#e4e6e7',
  neutro300:        '#dee2e6',
  neutro400:        '#ced4da',
  neutro500:        '#adb5bd',
  neutro600:        '#6c757d',
  neutro700:        '#495057',
  neutro900:        '#212529',

  // Estados
  exito:            '#146c43', // green.600
  exitoClaro:       '#effff5', // green.50
  error:            '#b02a37', // red.600
  errorClaro:       '#fff0ef', // red.50
  advertencia:      '#ca6510', // orange.600
  advertenciaClaro: '#fffbec', // yellow.50
  info:             '#087990', // cyan.700
  infoClaro:        '#eafeff', // cyan.50

  // Base
  blanco:           '#ffffff',
  negro:            '#000000',
} as const;

/* ── Tipografía ─────────────────────────────────────────────────────────── */

export const TIPOGRAFIA = {
  familia: 'Inter',

  peso: {
    thin:       100,
    extralight: 200,
    light:      300,
    regular:    400,
    medium:     500,
    semibold:   600,
    bold:       700,
    extrabold:  800,
    black:      900,
  },

  // Tamaños en rem (base 16px) — espejo de tailwind fontSize
  tamano: {
    h1: '4rem',      h2: '3.5rem',   h3: '3rem',    h4: '2.5rem',
    h5: '2rem',      h6: '1.5rem',
    title1: '1.25rem',   title2: '1.125rem',
    title3: '1rem',      title4: '0.875rem',
    bodyXl: '1rem',      bodyLg: '0.9375rem', bodyMd: '0.875rem',
    bodySm: '0.8125rem', bodyXs: '0.75rem',
    labelXl: '1rem',     labelLg: '0.9375rem', labelMd: '0.875rem',
    labelSm: '0.8125rem',labelXs: '0.75rem',
    caption1: '0.625rem',caption2: '0.5625rem',
  },

  lineHeight: {
    h1: '4.25rem',  h2: '3.75rem',  h3: '3.25rem', h4: '2.75rem',
    h5: '2.25rem',  h6: '1.75rem',
    title1: '1.5rem',    title2: '1.375rem',
    title3: '1.25rem',   title4: '1.125rem',
    bodyXl: '1.25rem',   bodyLg: '1.1875rem', bodyMd: '1.125rem',
    bodySm: '1.0625rem', bodyXs: '1rem',
    labelXl: '1.0625rem',labelLg: '1.1875rem',labelMd: '1.125rem',
    labelSm: '1.0625rem',labelXs: '1rem',
    caption1: '0.875rem',caption2: '0.8125rem',
  },

  espaciadoLetras: {
    h1: '-0.5px',  h2: '-0.4px',  h3: '-0.3px',
    h4: '-0.2px',  h5: '-0.15px', h6: '0',
    title1: '-0.8px', title2: '-0.8px',
    title3: '-0.6px', title4: '-0.4px',
    body: '0',
    labelXl: '-0.18px', labelLg: '-0.18px',
    labelMd: '-0.16px', labelSm: '-0.16px', labelXs: '-0.12px',
    caption: '0',
  },
} as const;

/* ── Espaciado (Kigen base.misc — valores en px) ─────────────────────────── */
// Usar en style={{}} cuando se necesite un valor específico del design system.
// Para clases Tailwind usar las utilidades estándar (p-4, m-8, gap-6, etc.)
// o los tokens únicos: p-100, p-120.

export const ESPACIADO = {
  0:    '0px',
  1:    '1px',
  2:    '2px',
  4:    '4px',
  6:    '6px',
  8:    '8px',
  10:   '10px',
  12:   '12px',
  14:   '14px',
  16:   '16px',
  18:   '18px',
  20:   '20px',
  24:   '24px',
  28:   '28px',
  32:   '32px',
  36:   '36px',
  40:   '40px',
  44:   '44px',
  48:   '48px',
  56:   '56px',
  60:   '60px',
  64:   '64px',
  72:   '72px',
  80:   '80px',
  96:   '96px',
  100:  '100px',
  120:  '120px',
  none: '0px',
  full: '9999px',
} as const;

/* ── Sombras ─────────────────────────────────────────────────────────────── */

export const SOMBRAS = {
  primario: '0 4px 14px rgba(200,55,113,0.35)',
  tarjeta:  '2px 4px 16px 0px rgba(0,0,0,0.10)', // Kigen cardShadow
  modal:    '0 20px 60px rgba(0,0,0,0.15)',
} as const;

/* ── Radios ──────────────────────────────────────────────────────────────── */

export const RADIOS = {
  input:   '0.75rem',
  tarjeta: '1rem',
  modal:   '1.25rem',
} as const;
