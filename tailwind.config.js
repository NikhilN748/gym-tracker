/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e8f2ff',
          100: '#d5e8ff',
          200: '#b3d4ff',
          300: '#80b8ff',
          400: '#3399ff',
          500: '#1f7af5',
          600: '#1a6bdb',
          700: '#1c5ab8',
          800: '#1c4a96',
          900: '#1c468f',
          950: '#142c5a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
