import { validateRequest } from "~/auth/lucia";
import { redirect } from "next/navigation";
import { ProtectedHeader } from "~/components/protected-header";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  if (user.emailVerified) {
    redirect("/setup");
  }

  return (
    <main>
      <ProtectedHeader />
      {children}
    </main>
  );
}
