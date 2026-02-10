/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      boxShadow: {
        'clay-sm': '0 2px 4px -1px rgba(0,0,0,0.06)',
        'clay-md': '0 8px 16px -8px rgba(0,0,0,0.18)',
      },
      colors: {
        priority: {
          low: '#22c55e',
          medium: '#f59e0b',
          high: '#f97316',
          urgent: '#ef4444',
        },
      },
    },
  },
}
