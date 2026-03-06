import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ===== Brand Colors ===== */
        brand: {
          purple: {
            300: "#C4B5FD",
            400: "#A78BFA",
            500: "#8B5CF6",
            600: "#7C3AED",
            700: "#6D28D9", // Default Primary
            800: "#5B21B6",
            900: "#4C1D95",
          },
          red: {
            400: "#F87171",
            500: "#EF4444",
            600: "#DC2626", // Default Destructive
            700: "#B91C1C",
            800: "#991B1B",
          }
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        background: {
          DEFAULT: "var(--background)",
          light: "#FFFFFF",
          dark: "#0B0B0F",
        },
        surface: {
          DEFAULT: "var(--card)",
          light: "#F9FAFB",
          dark: "#111827",
        },
        border: {
          DEFAULT: "var(--border)",
          light: "#E5E7EB",
          dark: "#1F2937",
        },
        text: {
          primary: {
            light: "#0F0F0F",
            dark: "#E5E7EB",
          },
          secondary: {
            light: "#6B7280",
            dark: "#9CA3AF",
          },
        },
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.08)",
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [],
};

export default config;
