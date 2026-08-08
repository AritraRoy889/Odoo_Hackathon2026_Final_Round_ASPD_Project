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
        darkBg: {
          DEFAULT: '#0B0F19',
          card: '#161D30',
          hover: '#1F2A45',
          border: '#24335C',
        },
        accent: {
          mint: '#10B981',
          mintLight: '#34D399',
          mintDark: '#059669',
          glow: 'rgba(16, 185, 129, 0.15)',
        }
      },
      boxShadow: {
        'glow': '0 0 15px 3px rgba(16, 185, 129, 0.2)',
        'glow-subtle': '0 0 10px 1px rgba(16, 185, 129, 0.1)',
        'glow-lg': '0 0 25px 5px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.98)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}

