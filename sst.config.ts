import { type SSTConfig } from "sst";
import { NextjsSite } from "sst/constructs";

export default {
  config(input) {
    return {
      name: "flojoy-cloud",
      region: "us-east-1",
      profile: input.stage === "production" ? "flojoy-prod" : "flojoy-dev",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new NextjsSite(stack, "site");

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
