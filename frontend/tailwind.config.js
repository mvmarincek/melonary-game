/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        melonary: {
          gold: '#FFD700',
          amber: '#FFBF00',
          caramel: '#D2691E',
          bronze: '#CD7F32',
          dark: '#1a1a2e',
          darker: '#0f0f1a',
        }
      },
      fontFamily: {
        game: ['Press Start 2P', 'cursive'],
      },
      animation: {
        'shake': 'shake 0.5s ease-in-out',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'kick': 'kick 0.3s ease-out',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 20px #FFD700' },
          '50%': { boxShadow: '0 0 40px #FFD700, 0 0 60px #FFBF00' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        kick: {
          '0%': { transform: 'translateX(0) rotate(0deg)' },
          '50%': { transform: 'translateX(50px) rotate(45deg)' },
          '100%': { transform: 'translateX(0) rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
