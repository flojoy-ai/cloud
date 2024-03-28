import { t } from "elysia";

export const queryBool = t
  .Transform(t.String())
  .Decode((arg) => {
    if (arg === "true" || arg === "1") {
      return true;
    }
    if (arg === "false" || arg === "0") {
      return false;
    }
    return false;
  })
  .Encode((arg) => (arg ? "true" : "false"));
