import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — verdant greens + an aurora accent set.
        forest: {
          50: "#E8F7EC",
          100: "#C7EBD1",
          200: "#9FDCB1",
          300: "#6FCB8E",
          400: "#43B86E",
          500: "#22A155",
          600: "#138445",
          700: "#0E6A38",
          800: "#0B522C",
          900: "#093D22",
        },
        aurora: {
          teal: "#2DD4BF",
          cyan: "#22D3EE",
          violet: "#8B5CF6",
          pink: "#EC4899",
          lime: "#A3E635",
        },
        // Semantic tokens driven by CSS variables (theme-aware).
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        hairline: "rgb(var(--hairline) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        // Legacy (V1) tokens kept so the original commerce pages still render.
        sage: "#9FDCB1",
        sky: "#90CAF9",
        ivory: "#FAFAF5",
        bark: {
          DEFAULT: "#795548",
          light: "#A1887F",
          dark: "#4E342E",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        glass: "0 8px 32px -8px rgba(2, 24, 14, 0.18)",
        glow: "0 0 40px -8px rgba(34, 161, 85, 0.45)",
        "glow-violet": "0 0 40px -8px rgba(139, 92, 246, 0.45)",
        lift: "0 24px 64px -24px rgba(2, 24, 14, 0.45)",
        // Legacy (V1)
        soft: "0 10px 40px -12px rgba(27, 94, 32, 0.18)",
        card: "0 4px 24px -8px rgba(27, 94, 32, 0.15)",
      },
      backgroundImage: {
        "aurora-1":
          "radial-gradient(60% 60% at 20% 20%, rgba(45,212,191,0.35), transparent 60%), radial-gradient(60% 60% at 80% 0%, rgba(139,92,246,0.30), transparent 55%), radial-gradient(70% 70% at 60% 90%, rgba(34,161,85,0.30), transparent 60%)",
        "brand-gradient":
          "linear-gradient(135deg, #22D3EE 0%, #22A155 45%, #8B5CF6 100%)",
        "grid-faint":
          "linear-gradient(to right, rgba(127,127,127,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(127,127,127,0.08) 1px, transparent 1px)",
        // Legacy (V1)
        "forest-gradient":
          "linear-gradient(135deg, #093D22 0%, #0B522C 45%, #138445 100%)",
        "sage-gradient": "linear-gradient(135deg, #E8F7EC 0%, #FAFAF5 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "aurora-shift": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(0,-3%,0) scale(1.08)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
        "aurora-shift": "aurora-shift 16s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite",
        "pulse-ring": "pulse-ring 1.8s ease-out infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
