import { MainNav } from "@/components/navbar/main-nav";
import { ModeToggle } from "@/components/navbar/mode-toggle";
import { useAuth } from "@/hooks/use-auth";
import AuthButtons from "./auth-buttons";
import ExternalLinks from "./external-links";
import UserButton from "./user-button";

export function SiteHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MainNav />
        <nav className="flex flex-1 items-center justify-end gap-1">
          {!user ? <AuthButtons /> : <UserButton user={user} />}

          <ExternalLinks />
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
