import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import { api } from "~/trpc/server";
import { type ReactNode } from "react";
import { TabNav } from "~/components/tab-nav";

export default async function Project({
  params,
  children,
}: {
  params: { projectId: string; namespace: string };
  children: ReactNode;
}) {
  const project = await api.project.getProjectById.query({
    projectId: params.projectId,
  });

  const sidebarNavItems = [
    {
      title: "Hardwares",
      href: `/workspace/${params.namespace}/project/${params.projectId}/hardwares`,
    },
    {
      title: "Tests",
      href: `/workspace/${params.namespace}/project/${params.projectId}/tests`,
    },
    {
      title: "Explorer",
      href: `/workspace/${params.namespace}/project/${params.projectId}/explorer`,
    },

    {
      title: "Upload",
      href: `/workspace/${params.namespace}/project/${params.projectId}/upload/python`,
    },
    {
      title: "Settings",
      href: `/workspace/${params.namespace}/project/${params.projectId}/settings/general`,
    },
  ];

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{project.name}</PageHeaderHeading>
        <PageHeaderDescription>
          View all the hardwares, tests, and their data for this project.
        </PageHeaderDescription>
      </PageHeader>

      <div className="py-2"></div>

      <TabNav items={sidebarNavItems} />

      <div className="py-2"></div>

      <div>{children}</div>

      <div className="py-8"></div>
    </div>
  );
}
