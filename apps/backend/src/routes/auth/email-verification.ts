import { lucia } from "~/routes/auth/lucia";
import { Elysia, t, error } from "elysia";
import { authMiddleware } from "~/middleware/auth-middleware";
import { env } from "~/env";
import { frontendUrl, withTryCatch } from "~/lib/utils";
import { emailVerificationDbTransaction } from "~/db/services/email-verification";
import { markUserEmailAsVerified } from "~/db/services/user";

const invalidCodeMsg = "Invalid or expired verification code!";

export const emailVerficationRoute = new Elysia({
  prefix: "/email-verification",
})
  .use(authMiddleware)
  .get(
    "/:code",
    async ({ params: { code }, user, set }) => {
      if (!user) {
        return (set.status = "Unauthorized");
      }

      await withTryCatch(
        emailVerificationDbTransaction(user.id, user.email, code),
        () => {
          throw error("Bad Request", invalidCodeMsg);
        }
      );

      await lucia.invalidateUserSessions(user.id);

      await markUserEmailAsVerified(user.id);

      const session = await lucia.createSession(user.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      set.cookie = {
        [sessionCookie.name]: {
          value: sessionCookie.value,
          ...sessionCookie.attributes,
        },
      };
      set.redirect = frontendUrl("/");
      set.status = "Permanent Redirect";
      return null;
    },
    {
      params: t.Object({
        code: t.String({
          minLength: 8,
          error: invalidCodeMsg,
        }),
      }),
    }
  );
