import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./storybooks/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#ffffff",
        ink: "#222222",
        mute: "#6a6a6a",
        line: "#949494",
        rausch: "#ff385c",
      },
      borderRadius: {
        field: "14px",
        card: "20px",
      },
      fontFamily: {
        sans: ["Public Sans", "Avenir Next", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
