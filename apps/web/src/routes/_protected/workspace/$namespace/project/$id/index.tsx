import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/project/$id/",
)({
  component: () => (
    <div>Hello /_protected/workspace/$namespace/project/$id/!</div>
  ),
});
