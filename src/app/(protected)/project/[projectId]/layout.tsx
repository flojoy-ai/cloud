import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import { api } from "~/trpc/server";
import { type ReactNode } from "react";
import { TabNav } from "~/components/tab-nav";

export default async function Project({
  params,
  children,
}: {
  params: { projectId: string };
  children: ReactNode;
}) {
  const project = await api.project.getProjectById.query({
    projectId: params.projectId,
  });

  const sidebarNavItems = [
    {
      title: "Tests",
      href: `/project/${params.projectId}/tests`,
    },
    {
      title: "Devices",
      href: `/project/${params.projectId}/devices`,
    },

    {
      title: "Explorer",
      href: `/project/${params.projectId}/explorer`,
    },

    {
      title: "Upload",
      href: `/project/${params.projectId}/upload`,
    },

    {
      title: "Setting",
      href: `/project/${params.projectId}/settings`,
    },
  ];

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{project.name}</PageHeaderHeading>
        <PageHeaderDescription>
          View all the tests, devices and settings for this project.
        </PageHeaderDescription>
      </PageHeader>

      <TabNav items={sidebarNavItems} />

      <div className="py-2"></div>

      <div>{children}</div>
    </div>
  );
}
