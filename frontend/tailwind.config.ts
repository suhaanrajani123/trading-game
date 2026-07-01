import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0E11",
        surface: "#14181D",
        surfaceHover: "#1B2028",
        border: "#242A33",
        text: "#E8EAED",
        muted: "#8B94A3",
        gain: "#00D964",
        loss: "#FF4757",
        brand: "#4C7CF0",
        xp: "#F5B800",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
