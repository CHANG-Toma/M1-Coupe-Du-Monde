/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
      },
    },
  },
  plugins: [],
};
