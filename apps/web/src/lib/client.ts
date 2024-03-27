import { QueryClient } from "@tanstack/react-query";
import { api } from "@cloud/shared";

export const queryClient = new QueryClient();

export const client = api;
