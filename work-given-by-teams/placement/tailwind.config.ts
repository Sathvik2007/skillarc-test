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
        // ── Design system ─────────────────────────────────────────────
        // Slate-900 base, indigo accent, clean neutrals
        background: {
          DEFAULT: "#0B0F1A",   // page bg — deep navy
          card:    "#111827",   // card surface
          muted:   "#1a2236",   // hover / muted surface
          border:  "#1f2d45",   // subtle border
        },
        primary: {
          DEFAULT: "#6366f1",   // indigo-500
          hover:   "#4f46e5",   // indigo-600
          muted:   "#312e81",   // indigo-900 (chips, pills bg)
          text:    "#c7d2fe",   // indigo-200 (text on primary)
        },
        accent: {
          teal:    "#14b8a6",   // teal-500
          amber:   "#f59e0b",   // amber-500
          rose:    "#f43f5e",   // rose-500
          sky:     "#38bdf8",   // sky-400
        },
        text: {
          primary:   "#f1f5f9",  // slate-100
          secondary: "#94a3b8",  // slate-400
          muted:     "#475569",  // slate-600
        },
        success: "#22c55e",
        warning: "#f59e0b",
        danger:  "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "12px",
        pill: "999px",
      },
      boxShadow: {
        card:  "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
        glow:  "0 0 20px rgba(99,102,241,0.25)",
        "glow-sm": "0 0 10px rgba(99,102,241,0.18)",
      },
      animation: {
        "fade-in":    "fadeIn 0.2s ease-out",
        "slide-up":   "slideUp 0.25s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};

export default config;
