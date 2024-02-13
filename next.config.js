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
  experimental: {
    serverComponentsExternalPackages: ["oslo", "@highlight-run/node"],
    instrumentationHook: true,
  },
  productionBrowserSourceMaps: true,
};

// build will break if you switch the order between
// `withHighlightConfig` and `bundleAnalyzer`
// 45 mins of my life was wasted here, so just don't do it :(
export default withHighlightConfig(bundleAnalyzer(config));
