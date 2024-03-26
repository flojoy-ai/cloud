import RevisionHistory from "@/components/hardware/revision-history";
import SwapHardware from "@/components/hardware/swap-hardware";
import {
  PageHeader,
  PageHeaderHeading,
  PageHeaderDescription,
} from "@/components/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { HardwareTreeVisualization } from "@/components/visualization/tree-visualization";
import {
  getHardwareOpts,
  getHardwareRevisionsOpts,
} from "@/lib/queries/hardware";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/hardware/$familyId/$modelId/$hardwareId/",
)({
  component: HardwarePage,
  beforeLoad: async ({ context, params: { hardwareId } }) => {
    const hardware = await context.queryClient.ensureQueryData(
      getHardwareOpts({ hardwareId, context }),
    );
    return { hardware };
  },
  loader: async ({ context, params: { hardwareId } }) => {
    context.queryClient.ensureQueryData(
      getHardwareRevisionsOpts({ hardwareId, context }),
    );
  },
});

function HardwarePage() {
  const context = Route.useRouteContext();
  const { workspace, hardware, family, model } = context;
  const { data: revisions } = useSuspenseQuery(
    getHardwareRevisionsOpts({ hardwareId: hardware.id, context }),
  );

  return (
    <div className="container max-w-screen-2xl">
      <div className="py-2"></div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to="/workspace/$namespace"
                params={{ namespace: workspace.namespace }}
              >
                {workspace.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to="/workspace/$namespace/hardware"
                params={{ namespace: workspace.namespace }}
              >
                Hardware Inventory
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to="/workspace/$namespace/hardware/$familyId"
                params={{ namespace: workspace.namespace, familyId: family.id }}
              >
                {family.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to="/workspace/$namespace/hardware/$familyId/$modelId"
                params={{
                  namespace: workspace.namespace,
                  familyId: family.id,
                  modelId: model.id,
                }}
              >
                {model.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{hardware.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading className="">
          <div className="flex items-center gap-x-2">
            <div>{hardware.name}</div>
            {hardware.components.length > 0 && (
              <>
                <SwapHardware hardware={hardware} workspace={workspace} />
                <RevisionHistory revisions={revisions} />
              </>
            )}
          </div>
        </PageHeaderHeading>
        <PageHeaderDescription>
          All tests that have been performed on &quot;{hardware.name}&quot; are
          listed here.
        </PageHeaderDescription>
      </PageHeader>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="hover:no-underline">
            Component Graph
          </AccordionTrigger>
          <AccordionContent>
            <div className="w-full p-1">
              <div className="h-96 rounded-md border border-muted">
                <HardwareTreeVisualization tree={hardware} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="py-4" />

      {/* <HardwareMeasurements */}
      {/*   hardwareId={params.hardwareId} */}
      {/*   hardware={hardware} */}
      {/*   namespace={params.namespace} */}
      {/*   initialMeasurements={measurements} */}
      {/* /> */}
    </div>
  );
}
