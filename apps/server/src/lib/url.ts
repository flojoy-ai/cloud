import { env } from "../env";

export function getUrlFromUri(uri: string): string {
  return (env.NODE_ENV === "production" ? "https://" : "http://") + uri;
}
