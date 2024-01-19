import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  // Img,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface Props {
  verificationLink: string;
}

export const EmailVerification = ({ verificationLink }: Props) => (
  <Html>
    <Head />
    <Preview>Log in with this magic link</Preview>
    <Body>
      <Container>
        <Heading>Login</Heading>
        <Text>
          <Link href={verificationLink} target="_blank">
            Click here to log in with this magic link
          </Link>
        </Text>
        <Text>
          If you didn&apos;t try to login, you can safely ignore this email.
        </Text>
        {/* <Img */}
        {/*   src={`${baseUrl}/static/notion-logo.png`} */}
        {/*   width="32" */}
        {/*   height="32" */}
        {/*   alt="Notion's Logo" */}
        {/* /> */}
        <Text>
          <Link href="https://cloud.flojoy.ai" target="_blank">
            Flojoy Cloud
          </Link>
          <br />
          the easiest way to supercharge your test & measurement data.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default EmailVerification;
