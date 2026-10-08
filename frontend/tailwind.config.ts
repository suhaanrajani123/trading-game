import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["variant", ['&:is([data-theme="dark"] *)', '&:is([data-theme="black"] *)']],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: token("paper"),
        surface: token("surface"),
        surface2: token("surface-2"),
        line: token("line"),
        ink: token("ink"),
        inksoft: token("ink-soft"),
        muted: token("muted"),
        gain: token("gain"),
        loss: token("loss"),
        marker: token("marker"),
        primary: token("primary"),
        onprimary: token("on-primary"),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', '"IBM Plex Sans"', "system-ui", "sans-serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        panel: "14px",
        control: "10px",
      },
      maxWidth: {
        page: "1320px",
        prose: "66ch",
      },
    },
  },
  plugins: [],
};
export default config;
