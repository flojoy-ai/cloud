import { env } from "@/env";
import type { App } from "@cloud/server/src/index";
import { treaty } from "@elysiajs/eden";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const client = treaty<App>(env.VITE_SERVER_URL, {
  fetch: {
    credentials: "include",
  },
});
