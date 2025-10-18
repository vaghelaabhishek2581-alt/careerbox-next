"use client";

import { SessionProvider } from "next-auth/react";
import { ChromeDevToolsHandler } from "./chrome-devtools-handler";
import { SocketProvider } from "@/lib/socket/SocketProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      basePath="/api/auth"
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <SocketProvider>
        <ChromeDevToolsHandler />
        {children}
      </SocketProvider>
    </SessionProvider>
  );
}
