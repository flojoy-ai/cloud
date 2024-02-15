// instrumentation.ts or src/instrumentation.ts
import { env } from "./env";

export async function register() {
  if (env.NODE_ENV === "production") {
    const { registerHighlight } = await import("@highlight-run/next/server");
    registerHighlight({
      projectID: env.HIGHLIGHT_PROJECT_ID,
      serviceName: "cloud-backend",
    });
  }
}
