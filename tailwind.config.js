/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // New color scheme from mockup
        primary: {
          DEFAULT: '#FFFC74', // Bright yellow for highlights
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
        // Dark theme colors
        dark: {
          DEFAULT: '#151515', // Main background
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
        // Text colors
        text: {
          primary: '#FFFFFF',    // Main heading color
          secondary: '#979797',  // Sub-heading color
          tertiary: '#5E5E5E',   // Paragraph color
        },
        // UI colors
        ui: {
          border: '#2A2A2A',
          card: '#1A1A1A',
          hover: '#202020',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
