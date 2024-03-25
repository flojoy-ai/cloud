import CreateHardware from "@/components/hardware/create-hardware";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/small-header";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { ModelTreeVisualization } from "@/components/visualization/tree-visualization";
import { client } from "@/lib/client";
import { getModelHardwareOpts } from "@/lib/queries/hardware";
import { getModelOpts } from "@/lib/queries/model";
import { Hardware } from "@cloud/server/src/types/hardware";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/hardware/$familyId/$modelId/",
)({
  component: ModelPage,
  loader: ({ context, params: { modelId } }) => {
    context.queryClient.ensureQueryData(getModelOpts({ modelId, context }));
    context.queryClient.ensureQueryData(
      getModelHardwareOpts({ modelId, context }),
    );
  },
});

const hardwareColumns: ColumnDef<Hardware>[] = [
  {
    accessorKey: "name",
    header: "Instance SN",
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.name}</Badge>;
    },
  },
  // {
  //   accessorKey: "model",
  //   header: "Model",
  //   cell: ({ row }) => {
  //     return <Badge>{row.original.model.name}</Badge>;
  //   },
  // },
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
  // TODO: Finish display of components
  // {
  //   accessorKey: "parts",
  //   header: "Components",
  //   cell: ({ row }) => {
  //     const byModel = _.groupBy(row.original.parts, (p) => p.model.name);
  //
  //     return (
  //       <div className="flex flex-col gap-2">
  //         {Object.entries(byModel).map(([modelName, devices], idx) => (
  //           <div className="flex items-start gap-1" key={idx}>
  //             <Badge className="">{modelName}</Badge>
  //             <div className="flex flex-col gap-1">
  //               {devices.map((d) => (
  //                 <Badge variant="secondary" key={d.id}>
  //                   {d.name}
  //                 </Badge>
  //               ))}
  //             </div>
  //           </div>
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
  const { workspace, family } = Route.useRouteContext();
  const { modelId } = Route.useParams();

  const { data: hardware } = useSuspenseQuery(
    getModelHardwareOpts({ modelId, context: { workspace } }),
  );

  const { data: model } = useSuspenseQuery(
    getModelOpts({ modelId, context: { workspace } }),
  );

  const [selectedHardwareId, setSelectedHardwareId] = useState<
    string | undefined
  >(hardware[0]?.id);

  const { data: hardwareTree, isPending } = useQuery({
    queryFn: async () => {
      if (!selectedHardwareId) return undefined;
      const { data, error } = await client
        .hardware({ hardwareId: selectedHardwareId })
        .get({
          headers: { "flojoy-workspace-id": workspace.id },
        });
      if (error) throw error;
      return data;
    },
    queryKey: ["hardwareTree", selectedHardwareId],
    enabled: selectedHardwareId !== undefined,
  });

  return (
    <div className="container max-w-screen-2xl">
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
      <div className="py-4" />
      <Separator />
      <div className="py-2" />
      <CreateHardware workspace={workspace} modelId={model.id}>
        <div className="flex items-center gap-1">
          <Plus size={20} />
          <div>Create</div>
        </div>
      </CreateHardware>
      <div className="py-2" />
      <h1 className="text-xl font-bold">Part Variations</h1>
      <div className="py-2" />
      <div className="flex items-center">
        <DataTable
          columns={hardwareColumns}
          data={hardware}
          onRowClick={(row) => setSelectedHardwareId(row.id)}
          highlightRow={(row) => row.id === selectedHardwareId}
        />
        <div className="h-96 w-64">
          <ModelTreeVisualization tree={model} />
        </div>
        {/* <div className="py-4" /> */}
        {/* {selectedModelId && isPending ? ( */}
        {/*   <Icons.spinner className="mx-auto animate-spin" /> */}
        {/* ) : ( */}
        {/*   hardwareTree && ( */}
        {/*     <> */}
        {/*       <h1 className="text-xl font-bold">Sub-assemblies</h1> */}
        {/*       <div className="py-2" /> */}
        {/*       <DataTable */}
        {/*         columns={} */}
        {/*         data={hardwareTree.components.map((child) => ({ */}
        {/*           count: child.count, */}
        {/*           ...child.model, */}
        {/*         }))} */}
        {/*         onRowClick={(row) => setSelectedModelId(row.id)} */}
        {/*       /> */}
        {/*     </> */}
        {/*   ) */}
        {/* )} */}
      </div>
      <div className="py-4" />
      <Separator />
      <div className="py-4" />
    </div>
  );
}
