const { join } = require("path");

const config = {
  plugins: {
    tailwindcss: { config: join(__dirname, "tailwind.config.ts") },
    autoprefixer: {},
  },
};

module.exports = config;
