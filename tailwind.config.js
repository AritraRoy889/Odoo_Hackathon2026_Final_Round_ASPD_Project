/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        darkBg: {
          DEFAULT: '#06070F',
          card: '#0D1117',
          hover: '#111827',
          border: '#1C2438',
          elevated: '#131B2E',
        },
        accent: {
          teal: '#00E5B0',
          tealLight: '#33EDBE',
          tealDark: '#00B88A',
          violet: '#7C3AED',
          violetLight: '#9B59F5',
          violetDark: '#5B21B6',
          gold: '#F59E0B',
          goldLight: '#FBB040',
          red: '#EF4444',
          // Legacy mint aliases for backward compat
          mint: '#00E5B0',
          mintLight: '#33EDBE',
          mintDark: '#00B88A',
          glow: 'rgba(0, 229, 176, 0.15)',
        }
      },
      backgroundImage: {
        'gradient-teal-violet': 'linear-gradient(135deg, #00E5B0, #7C3AED)',
        'gradient-violet-teal': 'linear-gradient(135deg, #7C3AED, #00E5B0)',
        'gradient-dark-card': 'linear-gradient(135deg, rgba(13,17,23,0.95), rgba(6,7,15,0.98))',
        'gradient-hero': 'linear-gradient(to bottom, rgba(6,7,15,0.7) 0%, rgba(6,7,15,0.55) 50%, rgba(6,7,15,1) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px 4px rgba(0, 229, 176, 0.25)',
        'glow-subtle': '0 0 12px 2px rgba(0, 229, 176, 0.12)',
        'glow-lg': '0 0 35px 8px rgba(0, 229, 176, 0.35)',
        'glow-violet': '0 0 20px 4px rgba(124, 58, 237, 0.3)',
        'glow-violet-subtle': '0 0 12px 2px rgba(124, 58, 237, 0.15)',
        'glow-gold': '0 0 15px 3px rgba(245, 158, 11, 0.25)',
        'card': '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,176,0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        // Core
        'fade-in': 'fadeIn 0.35s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        // Glow
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-violet': 'pulseViolet 2s ease-in-out infinite',
        'pulse-red': 'pulseRed 1.2s ease-in-out infinite',
        // Special
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'morphBorder': 'morphBorder 4s ease infinite',
        'typewriter': 'typewriter 0.05s steps(1) infinite',
        'spin-slow': 'spin 4s linear infinite',
        'bounce-subtle': 'bounceSubtle 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'number-roll': 'numberRoll 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'draw-check': 'drawCheck 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards',
        'live-blink': 'liveBlink 1.5s ease-in-out infinite',
        'count-up': 'fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'stagger-1': 'fadeInUp 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both',
        'stagger-2': 'fadeInUp 0.5s 0.2s cubic-bezier(0.16,1,0.3,1) both',
        'stagger-3': 'fadeInUp 0.5s 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'stagger-4': 'fadeInUp 0.5s 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'stagger-5': 'fadeInUp 0.5s 0.5s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px 4px rgba(0,229,176,0.25)' },
          '50%': { opacity: '0.85', boxShadow: '0 0 35px 8px rgba(0,229,176,0.4)' },
        },
        pulseViolet: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px 3px rgba(124,58,237,0.2)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 30px 6px rgba(124,58,237,0.45)' },
        },
        pulseRed: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.04)', opacity: '0.9' },
        },
        morphBorder: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        typewriter: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
          '60%': { transform: 'translateY(-3px)' },
        },
        numberRoll: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        drawCheck: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        liveBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      }
    },
  },
  plugins: [],
}
