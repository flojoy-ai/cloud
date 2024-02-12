/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

import withBundleAnalyzer from "@next/bundle-analyzer";
import { withHighlightConfig } from "@highlight-run/next/config";

await import("./src/env.js");

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import("next").NextConfig} */
const config = {
  logging: { fetches: { fullUrl: true } },
  webpack: (config) => {
    config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["@highlight-run/node"],
    instrumentationHook: true,
  },
};

export default bundleAnalyzer(withHighlightConfig(config));
