/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fleet: {
          dark: '#12202B',
          blue: '#1769E0',
          blueHover: '#0B57C7',
          bg: '#F3F5F7',
          border: '#DDE3E8',
          borderLight: '#EEF1F4',
          text: '#12202B',
          muted: '#5B6975',
          dim: '#B9C6D0',
          status: {
            movingBg: '#DCEBFF',
            movingFg: '#0A4A9E',
            movingDot: '#1769E0',
            idleBg: '#FFEBC2',
            idleFg: '#6B4100',
            idleDot: '#B86E00',
            offlineBg: '#E4E7EB',
            offlineFg: '#44505B',
            offlineDot: '#6B7682',
          }
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      keyframes: {
        ftpulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(23, 105, 224, 0.5)' },
          '100%': { boxShadow: '0 0 0 9px rgba(23, 105, 224, 0)' },
        },
      },
      animation: {
        pulseRadar: 'ftpulse 1.6s infinite',
      },
    },
  },
  plugins: [],
};
