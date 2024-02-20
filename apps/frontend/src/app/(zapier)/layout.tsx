import { redirect } from "next/navigation";
import { validateRequest } from "~/auth/lucia";
import { SiteHeader } from "~/components/site-header";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();
  if (!user) {
    redirect("/signup");
  }
  return (
    <main>
      <SiteHeader />
      <div className="container flex min-h-screen max-w-screen-2xl items-center justify-center">
        <div className="rounded-md border ">{children}</div>
      </div>
    </main>
  );
}
