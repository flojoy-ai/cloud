import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/profile/")({
  component: () => <div>Hello /_protected/profile/!</div>,
});
