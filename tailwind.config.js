/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F2E9',
        surface: '#FFFDF8',
        ink: '#064D3B',
        'ink-soft': '#4B665D',
        lime: '#C8E56B',
        'lime-soft': '#E4F3A6',
        coral: '#EC7448',
        'coral-soft': '#F7B08F',
        pink: '#ECA4D0',
      },
    },
  },
  plugins: [],
};
