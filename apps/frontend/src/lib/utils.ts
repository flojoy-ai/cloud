import { TRPCClientError } from "@trpc/client";
import axios from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

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

export const handleError = (error: any, defaultMessage?: string) => {
  if (error instanceof TRPCClientError) {
    if (error.data?.zodError) {
      const parsed = JSON.parse(error.message) as Record<string, string>[];

      return parsed.map((p) => p.message).join("\n");
    }
    return error.message;
  }
  if (axios.isAxiosError(error)) {
    if (typeof error.response?.data === "string") {
      return error.response.data;
    }
    return (
      (error.response?.data.message || defaultMessage) ??
      "Internal server error!"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage ?? "Internal server error!";
};

export const optionalBool = z.preprocess((arg) => {
  if (typeof arg === "string") {
    if (arg === "true" || arg === "1") {
      return true;
    }
    if (arg === "false" || arg === "0") {
      return false;
    }
  }
  return arg;
}, z.boolean().optional());
