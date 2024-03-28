import type { App } from "@cloud/server";
import { treaty } from "@elysiajs/eden";
import SuperJSON from "superjson";

export function createClient(serverUrl: string) {
  return treaty<App>(serverUrl, {
    async onResponse(response) {
      if (response.ok) {
        return SuperJSON.parse(await response.text());
      }
      throw response;
    },
    headers: {
      Origin: serverUrl,
    },
    fetch: {
      credentials: "include",
    },
  });
}
