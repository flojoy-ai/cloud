import { createLazyFileRoute } from "@tanstack/react-router";
import { Icons } from "@/components/icons";
import TermsAndPrivacy from "@/components/terms-and-privacy";
import { Button } from "@/components/ui/button";
import { env } from "@/env";

export const Route = createLazyFileRoute("/_public/login")({
  component: Login,
});

function Login() {
  return (
    <div>
      <div className="p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Log in to your account
            </h1>
          </div>

          <Button asChild variant="secondary">
            <a
              href={env.VITE_SERVER_URL + "/auth/google/login"}
              className="flex gap-2"
            >
              <Icons.google className="h-4 w-4" />
              Continue with Google
            </a>
          </Button>

          <TermsAndPrivacy />
        </div>
      </div>

      <div className="py-4"></div>
    </div>
  );
}
