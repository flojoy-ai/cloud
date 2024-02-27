import { Argon2id } from "oslo/password";
import { lucia } from "~/routes/auth/lucia";
import { Elysia, t } from "elysia";
import { frontendUrl } from "~/lib/utils";
import { findUserByEmail } from "~/db/services/user";

const defaultErrorMsg = "Wrong password or user does not exist.";

export const loginRoute = new Elysia({ prefix: "/login" }).post(
  "/",
  async ({ body: { email, password }, set }) => {
    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      set.status = "Bad Request";
      return defaultErrorMsg;
    }

    if (!existingUser.hashedPassword) {
      set.status = "Bad Request";
      return "This user does not have a password set, please try logging in with another provider.";
    }

    const validPassword = await new Argon2id().verify(
      existingUser.hashedPassword,
      password
    );

    if (!validPassword) {
      set.status = "Bad Request";
      return defaultErrorMsg;
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    set.cookie = {
      [sessionCookie.name]: {
        value: sessionCookie.value,
        ...sessionCookie.attributes,
      },
    };
    set.redirect = frontendUrl("/workspace");
    set.status = "Temporary Redirect";
    return null;
  },
  {
    body: t.Object({
      email: t.String({
        format: "email",
        default: "example@email.com",
        error: "Invalid email address",
      }),
      password: t.String({
        minLength: 8,
        maxLength: 255,
        error: "Password must be between 8 and 255 characters",
      }),
    }),
  }
);
