import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

// Import the generated route tree
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/auth";
import { ThemeProvider } from "./components/theme-provider";
import { queryClient } from "./lib/client";
import { App } from "./app";
import { Toaster } from "./components/ui/sonner";
import {
  DefaultErrorFunction,
  SetErrorFunction,
  ValueErrorType,
} from "@sinclair/typebox/errors";
import { TString } from "@sinclair/typebox";

import "chart.js/auto";
import "chartjs-adapter-luxon";

// this should be declared only once
SetErrorFunction((error) => {
  const errorOverride = error?.schema.error;
  if (typeof errorOverride === "string") {
    return errorOverride;
  }

  if (error.value === undefined || error.value === null) return "Required";

  switch (error.errorType) {
    case ValueErrorType.StringMinLength: {
      const schema = error.schema as TString;
      if (schema.minLength === 1) {
        return "Required";
      }
    }
  }
  return DefaultErrorFunction(error);
});

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Toaster />
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}
