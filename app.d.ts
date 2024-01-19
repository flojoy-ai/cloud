/// <reference types="lucia" />
declare namespace Lucia {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type Auth = import("~/auth/lucia").Auth;
  type DatabaseUserAttributes = {
    email_verified: boolean;
    email: string;
  };
  type DatabaseSessionAttributes = {
    auth_provider: "google" | "email";
  };
}
