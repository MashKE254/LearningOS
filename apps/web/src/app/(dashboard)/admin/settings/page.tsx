'use client';

import { useState } from 'react';
import {
  Settings,
  Shield,
  CreditCard,
  Mail,
  Globe,
  Database,
  Bell,
  Users,
  Key,
  Save,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'EduForge',
    supportEmail: 'support@eduforge.ai',
    maintenanceMode: false,
    allowSignups: true,
    requireEmailVerification: true,
  });

  // AI settings
  const [aiSettings, setAiSettings] = useState({
    model: 'claude-3-sonnet',
    maxTokens: 4096,
    temperature: 0.7,
    enableVoice: true,
    enableImageAnalysis: true,
  });

  // Subscription settings
  const [subscriptionSettings, setSubscriptionSettings] = useState({
    freeTrialDays: 7,
    studentProPrice: 9.99,
    familyPrice: 19.99,
    educatorPrice: 14.99,
    gracePeriodDays: 3,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'ai', label: 'AI Configuration', icon: RefreshCw },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'database', label: 'Database', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600">Configure platform-wide settings and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 shrink-0 hidden lg:block">
          <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sticky top-24">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Mobile tabs */}
          <div className="lg:hidden overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">General Settings</h2>
                <p className="text-sm text-gray-500">Basic platform configuration</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Maintenance Mode</p>
                      <p className="text-sm text-gray-500">Disable access for non-admin users</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={generalSettings.maintenanceMode}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })}
                      className="w-5 h-5 rounded text-red-500 focus:ring-red-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Allow New Signups</p>
                      <p className="text-sm text-gray-500">Enable user registration</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={generalSettings.allowSignups}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, allowSignups: e.target.checked })}
                      className="w-5 h-5 rounded text-red-500 focus:ring-red-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Require Email Verification</p>
                      <p className="text-sm text-gray-500">Users must verify email before access</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={generalSettings.requireEmailVerification}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, requireEmailVerification: e.target.checked })}
                      className="w-5 h-5 rounded text-red-500 focus:ring-red-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* AI Configuration */}
          {activeTab === 'ai' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">AI Configuration</h2>
                <p className="text-sm text-gray-500">Configure AI tutor settings</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI Model
                  </label>
                  <select
                    value={aiSettings.model}
                    onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="claude-3-opus">Claude 3 Opus (Most Capable)</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet (Balanced)</option>
                    <option value="claude-3-haiku">Claude 3 Haiku (Fast)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Max Tokens</label>
                    <span className="text-sm text-gray-500">{aiSettings.maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="1024"
                    max="8192"
                    step="512"
                    value={aiSettings.maxTokens}
                    onChange={(e) => setAiSettings({ ...aiSettings, maxTokens: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Temperature</label>
                    <span className="text-sm text-gray-500">{aiSettings.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiSettings.temperature}
                    onChange={(e) => setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower = more focused, Higher = more creative</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Enable Voice Input</p>
                      <p className="text-sm text-gray-500">Allow students to speak to the AI tutor</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiSettings.enableVoice}
                      onChange={(e) => setAiSettings({ ...aiSettings, enableVoice: e.target.checked })}
                      className="w-5 h-5 rounded text-red-500 focus:ring-red-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Enable Image Analysis</p>
                      <p className="text-sm text-gray-500">Allow AI to analyze uploaded images</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiSettings.enableImageAnalysis}
                      onChange={(e) => setAiSettings({ ...aiSettings, enableImageAnalysis: e.target.checked })}
                      className="w-5 h-5 rounded text-red-500 focus:ring-red-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Settings */}
          {activeTab === 'subscriptions' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Subscription Settings</h2>
                <p className="text-sm text-gray-500">Configure pricing and trial periods</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Free Trial Days
                  </label>
                  <input
                    type="number"
                    value={subscriptionSettings.freeTrialDays}
                    onChange={(e) => setSubscriptionSettings({ ...subscriptionSettings, freeTrialDays: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Pro Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={subscriptionSettings.studentProPrice}
                        onChange={(e) => setSubscriptionSettings({ ...subscriptionSettings, studentProPrice: parseFloat(e.target.value) })}
                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Family Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={subscriptionSettings.familyPrice}
                        onChange={(e) => setSubscriptionSettings({ ...subscriptionSettings, familyPrice: parseFloat(e.target.value) })}
                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Educator Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={subscriptionSettings.educatorPrice}
                        onChange={(e) => setSubscriptionSettings({ ...subscriptionSettings, educatorPrice: parseFloat(e.target.value) })}
                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grace Period Days
                  </label>
                  <input
                    type="number"
                    value={subscriptionSettings.gracePeriodDays}
                    onChange={(e) => setSubscriptionSettings({ ...subscriptionSettings, gracePeriodDays: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Days to allow access after failed payment</p>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Security Settings</h2>
                  <p className="text-sm text-gray-500">Configure platform security</p>
                </div>
                <div className="p-6 space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 rounded text-red-500 focus:ring-red-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Session Timeout</p>
                      <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                    </div>
                    <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Rate Limiting</p>
                      <p className="text-sm text-gray-500">Limit API requests per user</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 rounded text-red-500 focus:ring-red-500"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800">Security Notice</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Make sure to regularly rotate API keys and review admin access logs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Email Configuration</h2>
                <p className="text-sm text-gray-500">Configure email service settings</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Provider
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="resend">Resend</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="ses">Amazon SES</option>
                    <option value="mailgun">Mailgun</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Email
                  </label>
                  <input
                    type="email"
                    defaultValue="noreply@eduforge.ai"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    defaultValue="EduForge"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    defaultValue="••••••••••••••••"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                  Send Test Email
                </button>
              </div>
            </div>
          )}

          {/* Database Settings */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Database Status</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Connection Status</span>
                    <span className="flex items-center gap-2 text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Database Size</span>
                    <span className="font-medium text-gray-900">2.4 GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Records</span>
                    <span className="font-medium text-gray-900">1,245,678</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Backup</span>
                    <span className="font-medium text-gray-900">2 hours ago</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Database Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Create Backup
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    View Backups
                  </button>
                  <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                    Clear Cache
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
