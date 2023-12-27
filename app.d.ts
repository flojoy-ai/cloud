/// <reference types="lucia" />
declare namespace Lucia {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type Auth = import("~/auth/lucia").Auth;
  type DatabaseUserAttributes = {
    id: string;
  };
  // eslint-disable-next-line @typescript-eslint/ban-types
  type DatabaseSessionAttributes = {};
}
