import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import { api } from "~/trpc/server";
import { type ReactNode } from "react";
import { SidebarNav } from "~/components/sidebar-nav";
import { Key, Settings, Users } from "lucide-react";

export default async function Workspace({
  params,
  children,
}: {
  params: { namespace: string };
  children: ReactNode;
}) {
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace.query({
    namespace: params.namespace,
  });

  const workspace = await api.workspace.getWorkspaceById.query({
    workspaceId,
  });

  const sidebarNavItems = [
    {
      title: "General",
      icon: <Settings />,
      href: `/workspace/${params.namespace}/settings/general`,
    },
    {
      title: "Users",
      icon: <Users />,
      href: `/workspace/${params.namespace}/settings/users`,
    },
    {
      title: "Secret",
      icon: <Key />,
      href: `/workspace/${params.namespace}/settings/secret`,
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
      <div className="py-4"></div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
