import { columns } from "~/components/measurement/columns";
import { DataTable } from "~/components/measurement/data-table";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import { api } from "~/trpc/server";

export default async function Test({ params }: { params: { testId: string } }) {
  const test = await api().test.getTestById.query({
    testId: params.testId,
  });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{test.name}</PageHeaderHeading>
        <PageHeaderDescription>
          All measurements for the "{test.name}" test are listed here.
        </PageHeaderDescription>
      </PageHeader>

      <div className="py-4"></div>

      <DataTable columns={columns} data={test.measurements} />
    </div>
  );
}
