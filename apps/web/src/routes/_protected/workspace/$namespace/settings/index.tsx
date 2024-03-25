import { Link, createFileRoute } from "@tanstack/react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/small-header";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/settings/",
)({
  component: Page,
});

function Page() {
  const context = Route.useRouteContext();
  const { workspace } = context;

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
            <BreadcrumbPage>Workspace Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading>Workspace Settings</PageHeaderHeading>
        <PageHeaderDescription>
          Here you can find all your registered devices and systems in this
          workspace. <br />
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-4" />

      <Separator />

      <div className="py-4" />
    </div>
  );
}
