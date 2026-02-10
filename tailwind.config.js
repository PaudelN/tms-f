/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        priority: {
          low: 'hsl(142, 71%, 45%)',
          medium: 'hsl(38, 92%, 50%)',
          high: 'hsl(25, 95%, 53%)',
          urgent: 'hsl(0, 84%, 60%)'
        },
        status: {
          todo: 'hsl(240, 3.8%, 46%)',
          'in-progress': 'hsl(221, 83%, 53%)',
          review: 'hsl(38, 92%, 50%)',
          done: 'hsl(142, 71%, 45%)'
        }
      },
      boxShadow: {
        'clay-sm': '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'clay-md': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.05)'
      }
    }
  }
}
