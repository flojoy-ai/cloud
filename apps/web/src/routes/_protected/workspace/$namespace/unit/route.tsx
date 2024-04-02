import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/workspace/$namespace/unit")({
  component: () => <Outlet />,
  pendingComponent: CenterLoadingSpinner,
});

