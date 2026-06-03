/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kronos-bg': '#000000',
        'kronos-surface': '#0A0A0A',
        'kronos-border': '#1A1A1A',
        'kronos-text': '#FFFFFF',
        'kronos-muted': '#444444',
        'kronos-accent': '#C8D8FF',
        'kronos-rest': '#C8A86B',
        'kronos-danger': '#FF4444',
        'streak-0': '#111111',
        'streak-1': '#4A6FA5',
        'streak-2': '#7AA2D4',
        'streak-3': '#C8D8FF',
      },
      fontFamily: {
        'sans': ['"Elms Sans"', 'sans-serif'],
      },
      fontSize: {
        'xs': '11px',
        'sm': '13px',
        'base': '15px',
        'lg': '18px',
        'xl': '24px',
        '2xl': '32px',
        'timer': 'clamp(80px, 20vw, 160px)',
      },
      borderRadius: {
        'card': '8px',
        'sm': '4px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
      },
    },
  },
  plugins: [],
}
