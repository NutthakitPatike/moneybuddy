import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fff7ed",
        blush: "#ffe4e6",
        mint: "#d1fae5",
        skysoft: "#e0f2fe",
        cocoa: "#5b4b49"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(91,75,73,0.12)"
      }
    }
  },
  plugins: [animate]
} satisfies Config;
