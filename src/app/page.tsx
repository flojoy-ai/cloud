import Link from "next/link";
import { BouncyCardsFeatures } from "~/components/bouncy-cards-features";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import { Button } from "~/components/ui/button";

export default async function Home() {
  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">
          The easiest way to manage your test data
        </PageHeaderHeading>
        <PageHeaderDescription>
          Powerful visualizations, easy to use, and free forever.
        </PageHeaderDescription>
      </PageHeader>

      <div className="flex flex-col items-center">
        <Button asChild>
          <Link href="/signup">Try it free</Link>
        </Button>
      </div>

      <div className="py-4"></div>

      <BouncyCardsFeatures />
    </div>
  );
}
