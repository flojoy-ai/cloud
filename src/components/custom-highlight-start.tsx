// components/custom-highlight-start.tsx
"use client";

import { H } from "@highlight-run/next/client";
import { useEffect } from "react";

export function CustomHighlightStart() {
  useEffect(() => {
    const shouldStartHighlight =
      window.location.hostname === "https://cloud.flojoy.ai";

    if (shouldStartHighlight) {
      H.start();

      return () => {
        H.stop();
      };
    }
  });

  return null;
}
