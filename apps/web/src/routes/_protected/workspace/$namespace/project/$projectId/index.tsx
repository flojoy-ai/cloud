import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  // CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/small-header";
import { Link, createFileRoute } from "@tanstack/react-router";
import NewStation from "@/components/station/new-station";
import { getStationsQueryOpts } from "@/lib/queries/station";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/station/columns";
import { getPartVariationQueryOpts } from "@/lib/queries/part-variation";
import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { Doughnut } from "react-chartjs-2";
import { Test } from "@cloud/shared";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/project/$projectId/",
)({
  pendingComponent: CenterLoadingSpinner,
  loader: ({ context, params: { projectId } }) => {
    context.queryClient.ensureQueryData(
      getStationsQueryOpts({ projectId, context }),
    );

    context.queryClient.ensureQueryData(
      getPartVariationQueryOpts({
        context,
        partVariationId: context.project.partVariationId,
      }),
    );
  },
  component: Page,
});

const testColumns: ColumnDef<Test>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Type",
    accessorKey: "measurementType",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Link
          from={"/workspace/$namespace/test/$testId"}
          to={"/workspace/$namespace/test/$testId"}
          params={{ testId: row.original.id }}
        >
          <ArrowRight />
        </Link>
      );
    },
  },
];

function Page() {
  const { workspace, project } = Route.useRouteContext();
  const { projectId } = Route.useParams();

  const { data: stations } = useSuspenseQuery(
    getStationsQueryOpts({ projectId, context: { workspace } }),
  );

  const { data: partVariation } = useSuspenseQuery(
    getPartVariationQueryOpts({
      context: { workspace },
      partVariationId: project.partVariationId,
    }),
  );

  return (
    <div className="container max-w-screen-2xl">
      <div className="py-2"></div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={Route.fullPath} to="../..">
                {workspace.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={Route.fullPath} to="..">
                Production Lines
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading className="">{project.name}</PageHeaderHeading>
        <PageHeaderDescription></PageHeaderDescription>
      </PageHeader>

      <div className="py-4"></div>
      {/* <Card className="h-48"> */}
      {/*   <div className="h-full relative w-fit"> */}
      {/*     <Doughnut */}
      {/*       data={{ */}
      {/*         datasets: [ */}
      {/*           { */}
      {/*             data: [10, 20, 30], */}
      {/*             backgroundColor: ["blue", "green", "red"], */}
      {/*           }, */}
      {/*         ], */}
      {/*         labels: ["Aborted", "Passed", "Failed"], */}
      {/*       }} */}
      {/*       options={{ */}
      {/*         cutout: "70%", */}
      {/*         plugins: { */}
      {/*           legend: { */}
      {/*             display: false, */}
      {/*           }, */}
      {/*         }, */}
      {/*       }} */}
      {/*     /> */}
      {/*     <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 text-center -translate-y-1/2 mt-1"> */}
      {/*       <span className="text-xl font-semibold">1234</span> */}
      {/*       <br /> */}
      {/*       <span className="text-muted-foreground">sessions</span> */}
      {/*     </div> */}
      {/*   </div> */}
      {/* </Card> */}

      <div className="space-x-2">
        <NewStation project={project} />
      </div>

      <div className="py-4"></div>

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <DataTable columns={columns} data={stations} />
        </div>
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{partVariation.partNumber}</CardTitle>
              <CardDescription>
                This is the part variation being tested in this production line
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
      <DataTable columns={testColumns} data={project.tests} />
    </div>
  );
}
