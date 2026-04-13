/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aijoa: {
          blue: '#1A73E8',
          yellow: '#FFC107',
          gray: '#F1F3F4'
        }
      }
    },
  },
  plugins: [],
}
