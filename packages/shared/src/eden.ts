import { env } from "./env";
import type { App } from "@cloud/server";
import { treaty } from "@elysiajs/eden";
import SuperJSON from "superjson";

export const api = treaty<App>(env.VITE_SERVER_URL, {
  async onResponse(response) {
    if (response.ok) {
      return SuperJSON.parse(await response.text());
    }
    throw response;
  },
  headers: {
    Origin: env.VITE_SERVER_URL,
  },
  fetch: {
    credentials: "include",
  },
});
