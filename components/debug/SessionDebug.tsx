import React from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useSessionRefresh } from '@/hooks/use-session-refresh';

export const SessionDebug: React.FC = () => {
  const { data: session, status } = useSession();
  const { refreshSession } = useSessionRefresh();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-white shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Session Debug</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshSession}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Status:</strong> <Badge variant={status === 'authenticated' ? 'default' : 'secondary'}>{status}</Badge>
        </div>
        {session?.user && (
          <>
            <div>
              <strong>User ID:</strong> {session.user.id}
            </div>
            <div>
              <strong>Email:</strong> {session.user.email}
            </div>
            <div>
              <strong>Name:</strong> {session.user.name}
            </div>
            <div>
              <strong>Roles:</strong> {session.user.roles?.join(', ') || 'none'}
            </div>
            <div>
              <strong>Active Role:</strong> {session.user.activeRole || 'none'}
            </div>
            <div>
              <strong>Needs Onboarding:</strong> 
              <Badge variant={session.user.needsOnboarding ? 'destructive' : 'default'} className="ml-1">
                {session.user.needsOnboarding ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <strong>Needs Role Selection:</strong> 
              <Badge variant={session.user.needsRoleSelection ? 'destructive' : 'default'} className="ml-1">
                {session.user.needsRoleSelection ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <strong>Email Verified:</strong> 
              <Badge variant={(session.user as any).emailVerified ? 'default' : 'secondary'} className="ml-1">
                {(session.user as any).emailVerified ? 'Yes' : 'No'}
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
