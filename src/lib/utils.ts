import { TRPCClientError } from "@trpc/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function bind<T, U>(
  val: T | undefined,
  action: (val: T) => U | undefined,
) {
  if (!val) {
    return undefined;
  }

  return action(val);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleTrpcError = (error: any) => {
  if (error instanceof TRPCClientError) {
    if ((error.data as Record<string, string>)?.zodError) {
      const parsed = JSON.parse(error.message) as Record<string, string>[];

      return parsed.map((p) => p.message).join("\n");
    }
    return error.message;
  }
  return "Internal server error!";
};
