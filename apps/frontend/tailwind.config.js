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
        border: 'var(--border)',
        ring: 'var(--ring)',
        surface: 'var(--card)',
        primary: {
          DEFAULT: '#6366f1', // Vibrant Indigo
          foreground: '#ffffff',
          hover: '#4f46e5',
        },
        accent: {
          DEFAULT: '#f97316', // Orange
          foreground: '#ffffff',
        },
        slate: {
          950: '#020617',
        }
      },
      fontFamily: {
        heading: ['var(--font-outfit)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'premium': '0 20px 50px -12px rgba(0, 0, 0, 0.05)',
        'premium-hover': '0 30px 60px -12px rgba(99, 102, 241, 0.1)',
      }
    },
  },
  plugins: [],
}
