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
        background: "#f9f9f9",
        foreground: "#1a1c1c",
        surface: "#f9f9f9",
        "surface-dim": "#dadada",
        "surface-bright": "#f9f9f9",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1f1f1",
        "surface-container": "#eeeeee",
        "surface-container-high": "#e8e8e8",
        "surface-container-highest": "#e2e2e2",
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#434656",
        outline: "#747688",
        "outline-variant": "#c3c5d7",
        primary: "#0040e0",
        "on-primary": "#ffffff",
        "primary-container": "#2e5bff",
        "on-primary-container": "#ffffff",
        secondary: "#e2e2e2",
        "on-secondary": "#1a1c1c",
        "secondary-container": "#ffffff",
        "on-secondary-container": "#1a1c1c",
        destructive: "#ba1a1a",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        border: "#1a1c1c",
        input: "#1a1c1c",
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
