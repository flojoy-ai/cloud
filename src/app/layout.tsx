import "~/styles/globals.css";

import { auth } from "~/auth/lucia";
import * as context from "next/headers";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { Toaster } from "~/components/ui/sonner";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/theme-provider";
import { TailwindIndicator } from "~/components/tailwind-indicator";
import { ProtectedHeader } from "~/components/protected-header";
import { SiteHeader } from "~/components/site-header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Flojoy Cloud",
  description: "",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider cookies={cookies().toString()}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {session ? <ProtectedHeader /> : <SiteHeader />}
            <main>{children}</main>
            <Toaster />
            <TailwindIndicator />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
