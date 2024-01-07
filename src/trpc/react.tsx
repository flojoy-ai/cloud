"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useEffect, useState } from "react";

import { type AppRouter } from "~/server/api/root";
import { getUrl, transformer } from "./shared";
import { usePathname } from "next/navigation";

export const api = createTRPCReact<AppRouter>();

let currentWorkspaceId: string | undefined;
export function setCurrentWorkspaceId(workspaceId: string | undefined) {
  /**
   * You can also save the token to cookies, and initialize from
   * cookies above.
   */
  currentWorkspaceId = workspaceId;
}

export function TRPCReactProvider(props: {
  children: React.ReactNode;
  cookies: string;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();

  useEffect(() => {
    setCurrentWorkspaceId(pathname.split("/")[2]);
  }, [pathname]);

  const [trpcClient] = useState(() =>
    api.createClient({
      transformer,
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          url: getUrl(),
          headers() {
            return {
              cookie: props.cookies,
              "x-trpc-source": "react",
              "flojoy-cloud-workspace-id": currentWorkspaceId,
            };
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}
