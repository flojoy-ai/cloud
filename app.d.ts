/// <reference types="lucia" />
declare namespace Lucia {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type Auth = import("~/auth/lucia").Auth;
  type DatabaseUserAttributes = {
    signup_completed: boolean;
  };
  type DatabaseSessionAttributes = {
    auth_provider: "auth0";
  };
}
