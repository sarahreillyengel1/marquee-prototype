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
        // ── Legacy palette (existing pages) ──
        cream: "#F5F0E8",
        ink: "#111010",
        gray: { DEFAULT: "#6B6560", 2: "#A09890" },
        border: "#E0D9CE",
        lav: { DEFAULT: "#C4B5FD", mid: "#A78BFA", lt: "#F3F0FF", dk: "#7C3AED" },
        mint: { DEFAULT: "#6EE7B7", lt: "#ECFDF5", dk: "#059669" },
        coral: { DEFAULT: "#FB7185", lt: "#FFF1F2" },
        navy: { DEFAULT: "#1E3A5F", lt: "#E8EEF5" },

        // ── Brand palette — from BRAND.md (Brand Essentials). Source of truth. ──
        brand: {
          // foundation
          ink: "#111111",
          paper: "#FFFFFF",
          white: "#F7F7F8",
          stone: "#E6E2D0",
          taupe: "#DBCDC4",
          // brand
          crimson: "#B21E2F",
          wine: "#670821",
          purple: "#C7B5EE",
          sky: "#C0DDFB",
          blue: "#1F3BC4",
          // accent
          citron: "#D6E27B",
          blush: "#F8C3FF",
          sage: "#73926A",
          mint: "#B9E3A5",
          orange: "#FF5436",
          // legacy aliases → mapped to new hexes so existing classes keep working
          lavender: "#C7B5EE",
          vermillion: "#FF5436",
          green: "#B9E3A5",
        },
      },
      fontFamily: {
        serif: ["var(--font-dm-serif)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
        // Brand fonts
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
        poppins: ["var(--font-poppins)", "system-ui", "sans-serif"],
        caveat: ["var(--font-caveat)", "cursive"],
      },
      borderRadius: {
        pill: "100px",
      },
    },
  },
  plugins: [],
};
export default config;
