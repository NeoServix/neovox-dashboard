import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neoBlue: "#00006D",
        neoNeon: "#F7FF00",
        neoBackground: "#F8FAFC",
      },
    },
  },
  plugins: [],
};
export default config;