/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // Safelist for dynamic color classes used in components
  safelist: [
    {
      pattern: /border-(red|blue|green|yellow|purple|pink|indigo|gray)-(500)/,
    },
  ],
  plugins: [],
}
