import { Elysia } from "elysia";
import { signupRoute } from "./signup";
import { emailVerficationRoute } from "./email-verification";
import { loginRoute } from "./login";
import { logoutRoute } from "./logout";
import { googleLoginRoute } from "./google-login";

export const authRouter = new Elysia({ prefix: "/auth" })
  .use(signupRoute)
  .use(loginRoute)
  .use(logoutRoute)
  .use(googleLoginRoute)
  .use(emailVerficationRoute);
