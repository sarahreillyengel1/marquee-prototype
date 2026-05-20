import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F5F0E8",
        ink: "#111010",
        gray: { DEFAULT: "#6B6560", 2: "#A09890" },
        border: "#E0D9CE",
        lav: { DEFAULT: "#C4B5FD", mid: "#A78BFA", lt: "#F3F0FF", dk: "#7C3AED" },
        mint: { DEFAULT: "#6EE7B7", lt: "#ECFDF5", dk: "#059669" },
        coral: { DEFAULT: "#FB7185", lt: "#FFF1F2" },
        navy: { DEFAULT: "#1E3A5F", lt: "#E8EEF5" },
      },
      fontFamily: {
        serif: ["var(--font-dm-serif)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      borderRadius: {
        pill: "100px",
      },
    },
  },
  plugins: [],
};
export default config;
