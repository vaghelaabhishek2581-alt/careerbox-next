"use client";

import { SessionProvider } from "next-auth/react";
import { ChromeDevToolsHandler } from "./chrome-devtools-handler";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChromeDevToolsHandler />
      {children}
    </SessionProvider>
  );
}
