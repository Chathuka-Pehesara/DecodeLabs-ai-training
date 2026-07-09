/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          darkBg: "#0d0e12",
          darkSurface: "#15161c",
          darkCard: "#1e1f26",
          darkBorder: "#2c2d3a",
          primary: "#6366f1", // Indigo
          secondary: "#8b5cf6", // Violet
          accent: "#10b981", // Emerald
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
