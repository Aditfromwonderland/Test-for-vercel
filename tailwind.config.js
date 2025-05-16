/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'coral': '#FF6B6B',
        'orange': '#FFA93A',
        'yellow': '#FFD93D',
        'green': '#6BCB77',
        'blue': '#4D96FF',
      },
    },
  },
  plugins: [],
}
