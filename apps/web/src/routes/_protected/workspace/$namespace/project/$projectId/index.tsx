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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjectUser } from "@/hooks/use-project-user";

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

function Page() {
  const { workspace, project } = Route.useRouteContext();
  const { projectId } = Route.useParams();

  const { projectUser } = useProjectUser();

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
        <PageHeaderDescription>
          <div className="items-center flex gap-2">
            Role: <Badge>{projectUser.role}</Badge>
          </div>
        </PageHeaderDescription>
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
          <Button className="w-full" variant="secondary" asChild>
            <Link
              from={Route.fullPath}
              to={"/workspace/$namespace/project/$projectId/settings"}
              search={{ tab: "general" }}
            >
              Settings
            </Link>
          </Button>
          <div className="py-2"></div>
          <Card>
            <CardHeader>
              <CardTitle>{partVariation.partNumber}</CardTitle>
              <CardDescription>
                This is the partVariation being tested in this production line
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
