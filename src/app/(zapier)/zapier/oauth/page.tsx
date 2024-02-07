import React from "react";
import { api } from "~/trpc/server";
import { Icons } from "~/components/icons";
import { siteConfig } from "~/config/site";
import { Separator } from "~/components/ui/separator";
import WorkspaceForm from "./workspace-form";
import { redirect } from "next/navigation";

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
  const workspaces = await api.workspace.getWorkspaces.query();

  return (
    <>
      <div className="flex items-center gap-2 px-3">
        <Icons.logo className="h-6 w-6" />
        <h1 className="p-3">Connect with {siteConfig.name}</h1>
      </div>
      <Separator />
      <div className="flex flex-col items-center justify-center gap-5 p-8">
        <Icons.logo className="h-8 w-8" />
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
