import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#1B2A4A",
          teal: "#0D7A6E",
          gold: "#C9A84C",
          green: "#3B7D23",
          light: "#F4F6F9",
          muted: "#6B7A99",
        },
        hv: {
          50: "#F3F0FF",
          100: "#E9E3FB",
          200: "#D5C9F5",
          300: "#B7A3EA",
          400: "#9A82DB",
          500: "#7B61C8",
          600: "#6249AC",
          700: "#4E3A92",
          800: "#3E2A78",
          900: "#2C1D57",
          950: "#1D1238",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
