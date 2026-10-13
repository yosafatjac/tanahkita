import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        papua: {
          earth: "#78350f",
          forest: "#14532d",
          ochre: "#b45309",
          clay: "#9a3412",
        },
      },
    },
  },
  plugins: [],
};

export default config;
