import { env } from "~/env";

export const frontendUrl = (path: string) =>
  path.startsWith("/")
    ? `${env.NEXT_PUBLIC_URL_ORIGIN}${path}`
    : `${env.NEXT_PUBLIC_URL_ORIGIN}/${path}`;

export const withTryCatch = async (
  promise: Promise<void>,
  onError?: (error: any) => void
) => {
  try {
    return await promise;
  } catch (error) {
    if (onError) {
      return onError(error);
    }
    throw error;
  }
};
