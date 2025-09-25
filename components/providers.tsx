"use client";

import { SessionProvider } from "next-auth/react";
import { ChromeDevToolsHandler } from "./chrome-devtools-handler";
import { SocketProvider } from "@/lib/socket/SocketProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>
        <ChromeDevToolsHandler />
        {children}
      </SocketProvider>
    </SessionProvider>
  );
}
