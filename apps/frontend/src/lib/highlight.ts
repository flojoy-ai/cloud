import { AppRouterHighlight } from "@highlight-run/next/server";
import { env } from "~/env";

export const withAppRouterHighlight = AppRouterHighlight({
  projectID: env.HIGHLIGHT_PROJECT_ID,
});
