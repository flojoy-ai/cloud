import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";

export default async function Dashboard() {
  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">Your Workspaces</PageHeaderHeading>
        <PageHeaderDescription>
          Create a new workspace or pick an existing one to get started.
        </PageHeaderDescription>
      </PageHeader>
    </div>
  );
}
