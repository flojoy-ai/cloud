import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { db } from "~/server/db";
import TestsView from "./_components/tests-view";
import DevicesView from "./_components/devices-view";
import SettingsView from "./_components/settings-view";
import UploadView from "./_components/upload-view";
import ExplorerView from "./_components/explorer-view";

export default async function Project({
  params,
}: {
  params: { projectId: string };
}) {
  const project = await db.query.project.findFirst({
    where: (project, { eq }) => eq(project.id, params.projectId),
  });

  if (!project) {
    return (
      <div className="container max-w-screen-2xl">
        <PageHeader>
          <PageHeaderHeading className="">Project not found</PageHeaderHeading>
          <PageHeaderDescription>
            We cannot find the project you are looking for. <br />
            Could you double check if the project exists and you have access to
            it?
          </PageHeaderDescription>
        </PageHeader>

        <div className="py-4"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{project.name}</PageHeaderHeading>
        <PageHeaderDescription>
          View all the tests, devices and settings for this project.
        </PageHeaderDescription>
      </PageHeader>
      <Tabs defaultValue="tests">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="explorer">Explorer</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="tests">
          <TestsView project={project} />
        </TabsContent>
        <TabsContent value="devices">
          <DevicesView project={project} />
        </TabsContent>
        <TabsContent value="explorer">
          <ExplorerView project={project} />
        </TabsContent>
        <TabsContent value="upload">
          <UploadView project={project} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsView project={project} />
        </TabsContent>
      </Tabs>

      <div className="py-4"></div>
    </div>
  );
}
