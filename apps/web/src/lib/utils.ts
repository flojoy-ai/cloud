import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleError = (error: unknown, defaultMessage?: string) => {
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null) {
    if ("message" in error) {
      return error.message;
    }
    if ("response" in error) {
      if (typeof error.response === "string") {
        // A response like error(500, "message") was returned
        return error.response;
      } else if (
        // A response like error(500, Error Object) was returned
        typeof error.response === "object" &&
        error.response !== null &&
        "message" in error.response
      ) {
        return error.response.message;
      }
    }
  }

  return defaultMessage ?? "Internal server error!";
};

// NOTE: This function is needed because
// when a query param can be undefined, it actually passes
// the string "undefined". We just filter out the keys instead here.
export const makeQueryParams = (params: Record<string, unknown | undefined>) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
