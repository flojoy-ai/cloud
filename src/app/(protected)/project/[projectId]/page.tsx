import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";

import { auth } from "~/auth/lucia";
import * as context from "next/headers";
import { redirect } from "next/navigation";

import { db } from "~/server/db";

export default async function Project({
  params,
}: {
  params: { projectId: string };
}) {
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
          Select a project in your workspaces to get started! <br />
          You can also create a new workspace or a new project here.
        </PageHeaderDescription>
      </PageHeader>
    </div>
  );
}
