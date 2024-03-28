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
