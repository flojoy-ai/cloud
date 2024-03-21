import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/setup")({
  component: () => <div>Hello /_protected/setup!</div>,
});
