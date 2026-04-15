/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0B0E14',
        'dark-card': '#151A23',
        'brand': '#FF6B00', // Vibrant Orange for "Grab-n-Go"
        'brand-hover': '#e65e00',
        'accent': '#10B981', // Green for success/money
      },
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
