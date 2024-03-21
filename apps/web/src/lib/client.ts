import { env } from "@/env";
import type { App } from "@cloud/server/src/index";
import { treaty } from "@elysiajs/eden";

export const client = treaty<App>(env.VITE_SERVER_URL);
