import { env } from "@/env";
import type { App } from "@cloud/server/src/index";
import { treaty } from "@elysiajs/eden";
import { QueryClient } from "@tanstack/react-query";
import SuperJSON from "superjson";

export const queryClient = new QueryClient();

export const client = treaty<App>(env.VITE_SERVER_URL, {
  async onResponse(response) {
    return SuperJSON.parse(await response.text());
  },
  headers: {
    Origin: env.VITE_SERVER_URL,
  },
  fetch: {
    credentials: "include",
  },
});
