import { MeasurementsDataTable } from "~/components/measurements-data-table";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import { api } from "~/trpc/server";

export default async function Test({
  params,
}: {
  params: { testId: string; namespace: string };
}) {
  const test = await api.test.getTestById.query({
    testId: params.testId,
  });
  const testMeasurements =
    await api.measurement.getAllMeasurementsByTestId.query({
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

      <MeasurementsDataTable
        measurements={testMeasurements}
        namespace={params.namespace}
      />

      <div className="py-8" />
    </div>
  );
}
