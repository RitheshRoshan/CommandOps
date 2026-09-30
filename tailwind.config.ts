import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ops: {
          bg: "#090d16",          // Deep dark background
          card: "#0f172a",        // Primary container card
          surface: "#1e293b",     // Elevated surface
          hover: "#334155",       // Subdued hover
          border: "#1e293b",      // Subtle border line
          borderBright: "#334155",// Bright border line
          text: "#f8fafc",        // High contrast text
          muted: "#94a3b8",       // Muted text
          dim: "#64748b",         // Dim text
          blurple: "#5865f2",     // Discord Blurple accent
          blurpleHover: "#4752c4",
          success: "#10b981",     // Muted Emerald
          warning: "#f59e0b",     // Muted Amber
          danger: "#ef4444",      // Muted Rose
          info: "#3b82f6",        // Muted Blue
          purple: "#8b5cf6",      // Muted Purple
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        console: "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
