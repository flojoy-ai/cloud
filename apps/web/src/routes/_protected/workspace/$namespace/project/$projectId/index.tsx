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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getProjectQueryOpts } from "@/lib/queries/project";
import NewStation from "@/components/station/new-station";
import { getStationsQueryOpts } from "@/lib/queries/station";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/station/columns";
import { getModelQueryOpts } from "@/lib/queries/model";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/project/$projectId/",
)({
  beforeLoad: async ({ context, params: { projectId } }) => {
    const project = await context.queryClient.ensureQueryData(
      getProjectQueryOpts({ projectId, context }),
    );
    return { project };
  },
  loader: ({ context, params: { projectId } }) => {
    context.queryClient.ensureQueryData(
      getStationsQueryOpts({ projectId, context }),
    );

    context.queryClient.ensureQueryData(
      getModelQueryOpts({ context, modelId: context.project.modelId }),
    );
  },
  component: Page,
});

function Page() {
  const { workspace, project } = Route.useRouteContext();
  const { projectId } = Route.useParams();

  const { data: stations } = useSuspenseQuery(
    getStationsQueryOpts({ projectId, context: { workspace } }),
  );

  const { data: model } = useSuspenseQuery(
    getModelQueryOpts({ context: { workspace }, modelId: project.modelId }),
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
                to="/workspace/$namespace/project"
                params={{ namespace: workspace.namespace }}
              >
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
              <CardTitle>{model.name}</CardTitle>
              <CardDescription>
                This is the model being tested in this production line
              </CardDescription>
            </CardHeader>
            {/* <CardContent> */}
            {/*   <p>Card Content</p> */}
            {/* </CardContent> */}
            {/* <CardFooter> */}
            {/*   <p>Card Footer</p> */}
            {/* </CardFooter> */}
          </Card>
        </div>
      </div>
    </div>
  );
}
