import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import { api } from "~/trpc/server";
import { type ReactNode } from "react";
import { SidebarNav } from "~/components/sidebar-nav";

export default async function Workspace({
  params,
  children,
}: {
  params: { workspaceId: string };
  children: ReactNode;
}) {
  const workspace = await api.workspace.getWorkspaceById.query({
    workspaceId: params.workspaceId,
  });

  const sidebarNavItems = [
    {
      title: "General",
      href: `/workspace/${params.workspaceId}/general`,
    },
    {
      title: "Users",
      href: `/workspace/${params.workspaceId}/users`,
    },
  ];

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{workspace.name}</PageHeaderHeading>
        <PageHeaderDescription>
          Manage your workspace settings here.
        </PageHeaderDescription>
      </PageHeader>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
