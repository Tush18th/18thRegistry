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
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        surface: 'var(--card)', // Map surface to card for consistency
        primary: '#6b46c1',
        primaryHover: '#805ad5',
        secondary: 'var(--border)',
        border: 'var(--border)',
      },
    },
  },
  plugins: [],
}
