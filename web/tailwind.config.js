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
        pantry: {
          50: '#F4FBF4',
          100: '#E8F5E9',
          200: '#C8E6C9',
          300: '#A5D6A7',
          400: '#66BB6A',
          500: '#2E7D32',
          600: '#1B5E20',
          700: '#144517',
          800: '#0E3010',
          900: '#081C09',
          950: '#040E05',
        },
        hud: {
          green: '#00FF66',
          cyan: '#00F0FF',
          amber: '#FFB800',
          rose: '#FF3366',
          dark: '#0A0F0D',
          panel: 'rgba(16, 26, 20, 0.75)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scan 2.8s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(46, 125, 50, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 255, 102, 0.6)' },
        }
      }
    },
  },
  plugins: [],
};

