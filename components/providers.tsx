"use client";

import { SessionProvider } from "next-auth/react";
import { ChromeDevToolsHandler } from "./chrome-devtools-handler";
import { SocketProvider } from "@/lib/socket/SocketProvider";
import { Toaster } from "@/components/ui/toaster";

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
        <Toaster />
      </SocketProvider>
    </SessionProvider>
  );
}
