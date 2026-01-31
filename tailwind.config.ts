import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0d12",
          900: "#14181f",
          800: "#1f2530",
          700: "#2d3644",
          600: "#475467"
        },
        sand: {
          50: "#f7f4ef",
          100: "#efe9df",
          200: "#e3d8c7",
          300: "#d2c1a8"
        },
        tide: {
          500: "#4b6a83",
          600: "#3b556a",
          700: "#2d4252"
        }
      }
    }
  },
  plugins: []
};

export default config;
