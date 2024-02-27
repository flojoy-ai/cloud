import { lucia } from "~/routes/auth/lucia";
import { Argon2id } from "oslo/password";
import { Elysia, t } from "elysia";
import { generateDatabaseId } from "../../lib/id";
import { generateEmailVerificationToken } from "~/lib/token";
import { sendAccountExistsEmail, sendEmailVerificationLink } from "~/lib/email";
import { frontendUrl } from "~/lib/utils";
import { addNewUser, findUserByEmail } from "~/db/services/user";

const defaultErrorMsg =
  "There was an error with your registration. Please try registering again.";

export const signupRoute = new Elysia({ prefix: "/signup" }).post(
  "/",
  async ({ body: { email, password }, set }) => {
    const userId = generateDatabaseId("user");
    const hashedPassword = await new Argon2id().hash(password);

    const userExists = await findUserByEmail(email);

    if (userExists) {
      await sendAccountExistsEmail(email);
      set.status = "Bad Request";
      return defaultErrorMsg;
    }

    await addNewUser({
      id: userId,
      email,
      hashedPassword,
      emailVerified: false,
    });

    const token = await generateEmailVerificationToken(userId, email);
    const verificationLink = frontendUrl("/api/email-verification/" + token);
    await sendEmailVerificationLink(email, verificationLink);

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    set.cookie = {
      [sessionCookie.name]: {
        value: sessionCookie.value,
        ...sessionCookie.attributes,
      },
    };
    set.redirect = frontendUrl("/verify");
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
