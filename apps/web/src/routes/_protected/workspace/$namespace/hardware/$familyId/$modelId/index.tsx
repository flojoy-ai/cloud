import CreateHardware from "@/components/hardware/create-hardware";
import { Icons } from "@/components/icons";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/small-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import {
  HardwareTreeVisualization,
  ModelTreeVisualization,
} from "@/components/visualization/tree-visualization";
import { client } from "@/lib/client";
import { getModelHardwareQueryOpts } from "@/lib/queries/hardware";
import { Hardware } from "@cloud/server/src/types/hardware";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/hardware/$familyId/$modelId/",
)({
  component: ModelPage,
  loader: ({ context, params: { modelId } }) => {
    context.queryClient.ensureQueryData(
      getModelHardwareQueryOpts({ modelId, context }),
    );
  },
});

const hardwareColumns: ColumnDef<Hardware>[] = [
  {
    accessorKey: "name",
    header: "Instance SN",
    cell: ({ row }) => {
      return (
        <Link
          from={Route.fullPath}
          to="./$hardwareId"
          params={{ hardwareId: row.original.id }}
        >
          <Badge variant="secondary">{row.original.name}</Badge>
        </Link>
      );
    },
  },
  // {
  //   accessorKey: "project",
  //   header: "Project",
  //   cell: ({ row }) => {
  //     const projects = row.original.projects;
  //
  //     return (
  //       <div>
  //         {projects.map((p) => (
  //           <Badge key={p.id} variant="outline">
  //             {p.name}
  //           </Badge>
  //         ))}
  //       </div>
  //     );
  //   },
  // },
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: HardwareActions,
  // },
];

function ModelPage() {
  const { workspace, family, model } = Route.useRouteContext();
  const { modelId } = Route.useParams();

  const { data: hardware } = useSuspenseQuery(
    getModelHardwareQueryOpts({ modelId, context: { workspace } }),
  );

  const [selectedHardwareId, setSelectedHardwareId] = useState<
    string | undefined
  >(hardware[0]?.id);

  const { data: hardwareTree, isPending } = useQuery({
    queryFn: async () => {
      if (!selectedHardwareId) return undefined;
      const { data, error } = await client
        .hardware({ hardwareId: selectedHardwareId })
        .index.get({
          headers: { "flojoy-workspace-id": workspace.id },
        });
      if (error) throw error;
      return data;
    },
    queryKey: ["hardware", selectedHardwareId],
    enabled: selectedHardwareId !== undefined,
  });

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
            <BreadcrumbPage>{model.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading>{model.name}</PageHeaderHeading>
        <div className="text-muted-foreground font-bold">
          Product: {family.productName}
        </div>
        <PageHeaderDescription>
          Here you can find all of the parts registered under this family.
          <br />
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
                <ModelTreeVisualization tree={model} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="py-4" />
      <CreateHardware workspace={workspace} modelId={model.id}>
        <div className="flex items-center gap-1">
          <Plus size={20} />
          <div>Create</div>
        </div>
      </CreateHardware>
      <div className="py-2" />
      <h1 className="text-xl font-bold">Part Variations</h1>
      <div className="py-2" />
      <div className="flex gap-x-8">
        <div className="w-1/2">
          <DataTable
            columns={hardwareColumns}
            data={hardware}
            onRowClick={(row) => setSelectedHardwareId(row.id)}
            highlightRow={(row) => row.id === selectedHardwareId}
            scrollable
            scrollHeight={328}
          />
        </div>
        <div className="w-1/2 h-[379px] border rounded-lg">
          {isPending ? (
            <Icons.spinner className="mx-auto animate-spin" />
          ) : (
            hardwareTree && <HardwareTreeVisualization tree={hardwareTree} />
          )}
        </div>
      </div>
      <div className="py-4" />
    </div>
  );
}
