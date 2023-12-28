import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { Toaster } from "~/components/ui/sonner";

import { TRPCReactProvider } from "~/trpc/react";
import { SiteHeader } from "~/components/site-header";
import { ThemeProvider } from "~/components/theme-provider";
import { TailwindIndicator } from "~/components/tailwind-indicator";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Flojoy Cloud",
  description: "",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <SiteHeader />
            <main>{children}</main>
            <Toaster />
            <TailwindIndicator />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
