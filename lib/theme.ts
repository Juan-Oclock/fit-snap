/**
 * Design System Theme Configuration
 * Based on the FitSnap mockup design
 */

export const theme = {
  colors: {
    primary: {
      DEFAULT: '#FFFC74',
      50: '#FFFEF0',
      100: '#FFFDE0',
      200: '#FFFAC2',
      300: '#FFF794',
      400: '#FFF366',
      500: '#FFFC74',
      600: '#E6E366',
      700: '#CCCA59',
      800: '#B3B14C',
      900: '#99983F',
    },
    dark: {
      DEFAULT: '#151515',
      50: '#F5F5F5',
      100: '#E5E5E5',
      200: '#D4D4D4',
      300: '#A3A3A3',
      400: '#737373',
      500: '#525252',
      600: '#404040',
      700: '#2A2A2A',
      800: '#1F1F1F',
      900: '#151515',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#979797',
      tertiary: '#5E5E5E',
    },
    ui: {
      border: '#2A2A2A',
      card: '#1A1A1A',
      hover: '#202020',
    },
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
    // App container spacing
    container: '1.5625rem', // 25px
  },
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
} as const;

export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
