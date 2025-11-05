import React, { useState, useRef, useEffect } from 'react';
import { User, Employee, Department } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Label from '../common/Label';
import { useToast } from '../../hooks/useToast';
import Icon from '../common/Icon';

interface ProfileSettingsPageProps {
    user: User;
    onUpdateUser: (updatedUser: Partial<User>) => void;
}

const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({ user, onUpdateUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'profile' | 'contact' | 'security' | 'preferences' | 'general' | 'notifications' | 'privacy' | 'system'>('profile');

  // Load employee data
  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        const { employeeService } = await import('../../services/employeeService');
        const { departmentService } = await import('../../services/departmentService');
        
        const employees = await employeeService.getAllEmployees();
        const employee = employees.find(emp => emp.email === user.email);
        
        if (employee) {
          setEmployeeData(employee);
          const dept = await departmentService.getDepartmentById(employee.departmentId);
          setDepartment(dept);
        }
      } catch (error) {
        console.error('Failed to load employee data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeData();
  }, [user.email]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast({ type: 'error', message: 'Image size must be less than 5MB' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        addToast({ type: 'error', message: 'Please select a valid image file' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const avatarUrl = reader.result as string;
          const api = (await import('../../services/api')).default;
          await api.put(`/users/${user.id}`, { avatarUrl });
          onUpdateUser({ avatarUrl });
          addToast({ type: 'success', message: 'Profile photo updated!' });
        } catch (error) {
          console.error('Failed to update avatar:', error);
          addToast({ type: 'error', message: 'Failed to update profile photo' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-card-foreground mb-8">Profile & Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar with Avatar and Navigation */}
        <div className="lg:col-span-1">
          <Card className="text-center p-6 mb-6">
            <div className="relative inline-block">
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="h-32 w-32 rounded-full mb-4 mx-auto ring-4 ring-primary/20 object-cover" 
              />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <h2 className="text-2xl font-semibold mt-2">{user.name}</h2>
            <p className="text-muted-foreground text-sm">{user.role}</p>
            <p className="text-muted-foreground text-xs mt-1">{user.email}</p>
            <Button onClick={handleAvatarClick} variant="secondary" className="mt-4 w-full" size="sm">
                <Icon name="camera" className="w-4 h-4 mr-2" />
                Change Photo
            </Button>

            {!loading && employeeData && (
              <div className="mt-6 pt-6 border-t border-border text-left space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Employee ID</p>
                  <p className="text-sm font-semibold">{employeeData.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-sm font-semibold">{department?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Position</p>
                  <p className="text-sm font-semibold">{employeeData.role}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    employeeData.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {employeeData.status}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Navigation Menu */}
          <Card className="p-2">
            <nav className="space-y-1">
              <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Profile</h3>
              <NavButton icon="user" label="Personal Info" active={activeSection === 'profile'} onClick={() => setActiveSection('profile')} />
              <NavButton icon="phone" label="Contact" active={activeSection === 'contact'} onClick={() => setActiveSection('contact')} />
              <NavButton icon="lock" label="Security" active={activeSection === 'security'} onClick={() => setActiveSection('security')} />
              <NavButton icon="bell" label="Preferences" active={activeSection === 'preferences'} onClick={() => setActiveSection('preferences')} />
              
              <div className="pt-2 mt-2 border-t border-border">
                <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Settings</h3>
              </div>
              <NavButton icon="settings" label="General" active={activeSection === 'general'} onClick={() => setActiveSection('general')} />
              <NavButton icon="bell" label="Notifications" active={activeSection === 'notifications'} onClick={() => setActiveSection('notifications')} />
              <NavButton icon="shield" label="Privacy" active={activeSection === 'privacy'} onClick={() => setActiveSection('privacy')} />
              <NavButton icon="monitor" label="System" active={activeSection === 'system'} onClick={() => setActiveSection('system')} />
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeSection === 'profile' && <ProfileInfoSection user={user} onUpdateUser={onUpdateUser} />}
          {activeSection === 'contact' && <ContactSection user={user} employeeData={employeeData} />}
          {activeSection === 'security' && <SecuritySection user={user} onUpdateUser={onUpdateUser} />}
          {activeSection === 'preferences' && <PreferencesSection />}
          {activeSection === 'general' && <GeneralSettingsSection />}
          {activeSection === 'notifications' && <NotificationSettingsSection />}
          {activeSection === 'privacy' && <PrivacySettingsSection />}
          {activeSection === 'system' && <SystemSettingsSection />}
        </div>
      </div>
    </div>
  );
};

// Navigation Button Component
const NavButton: React.FC<{ icon: any; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      active
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`}
  >
    <Icon name={icon} className="w-4 h-4 mr-3" />
    {label}
  </button>
);

// Profile Info Section
const ProfileInfoSection: React.FC<{ user: User, onUpdateUser: (updatedUser: Partial<User>) => void }> = ({ user, onUpdateUser }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
          const api = (await import('../../services/api')).default;
          await api.put(`/users/${user.id}`, { name, email });
          onUpdateUser({ name, email });
          addToast({ type: 'success', message: 'Profile updated successfully!' });
        } catch (error: any) {
          addToast({ type: 'error', message: error.response?.data?.message || 'Failed to update profile' });
        } finally {
          setSaving(false);
        }
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
            <form className="space-y-6" onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                </div>
                <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={user.role} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground mt-1">Contact HR to change your role</p>
                </div>
                <div className="flex justify-end">
                     <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                </div>
            </form>
        </Card>
    );
};

// Contact Section
const ContactSection: React.FC<{ user: User, employeeData: Employee | null }> = ({ user, employeeData }) => {
    const [phone, setPhone] = useState(employeeData?.phone || '');
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    const handleContactUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
          if (!employeeData) {
            addToast({ type: 'error', message: 'Employee data not found' });
            return;
          }
          const api = (await import('../../services/api')).default;
          await api.put(`/employees/${employeeData.id}`, { phone });
          addToast({ type: 'success', message: 'Contact information updated!' });
        } catch (error: any) {
          addToast({ type: 'error', message: error.response?.data?.message || 'Failed to update contact information' });
        } finally {
          setSaving(false);
        }
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            <form className="space-y-6" onSubmit={handleContactUpdate}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
                    </div>
                    <div>
                        <Label htmlFor="workEmail">Work Email</Label>
                        <Input id="workEmail" type="email" value={user.email} disabled className="bg-muted" />
                    </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <Icon name="info" className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">Emergency Contact</h4>
                      <p className="text-sm text-blue-700">To update emergency contact information, please contact HR department directly.</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                     <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                </div>
            </form>
        </Card>
    );
};

// Security Section
const SecuritySection: React.FC<{ user: User, onUpdateUser: (updatedUser: Partial<User>) => void }> = ({ user, onUpdateUser }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();
    
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) {
             addToast({ type: 'error', message: 'New password must be at least 8 characters.' });
             return;
        }
        if (newPassword !== confirmPassword) {
            addToast({ type: 'error', message: 'New passwords do not match.' });
            return;
        }
        setSaving(true);
        try {
          const api = (await import('../../services/api')).default;
          await api.post('/auth/change-password', { currentPassword, newPassword });
          addToast({ type: 'success', message: 'Password changed successfully!' });
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } catch (error: any) {
          addToast({ type: 'error', message: error.response?.data?.message || 'Failed to change password' });
        } finally {
          setSaving(false);
        }
    };

    const handleResetMFA = async () => {
      try {
        const api = (await import('../../services/api')).default;
        const response = await api.post('/auth/mfa/reset');
        if (response.data.user) {
          onUpdateUser({ isMfaSetup: false });
        }
        addToast({ type: 'success', message: 'MFA has been reset. Please set it up again on next login.' });
      } catch (error: any) {
        addToast({ type: 'error', message: error.response?.data?.message || 'Failed to reset MFA' });
      }
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-6">Security</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <form className="space-y-6" onSubmit={handlePasswordChange}>
                    <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                            <Input 
                                id="currentPassword" 
                                type={showCurrentPassword ? "text" : "password"} 
                                value={currentPassword} 
                                onChange={e => setCurrentPassword(e.target.value)} 
                                required 
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                                title={showCurrentPassword ? "Hide password" : "Show password"}
                            >
                                <Icon name={showCurrentPassword ? "eye-off" : "eye"} className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Input 
                                    id="newPassword" 
                                    type={showNewPassword ? "text" : "password"} 
                                    value={newPassword} 
                                    onChange={e => setNewPassword(e.target.value)} 
                                    required 
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                                    title={showNewPassword ? "Hide password" : "Show password"}
                                >
                                    <Icon name={showNewPassword ? "eye-off" : "eye"} className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Input 
                                    id="confirmPassword" 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    value={confirmPassword} 
                                    onChange={e => setConfirmPassword(e.target.value)} 
                                    required 
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Icon name={showConfirmPassword ? "eye-off" : "eye"} className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</Button>
                    </div>
                </form>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isMfaSetup ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isMfaSetup ? 'Enabled' : 'Not Enabled'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.isMfaSetup ? 'Two-factor authentication is currently enabled for your account.' : 'Enable two-factor authentication for enhanced security.'}
                    </p>
                  </div>
                  {user.isMfaSetup && (
                    <Button variant="outline" onClick={handleResetMFA} className="ml-4">Reset MFA</Button>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-green-600 text-sm font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
        </Card>
    );
};

// Preferences Section
const PreferencesSection: React.FC = () => {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [leaveReminders, setLeaveReminders] = useState(true);
    const [attendanceAlerts, setAttendanceAlerts] = useState(true);
    const [taskUpdates, setTaskUpdates] = useState(true);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    const handleSavePreferences = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          addToast({ type: 'success', message: 'Preferences saved successfully!' });
        } catch (error) {
          addToast({ type: 'error', message: 'Failed to save preferences' });
        } finally {
          setSaving(false);
        }
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-6">Preferences</h2>
            <form className="space-y-8" onSubmit={handleSavePreferences}>
              <div>
                <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <ToggleRow label="Email Notifications" description="Receive email notifications for important updates" checked={emailNotifications} onChange={setEmailNotifications} />
                  <ToggleRow label="Leave Reminders" description="Get notified about leave balance and approvals" checked={leaveReminders} onChange={setLeaveReminders} />
                  <ToggleRow label="Attendance Alerts" description="Reminders for clock-in and clock-out" checked={attendanceAlerts} onChange={setAttendanceAlerts} />
                  <ToggleRow label="Task Updates" description="Notifications when tasks are assigned or updated" checked={taskUpdates} onChange={setTaskUpdates} />
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">Display Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select id="timezone" className="w-full px-3 py-2 border border-input rounded-md bg-background">
                      <option>America/New_York (EST)</option>
                      <option>America/Chicago (CST)</option>
                      <option>America/Los_Angeles (PST)</option>
                      <option>Europe/London (GMT)</option>
                      <option>Asia/Tokyo (JST)</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <select id="dateFormat" className="w-full px-3 py-2 border border-input rounded-md bg-background">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <select id="language" className="w-full px-3 py-2 border border-input rounded-md bg-background">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                   <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</Button>
              </div>
            </form>
        </Card>
    );
};

// Toggle Row Component
const ToggleRow: React.FC<{ label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
    </label>
  </div>
);

// General Settings Section
const GeneralSettingsSection: React.FC = () => {
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
                <h2 className="text-2xl font-bold mb-6">General Settings</h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Regional Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="timezone">Timezone</Label>
                                <select id="timezone" className="w-full px-3 py-2 border border-input rounded-md bg-background">
                                    <option>America/New_York (EST)</option>
                                    <option>America/Chicago (CST)</option>
                                    <option>America/Los_Angeles (PST)</option>
                                    <option>Europe/London (GMT)</option>
                                    <option>Asia/Tokyo (JST)</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="dateFormat">Date Format</Label>
                                    <select id="dateFormat" className="w-full px-3 py-2 border border-input rounded-md bg-background">
                                        <option>MM/DD/YYYY</option>
                                        <option>DD/MM/YYYY</option>
                                        <option>YYYY-MM-DD</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="timeFormat">Time Format</Label>
                                    <select id="timeFormat" className="w-full px-3 py-2 border border-input rounded-md bg-background">
                                        <option>12-hour</option>
                                        <option>24-hour</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="language">Language</Label>
                                    <select id="language" className="w-full px-3 py-2 border border-input rounded-md bg-background">
                                        <option>English (US)</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                        <option>German</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="currency">Currency</Label>
                                    <select id="currency" className="w-full px-3 py-2 border border-input rounded-md bg-background">
                                        <option>USD ($)</option>
                                        <option>EUR (€)</option>
                                        <option>GBP (£)</option>
                                        <option>JPY (¥)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h3 className="text-lg font-semibold mb-4">Work Week Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="firstDay">First Day of Week</Label>
                                <select id="firstDay" className="w-full px-3 py-2 border border-input rounded-md bg-background">
                                    <option>Sunday</option>
                                    <option>Monday</option>
                                    <option>Saturday</option>
                                </select>
                            </div>
                            <div>
                                <Label>Working Days</Label>
                                <div className="grid grid-cols-7 gap-2 mt-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                        <label key={day} className="flex flex-col items-center">
                                            <input type="checkbox" defaultChecked={index >= 1 && index <= 5} className="mb-1" />
                                            <span className="text-xs">{day}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="workHours">Standard Work Hours per Week</Label>
                                <Input id="workHours" type="number" defaultValue={40} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// Notification Settings Section
const NotificationSettingsSection: React.FC = () => {
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
                <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
                        <div className="space-y-4">
                            <ToggleRow label="Leave Requests" description="Get notified when leave requests are submitted or updated" checked={true} onChange={() => {}} />
                            <ToggleRow label="Attendance Alerts" description="Receive alerts for attendance-related activities" checked={true} onChange={() => {}} />
                            <ToggleRow label="Task Assignments" description="Notifications when tasks are assigned to you" checked={true} onChange={() => {}} />
                            <ToggleRow label="Payroll Updates" description="Get notified about payroll processing and updates" checked={true} onChange={() => {}} />
                            <ToggleRow label="System Announcements" description="Important system updates and announcements" checked={true} onChange={() => {}} />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h3 className="text-lg font-semibold mb-4">In-App Notifications</h3>
                        <div className="space-y-4">
                            <ToggleRow label="Desktop Notifications" description="Show desktop notifications for important updates" checked={true} onChange={() => {}} />
                            <ToggleRow label="Sound Alerts" description="Play sound for new notifications" checked={false} onChange={() => {}} />
                            <ToggleRow label="Badge Counter" description="Show unread notification count" checked={true} onChange={() => {}} />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h3 className="text-lg font-semibold mb-4">Notification Frequency</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="emailDigest">Email Digest</Label>
                                <select id="emailDigest" className="w-full px-3 py-2 border border-input rounded-md bg-background">
                                    <option>Real-time</option>
                                    <option>Daily Summary</option>
                                    <option>Weekly Summary</option>
                                    <option>Never</option>
                                </select>
                            </div>
                            <div>
                                <Label>Quiet Hours</Label>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-1">From</label>
                                        <input type="time" defaultValue="22:00" className="w-full px-3 py-2 border border-input rounded-md bg-background" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-1">To</label>
                                        <input type="time" defaultValue="08:00" className="w-full px-3 py-2 border border-input rounded-md bg-background" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">No notifications during these hours</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// Privacy Settings Section
const PrivacySettingsSection: React.FC = () => {
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
                <h2 className="text-2xl font-bold mb-6">Privacy & Security</h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Profile Visibility</h3>
                        <div className="space-y-4">
                            <ToggleRow label="Show Email to Colleagues" description="Allow other employees to see your email address" checked={true} onChange={() => {}} />
                            <ToggleRow label="Show Phone Number" description="Display your phone number in the employee directory" checked={true} onChange={() => {}} />
                            <ToggleRow label="Show Birthday" description="Let colleagues see your birthday" checked={true} onChange={() => {}} />
                            <ToggleRow label="Show Work Anniversary" description="Display your work anniversary date" checked={true} onChange={() => {}} />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h3 className="text-lg font-semibold mb-4">Activity Tracking</h3>
                        <div className="space-y-4">
                            <ToggleRow label="Track Login Activity" description="Keep a log of your login sessions" checked={true} onChange={() => {}} />
                            <ToggleRow label="Activity History" description="Store your activity history for analytics" checked={true} onChange={() => {}} />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h3 className="text-lg font-semibold mb-4">Data Management</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div>
                                    <p className="font-medium">Export Your Data</p>
                                    <p className="text-sm text-muted-foreground">Download a copy of your personal data</p>
                                </div>
                                <Button variant="outline" onClick={handleExportData}>
                                    <Icon name="download" className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div>
                                    <p className="font-medium text-red-900">Delete Account</p>
                                    <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                                </div>
                                <Button variant="destructive" onClick={handleDeleteAccount}>
                                    <Icon name="trash" className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// System Settings Section
const SystemSettingsSection: React.FC = () => {
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
                <h2 className="text-2xl font-bold mb-6">System Settings</h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Application Info</h3>
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
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h3 className="text-lg font-semibold mb-4">Performance</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div>
                                    <p className="font-medium">Clear Cache</p>
                                    <p className="text-sm text-muted-foreground">Clear application cache to free up space</p>
                                </div>
                                <Button variant="outline" onClick={handleClearCache}>Clear</Button>
                            </div>
                            <ToggleRow label="Enable Animations" description="Show smooth transitions and animations" checked={true} onChange={() => {}} />
                            <ToggleRow label="Auto-refresh Data" description="Automatically refresh data every 3 seconds" checked={true} onChange={() => {}} />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h3 className="text-lg font-semibold mb-4">Advanced</h3>
                        <div className="space-y-4">
                            <ToggleRow label="Developer Mode" description="Enable advanced debugging features" checked={false} onChange={() => {}} />
                            <ToggleRow label="Beta Features" description="Try out experimental features" checked={false} onChange={() => {}} />

                            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div>
                                    <p className="font-medium text-yellow-900">Reset All Settings</p>
                                    <p className="text-sm text-yellow-700">Restore all settings to default values</p>
                                </div>
                                <Button variant="outline" onClick={handleResetSettings}>Reset</Button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h3 className="text-lg font-semibold mb-4">Support</h3>
                        <div className="space-y-3">
                            <a href="#" className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
                                <div className="flex items-center">
                                    <Icon name="book" className="w-5 h-5 mr-3 text-muted-foreground" />
                                    <span>Documentation</span>
                                </div>
                                <Icon name="chevron-right" className="w-4 h-4 text-muted-foreground" />
                            </a>
                            <a href="#" className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
                                <div className="flex items-center">
                                    <Icon name="help-circle" className="w-5 h-5 mr-3 text-muted-foreground" />
                                    <span>Help Center</span>
                                </div>
                                <Icon name="chevron-right" className="w-4 h-4 text-muted-foreground" />
                            </a>
                            <a href="#" className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
                                <div className="flex items-center">
                                    <Icon name="mail" className="w-5 h-5 mr-3 text-muted-foreground" />
                                    <span>Contact Support</span>
                                </div>
                                <Icon name="chevron-right" className="w-4 h-4 text-muted-foreground" />
                            </a>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ProfileSettingsPage;
