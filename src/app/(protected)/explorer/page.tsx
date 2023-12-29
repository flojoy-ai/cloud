import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import ExplorerView from "./_components/explorer-view";

export default async function Explorer() {
  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">Data Explorer</PageHeaderHeading>
        <PageHeaderDescription>
          Visualize and explore your test data.
        </PageHeaderDescription>
      </PageHeader>

      <ExplorerView />
    </div>
  );
}
