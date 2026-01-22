"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ChromeDevToolsHandler } from "./chrome-devtools-handler";
import { SocketProvider } from "@/lib/socket/SocketProvider";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { setApiClientSession } from "@/lib/api/client";

// Component to sync session with API client
function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Sync session to API client whenever it changes
    if (status !== 'loading') {
      setApiClientSession(session);
    }
  }, [session, status]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      basePath="/api/auth"
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <SessionSync>
        <SocketProvider>
          <ChromeDevToolsHandler />
          {children}
          <Toaster />
        </SocketProvider>
      </SessionSync>
    </SessionProvider>
  );
}

