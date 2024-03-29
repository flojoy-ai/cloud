import Link from "next/link";
import { BouncyCardsFeatures } from "~/components/bouncy-cards-features";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import { Button } from "@cloud/ui/components/ui/button";

export default async function Home() {
  return (
    <>
      <div className="container max-w-screen-2xl">
        <PageHeader>
          <PageHeaderHeading className="">
            The easiest way to{" "}
            <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent dark:from-violet-500 dark:to-indigo-500">
              supercharge{" "}
            </span>
            your test & measurement data
          </PageHeaderHeading>
          <PageHeaderDescription>
            Powerful data visualizations. Easy to use. APIs for Python, LabVIEW,
            and MATLAB.
          </PageHeaderDescription>
        </PageHeader>

        <div className="flex flex-col items-center">
          <Link href="/signup">
            <Button>Try it free</Button>
          </Link>
        </div>

        <div className="py-4"></div>

        <BouncyCardsFeatures />

        <div className="py-4"></div>
      </div>
    </>
  );
}
