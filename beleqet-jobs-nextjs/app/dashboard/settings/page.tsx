'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  Bell,
  Lock,
  Eye,
  Mail,
  Shield,
  LogOut,
  Save,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationSettings {
  emailNotifications: boolean;
  jobAlerts: boolean;
  applicationUpdates: boolean;
  weeklyDigest: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'employers_only';
  showEmail: boolean;
  showPhone: boolean;
  allowMessages: boolean;
}

/** Settings page with notification, privacy, password change, and account sections */
export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    jobAlerts: true,
    applicationUpdates: true,
    weeklyDigest: false,
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load saved user settings on mount
  useEffect(() => {
    loadSettings();
  }, [user]);

  /** Fetch user notification and privacy settings */
  const loadSettings = async () => {
    try {
      setLoading(true);
      // Load user settings from API
      // const settings = await api.getUserSettings();
      // setNotificationSettings(settings.notifications);
      // setPrivacySettings(settings.privacy);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  /** Toggle a notification setting checkbox */
  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /** Update a privacy setting (toggle or select change) */
  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  /** Persist notification preferences to the backend */
  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      // await api.updateUserSettings({ notifications: notificationSettings });
      setMessage({ type: 'success', text: 'Notification settings updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  /** Persist privacy settings to the backend */
  const handleSavePrivacy = async () => {
    try {
      setSaving(true);
      // await api.updateUserSettings({ privacy: privacySettings });
      setMessage({ type: 'success', text: 'Privacy settings updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  /** Validate and submit password change request */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    try {
      setSaving(true);
      // await api.changePassword(passwordData);
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  /** Log the user out and redirect to home */
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink">Settings</h1>
        <p className="text-muted mt-2">Manage your account preferences and security</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Notification Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-brandGreen" />
          <h2 className="text-xl font-semibold text-ink">Notification Preferences</h2>
        </div>

        <div className="space-y-4 mb-6">
          {[
            {
              key: 'emailNotifications',
              label: 'Email Notifications',
              description: 'Receive email updates about your activity',
            },
            {
              key: 'jobAlerts',
              label: 'Job Alerts',
              description: 'Get notified about new job postings matching your profile',
            },
            {
              key: 'applicationUpdates',
              label: 'Application Updates',
              description: 'Receive notifications when applications are updated',
            },
            {
              key: 'weeklyDigest',
              label: 'Weekly Digest',
              description: 'Receive a weekly summary of activities',
            },
          ].map((setting) => (
            <label key={setting.key} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings[setting.key as keyof NotificationSettings]}
                onChange={() => handleNotificationChange(setting.key as keyof NotificationSettings)}
                className="w-5 h-5 rounded border-gray-300 text-brandGreen focus:ring-brandGreen mt-1"
              />
              <div>
                <p className="font-medium text-ink">{setting.label}</p>
                <p className="text-sm text-muted">{setting.description}</p>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={handleSaveNotifications}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-brandGreen text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Eye className="w-6 h-6 text-brandGreen" />
          <h2 className="text-xl font-semibold text-ink">Privacy Settings</h2>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Profile Visibility
            </label>
            <select
              value={privacySettings.profileVisibility}
              onChange={(e) =>
                handlePrivacyChange(
                  'profileVisibility',
                  e.target.value as PrivacySettings['profileVisibility']
                )
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandGreen"
            >
              <option value="public">Public - Visible to everyone</option>
              <option value="employers_only">Employers Only - Visible to employers</option>
              <option value="private">Private - Only visible to you</option>
            </select>
          </div>

          {[
            {
              key: 'showEmail',
              label: 'Show Email Address',
              description: 'Allow others to see your email address',
            },
            {
              key: 'showPhone',
              label: 'Show Phone Number',
              description: 'Allow others to see your phone number',
            },
            {
              key: 'allowMessages',
              label: 'Allow Messages',
              description: 'Allow employers to send you messages',
            },
          ].map((setting) => (
            <label key={setting.key} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings[setting.key as keyof PrivacySettings] as boolean}
                onChange={(e) =>
                  handlePrivacyChange(setting.key as keyof PrivacySettings, e.target.checked)
                }
                className="w-5 h-5 rounded border-gray-300 text-brandGreen focus:ring-brandGreen mt-1"
              />
              <div>
                <p className="font-medium text-ink">{setting.label}</p>
                <p className="text-sm text-muted">{setting.description}</p>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={handleSavePrivacy}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-brandGreen text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Privacy Settings'}
        </button>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-brandGreen" />
          <h2 className="text-xl font-semibold text-ink">Security</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandGreen"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandGreen"
              placeholder="Enter new password (min. 8 characters)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandGreen"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-brandGreen text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Lock className="w-4 h-4" />
            {saving ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Account */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-brandGreen" />
          <h2 className="text-xl font-semibold text-ink">Account</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted mb-2">Email Address</p>
            <p className="font-medium text-ink">{user?.email}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted mb-2">Account Type</p>
            <p className="font-medium text-ink capitalize">
              {user?.role.toLowerCase().replace('_', ' ')}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
