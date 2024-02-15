import { render } from "@react-email/render";
import { SES } from "@aws-sdk/client-ses";
import { EmailVerification } from "~/emails/email-verification";
import { env } from "~/env";
import { PasswordResetHTML } from "~/emails/password-reset";
import { AccountExists } from "~/emails/account-exists";

export const sendEmailVerificationLink = async (
  email: string,
  link: string,
) => {
  const emailHtml = render(
    EmailVerification({
      verificationLink: link,
    }),
  );

  await sendEmailWithSES({
    recipients: [email],
    emailHtml,
    subject: "Flojoy Cloud - Email Verification",
  });
};

export const sendPasswordResetLink = async (email: string, link: string) => {
  const emailHtml = render(
    PasswordResetHTML({
      resetLink: link,
    }),
  );
  await sendEmailWithSES({
    recipients: [email],
    emailHtml,
    subject: "Flojoy Cloud - Password Reset",
  });
};

export const sendAccountExistsEmail = async (email: string) => {
  const emailHtml = render(
    AccountExists({
      userEmail: email,
    }),
  );
  await sendEmailWithSES({
    recipients: [email],
    emailHtml,
    subject: "Flojoy Cloud - Account Exists",
  });
};

type SendEmailWithSESProps = {
  recipients: string[];
  emailHtml: string;
  subject: string;
};

export const sendEmailWithSES = async ({
  recipients,
  emailHtml,
  subject,
}: SendEmailWithSESProps) => {
  const params = {
    Source: `"Flojoy Cloud" <${env.SENDER_EMAIL}>`,
    Destination: {
      ToAddresses: recipients,
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
        Data: subject,
      },
    },
  };
  const ses = new SES({
    region: env.AWS_REGION,
    credentials:
      env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
  await ses.sendEmail(params);
};
