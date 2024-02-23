import "@cloud/ui/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { Toaster } from "@cloud/ui/components/ui/sonner";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/theme-provider";
import { TailwindIndicator } from "~/components/tailwind-indicator";
import { validateRequest } from "~/auth/lucia";
import IdentifyUser from "~/components/identify-user";
import { RouteChangeProgressProvider } from "~/components/router-progress";

export const metadata = {
  title: "Flojoy Cloud",
  description:
    "The easiest way to supercharge your test & measurement data. Powerful data visualizations. Easy to use. APIs for Python, LabVIEW, and MATLAB.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <RouteChangeProgressProvider>
              <main>{children}</main>
              <Toaster />
              <TailwindIndicator />
              <IdentifyUser user={user} />
            </RouteChangeProgressProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
