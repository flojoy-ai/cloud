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
import { env } from "~/env";

interface Props {
  userEmail: string;
}

export const AccountExists = ({ userEmail }: Props) => (
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
      <Preview>Account exists - Flojoy Cloud!</Preview>
      <Body className="font-main bg-white">
        <Container>
          <Heading>Welcome to Flojoy Cloud</Heading>
          <Text>
            Hey {userEmail}! we noticed that you recently tried to sign up on
            Flojoy Cloud. There is an account already associated with this
            email.
          </Text>
          <Text>To login, please click the button below:</Text>
          <Button
            href={`${env.NEXT_PUBLIC_URL_ORIGIN}/login`}
            target="_blank"
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
          >
            Login
          </Button>

          <Text>Did you forget your password?</Text>
          <Button
            href={`${env.NEXT_PUBLIC_URL_ORIGIN}/reset-password`}
            target="_blank"
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
          >
            Reset Password
          </Button>
          <Text>
            <div className="flex items-center gap-2">
              <Link href={env.NEXT_PUBLIC_URL_ORIGIN}>
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
