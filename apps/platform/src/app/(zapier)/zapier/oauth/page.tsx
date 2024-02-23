import { api } from "~/trpc/server";
import { Icons } from "~/components/icons";
import { siteConfig } from "~/config/site";
import { Separator } from "@cloud/ui/components/ui/separator";
import WorkspaceForm from "./workspace-form";
import { redirect } from "next/navigation";
import Image from "next/image";

export type OAuthSearchParams = {
  client_id: string;
  redirect_uri: string;
  state: string;
};
const Page = async ({ searchParams }: { searchParams: OAuthSearchParams }) => {
  if (
    !searchParams.client_id ||
    !searchParams.redirect_uri ||
    !searchParams.state
  ) {
    redirect("/");
  }
  const workspaces = await api.workspace.getWorkspaces();

  return (
    <>
      <div className="flex items-center gap-2 px-3">
        <Icons.logo className="h-6 w-6" />
        <h1 className="py-3 pl-1">Connect with {siteConfig.name}</h1>
      </div>
      <Separator />
      <div className="flex flex-col items-center justify-center gap-5 p-8">
        <Image
          src={"/zapier-logo.png"}
          alt="zapier-logo"
          width={45}
          height={45}
        />
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl">Choose a workspace</h1>

          <h6 className="text-sm">to connect with Zapier</h6>
        </div>

        <WorkspaceForm workspaces={workspaces} searchParams={searchParams} />
      </div>
    </>
  );
};

export default Page;
