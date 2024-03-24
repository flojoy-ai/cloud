import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/project/$projectId/station/$stationId/",
)({
  component: () => (
    <div>
      Hello
      /_protected/workspace/$namespace/project/$projectId/station/$stationId/!
    </div>
  ),
});
