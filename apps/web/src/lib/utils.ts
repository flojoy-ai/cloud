import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleError = (error: unknown, defaultMessage?: string) => {
  //TODO: Make this work for elysia

  // if (error instanceof TRPCClientError) {
  //   if (error.data?.zodError) {
  //     const parsed = JSON.parse(error.message) as Record<string, string>[];
  //
  //     return parsed.map((p) => p.message).join("\n");
  //   }
  //   return error.message;
  // }
  // if (axios.isAxiosError(error)) {
  //   if (typeof error.response?.data === "string") {
  //     return error.response.data;
  //   }
  //   return (
  //     (error.response?.data.message || defaultMessage) ??
  //     "Internal server error!"
  //   );
  // }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage ?? "Internal server error!";
};
