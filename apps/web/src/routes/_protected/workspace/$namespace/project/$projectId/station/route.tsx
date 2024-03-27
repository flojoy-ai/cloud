import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/project/$projectId/station",
)({
  component: () => <Outlet />,
});

