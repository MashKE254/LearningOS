'use client';

import { useState, useEffect } from 'react';

interface Settings {
  emailNotifications: {
    weeklyReports: boolean;
    struggleAlerts: boolean;
    milestoneAlerts: boolean;
    inactivityAlerts: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    struggleAlerts: boolean;
    milestoneAlerts: boolean;
  };
  alertThresholds: {
    inactivityDays: number;
    struggleAttempts: number;
    masteryThreshold: number;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: {
      weeklyReports: true,
      struggleAlerts: true,
      milestoneAlerts: true,
      inactivityAlerts: false,
    },
    pushNotifications: {
      enabled: true,
      struggleAlerts: true,
      milestoneAlerts: true,
    },
    alertThresholds: {
      inactivityDays: 2,
      struggleAttempts: 5,
      masteryThreshold: 80,
    },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (category: keyof Settings, key: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !(prev[category] as Record<string, boolean | number>)[key],
      },
    }));
  };

  const handleThresholdChange = (key: keyof Settings['alertThresholds'], value: number) => {
    setSettings(prev => ({
      ...prev,
      alertThresholds: {
        ...prev.alertThresholds,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your notification preferences and alert settings</p>
      </div>

      {/* Email Notifications */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Email Notifications</h2>
            <p className="text-sm text-slate-400">Choose which emails you receive</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'weeklyReports', label: 'Weekly Progress Reports', description: 'Receive detailed weekly summaries every Sunday' },
            { key: 'struggleAlerts', label: 'Struggle Alerts', description: 'Get notified when your child is having difficulty' },
            { key: 'milestoneAlerts', label: 'Milestone Alerts', description: 'Celebrate achievements and progress' },
            { key: 'inactivityAlerts', label: 'Inactivity Alerts', description: 'Know when your child hasn\'t studied recently' },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
              <div>
                <p className="text-white font-medium">{label}</p>
                <p className="text-sm text-slate-400">{description}</p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications', key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.emailNotifications[key as keyof typeof settings.emailNotifications]
                    ? 'bg-purple-600'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.emailNotifications[key as keyof typeof settings.emailNotifications]
                      ? 'translate-x-7'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Push Notifications</h2>
            <p className="text-sm text-slate-400">Real-time alerts on your device</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-800">
            <div>
              <p className="text-white font-medium">Enable Push Notifications</p>
              <p className="text-sm text-slate-400">Allow notifications on this device</p>
            </div>
            <button
              onClick={() => handleToggle('pushNotifications', 'enabled')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.pushNotifications.enabled ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.pushNotifications.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.pushNotifications.enabled && (
            <>
              {[
                { key: 'struggleAlerts', label: 'Struggle Alerts', description: 'Immediate notification when struggling detected' },
                { key: 'milestoneAlerts', label: 'Milestone Alerts', description: 'Instant celebration for achievements' },
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0 pl-4">
                  <div>
                    <p className="text-white font-medium">{label}</p>
                    <p className="text-sm text-slate-400">{description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle('pushNotifications', key)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.pushNotifications[key as keyof typeof settings.pushNotifications]
                        ? 'bg-purple-600'
                        : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.pushNotifications[key as keyof typeof settings.pushNotifications]
                          ? 'translate-x-7'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Alert Thresholds</h2>
            <p className="text-sm text-slate-400">Customize when alerts are triggered</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Inactivity Days */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white font-medium">Inactivity Alert After</label>
              <span className="text-purple-400 font-medium">{settings.alertThresholds.inactivityDays} days</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              value={settings.alertThresholds.inactivityDays}
              onChange={(e) => handleThresholdChange('inactivityDays', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            />
            <p className="text-sm text-slate-400 mt-1">Notify me if my child hasn't studied for this many days</p>
          </div>

          {/* Struggle Attempts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white font-medium">Struggle Detection After</label>
              <span className="text-purple-400 font-medium">{settings.alertThresholds.struggleAttempts} attempts</span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              value={settings.alertThresholds.struggleAttempts}
              onChange={(e) => handleThresholdChange('struggleAttempts', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            />
            <p className="text-sm text-slate-400 mt-1">Alert when my child fails the same concept this many times</p>
          </div>

          {/* Mastery Threshold */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white font-medium">Mastery Celebration At</label>
              <span className="text-purple-400 font-medium">{settings.alertThresholds.masteryThreshold}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="95"
              step="5"
              value={settings.alertThresholds.masteryThreshold}
              onChange={(e) => handleThresholdChange('masteryThreshold', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            />
            <p className="text-sm text-slate-400 mt-1">Celebrate when my child reaches this mastery level</p>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Account</h2>
            <p className="text-sm text-slate-400">Manage your account settings</p>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors">
            <span className="text-white">Change Password</span>
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors">
            <span className="text-white">Manage Subscription</span>
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors">
            <span className="text-white">Export Data</span>
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors">
            <span className="text-red-400">Delete Account</span>
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end space-x-4">
        {saved && (
          <span className="text-green-400 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Settings saved</span>
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
