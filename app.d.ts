/// <reference types="lucia" />
declare namespace Lucia {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type Auth = import("~/auth/lucia").Auth;
  type DatabaseUserAttributes = {
    signupCompleted: boolean;
    email: string;
  };
  type DatabaseSessionAttributes = {
    authProvider: "google";
  };
}
