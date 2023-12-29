import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";

import { auth } from "~/auth/lucia";
import * as context from "next/headers";
import { redirect } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { db } from "~/server/db";
import TestsView from "./_components/tests-view";
import DevicesView from "./_components/devices-view";
import SettingsView from "./_components/settings-view";
import UploadView from "./_components/upload-view";

export default async function Project({
  params,
}: {
  params: { projectId: string };
}) {
  // TODO: need to check if this user has access
  // to the workspace this project belongs to

  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();

  if (!session) {
    redirect("/login");
  }

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="tests">
          <TestsView project={project} />
        </TabsContent>
        <TabsContent value="devices">
          <DevicesView project={project} />
        </TabsContent>
        <TabsContent value="upload">
          <UploadView project={project} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsView project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
