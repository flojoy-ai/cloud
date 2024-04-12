import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

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
// import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { projectSettingsTabSchema } from "@/types/setting";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/project/$projectId/settings",
)({
  validateSearch: (search) => {
    return projectSettingsTabSchema.parse(search);
  },
  component: Page,
});

function Page() {
  const context = Route.useRouteContext();
  const { workspace, project } = context;
  const { tab } = Route.useSearch();

  return (
    <div className="container max-w-screen-2xl">
      <div className="py-2"></div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={Route.fullPath} to="../../..">
                {workspace.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={Route.fullPath} to="../..">
                Production Lines
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={Route.fullPath} to="..">
                {project.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Production Line Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading>Production Line Settings</PageHeaderHeading>
        <PageHeaderDescription>
          Configure your production line.
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-4" />

      {/* <Separator /> */}

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav
            className={"flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1"}
          >
            <Link
              from={Route.fullPath}
              to={Route.fullPath}
              search={{ tab: "general" }}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                tab === "general"
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start",
              )}
            >
              {/* {item.icon && <div className="mr-2">{item.icon}</div>} */}
              General
            </Link>
            <Link
              from={Route.fullPath}
              to={Route.fullPath}
              search={{ tab: "users" }}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                tab === "users"
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start",
              )}
            >
              {/* {item.icon && <div className="mr-2">{item.icon}</div>} */}
              Users
            </Link>
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <Outlet />
        </div>
      </div>

      <div className="py-4" />
    </div>
  );
}

