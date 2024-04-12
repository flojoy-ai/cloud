import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/project/$projectId/settings/",
)({
  component: Page,
});

function Page() {
  return <div className="container max-w-screen-2xl">hahah</div>;
}

