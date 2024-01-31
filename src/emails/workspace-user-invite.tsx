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
  fromEmail: string;
  workspaceName: string;
  inviteLink: string;
}

export const WorkspaceUserInvite = ({
  inviteLink,
  fromEmail,
  workspaceName,
}: Props) => (
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
      <Preview>Invite to Flojoy Cloud!</Preview>
      <Body className="font-main bg-white">
        <Container>
          {/* <div className="flex items-center gap-2"> */}
          {/*   <Link href={env.NEXT_PUBLIC_URL_ORIGIN}> */}
          {/*     <Img */}
          {/*       src="https://cloud.flojoy.ai/logo.png" */}
          {/*       alt="Flojoy Logo" */}
          {/*       width="40" */}
          {/*       height="40" */}
          {/*     /> */}
          {/*     <Text className="text-xl font-bold">Flojoy Cloud</Text> */}
          {/*   </Link> */}
          {/* </div> */}
          <Heading>Invite to join workspace</Heading>
          <Text>
            Hey there! {fromEmail} just sent you an invite to join the "
            {workspaceName}" workspace
          </Text>
          <Button
            href={inviteLink}
            target="_blank"
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
          >
            Accept Invite
          </Button>
          <Text>
            If you do not recognize this address, you can safely ignore this
            email.
          </Text>
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
