import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/_namespace",
)({
  component: () => (
    <div>Hello /_protected/workspace/$namespace/_namespace!</div>
  ),
});
