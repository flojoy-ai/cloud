import * as context from "next/headers";
import { validateRequest } from "~/auth/lucia";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { SiteHeader } from "~/components/site-header";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  if (user) {
    if (!user.emailVerified) {
      redirect("/verify");
    }

    // Redirect to the protected space if the user has access to it
    const scope = context.cookies().get("scope");

    if (scope) {
      const workspaces = await api.workspace.getWorkspaces();
      if (workspaces.some((ws) => ws.namespace === scope.value)) {
        redirect(`/workspace/${scope.value}`);
      }
      if (workspaces[0]) {
        redirect(`/workspace/${workspaces[0].namespace}`);
      }
    }

    redirect("/setup");
  }

  return (
    <main>
      <SiteHeader />
      {children}
    </main>
  );
}
