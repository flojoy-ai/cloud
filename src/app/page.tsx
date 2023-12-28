import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";

export default async function Home() {
  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">Flojoy Cloud</PageHeaderHeading>
        <PageHeaderDescription></PageHeaderDescription>
      </PageHeader>
    </div>
  );
}
