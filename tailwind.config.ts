import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171513", coal: "#1F1C19", coal2: "#27231F", paper: "#F5F0E6", paper2: "#EDE6D8",
        gold: "#C19A5B", golddark: "#8A672A", snow: "#FCFBF8", sand: "#F4F0E8", charcoal: "#1F1C19", goldsoft: "#E6D3AD", muted: "#756D60", mutedink: "#6E665A",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      maxWidth: { page: "1180px" },
    },
  },
  plugins: [],
};
export default config;
