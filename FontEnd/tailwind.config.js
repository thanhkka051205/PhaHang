/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.html",
    "./admin/*.html",
    "./js/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#DC2626', // Carmine Tech Red
          hover: '#B91C1C',
          dark: '#991B1B',
          light: '#FEF2F2',
          subtle: '#FEE2E2',
          border: '#FECACA',
        },
        navy: {
          DEFAULT: '#0F172A',
          surface: '#1E293B',
          subtle: '#334155',
          light: '#F8FAFC',
        },
        accent: {
          DEFAULT: '#D97706',
          hover: '#B45309',
          light: '#FFFBEB',
        },
        ember: {
          DEFAULT: '#DC2626',
          hover: '#B91C1C',
          light: '#EF4444',
          dark: '#991B1B',
        },
        price: {
          DEFAULT: '#DC2626', // Đỏ Carmine đậm nét
          light: '#FEF2F2',
          border: '#FECACA',
        },
        retail: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          text: '#0F172A',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 12px 24px -4px rgba(220, 38, 38, 0.12), 0 8px 12px -6px rgba(15, 23, 42, 0.08)',
        'btn-brand': '0 4px 14px rgba(220, 38, 38, 0.3)',
      },
      borderRadius: {
        'card': '16px',
        'subcard': '12px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}
