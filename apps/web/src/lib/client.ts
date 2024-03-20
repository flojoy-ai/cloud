import type { App } from "@cloud/server/src/index";
import { treaty } from "@elysiajs/eden";

export const client = treaty<App>("http://localhost:3001");
