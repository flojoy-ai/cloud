import { render } from "@react-email/render";
import { SES } from "@aws-sdk/client-ses";
import EmailVerification from "~/emails/email-verification";
import { env } from "~/env";

export const sendEmailVerificationLink = async (
  email: string,
  link: string,
) => {
  const ses = new SES({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const emailHtml = render(
    EmailVerification({
      verificationLink: link,
    }),
  );

  const params = {
    Source: `"Flojoy Cloud" <${env.SENDER_EMAIL}>`,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: emailHtml,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Flojoy Cloud - Email Verification",
      },
    },
  };

  await ses.sendEmail(params);
};
