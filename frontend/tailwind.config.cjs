/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govGreen: {
          light: '#E8F5E9',
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
        },
        govBlue: {
          light: '#E3F2FD',
          DEFAULT: '#0D47A1',
          dark: '#0A2540',
        },
        lightBg: '#F4F6F8',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
