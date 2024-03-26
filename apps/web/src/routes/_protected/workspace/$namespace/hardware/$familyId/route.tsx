import { getFamilyQueryOpts } from "@/lib/queries/family";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/hardware/$familyId",
)({
  component: Page,
  beforeLoad: async ({ context, params: { familyId } }) => {
    const family = await context.queryClient.ensureQueryData(
      getFamilyQueryOpts({ familyId, context }),
    );
    return { family };
  },
});

function Page() {
  return <Outlet />;
}
