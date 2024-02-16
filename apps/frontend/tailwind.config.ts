import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.tsx", "../../packages/ui/**/*.tsx"],
  presets: [require("../../tailwind.config.base.ts")],
} satisfies Config;
