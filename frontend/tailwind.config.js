/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#070a13',
          card: '#0f172a',
          cyan: '#00f0ff',
          neon: '#39ff14',
          blue: '#3b82f6',
          border: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
