/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: '#1E1E1E',
        calmBlue: {
          light: '#4EA8DE',
          DEFAULT: '#0077B6',
          dark: '#023E8A',
        }
      }
    },
  },
  plugins: [],
}