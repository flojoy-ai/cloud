import { auth } from "~/auth/lucia";
import * as context from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "~/components/site-header";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
