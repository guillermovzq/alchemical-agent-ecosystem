/**
 * Alchemical Agent Ecosystem v2.0 — "Magnum Opus"
 * Tailwind CSS v3 / v4 Theme Extension
 * =========================================
 * Drop this into your tailwind.config.js as:
 *
 *   const alchemical = require('./assets/branding/tailwind-alchemical');
 *
 *   module.exports = {
 *     theme: {
 *       extend: alchemical,
 *     },
 *   };
 *
 * Or for Tailwind v4 (CSS-first config), import the tokens via
 * the @theme directive and reference this file for JS tooling.
 */

'use strict';

// ---------------------------------------------------------------------------
// Shared RGBA helper (used to keep shadow strings DRY)
// ---------------------------------------------------------------------------
const rgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// Raw color values (single source of truth)
const RAW = {
  aurum:   '#FFD700',
  aether:  '#00FFAA',
  arcane:  '#9D4EDD',
  crimson: '#FF2D55',
};

// ---------------------------------------------------------------------------
// COLOR SCALES
// ---------------------------------------------------------------------------

/** Obsidian — near-black with a slight cool blue undertone */
const obsidian = {
  50:  '#E8E8F0',
  100: '#C8C8D8',
  200: '#9898B0',
  300: '#686888',
  400: '#404060',
  500: '#2A2A40',
  600: '#1E1E2E',
  700: '#16161F',
  800: '#111118',
  900: '#0A0A0A',
  950: '#050508',
  // Named semantic aliases (also available as CSS vars in the palette)
  DEFAULT:   '#0A0A0A',
  soft:      '#111118',
  mid:       '#16161F',
  light:     '#1E1E2E',
};

/** Arcane — deep indigo-purple, the color of raw arcane energy */
const arcane = {
  50:  '#F3E8FF',
  100: '#E2C4FF',
  200: '#C792F5',
  300: '#AB60EC',
  400: '#9D4EDD',
  500: '#7B2FBE',
  600: '#6A0DAD',
  700: '#4B0082',
  800: '#350060',
  900: '#1F0040',
  950: '#0F0020',
  DEFAULT: '#4B0082',
  light:   '#6A0DAD',
  glow:    '#9D4EDD',
};

/** Aurum — alchemical gold, the color of transmuted perfection */
const aurum = {
  50:  '#FFFDE7',
  100: '#FFF9C4',
  200: '#FFF176',
  300: '#FFE566',
  400: '#FFD700',
  500: '#F5C800',
  600: '#CC9900',
  700: '#A07400',
  800: '#705000',
  900: '#3D2C00',
  950: '#1F1600',
  DEFAULT: '#FFD700',
  light:   '#FFE566',
  dark:    '#CC9900',
};

/** Aether — spectral emerald, the color of pure life force */
const aether = {
  50:  '#E6FFF6',
  100: '#C0FFE8',
  200: '#8AFFCE',
  300: '#66FFD3',
  400: '#00FFAA',
  500: '#00DD92',
  600: '#00CC88',
  700: '#009966',
  800: '#006644',
  900: '#003322',
  950: '#001A11',
  DEFAULT: '#00FFAA',
  light:   '#66FFD3',
  dark:    '#00CC88',
};

/** Crimson — danger, sacrifice, and forbidden alchemy */
const crimson = {
  50:  '#FFE8ED',
  100: '#FFC4CE',
  200: '#FF8FA2',
  300: '#FF5A78',
  400: '#FF2D55',
  500: '#E6003A',
  600: '#CC0033',
  700: '#990026',
  800: '#66001A',
  900: '#33000D',
  950: '#1A0007',
  DEFAULT: '#FF2D55',
};

/** Mist — cool off-white grays for text and subtle UI */
const mist = {
  50:  '#FFFFFF',
  100: '#F5F5FF',
  200: '#EBEBFF',
  300: '#E8E8FF',
  400: '#C8C8F0',
  500: '#A0A0C0',
  600: '#787898',
  700: '#545470',
  800: '#343448',
  900: '#1A1A2C',
  950: '#0E0E1A',
  DEFAULT: '#E8E8FF',
  dim:     '#A0A0C0',
};

/** Violet — secondary accent between arcane and blue */
const violet = {
  50:  '#F5F3FF',
  100: '#EDE9FE',
  200: '#DDD6FE',
  300: '#C4B5FD',
  400: '#A78BFA',
  500: '#8B5CF6',
  600: '#7C3AED',
  700: '#6D28D9',
  800: '#5B21B6',
  900: '#4C1D95',
  950: '#2E1065',
  DEFAULT: '#7C3AED',
  light:   '#A78BFA',
};

// ---------------------------------------------------------------------------
// FONT FAMILIES
// ---------------------------------------------------------------------------

const fontFamily = {
  display: [
    'Cinzel',
    'Cormorant Garamond',
    'Georgia',
    'serif',
  ],
  rune: [
    'Uncial Antiqua',
    'cursive',
  ],
  body: [
    'Inter',
    'DM Sans',
    'system-ui',
    'sans-serif',
  ],
  mono: [
    'JetBrains Mono',
    'Fira Code',
    'monospace',
  ],
};

// ---------------------------------------------------------------------------
// BOX SHADOWS (glow presets)
// ---------------------------------------------------------------------------

const boxShadow = {
  // ── Gold / Aurum ──────────────────────────────────────────
  'glow-gold-sm': [
    `0 0 8px  ${rgba('#FFD700', 0.40)}`,
    `0 0 16px ${rgba('#FFD700', 0.20)}`,
  ].join(', '),

  'glow-gold': [
    `0 0 16px ${rgba('#FFD700', 0.50)}`,
    `0 0 32px ${rgba('#FFD700', 0.25)}`,
    `0 0 64px ${rgba('#FFD700', 0.10)}`,
  ].join(', '),

  'glow-gold-lg': [
    `0 0 24px ${rgba('#FFD700', 0.60)}`,
    `0 0 48px ${rgba('#FFD700', 0.35)}`,
    `0 0 96px ${rgba('#FFD700', 0.15)}`,
  ].join(', '),

  // ── Aether / Emerald ─────────────────────────────────────
  'glow-aether-sm': [
    `0 0 8px  ${rgba('#00FFAA', 0.40)}`,
    `0 0 16px ${rgba('#00FFAA', 0.20)}`,
  ].join(', '),

  'glow-aether': [
    `0 0 16px ${rgba('#00FFAA', 0.50)}`,
    `0 0 32px ${rgba('#00FFAA', 0.25)}`,
    `0 0 64px ${rgba('#00FFAA', 0.10)}`,
  ].join(', '),

  'glow-aether-lg': [
    `0 0 24px ${rgba('#00FFAA', 0.60)}`,
    `0 0 48px ${rgba('#00FFAA', 0.35)}`,
    `0 0 96px ${rgba('#00FFAA', 0.15)}`,
  ].join(', '),

  // ── Arcane / Purple ───────────────────────────────────────
  'glow-arcane-sm': [
    `0 0 8px  ${rgba('#9D4EDD', 0.40)}`,
    `0 0 16px ${rgba('#9D4EDD', 0.20)}`,
  ].join(', '),

  'glow-arcane': [
    `0 0 16px ${rgba('#9D4EDD', 0.50)}`,
    `0 0 32px ${rgba('#9D4EDD', 0.25)}`,
    `0 0 64px ${rgba('#9D4EDD', 0.10)}`,
  ].join(', '),

  'glow-arcane-lg': [
    `0 0 24px ${rgba('#9D4EDD', 0.60)}`,
    `0 0 48px ${rgba('#9D4EDD', 0.35)}`,
    `0 0 96px ${rgba('#9D4EDD', 0.15)}`,
  ].join(', '),

  // ── Crimson ───────────────────────────────────────────────
  'glow-crimson-sm': [
    `0 0 8px  ${rgba('#FF2D55', 0.40)}`,
    `0 0 16px ${rgba('#FF2D55', 0.20)}`,
  ].join(', '),

  'glow-crimson': [
    `0 0 16px ${rgba('#FF2D55', 0.50)}`,
    `0 0 32px ${rgba('#FF2D55', 0.25)}`,
    `0 0 64px ${rgba('#FF2D55', 0.10)}`,
  ].join(', '),

  'glow-crimson-lg': [
    `0 0 24px ${rgba('#FF2D55', 0.60)}`,
    `0 0 48px ${rgba('#FF2D55', 0.35)}`,
    `0 0 96px ${rgba('#FF2D55', 0.15)}`,
  ].join(', '),

  // ── Violet ────────────────────────────────────────────────
  'glow-violet-sm': [
    `0 0 8px  ${rgba('#7C3AED', 0.40)}`,
    `0 0 16px ${rgba('#7C3AED', 0.20)}`,
  ].join(', '),

  'glow-violet': [
    `0 0 16px ${rgba('#7C3AED', 0.50)}`,
    `0 0 32px ${rgba('#7C3AED', 0.25)}`,
    `0 0 64px ${rgba('#7C3AED', 0.10)}`,
  ].join(', '),

  // ── Card / Panel ──────────────────────────────────────────
  'card-obsidian': [
    '0 8px 32px rgba(0,0,0,0.40)',
    '0 2px 8px  rgba(0,0,0,0.30)',
    `inset 0 1px 0 rgba(255,255,255,0.06)`,
  ].join(', '),

  'crystal': [
    '0 8px  32px rgba(0,0,0,0.40)',
    '0 2px  8px  rgba(0,0,0,0.30)',
    `inset 0 1px 0 rgba(255,255,255,0.06)`,
    `0 0 40px ${rgba('#9D4EDD', 0.10)}`,
  ].join(', '),
};

// ---------------------------------------------------------------------------
// BACKGROUND IMAGES (gradients)
// ---------------------------------------------------------------------------

const backgroundImage = {
  // Linear gradients
  'gradient-transmutation': 'linear-gradient(135deg, #4B0082 0%, #9D4EDD 40%, #00FFAA 100%)',
  'gradient-aurum':         'linear-gradient(135deg, #CC9900 0%, #FFD700 50%, #FFE566 100%)',
  'gradient-aether':        'linear-gradient(135deg, #00CC88 0%, #00FFAA 50%, #66FFD3 100%)',
  'gradient-arcane':        'linear-gradient(135deg, #2D0057 0%, #4B0082 40%, #6A0DAD 100%)',
  'gradient-obsidian':      'linear-gradient(180deg, #0A0A0A 0%, #111118 50%, #16161F 100%)',
  'gradient-crimson':       'linear-gradient(135deg, #800020 0%, #FF2D55 50%, #FF7096 100%)',
  'gradient-violet':        'linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #A78BFA 100%)',

  // Radial gradients
  'gradient-hero':
    'radial-gradient(ellipse at 50% 0%, rgba(75,0,130,0.30) 0%, rgba(10,10,10,0) 70%)',
  'gradient-radial-gold':
    'radial-gradient(ellipse at center, rgba(255,215,0,0.25) 0%, rgba(255,215,0,0) 70%)',
  'gradient-radial-arcane':
    'radial-gradient(ellipse at center, rgba(157,78,221,0.25) 0%, rgba(157,78,221,0) 70%)',
  'gradient-radial-aether':
    'radial-gradient(ellipse at center, rgba(0,255,170,0.20) 0%, rgba(0,255,170,0) 70%)',

  // Shimmer overlay
  'shimmer':
    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',

  // Ambient background for particle scenes
  'ambient-arcane': [
    'radial-gradient(ellipse at 20% 20%, rgba(75,0,130,0.12)    0%, transparent 50%)',
    'radial-gradient(ellipse at 80% 80%, rgba(0,255,170,0.08)   0%, transparent 50%)',
    'radial-gradient(ellipse at 50% 50%, rgba(157,78,221,0.06)  0%, transparent 70%)',
  ].join(', '),
};

// ---------------------------------------------------------------------------
// KEYFRAMES
// ---------------------------------------------------------------------------

const keyframes = {
  /**
   * transmute — pulsing scale + opacity for alchemical transforms
   */
  transmute: {
    '0%, 100%': { transform: 'scale(1.00)', opacity: '1' },
    '25%':      { transform: 'scale(1.04)', opacity: '0.85' },
    '50%':      { transform: 'scale(1.08)', opacity: '0.70' },
    '75%':      { transform: 'scale(1.04)', opacity: '0.85' },
  },

  /**
   * glow-pulse — arcane box-shadow cycling between dim and bright
   */
  'glow-pulse': {
    '0%, 100%': {
      boxShadow: [
        `0 0 8px  ${rgba('#9D4EDD', 0.35)}`,
        `0 0 16px ${rgba('#9D4EDD', 0.15)}`,
      ].join(', '),
    },
    '50%': {
      boxShadow: [
        `0 0 20px ${rgba('#9D4EDD', 0.65)}`,
        `0 0 40px ${rgba('#9D4EDD', 0.35)}`,
        `0 0 80px ${rgba('#9D4EDD', 0.15)}`,
      ].join(', '),
    },
  },

  /**
   * glow-pulse-gold — gold box-shadow cycling
   */
  'glow-pulse-gold': {
    '0%, 100%': {
      boxShadow: [
        `0 0 8px  ${rgba('#FFD700', 0.40)}`,
        `0 0 16px ${rgba('#FFD700', 0.20)}`,
      ].join(', '),
    },
    '50%': {
      boxShadow: [
        `0 0 24px ${rgba('#FFD700', 0.60)}`,
        `0 0 48px ${rgba('#FFD700', 0.35)}`,
        `0 0 96px ${rgba('#FFD700', 0.15)}`,
      ].join(', '),
    },
  },

  /**
   * glow-pulse-aether — emerald box-shadow cycling
   */
  'glow-pulse-aether': {
    '0%, 100%': {
      boxShadow: [
        `0 0 8px  ${rgba('#00FFAA', 0.40)}`,
        `0 0 16px ${rgba('#00FFAA', 0.20)}`,
      ].join(', '),
    },
    '50%': {
      boxShadow: [
        `0 0 24px ${rgba('#00FFAA', 0.60)}`,
        `0 0 48px ${rgba('#00FFAA', 0.35)}`,
        `0 0 96px ${rgba('#00FFAA', 0.15)}`,
      ].join(', '),
    },
  },

  /**
   * glow-pulse-crimson — crimson box-shadow cycling
   */
  'glow-pulse-crimson': {
    '0%, 100%': {
      boxShadow: [
        `0 0 8px  ${rgba('#FF2D55', 0.40)}`,
        `0 0 16px ${rgba('#FF2D55', 0.20)}`,
      ].join(', '),
    },
    '50%': {
      boxShadow: [
        `0 0 16px ${rgba('#FF2D55', 0.50)}`,
        `0 0 32px ${rgba('#FF2D55', 0.25)}`,
        `0 0 64px ${rgba('#FF2D55', 0.10)}`,
      ].join(', '),
    },
  },

  /**
   * particle-drift — ambient floating particles drifting upward
   */
  'particle-drift': {
    '0%':  { transform: 'translate(0px, 0px) scale(1.0)',    opacity: '0' },
    '10%': { opacity: '1' },
    '50%': { transform: 'translate(-18px, -36px) scale(1.05)', opacity: '0.7' },
    '90%': { opacity: '0.4' },
    '100%':{ transform: 'translate(12px, -72px) scale(0.95)', opacity: '0' },
  },

  /**
   * rune-spin — continuous clockwise rotation for sigils
   */
  'rune-spin': {
    '0%':   { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },

  /**
   * rune-spin-reverse — counter-clockwise variant
   */
  'rune-spin-reverse': {
    '0%':   { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(-360deg)' },
  },

  /**
   * aether-flow — hue-rotation sweep through the full chromatic wheel
   */
  'aether-flow': {
    '0%':   { filter: 'hue-rotate(0deg)   brightness(1.0)' },
    '25%':  { filter: 'hue-rotate(45deg)  brightness(1.1)' },
    '50%':  { filter: 'hue-rotate(90deg)  brightness(1.05)' },
    '75%':  { filter: 'hue-rotate(135deg) brightness(1.1)' },
    '100%': { filter: 'hue-rotate(180deg) brightness(1.0)' },
  },

  /**
   * materialize — element fades in while rising from 20px below
   */
  materialize: {
    '0%':  { opacity: '0', transform: 'translateY(20px) scale(0.97)' },
    '60%': { opacity: '1' },
    '100%':{ opacity: '1', transform: 'translateY(0px)  scale(1.00)' },
  },

  /**
   * crystallize — scale from 0.8 to 1.0 with glow intensifying
   */
  crystallize: {
    '0%': {
      transform:  'scale(0.80)',
      opacity:    '0',
      boxShadow:  `0 0 0px ${rgba('#00FFAA', 0)}, 0 0 0px ${rgba('#00FFAA', 0)}`,
    },
    '40%': {
      opacity:    '0.8',
      boxShadow:  [
        `0 0 12px ${rgba('#00FFAA', 0.30)}`,
        `0 0 24px ${rgba('#00FFAA', 0.15)}`,
      ].join(', '),
    },
    '70%': { transform: 'scale(1.03)' },
    '100%': {
      transform:  'scale(1.00)',
      opacity:    '1',
      boxShadow:  [
        `0 0 20px ${rgba('#00FFAA', 0.50)}`,
        `0 0 40px ${rgba('#00FFAA', 0.25)}`,
        `0 0 80px ${rgba('#00FFAA', 0.10)}`,
      ].join(', '),
    },
  },

  /**
   * shimmer — diagonal shimmer sweep for metallic surfaces
   */
  shimmer: {
    '0%':   { backgroundPosition: '-200% center' },
    '100%': { backgroundPosition:  '200% center' },
  },

  /**
   * float — gentle vertical bobbing
   */
  float: {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%':      { transform: 'translateY(-6px)' },
  },

  /**
   * flicker — torch / candle opacity variation
   */
  flicker: {
    '0%, 100%': { opacity: '1.0' },
    '8%':        { opacity: '0.9' },
    '15%':       { opacity: '1.0' },
    '28%':       { opacity: '0.85' },
    '35%':       { opacity: '1.0' },
    '52%':       { opacity: '0.95' },
    '60%':       { opacity: '1.0' },
    '78%':       { opacity: '0.88' },
    '85%':       { opacity: '1.0' },
  },
};

// ---------------------------------------------------------------------------
// ANIMATION SHORTCUTS
// ---------------------------------------------------------------------------

const animation = {
  // Transmutation pulse
  'transmute':        'transmute 2.5s cubic-bezier(0.4,0,0.2,1) infinite',
  'transmute-slow':   'transmute 4.0s cubic-bezier(0.4,0,0.2,1) infinite',
  'transmute-fast':   'transmute 1.5s cubic-bezier(0.4,0,0.2,1) infinite',

  // Glow pulses
  'glow-pulse':         'glow-pulse        2.5s ease-in-out infinite',
  'glow-pulse-gold':    'glow-pulse-gold   2.5s ease-in-out infinite',
  'glow-pulse-aether':  'glow-pulse-aether 2.5s ease-in-out infinite',
  'glow-pulse-crimson': 'glow-pulse-crimson 2.5s ease-in-out infinite',

  // Particle drift
  'particle-drift':       'particle-drift 6s ease-in-out infinite',
  'particle-drift-slow':  'particle-drift 9s ease-in-out infinite',

  // Rune spin variants
  'rune-spin':          'rune-spin         8s linear infinite',
  'rune-spin-slow':     'rune-spin        14s linear infinite',
  'rune-spin-fast':     'rune-spin         4s linear infinite',
  'rune-spin-reverse':  'rune-spin-reverse 8s linear infinite',

  // Aether hue flow
  'aether-flow':        'aether-flow 6s linear infinite',
  'aether-flow-slow':   'aether-flow 12s linear infinite',

  // Enter animations
  'materialize':        'materialize 0.6s cubic-bezier(0,0,0.2,1) both',
  'materialize-slow':   'materialize 0.9s cubic-bezier(0,0,0.2,1) both',
  'materialize-fast':   'materialize 0.35s cubic-bezier(0,0,0.2,1) both',
  'crystallize':        'crystallize 0.8s cubic-bezier(0.34,1.56,0.64,1) both',

  // Shimmer sweep
  'shimmer':            'shimmer 2.5s linear infinite',
  'shimmer-slow':       'shimmer 4.0s linear infinite',

  // Ambient / ambient loop
  'float':              'float   3.0s ease-in-out infinite',
  'float-slow':         'float   5.0s ease-in-out infinite',
  'flicker':            'flicker 2.5s linear    infinite',
};

// ---------------------------------------------------------------------------
// BORDER RADIUS EXTENSIONS
// ---------------------------------------------------------------------------

const borderRadius = {
  '4xl': '2rem',
  '5xl': '3rem',
};

// ---------------------------------------------------------------------------
// TRANSITION TIMING FUNCTIONS
// ---------------------------------------------------------------------------

const transitionTimingFunction = {
  'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'smooth': 'cubic-bezier(0.4,  0,    0.2,  1)',
};

// ---------------------------------------------------------------------------
// DROP SHADOWS (filter: drop-shadow — for SVG / transparent PNGs)
// ---------------------------------------------------------------------------

const dropShadow = {
  'glow-gold':   [`0 0 8px  ${rgba('#FFD700', 0.60)}`, `0 0 16px ${rgba('#FFD700', 0.30)}`],
  'glow-aether': [`0 0 8px  ${rgba('#00FFAA', 0.60)}`, `0 0 16px ${rgba('#00FFAA', 0.30)}`],
  'glow-arcane': [`0 0 8px  ${rgba('#9D4EDD', 0.60)}`, `0 0 16px ${rgba('#9D4EDD', 0.30)}`],
  'glow-crimson':[`0 0 8px  ${rgba('#FF2D55', 0.60)}`, `0 0 16px ${rgba('#FF2D55', 0.30)}`],
};

// ---------------------------------------------------------------------------
// BACKDROP BLUR EXTENSIONS
// ---------------------------------------------------------------------------

const backdropBlur = {
  xs: '2px',
  '4xl': '64px',
};

// ---------------------------------------------------------------------------
// SPACING EXTENSIONS (alchemical scale)
// ---------------------------------------------------------------------------

const spacing = {
  '18': '4.5rem',
  '22': '5.5rem',
  '26': '6.5rem',
  '28': '7rem',
  '72': '18rem',
  '84': '21rem',
  '96': '24rem',
  '128':'32rem',
};

// ---------------------------------------------------------------------------
// OPACITY UTILITIES
// ---------------------------------------------------------------------------

const opacity = {
  '2':  '0.02',
  '3':  '0.03',
  '7':  '0.07',
  '12': '0.12',
  '15': '0.15',
  '18': '0.18',
  '35': '0.35',
  '45': '0.45',
  '65': '0.65',
  '85': '0.85',
  '92': '0.92',
  '98': '0.98',
};

// ---------------------------------------------------------------------------
// FULL THEME EXTENSION EXPORT
// ---------------------------------------------------------------------------

/** @type {import('tailwindcss').Config['theme']} */
const alchemicalThemeExtend = {
  colors: {
    obsidian,
    arcane,
    aurum,
    aether,
    crimson,
    mist,
    violet,
  },

  fontFamily,

  boxShadow,

  backgroundImage,

  keyframes,

  animation,

  borderRadius,

  transitionTimingFunction,

  dropShadow,

  backdropBlur,

  spacing,

  opacity,
};

module.exports = alchemicalThemeExtend;


/* ============================================================
   USAGE EXAMPLES
   ============================================================

   tailwind.config.js
   ------------------
   const alchemical = require('./assets/branding/tailwind-alchemical');

   module.exports = {
     content: ['./src/**\/*.{html,js,ts,tsx,vue,svelte}'],
     theme: {
       extend: alchemical,
     },
     plugins: [],
   };


   In your HTML / JSX:
   -------------------
   // Gold glow card
   <div class="bg-obsidian-700 border border-aurum-400/30 shadow-glow-gold rounded-2xl p-6">
     <h2 class="font-display text-2xl text-aurum-400">Philosopher's Stone</h2>
   </div>

   // Pulsing arcane badge
   <span class="bg-arcane-900 text-arcane-400 border border-arcane-600/40
                shadow-glow-arcane-sm animate-glow-pulse px-3 py-1 rounded-full
                text-xs font-semibold uppercase tracking-widest">
     Legendary
   </span>

   // Aether text gradient (requires CSS @apply or inline style)
   <h1 class="font-display text-4xl bg-gradient-aether bg-clip-text text-transparent">
     Magnum Opus
   </h1>

   // Entrance animation
   <div class="animate-materialize">...</div>

   // Rune spinning icon
   <svg class="animate-rune-spin w-8 h-8 text-arcane-400">...</svg>

   // Crystal glassmorphism panel
   <div class="bg-obsidian-700/70 backdrop-blur-xl border border-arcane-400/20
               shadow-crystal rounded-3xl">
     ...
   </div>

   ============================================================ */
