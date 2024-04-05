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
