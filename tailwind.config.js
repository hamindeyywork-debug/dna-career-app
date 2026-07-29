/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FAF3E7",
        ink: "#241F1B",
        rose: { DEFAULT: "#C2485C", deep: "#9C3548", soft: "#EBC9CE" },
        sage: { DEFAULT: "#5C7A6E", soft: "#D9E3DE" },
        gold: { DEFAULT: "#C98A3E", soft: "#EEDCC0" },
        line: "#E5D9C6",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
