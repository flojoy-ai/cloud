import { render } from "@react-email/render";
import { SES } from "@aws-sdk/client-ses";
import EmailVerification from "~/emails/email-verification";

export const sendEmailVerificationLink = async (
  email: string,
  link: string,
) => {
  const ses = new SES({ region: "us-east-2" });

  const emailHtml = render(
    EmailVerification({
      verificationLink: link,
    }),
  );

  const params = {
    Source: "joey@flojoy.io",
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
