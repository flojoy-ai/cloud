import { QueryClient } from "@tanstack/react-query";
import type { App } from "@cloud/server";
import { treaty } from "@elysiajs/eden";
import SuperJSON from "superjson";
import { env } from "@/env";

export const queryClient = new QueryClient();

export const client = treaty<App>(env.VITE_SERVER_URL, {
  async onResponse(response) {
    // console.log(response);
    const json = await response.json();
    const superjsonMeta = response.headers.get("superjson-meta");
    console.log(response.status);
    if (!superjsonMeta) return json;

    const superjsonVal = SuperJSON.deserialize({
      json,
      meta: JSON.parse(superjsonMeta),
    });
    if (response.ok) {
      return superjsonVal;
    } else {
      throw superjsonVal.response;
    }
    // return superjsonVal;
    // const val = superjsonMeta ?
    // console.log(val);
    // if (response.ok) {
    //   return val;
    // } else {
    //   console.log(val.response.message);
    //   throw val.response.message;
    // }
  },
  headers: {
    Origin: env.VITE_SERVER_URL,
    "use-superjson": "true",
  },
  fetch: {
    credentials: "include",
  },
});
