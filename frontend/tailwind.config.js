/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#FFD700',
        amber: '#FF8C00',
        dark: '#0D0D14',
        'dark-card': '#13131D',
        'dark-border': '#1F1F2E',
      },
      fontFamily: {
        game: ['Orbitron', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
