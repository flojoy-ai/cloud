import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import { api } from "~/trpc/server";
import { Separator } from "@cloud/ui/components/ui/separator";
import BackButton from "~/components/back-button";
import { TestMeasurements } from "../_components/test-measurements";

export default async function Test({
  params,
  searchParams,
}: {
  params: { testId: string; namespace: string };
  searchParams: { back?: string };
}) {
  const test = await api.test.getTest({
    testId: params.testId,
  });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        {searchParams.back && <BackButton />}

        <PageHeaderHeading className="">{test.name}</PageHeaderHeading>
        <PageHeaderDescription>
          All measurements for the &quot;{test.name}&quot; test are listed here.
        </PageHeaderDescription>
      </PageHeader>

      <Separator className="my-6" />

      <TestMeasurements {...params} />

      <div className="py-8" />
    </div>
  );
}
