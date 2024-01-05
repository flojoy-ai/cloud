import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";

export default function DeviceInventory() {
  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">Device Inventory</PageHeaderHeading>
        <PageHeaderDescription>
          Here you can find all your register devices in this workspace.
        </PageHeaderDescription>
      </PageHeader>
    </div>
  );
}
