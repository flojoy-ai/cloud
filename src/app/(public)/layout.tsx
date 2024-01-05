import { SiteHeader } from "~/components/site-header";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
