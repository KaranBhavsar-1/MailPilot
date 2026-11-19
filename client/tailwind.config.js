/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#7C3AED",
          light: "#EDE9FE",
          dark: "#5B21B6",
        },
        app: {
          background: "#F8FAFC",
          surface: "#FFFFFF",
          border: "#E2E8F0",
          text: "#0F172A",
          muted: "#64748B",
        },
        classification: {
          assistant: "#DBEAFE",
          client: "#FCE7F3",
          noReply: "#DCFCE7",
          review: "#FEF3C7",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};