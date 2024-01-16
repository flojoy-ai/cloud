import { auth } from "~/auth/lucia";
import * as context from "next/headers";
import { redirect } from "next/navigation";
import { ProtectedHeader } from "~/components/protected-header";

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
    <main>
      <ProtectedHeader />
      {children}
    </main>
  );
}
