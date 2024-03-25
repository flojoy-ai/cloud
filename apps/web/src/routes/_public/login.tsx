import { createFileRoute } from "@tanstack/react-router";

import { Icons } from "@/components/icons";
import TermsAndPrivacy from "@/components/terms-and-privacy";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { getAuthMethodsOpts } from "@/lib/queries/auth";

import { match } from "ts-pattern";

export const Route = createFileRoute("/_public/login")({
  beforeLoad: async ({ context: { queryClient } }) => {
    return {
      authMethods: await queryClient.ensureQueryData(getAuthMethodsOpts()),
    };
  },
  component: Login,
});

function Login() {
  const { authMethods } = Route.useRouteContext();

  return (
    <div>
      <div className="p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Log in to your account
            </h1>
          </div>

          {authMethods.map((method) =>
            match(method)
              .with("google", () => (
                <Button asChild variant="secondary">
                  <a
                    href={env.VITE_SERVER_URL + "/auth/google/login"}
                    className="flex gap-2"
                  >
                    <Icons.google className="h-4 w-4" />
                    Continue with Google
                  </a>
                </Button>
              ))
              .with("entra", () => (
                <Button asChild variant="secondary">
                  <a
                    href={env.VITE_SERVER_URL + "/auth/entra/login"}
                    className="flex gap-2"
                  >
                    <Icons.google className="h-4 w-4" />
                    Continue with Entra
                  </a>
                </Button>
              ))
              .exhaustive(),
          )}

          <TermsAndPrivacy />
        </div>
      </div>

      <div className="py-4"></div>
    </div>
  );
}

