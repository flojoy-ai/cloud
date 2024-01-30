import {
  Body,
  Container,
  Head,
  Heading,
  Button,
  Img,
  Link,
  Tailwind,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface Props {
  resetLink: string;
}

export const PasswordResetHTML = ({ resetLink }: Props) => (
  <Tailwind
    config={{
      theme: {
        extend: {
          fontFamily: {
            main: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
          },
        },
      },
    }}
  >
    <Head>
      <Preview>Welcome to Flojoy Cloud!</Preview>
      <Body className="font-main bg-white">
        <Container>
          <div className="flex items-center gap-2">
            <Link href="https://cloud.flojoy.ai">
              <Img
                src="https://cloud.flojoy.ai/logo.png"
                alt="Flojoy Logo"
                width="40"
                height="40"
              />
              <Text className="text-xl font-bold">Flojoy Cloud</Text>
            </Link>
          </div>
          <Heading>Reset your password</Heading>
          <Text>To reset your password, please click the button below.:</Text>
          <Button
            href={resetLink}
            target="_blank"
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
          >
            Click here to reset your password
          </Button>
          <Text>
            If you didn&apos;t request a password reset, you can safely ignore
            this email.
          </Text>
          <Text>
            <div className="flex items-center gap-2">
              <Link href="https://cloud.flojoy.ai">
                <Img
                  src="https://cloud.flojoy.ai/logo.png"
                  alt="Flojoy Logo"
                  width="40"
                  height="40"
                />
                <Text className="text-xl font-bold">Flojoy Cloud</Text>
              </Link>
            </div>
            the easiest way to supercharge your test & measurement data.
          </Text>
        </Container>
      </Body>
    </Head>
  </Tailwind>
);

export default PasswordResetHTML;
