import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
  component: Public,
});

function Public() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
