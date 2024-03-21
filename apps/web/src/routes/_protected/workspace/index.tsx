import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/workspace/")({
  component: () => <div>Hello /_protected/workspace/!</div>,
});
