"use client";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export const RouteChangeProgressProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
      <ProgressBar
        height="6px"
        color="#6548f6"
        options={{ showSpinner: false }}
        shallowRouting
      />
      {children}
    </>
  );
};
