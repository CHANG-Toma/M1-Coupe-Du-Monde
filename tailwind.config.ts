import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "#0b0f1a",
        card: "#131929",
        border: "#1e2840",
        accent: "#4a7ef5",
        live: "#00e676",
        muted: "#6b7a9e",
        cdm: {
          blue: "#4a7ef5",
          green: "#00e676",
          dark: "#0b0f1a",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
