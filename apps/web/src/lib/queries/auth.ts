import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";

export function getAuthMethodsOpts() {
  return queryOptions({
    queryFn: async () => {
      const { data: authMethods, error } = await client.auth.index.get();

      if (error) throw error;
      return authMethods;
    },
    queryKey: ["authMethods"],
  });
}
