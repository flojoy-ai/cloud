import { type ReactNode } from "react";
import { SidebarNav } from "~/components/sidebar-nav";
import { Separator } from "~/components/ui/separator";

export default async function Upload({
  params,
  children,
}: {
  params: { projectId: string; namespace: string };
  children: ReactNode;
}) {
  const sidebarNavItems = [
    {
      title: "Python Client",
      href: `/workspace/${params.namespace}/project/${params.projectId}/upload/python`,
    },
    // {
    //   title: "MATLAB Client",
    //   href: `/project/${params.projectId}/upload/matlab`,
    // },
    {
      title: "REST API",
      href: `/workspace/${params.namespace}/project/${params.projectId}/upload/rest`,
    },
  ];

  return (
    <div className="">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Upload Methods</h2>
        <p className="text-muted-foreground">
          Here are all the ways you can upload measurements to Flojoy Cloud.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
