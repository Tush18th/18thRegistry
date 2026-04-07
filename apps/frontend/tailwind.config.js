/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f111a',
        surface: '#1e2130',
        primary: '#6b46c1',
        primaryHover: '#805ad5',
        secondary: '#2d3748',
        border: '#2d3748',
      },
    },
  },
  plugins: [],
}
