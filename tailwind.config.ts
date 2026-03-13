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
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
