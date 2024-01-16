import * as context from "next/headers";
import { auth } from "~/auth/lucia";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();

  if (session) {
    const scope = context.cookies().get("scope");
    if (scope) {
      const workspaces = await api.workspace.getWorkspaces.query();
      if (workspaces.some((ws) => ws.workspace.namespace === scope.value)) {
        redirect(`/workspace/${scope.value}`);
      }
      if (workspaces[0]) {
        redirect(`/workspace/${workspaces[0].workspace.namespace}`);
      }
    }

    redirect("/setup");
  }

  return <main>{children}</main>;
}