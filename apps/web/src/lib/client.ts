import { QueryClient } from "@tanstack/react-query";
import type { App } from "@cloud/server";
import { treaty } from "@elysiajs/eden";
import SuperJSON from "superjson";
import { env } from "@/env";

export const queryClient = new QueryClient();

export const client = treaty<App>(env.VITE_SERVER_URL, {
  async onResponse(response) {
    const json = await response.json();
    const superjsonMeta = response.headers.get("superjson-meta");
    const val = superjsonMeta
      ? SuperJSON.deserialize({ json, meta: JSON.parse(superjsonMeta) })
      : json;
    if (!response.ok) {
      throw val;
    }
    return val;
  },
  headers: {
    Origin: env.VITE_SERVER_URL,
    "use-superjson": "true",
  },
  fetch: {
    credentials: "include",
  },
});
