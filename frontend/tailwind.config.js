/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          light: '#eff6ff'
        },
        purple: '#8b5cf6',
        green: '#10b981',
        text: '#1e293b',
        muted: '#64748b',
        border: '#e2e8f0',
        bg: '#f8fafc',
        card: '#ffffff'
      },
      borderRadius: {
        DEFAULT: '14px'
      },
      boxShadow: {
        DEFAULT: '0 4px 24px rgba(59,130,246,.10)',
        sm: '0 2px 8px rgba(0,0,0,.07)'
      }
    },
  },
  plugins: [],
}
