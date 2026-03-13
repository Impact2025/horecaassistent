import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light mode (guest / dashboard)
        primary: {
          DEFAULT: "#003422",
          foreground: "#ffffff",
        },
        tertiary: {
          DEFAULT: "#501d00",
          foreground: "#ffffff",
        },
        "surface-container": "#efeeeb",
        "on-surface-variant": "#404943",
        "secondary-container": "#d6e7db",
        "outline-variant": "#c0c9c1",
        "surface-container-low": "#f5f3f0",
        "surface-container-high": "#eae8e5",
        "surface-container-highest": "#e4e2df",
        "on-surface": "#1b1c1a",
        "primary-container": "#0f4c35",
        "on-primary-container": "#82bc9e",
        "tertiary-container": "#732d00",
        "on-tertiary-container": "#ff935c",
        "primary-fixed": "#b4f0d0",
        "primary-fixed-dim": "#99d3b4",
        "inverse-surface": "#30312f",
        // Dark mode (kitchen)
        "dark-bg": "#0a0c0b",
        "dark-primary": "#82bc9e",
        "dark-tertiary": "#ffb693",
        "dark-surface": "#1b1c1a",
        "dark-surface-high": "#2a2c29",
        "dark-on-surface": "#e2e4e1",
        "dark-on-surface-variant": "#8c9089",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Manrope", "sans-serif"],
        serif: ["Cormorant Garamond", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
