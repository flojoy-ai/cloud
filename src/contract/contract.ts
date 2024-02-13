import { c } from "./root";
import { secretContract } from "./routers/secret";

export const contract = c.router({
  secret: secretContract,
});
