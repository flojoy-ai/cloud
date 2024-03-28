import { QueryClient } from "@tanstack/react-query";
import { createClient } from "@cloud/shared";
import { env } from "@/env";

export const queryClient = new QueryClient();

export const client = createClient(env.VITE_SERVER_URL);
