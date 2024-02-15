import { redirect } from "next/navigation";
import { validateRequest } from "~/auth/lucia";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";

const Page = async () => {
  const { user } = await validateRequest();
  if (!user) {
    redirect("/");
  }

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">Hi, {user.email}</PageHeaderHeading>
        <PageHeaderDescription>Welcome to Flojoy Cloud!</PageHeaderDescription>
      </PageHeader>
    </div>
  );
};

export default Page;
