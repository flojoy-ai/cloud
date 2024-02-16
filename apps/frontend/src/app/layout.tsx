import "~/styles/globals.css";

import { HighlightInit } from "@highlight-run/next/client";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { Toaster } from "~/components/ui/sonner";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/theme-provider";
import { TailwindIndicator } from "~/components/tailwind-indicator";
import { ErrorBoundary } from "~/components/error-boundary";
import { env } from "~/env";
import { CustomHighlightStart } from "~/components/custom-highlight-start";

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
  return (
    <>
      <HighlightInit
        excludedHostnames={["localhost"]}
        projectId={env.HIGHLIGHT_PROJECT_ID}
        serviceName="cloud-frontend"
        tracingOrigins
        networkRecording={{
          enabled: true,
          recordHeadersAndBody: true,
          urlBlocklist: [],
        }}
        // https://github.com/highlight/highlight/issues/5677
        inlineImages={false}
        manualStart
      />
      <CustomHighlightStart />
      <html lang="en">
        <body
          className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        >
          <ErrorBoundary>
            <TRPCReactProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <main>{children}</main>
                <Toaster />
                <TailwindIndicator />
              </ThemeProvider>
            </TRPCReactProvider>
          </ErrorBoundary>
        </body>
      </html>
    </>
  );
}
