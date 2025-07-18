'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SecuritySettingsData {
  enableTwoFactorAuth: boolean;
  disablePublicSignups: boolean;
  lockPlatformInviteOnly: boolean;
  enableAuditLogs: boolean;
}

export function SecuritySettings() {
  const [settings, setSettings] = useState<SecuritySettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/platform-settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        setSettings(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = async (key: keyof SecuritySettingsData) => {
    if (!settings) return;

    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      const response = await fetch('/api/admin/platform-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newSettings[key] }),
      });
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      // Revert UI on failure
      setSettings(settings);
    }
  };

  if (loading) return <div>Loading settings...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label htmlFor="2fa-switch" className="font-semibold">Enable Two-Factor Authentication</Label>
          <p className="text-sm text-gray-500">Require all users to set up 2FA for enhanced security.</p>
        </div>
        <Switch
          id="2fa-switch"
          checked={settings.enableTwoFactorAuth}
          onCheckedChange={() => handleToggle('enableTwoFactorAuth')}
        />
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label htmlFor="signup-switch" className="font-semibold">Disable Public Guest Signups</Label>
          <p className="text-sm text-gray-500">Prevent new users from signing up without an invite.</p>
        </div>
        <Switch
          id="signup-switch"
          checked={settings.disablePublicSignups}
          onCheckedChange={() => handleToggle('disablePublicSignups')}
        />
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label htmlFor="invite-switch" className="font-semibold">Lock Platform for Invite-Only Access</Label>
          <p className="text-sm text-gray-500">Makes the entire platform accessible only to existing users.</p>
        </div>
        <Switch
          id="invite-switch"
          checked={settings.lockPlatformInviteOnly}
          onCheckedChange={() => handleToggle('lockPlatformInviteOnly')}
        />
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label htmlFor="audit-switch" className="font-semibold">Enable Audit Logs for Role Changes</Label>
          <p className="text-sm text-gray-500">Record all role modifications for security auditing.</p>
        </div>
        <Switch
          id="audit-switch"
          checked={settings.enableAuditLogs}
          onCheckedChange={() => handleToggle('enableAuditLogs')}
        />
      </div>
    </div>
  );
} 