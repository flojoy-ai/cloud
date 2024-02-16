import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.tsx"],
  presets: [require("../../tailwind.config.base.ts")],
} satisfies Config;
