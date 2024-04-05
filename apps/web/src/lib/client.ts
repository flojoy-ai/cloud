import { QueryClient } from "@tanstack/react-query";
import type { App } from "@cloud/server";
import { treaty } from "@elysiajs/eden";
import SuperJSON from "superjson";
import { env } from "@/env";

export const queryClient = new QueryClient();

export const client = treaty<App>(env.VITE_SERVER_URL, {
  async onResponse(response) {
    const val = SuperJSON.parse(await response.text());
    console.log(val);
    if (response.ok) {
      return val;
    } else {
      throw val;
    }
  },
  headers: {
    Origin: env.VITE_SERVER_URL,
    "use-superjson": "true",
  },
  fetch: {
    credentials: "include",
  },
});
