import React, { useState } from 'react';
import { User } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Icon from '../common/Icon';
import { useToast } from '../../hooks/useToast';

interface SettingsPageProps {
  user: User;
  setActivePage?: (page: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, setActivePage }) => {
  const [activeSection, setActiveSection] = useState<'general' | 'notifications' | 'privacy' | 'system'>('general');

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-card-foreground">Settings</h1>
        {setActivePage && (
          <Button variant="outline" onClick={() => setActivePage('Profile')}>
            <Icon name="user" className="w-4 h-4 mr-2" />
            Profile
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveSection('general')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === 'general'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon name="settings" className="w-4 h-4 mr-3" />
                General
              </button>
              <button
                onClick={() => setActiveSection('notifications')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === 'notifications'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon name="bell" className="w-4 h-4 mr-3" />
                Notifications
              </button>
              <button
                onClick={() => setActiveSection('privacy')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === 'privacy'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon name="shield" className="w-4 h-4 mr-3" />
                Privacy & Security
              </button>
              <button
                onClick={() => setActiveSection('system')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === 'system'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon name="monitor" className="w-4 h-4 mr-3" />
                System
              </button>
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeSection === 'general' && <GeneralSettings user={user} />}
          {activeSection === 'notifications' && <NotificationSettings user={user} />}
          {activeSection === 'privacy' && <PrivacySettings user={user} />}
          {activeSection === 'system' && <SystemSettings user={user} />}
        </div>
      </div>
    </div>
  );
};

// General Settings
const GeneralSettings: React.FC<{ user: User }> = ({ user }) => {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    addToast({ type: 'success', message: 'Settings saved successfully!' });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4">Regional Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
              <option>America/New_York (EST)</option>
              <option>America/Chicago (CST)</option>
              <option>America/Denver (MST)</option>
              <option>America/Los_Angeles (PST)</option>
              <option>Europe/London (GMT)</option>
              <option>Asia/Tokyo (JST)</option>
              <option>Asia/Dubai (GST)</option>
              <option>Australia/Sydney (AEDT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Date Format</label>
            <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
              <option>MM/DD/YYYY (12/31/2025)</option>
              <option>DD/MM/YYYY (31/12/2025)</option>
              <option>YYYY-MM-DD (2025-12-31)</option>
              <option>DD MMM YYYY (31 Dec 2025)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Time Format</label>
            <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
              <option>12-hour (3:30 PM)</option>
              <option>24-hour (15:30)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Chinese (Simplified)</option>
              <option>Japanese</option>
              <option>Arabic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>JPY (¥)</option>
              <option>AED (د.إ)</option>
              <option>INR (₹)</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Work Week Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">First Day of Week</label>
            <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
              <option>Sunday</option>
              <option>Monday</option>
              <option>Saturday</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Working Days</label>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <label key={day} className="flex flex-col items-center">
                  <input
                    type="checkbox"
                    defaultChecked={index >= 1 && index <= 5}
                    className="mb-1"
                  />
                  <span className="text-xs">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Standard Work Hours per Week</label>
            <input
              type="number"
              defaultValue={40}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

// Notification Settings
const NotificationSettings: React.FC<{ user: User }> = ({ user }) => {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    addToast({ type: 'success', message: 'Notification settings saved!' });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4">Email Notifications</h2>
        <div className="space-y-4">
          <NotificationToggle
            title="Leave Requests"
            description="Get notified when leave requests are submitted or updated"
            defaultChecked={true}
          />
          <NotificationToggle
            title="Attendance Alerts"
            description="Receive alerts for attendance-related activities"
            defaultChecked={true}
          />
          <NotificationToggle
            title="Task Assignments"
            description="Notifications when tasks are assigned to you"
            defaultChecked={true}
          />
          <NotificationToggle
            title="Payroll Updates"
            description="Get notified about payroll processing and updates"
            defaultChecked={true}
          />
          <NotificationToggle
            title="System Announcements"
            description="Important system updates and announcements"
            defaultChecked={true}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">In-App Notifications</h2>
        <div className="space-y-4">
          <NotificationToggle
            title="Desktop Notifications"
            description="Show desktop notifications for important updates"
            defaultChecked={true}
          />
          <NotificationToggle
            title="Sound Alerts"
            description="Play sound for new notifications"
            defaultChecked={false}
          />
          <NotificationToggle
            title="Badge Counter"
            description="Show unread notification count"
            defaultChecked={true}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Notification Frequency</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Digest</label>
            <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
              <option>Real-time</option>
              <option>Daily Summary</option>
              <option>Weekly Summary</option>
              <option>Never</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Quiet Hours</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">From</label>
                <input
                  type="time"
                  defaultValue="22:00"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">To</label>
                <input
                  type="time"
                  defaultValue="08:00"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              No notifications during these hours
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

// Privacy Settings
const PrivacySettings: React.FC<{ user: User }> = ({ user }) => {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    addToast({ type: 'success', message: 'Privacy settings saved!' });
    setSaving(false);
  };

  const handleExportData = () => {
    addToast({ type: 'info', message: 'Data export initiated. You will receive an email shortly.' });
  };

  const handleDeleteAccount = () => {
    addToast({ type: 'warning', message: 'Please contact HR to delete your account.' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4">Profile Visibility</h2>
        <div className="space-y-4">
          <NotificationToggle
            title="Show Email to Colleagues"
            description="Allow other employees to see your email address"
            defaultChecked={true}
          />
          <NotificationToggle
            title="Show Phone Number"
            description="Display your phone number in the employee directory"
            defaultChecked={true}
          />
          <NotificationToggle
            title="Show Birthday"
            description="Let colleagues see your birthday"
            defaultChecked={true}
          />
          <NotificationToggle
            title="Show Work Anniversary"
            description="Display your work anniversary date"
            defaultChecked={true}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Activity Tracking</h2>
        <div className="space-y-4">
          <NotificationToggle
            title="Track Login Activity"
            description="Keep a log of your login sessions"
            defaultChecked={true}
          />
          <NotificationToggle
            title="Activity History"
            description="Store your activity history for analytics"
            defaultChecked={true}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Export Your Data</p>
              <p className="text-sm text-muted-foreground">
                Download a copy of your personal data
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Icon name="download" className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Icon name="trash" className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

// System Settings
const SystemSettings: React.FC<{ user: User }> = ({ user }) => {
  const { addToast } = useToast();

  const handleClearCache = () => {
    localStorage.clear();
    addToast({ type: 'success', message: 'Cache cleared successfully!' });
  };

  const handleResetSettings = () => {
    addToast({ type: 'success', message: 'Settings reset to defaults!' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4">Application Info</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">2.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Build</span>
            <span className="font-medium">20251103</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Environment</span>
            <span className="font-medium">Production</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">November 3, 2025</span>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Performance</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Clear Cache</p>
              <p className="text-sm text-muted-foreground">
                Clear application cache to free up space
              </p>
            </div>
            <Button variant="outline" onClick={handleClearCache}>
              Clear
            </Button>
          </div>

          <NotificationToggle
            title="Enable Animations"
            description="Show smooth transitions and animations"
            defaultChecked={true}
          />
          <NotificationToggle
            title="Auto-refresh Data"
            description="Automatically refresh data every 3 seconds"
            defaultChecked={true}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Advanced</h2>
        <div className="space-y-4">
          <NotificationToggle
            title="Developer Mode"
            description="Enable advanced debugging features"
            defaultChecked={false}
          />
          <NotificationToggle
            title="Beta Features"
            description="Try out experimental features"
            defaultChecked={false}
          />

          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div>
              <p className="font-medium text-yellow-900">Reset All Settings</p>
              <p className="text-sm text-yellow-700">
                Restore all settings to default values
              </p>
            </div>
            <Button variant="outline" onClick={handleResetSettings}>
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Support</h2>
        <div className="space-y-3">
          <a
            href="#"
            className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Icon name="book" className="w-5 h-5 mr-3 text-muted-foreground" />
              <span>Documentation</span>
            </div>
            <Icon name="chevron-right" className="w-4 h-4 text-muted-foreground" />
          </a>
          <a
            href="#"
            className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Icon name="help-circle" className="w-5 h-5 mr-3 text-muted-foreground" />
              <span>Help Center</span>
            </div>
            <Icon name="chevron-right" className="w-4 h-4 text-muted-foreground" />
          </a>
          <a
            href="#"
            className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Icon name="mail" className="w-5 h-5 mr-3 text-muted-foreground" />
              <span>Contact Support</span>
            </div>
            <Icon name="chevron-right" className="w-4 h-4 text-muted-foreground" />
          </a>
        </div>
      </Card>
    </div>
  );
};

// Reusable Toggle Component
const NotificationToggle: React.FC<{
  title: string;
  description: string;
  defaultChecked: boolean;
}> = ({ title, description, defaultChecked }) => {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
};

export default SettingsPage;
