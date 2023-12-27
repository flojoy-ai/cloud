/// <reference types="lucia" />
declare namespace Lucia {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type Auth = import("~/auth/lucia").Auth;
  // eslint-disable-next-line @typescript-eslint/ban-types
  type DatabaseUserAttributes = {};
  type DatabaseSessionAttributes = {
    auth_provider: "auth0";
  };
}
