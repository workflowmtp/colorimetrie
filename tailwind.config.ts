import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Sidebar & header
        sidebar: {
          bg: "#0C1B2E",
          hover: "#142640",
          active: "#1A3050",
          text: "#94A3B8",
          "text-active": "#FFFFFF",
        },
        // Accents
        accent: {
          blue: "#3B82F6",
          "blue-dim": "rgba(59,130,246,0.15)",
          purple: "#8B5CF6",
          cyan: "#06B6D4",
          green: "#10B981",
          "green-dim": "rgba(16,185,129,0.15)",
          yellow: "#F59E0B",
          "yellow-dim": "rgba(245,158,11,0.15)",
          orange: "#F97316",
          red: "#EF4444",
          "red-dim": "rgba(239,68,68,0.15)",
        },
        // Densito CMJN
        cmjn: {
          cyan: "#0097A7",
          magenta: "#C2185B",
          jaune: "#F9A825",
          noir: "#37474F",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
        modal: "0 20px 60px rgba(0,0,0,0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
