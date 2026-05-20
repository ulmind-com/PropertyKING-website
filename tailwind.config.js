/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A1A1A',
          hover: '#000000',
          light: '#F0F0F0',
          dark: '#000000',
          soft: 'rgba(0,0,0,0.05)',
        },
        bg: {
          DEFAULT: '#FFFFFF',
          alt: '#FAFAFA',
          dark: '#F5F5F5',
        },
        surface: '#FFFFFF',
        border: {
          DEFAULT: '#E5E5E5',
          light: '#F5F5F5',
        },
        text: {
          primary: '#0A0A0A',
          secondary: '#525252',
          muted: '#A3A3A3',
          inverse: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Raleway', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        'md': '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)',
        'lg': '0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.03)',
        'xl': '0 20px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.03)',
        'primary': '0 4px 14px rgba(0,0,0,0.15)',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #1A1A1A, #000000)',
      }
    },
  },
  plugins: [],
}
