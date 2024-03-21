import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  component: Protected,
});

function Protected() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
