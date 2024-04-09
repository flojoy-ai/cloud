import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleError = (error: unknown, defaultMessage?: string) => {
  //TODO: Make this work better for elysia errors
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    return error.message;
  }

  return defaultMessage ?? "Internal server error!";
};

// NOTE: This function is needed because
// when a query param can be undefined, it actually passes
// the string "undefined". We just filter out the keys instead here.
export const makeQueryParams = (params: Record<string, unknown | undefined>) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
