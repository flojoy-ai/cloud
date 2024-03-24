import { t } from "elysia";

export const date = t
  .Transform(t.Date())
  .Decode((value) => new Date(value))
  .Encode((value) => value);
