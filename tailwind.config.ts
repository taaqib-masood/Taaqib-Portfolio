import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        heading: ["var(--font-sans)"], // Only Inter
      },
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        surface: "#000000",
        "surface-dim": "#1a1c1c",
        "surface-bright": "#111111",
        "surface-container-lowest": "#000000",
        "surface-container-low": "#0e0e0e",
        "surface-container": "#111111",
        "surface-container-high": "#1a1a1a",
        "surface-container-highest": "#222222",
        "on-surface": "#ffffff",
        "on-surface-variant": "#a3a6b6",
        outline: "#747688",
        "outline-variant": "#3a3c4e",
        primary: "#2e5bff",
        "on-primary": "#ffffff",
        "primary-container": "#2e5bff",
        "on-primary-container": "#ffffff",
        secondary: "#1a1c1c",
        "on-secondary": "#e2e2e2",
        "secondary-container": "#000000",
        "on-secondary-container": "#e2e2e2",
        destructive: "#ba1a1a",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        border: "#ffffff",
        input: "#ffffff",
        ring: "#2e5bff",
      },
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
        full: "0px",
      },
    },
  },
  plugins: [],
};
export default config;
