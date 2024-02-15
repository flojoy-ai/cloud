import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { generateEmailVerificationToken } from "~/lib/token";
import { env } from "~/env";
import { sendEmailVerificationLink } from "~/lib/email";
import { TRPCError } from "@trpc/server";

export const emailRouter = createTRPCRouter({
  sendEmailVerification: protectedProcedure
    .output(
      z.object({
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx }) => {
      if (ctx.user.emailVerified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email already verified",
        });
      }
      const token = await generateEmailVerificationToken(
        ctx.user.id,
        ctx.user.email,
      );
      const verificationLink = `${env.NEXT_PUBLIC_URL_ORIGIN}/api/email-verification/${token}`;
      await sendEmailVerificationLink(ctx.user.email, verificationLink);
      return {
        message: "Email verification sent",
      };
    }),
});
