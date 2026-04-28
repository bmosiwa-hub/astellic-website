/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#041232",
        "navy-light": "#0a1f52",
        blue: "#0B76A0",
        "gold-dark": "#CC9B00",
        "gold-bright": "#FFC000",
        cream: "#F9F1DC",
        "text-gray": "#A6A6A6",
        green: "#3B7D23",
        red: "#C04F15",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["'TW Cen MT'", "Futura", "Century Gothic", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
