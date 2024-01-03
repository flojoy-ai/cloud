import MeasurementTable from "~/components/measurement-table";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import { api } from "~/trpc/server";

export default async function Test({ params }: { params: { testId: string } }) {
  const test = await api.test.getTestById.query({
    testId: params.testId,
  });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{test.name}</PageHeaderHeading>
        <PageHeaderDescription>Your test.</PageHeaderDescription>
      </PageHeader>

      <div className="py-4"></div>

      <MeasurementTable measurements={test.measurements} />
    </div>
  );
}
