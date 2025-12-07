/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'card-bg': '#1a1a2e',
        'card-border': '#16213e',
        'accent': '#e94560',
        'accent-hover': '#ff6b6b',
        'surface': '#0f0f23',
        'surface-light': '#1a1a3e',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(233, 69, 96, 0.1), 0 2px 4px -1px rgba(233, 69, 96, 0.06)',
        'card-hover': '0 10px 25px -5px rgba(233, 69, 96, 0.2), 0 8px 10px -6px rgba(233, 69, 96, 0.1)',
        'glow': '0 0 20px rgba(233, 69, 96, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
