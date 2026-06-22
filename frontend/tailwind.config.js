/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F1115',
          800: '#1A1D23',
          700: '#262A33',
          600: '#363B46',
        },
        gold: {
          100: '#FDECEC',
          400: '#F0453B',
          500: '#E2231A',
          600: '#B91C1C',
        },
        surface: {
          page: '#F5F6FA',
          card: '#FFFFFF',
          input: '#F8FAFC',
          subtle: '#F1F5F9',
        },
        border: {
          light: '#E2E8F0',
          focus: '#E2231A',
          hover: '#CBD5E1',
        },
        text: {
          primary: '#1F2937',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        status: {
          baruBg: '#EBF0FF', baruText: '#1E3A8A',
          reviewBg: '#FEF3C7', reviewText: '#92400E',
          shortlistBg: '#D1FAE5', shortlistText: '#065F46',
          ditolakBg: '#FEE2E2', ditolakText: '#991B1B',
          diterimaBg: '#DCFCE7', diterimaText: '#14532D',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '99px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,30,60,0.06), 0 1px 2px rgba(15,30,60,0.04)',
        'card-hover': '0 4px 12px rgba(15,30,60,0.09)',
        focus: '0 0 0 3px rgba(226,35,26,0.18)',
        toast: '0 8px 24px rgba(15,30,60,0.15)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        xs: ['13px', '1.5'],
        sm: ['14.5px', '1.6'],
        base: ['16px', '1.7'],
        lg: ['18px', { lineHeight: '1.6', fontWeight: '500' }],
        xl: ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        '2xl': ['30px', { lineHeight: '1.3', fontWeight: '600' }],
      },
      keyframes: {
        fadeSlideIn: {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        fadeSlideIn: 'fadeSlideIn 0.25s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        scaleIn: 'scaleIn 0.3s ease-out backwards',
        floatSlow: 'floatSlow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
