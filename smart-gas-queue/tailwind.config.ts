import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#DC2626',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #EF4444 0%, #DC2626 55%, #B91C1C 100%)',
        'brand-radial': 'radial-gradient(120% 120% at 0% 0%, #EF4444 0%, #B91C1C 100%)',
      },
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      boxShadow: {
        // Layered, low-opacity shadows tuned on a cool-neutral base (16,24,40)
        soft: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.08)',
        card: '0 1px 3px rgba(16,24,40,0.04), 0 6px 16px -4px rgba(16,24,40,0.08)',
        float: '0 8px 24px -6px rgba(16,24,40,0.12), 0 2px 6px -2px rgba(16,24,40,0.06)',
        premium:
          '0 1px 2px rgba(16,24,40,0.04), 0 12px 32px -8px rgba(16,24,40,0.14), 0 4px 8px -4px rgba(16,24,40,0.06)',
        'brand-glow': '0 8px 24px -6px rgba(220,38,38,0.45), 0 2px 6px -2px rgba(220,38,38,0.30)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
