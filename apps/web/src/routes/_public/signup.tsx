import { createFileRoute } from "@tanstack/react-router";

import { Icons } from "@/components/icons";
import TermsAndPrivacy from "@/components/terms-and-privacy";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { getAuthMethodsQueryOpts } from "@/lib/queries/auth";

import { match } from "ts-pattern";
import CenterLoadingSpinner from "@/components/center-loading-spinner";

export const Route = createFileRoute("/_public/signup")({
  beforeLoad: async ({ context: { queryClient } }) => {
    return {
      authMethods: await queryClient.ensureQueryData(getAuthMethodsQueryOpts()),
    };
  },
  pendingComponent: CenterLoadingSpinner,
  component: SignUp,
});

function SignUp() {
  const { authMethods } = Route.useRouteContext();

  return (
    <div>
      <div className="p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Let's get started!
            </h1>
          </div>

          <div className="flex space-y-2 flex-col">
            {authMethods.map((method) =>
              match(method)
                .with("google", () => (
                  <Button asChild variant="secondary" key={method}>
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
                  <Button asChild variant="secondary" key={method}>
                    <a
                      href={env.VITE_SERVER_URL + "/auth/entra/login"}
                      className="flex gap-2"
                    >
                      <Icons.entra className="h-4 w-4" />
                      Continue with Entra ID
                    </a>
                  </Button>
                ))
                .exhaustive(),
            )}
          </div>

          <TermsAndPrivacy />
        </div>
      </div>

      <div className="py-4"></div>
    </div>
  );
}
