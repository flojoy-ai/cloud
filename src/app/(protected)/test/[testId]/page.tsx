import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";

import { db } from "~/server/db";

export default async function Test({ params }: { params: { testId: string } }) {
  const test = await db.query.test.findFirst({
    where: (test, { eq }) => eq(test.id, params.testId),
  });

  if (!test) {
    return (
      <div className="container max-w-screen-2xl">
        <PageHeader>
          <PageHeaderHeading className="">Test not found</PageHeaderHeading>
          <PageHeaderDescription>
            We cannot find the test you are looking for. <br />
            Could you double check if the test exists and you have access to it?
          </PageHeaderDescription>
        </PageHeader>

        <div className="py-4"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{test.name}</PageHeaderHeading>
        <PageHeaderDescription>Your test.</PageHeaderDescription>
      </PageHeader>

      <div className="py-4"></div>
    </div>
  );
}
