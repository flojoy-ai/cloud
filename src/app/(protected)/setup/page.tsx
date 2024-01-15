import CreateWorkspaceForm from "./create-workspace-form";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";

const SetupPage = async () => {
  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">Welcome to Flojoy</PageHeaderHeading>
        <PageHeaderDescription>
          Let&apos;s get you set up with a new workspace.
        </PageHeaderDescription>
      </PageHeader>
      <div className="mx-auto max-w-lg">
        <CreateWorkspaceForm />
      </div>
    </div>
  );
};

export default SetupPage;
