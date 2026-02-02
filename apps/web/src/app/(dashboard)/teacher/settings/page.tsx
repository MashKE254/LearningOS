'use client';

import { useState } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  Shield,
  User,
  Clock,
  AlertTriangle,
  Award,
  BookOpen,
  Save,
  Check,
} from 'lucide-react';

export default function TeacherSettingsPage() {
  const [saved, setSaved] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState({
    dailyDigest: true,
    struggleAlerts: true,
    milestoneAlerts: true,
    assignmentSubmissions: true,
    inactivityAlerts: false,
  });

  const [pushNotifications, setPushNotifications] = useState({
    enabled: true,
    struggleAlerts: true,
    milestoneAlerts: false,
    assignmentSubmissions: true,
  });

  // Alert thresholds
  const [thresholds, setThresholds] = useState({
    struggleMastery: 40,
    struggleAttempts: 5,
    inactivityDays: 3,
    masteryTarget: 70,
  });

  // Display preferences
  const [displayPrefs, setDisplayPrefs] = useState({
    defaultView: 'overview',
    showInactiveStudents: true,
    compactMode: false,
    colorBlindMode: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Customize your teaching dashboard experience</p>
      </div>

      {/* Email Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Email Notifications</h2>
            <p className="text-sm text-gray-500">Choose what updates you receive via email</p>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Daily Digest</p>
              <p className="text-sm text-gray-500">Summary of all class activity</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications.dailyDigest}
              onChange={(e) => setEmailNotifications({ ...emailNotifications, dailyDigest: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Struggle Alerts</p>
              <p className="text-sm text-gray-500">When students fall below mastery threshold</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications.struggleAlerts}
              onChange={(e) => setEmailNotifications({ ...emailNotifications, struggleAlerts: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Milestone Alerts</p>
              <p className="text-sm text-gray-500">When students achieve mastery goals</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications.milestoneAlerts}
              onChange={(e) => setEmailNotifications({ ...emailNotifications, milestoneAlerts: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Assignment Submissions</p>
              <p className="text-sm text-gray-500">When students submit assignments</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications.assignmentSubmissions}
              onChange={(e) => setEmailNotifications({ ...emailNotifications, assignmentSubmissions: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Inactivity Alerts</p>
              <p className="text-sm text-gray-500">When students haven't logged in</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications.inactivityAlerts}
              onChange={(e) => setEmailNotifications({ ...emailNotifications, inactivityAlerts: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
            />
          </label>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Smartphone className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Push Notifications</h2>
            <p className="text-sm text-gray-500">Real-time alerts on your device</p>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Enable Push Notifications</p>
              <p className="text-sm text-gray-500">Receive alerts on this device</p>
            </div>
            <input
              type="checkbox"
              checked={pushNotifications.enabled}
              onChange={(e) => setPushNotifications({ ...pushNotifications, enabled: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
            />
          </label>

          {pushNotifications.enabled && (
            <div className="pl-4 border-l-2 border-gray-200 space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <p className="text-sm text-gray-700">Struggle alerts</p>
                <input
                  type="checkbox"
                  checked={pushNotifications.struggleAlerts}
                  onChange={(e) => setPushNotifications({ ...pushNotifications, struggleAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <p className="text-sm text-gray-700">Milestone alerts</p>
                <input
                  type="checkbox"
                  checked={pushNotifications.milestoneAlerts}
                  onChange={(e) => setPushNotifications({ ...pushNotifications, milestoneAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <p className="text-sm text-gray-700">Assignment submissions</p>
                <input
                  type="checkbox"
                  checked={pushNotifications.assignmentSubmissions}
                  onChange={(e) => setPushNotifications({ ...pushNotifications, assignmentSubmissions: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Alert Thresholds</h2>
            <p className="text-sm text-gray-500">Customize when alerts are triggered</p>
          </div>
        </div>
        <div className="p-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-gray-900">Struggle Mastery Threshold</label>
              <span className="text-sm font-medium text-emerald-600">{thresholds.struggleMastery}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="60"
              value={thresholds.struggleMastery}
              onChange={(e) => setThresholds({ ...thresholds, struggleMastery: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Alert when student mastery falls below this level
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-gray-900">Struggle Attempts</label>
              <span className="text-sm font-medium text-emerald-600">{thresholds.struggleAttempts}</span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              value={thresholds.struggleAttempts}
              onChange={(e) => setThresholds({ ...thresholds, struggleAttempts: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Alert after this many failed attempts on a concept
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-gray-900">Inactivity Days</label>
              <span className="text-sm font-medium text-emerald-600">{thresholds.inactivityDays} days</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              value={thresholds.inactivityDays}
              onChange={(e) => setThresholds({ ...thresholds, inactivityDays: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Alert when a student is inactive for this many days
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-gray-900">Mastery Target</label>
              <span className="text-sm font-medium text-emerald-600">{thresholds.masteryTarget}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="90"
              value={thresholds.masteryTarget}
              onChange={(e) => setThresholds({ ...thresholds, masteryTarget: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Target mastery level for celebrations and insights
            </p>
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Display Preferences</h2>
            <p className="text-sm text-gray-500">Customize your dashboard view</p>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block font-medium text-gray-900 mb-2">Default View</label>
            <select
              value={displayPrefs.defaultView}
              onChange={(e) => setDisplayPrefs({ ...displayPrefs, defaultView: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="overview">Overview</option>
              <option value="classes">Classes</option>
              <option value="students">Students</option>
              <option value="insights">Insights</option>
            </select>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Show Inactive Students</p>
              <p className="text-sm text-gray-500">Include inactive students in lists</p>
            </div>
            <input
              type="checkbox"
              checked={displayPrefs.showInactiveStudents}
              onChange={(e) => setDisplayPrefs({ ...displayPrefs, showInactiveStudents: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Compact Mode</p>
              <p className="text-sm text-gray-500">Show more content with less spacing</p>
            </div>
            <input
              type="checkbox"
              checked={displayPrefs.compactMode}
              onChange={(e) => setDisplayPrefs({ ...displayPrefs, compactMode: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Color Blind Mode</p>
              <p className="text-sm text-gray-500">Use patterns in addition to colors</p>
            </div>
            <input
              type="checkbox"
              checked={displayPrefs.colorBlindMode}
              onChange={(e) => setDisplayPrefs({ ...displayPrefs, colorBlindMode: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
            />
          </label>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Account Settings</h2>
            <p className="text-sm text-gray-500">Manage your account</p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between">
            <span className="text-gray-700">Change Password</span>
            <Shield className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between">
            <span className="text-gray-700">Edit Profile</span>
            <User className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between">
            <span className="text-gray-700">Export Class Data</span>
            <BookOpen className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
            Delete Account
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
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
  );
}
