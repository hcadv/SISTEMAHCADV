import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#e8edf5",
          100: "#c5d0e4",
          200: "#9fb0d0",
          300: "#7890bc",
          400: "#5a78ad",
          500: "#3c609e",
          600: "#2d5191",
          700: "#1e3a5f",
          800: "#162d4d",
          900: "#0d1f38",
        },
        gold: {
          50: "#fdf8ec",
          100: "#f9edcc",
          200: "#f4e0a3",
          300: "#eed279",
          400: "#e8c455",
          500: "#c9a84c",
          600: "#b8943a",
          700: "#9a7a28",
          800: "#7c611a",
          900: "#5e4a10",
        },
      },
    },
  },
  plugins: [],
};

export default config;
