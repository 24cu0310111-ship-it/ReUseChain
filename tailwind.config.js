/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-base)",
        foreground: "var(--text-primary)",
        card: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--text-primary)",
        },
        border: "var(--border-subtle)",
        muted: {
          DEFAULT: "var(--bg-subtle)",
          foreground: "var(--text-muted)",
        },
        accent: {
          cyan: "var(--accent-cyan)",
          emerald: "var(--accent-emerald)",
          amber: "var(--accent-amber)",
          rose: "var(--accent-rose)",
          purple: "var(--accent-purple)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
