'use client';

import React from 'react';
import { useNotifications, NotificationPreferences } from '@/hooks/use-notifications';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const NOTIFICATION_TYPES = {
  profile_update: 'Profile Updates',
  new_message: 'New Messages',
  admin_alert: 'Admin Alerts',
  welcome: 'Welcome Messages',
};

export function NotificationPreferencesForm() {
  // const { getPreferences, updatePreferences } = useNotifications();
  const [preferences, setPreferences] = React.useState<NotificationPreferences>({
    email: true,
    push: true,
    inApp: true,
    types: {},
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  // React.useEffect(() => {
  //   const fetchPreferences = async () => {
  //     setIsLoading(true);
  //     const result = await getPreferences();
  //     if (result.success) {
  //       setPreferences(result.preferences);
  //     }
  //     setIsLoading(false);
  //   };

  //   fetchPreferences();
  // }, [getPreferences]);

  const handleGlobalToggle = async (channel: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [channel]: !preferences[channel],
    } as NotificationPreferences;
    setPreferences(newPreferences);

    // TODO: Implement updatePreferences
    // const result = await updatePreferences(newPreferences);
    const result = { success: true };
    if (!result.success) {
      // Revert on failure
      setPreferences(preferences);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive',
      });
    }
  };

  const handleTypeToggle = async (
    type: string,
    channel: keyof NotificationPreferences
  ) => {
    const newPreferences = {
      ...preferences,
      types: {
        ...(preferences.types || {}),
        [type]: {
          ...(preferences.types?.[type] || {}),
          [channel]: !(preferences.types?.[type]?.[channel as 'email' | 'push' | 'inApp']),
        },
      },
    } as NotificationPreferences;
    setPreferences(newPreferences);

    // TODO: Implement updatePreferences
    // const result = await updatePreferences(newPreferences);
    const result = { success: true };
    if (!result.success) {
      // Revert on failure
      setPreferences(preferences);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive',
      });
    }
  };

  const handleResetDefaults = async () => {
    const defaultPreferences: NotificationPreferences = {
      email: true,
      push: true,
      inApp: true,
      types: {},
    };

    // TODO: Implement updatePreferences
    // const result = await updatePreferences(defaultPreferences);
    const result = { success: true };
    if (result.success) {
      setPreferences(defaultPreferences);
      toast({
        title: 'Success',
        description: 'Notification preferences reset to defaults',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to reset notification preferences',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Global Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={preferences.email}
              onCheckedChange={() => handleGlobalToggle('email')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive push notifications on your device
              </p>
            </div>
            <Switch
              checked={preferences.push}
              onCheckedChange={() => handleGlobalToggle('push')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">In-App Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive notifications within the app
              </p>
            </div>
            <Switch
              checked={preferences.inApp}
              onCheckedChange={() => handleGlobalToggle('inApp')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(NOTIFICATION_TYPES).map(([type, label]) => (
            <div key={type} className="space-y-4">
              <h4 className="font-medium">{label}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email</span>
                  <Switch
                    checked={preferences.types?.[type]?.email ?? preferences.email}
                    onCheckedChange={() => handleTypeToggle(type, 'email')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push</span>
                  <Switch
                    checked={preferences.types?.[type]?.push ?? preferences.push}
                    onCheckedChange={() => handleTypeToggle(type, 'push')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In-App</span>
                  <Switch
                    checked={preferences.types?.[type]?.inApp ?? preferences.inApp}
                    onCheckedChange={() => handleTypeToggle(type, 'inApp')}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleResetDefaults}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
