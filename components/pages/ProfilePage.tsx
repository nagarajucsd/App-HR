import React, { useState, useRef, useEffect } from 'react';
import { User, Employee, Department } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Label from '../common/Label';
import { useToast } from '../../hooks/useToast';
import Icon from '../common/Icon';

interface ProfilePageProps {
    user: User;
    onUpdateUser: (updatedUser: Partial<User>) => void;
    setActivePage?: (page: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser, setActivePage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

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
          
          // Load department
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
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast({ type: 'error', message: 'Image size must be less than 5MB' });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        addToast({ type: 'error', message: 'Please select a valid image file' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const avatarUrl = reader.result as string;
          
          // Update via API
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-card-foreground">My Profile</h1>
        {setActivePage && (
          <Button variant="outline" onClick={() => setActivePage('Settings')}>
            <Icon name="settings" className="w-4 h-4 mr-2" />
            Settings
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card className="text-center p-6">
            <div className="relative inline-block">
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="h-36 w-36 rounded-full mb-4 mx-auto ring-4 ring-primary/20 object-cover" 
              />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <h2 className="text-3xl font-semibold mt-2">{user.name}</h2>
            <p className="text-muted-foreground text-lg">{user.role}</p>
            <p className="text-muted-foreground mt-1">{user.email}</p>
            <Button onClick={handleAvatarClick} variant="secondary" className="mt-4 w-full">
                <Icon name="camera" className="w-4 h-4 mr-2" />
                Change Photo
            </Button>

            {/* Employee Details */}
            {!loading && employeeData && (
              <div className="mt-6 pt-6 border-t border-border text-left space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Employee ID</p>
                  <p className="font-semibold">{employeeData.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-semibold">{department?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Position</p>
                  <p className="font-semibold">{employeeData.role}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Employment Type</p>
                  <p className="font-semibold">{employeeData.employeeType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Join Date</p>
                  <p className="font-semibold">
                    {new Date(employeeData.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
        </div>
        <div className="lg:col-span-2">
           <ProfileForms user={user} employeeData={employeeData} onUpdateUser={onUpdateUser} />
        </div>
      </div>
    </div>
  );
};


// Main component for forms
const ProfileForms: React.FC<ProfilePageProps & { employeeData: Employee | null }> = ({ 
  user, 
  employeeData, 
  onUpdateUser 
}) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'security' | 'preferences'>('profile');

    return (
        <Card bodyClassName="p-0">
            <div className="border-b border-border overflow-x-auto">
                <nav className="-mb-px flex space-x-6 px-6">
                    <button 
                      onClick={() => setActiveTab('profile')} 
                      className={`py-4 px-1 border-b-2 font-medium text-base transition-colors whitespace-nowrap ${
                        activeTab === 'profile' 
                          ? 'border-primary text-primary' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                        <Icon name="user" className="w-4 h-4 inline mr-2" />
                        Personal Info
                    </button>
                    <button 
                      onClick={() => setActiveTab('contact')} 
                      className={`py-4 px-1 border-b-2 font-medium text-base transition-colors whitespace-nowrap ${
                        activeTab === 'contact' 
                          ? 'border-primary text-primary' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                        <Icon name="phone" className="w-4 h-4 inline mr-2" />
                        Contact
                    </button>
                    <button 
                      onClick={() => setActiveTab('security')} 
                      className={`py-4 px-1 border-b-2 font-medium text-base transition-colors whitespace-nowrap ${
                        activeTab === 'security' 
                          ? 'border-primary text-primary' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                        <Icon name="lock" className="w-4 h-4 inline mr-2" />
                        Security
                    </button>
                    <button 
                      onClick={() => setActiveTab('preferences')} 
                      className={`py-4 px-1 border-b-2 font-medium text-base transition-colors whitespace-nowrap ${
                        activeTab === 'preferences' 
                          ? 'border-primary text-primary' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                        <Icon name="settings" className="w-4 h-4 inline mr-2" />
                        Preferences
                    </button>
                </nav>
            </div>
             <div className="p-6">
              {activeTab === 'profile' && <ProfileInfoForm user={user} onUpdateUser={onUpdateUser} />}
              {activeTab === 'contact' && <ContactInfoForm user={user} employeeData={employeeData} />}
              {activeTab === 'security' && <SecurityForm user={user} onUpdateUser={onUpdateUser} />}
              {activeTab === 'preferences' && <PreferencesForm user={user} />}
            </div>
        </Card>
    );
};


// Sub-component for profile info form
const ProfileInfoForm: React.FC<{ user: User, onUpdateUser: (updatedUser: Partial<User>) => void }> = ({ 
  user, 
  onUpdateUser 
}) => {
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
          console.error('Failed to update profile:', error);
          addToast({ 
            type: 'error', 
            message: error.response?.data?.message || 'Failed to update profile' 
          });
        } finally {
          setSaving(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleProfileUpdate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      required
                    />
                </div>
                <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="role">Role</Label>
                <Input 
                  id="role" 
                  value={user.role} 
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Contact HR to change your role
                </p>
            </div>
            <div className="flex justify-end pt-4">
                 <Button type="submit" disabled={saving}>
                   {saving ? 'Saving...' : 'Save Changes'}
                 </Button>
            </div>
        </form>
    );
};

// Contact Information Form
const ContactInfoForm: React.FC<{ user: User, employeeData: Employee | null }> = ({ 
  user, 
  employeeData 
}) => {
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
          console.error('Failed to update contact:', error);
          addToast({ 
            type: 'error', 
            message: error.response?.data?.message || 'Failed to update contact information' 
          });
        } finally {
          setSaving(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleContactUpdate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                </div>
                <div>
                    <Label htmlFor="workEmail">Work Email</Label>
                    <Input 
                      id="workEmail" 
                      type="email" 
                      value={user.email} 
                      disabled
                      className="bg-muted"
                    />
                </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <Icon name="info" className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Emergency Contact
                  </h4>
                  <p className="text-sm text-blue-700">
                    To update emergency contact information, please contact HR department directly.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
                 <Button type="submit" disabled={saving}>
                   {saving ? 'Saving...' : 'Save Changes'}
                 </Button>
            </div>
        </form>
    );
};

// Security Form
const SecurityForm: React.FC<{ user: User, onUpdateUser: (updatedUser: Partial<User>) => void }> = ({ user, onUpdateUser }) => {
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
          await api.post('/auth/change-password', {
            currentPassword,
            newPassword
          });
          
          addToast({ type: 'success', message: 'Password changed successfully!' });
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } catch (error: any) {
          console.error('Failed to change password:', error);
          addToast({ 
            type: 'error', 
            message: error.response?.data?.message || 'Failed to change password' 
          });
        } finally {
          setSaving(false);
        }
    };

    const handleResetMFA = async () => {
      try {
        const api = (await import('../../services/api')).default;
        const response = await api.post('/auth/mfa/reset');
        
        // Update user state with new MFA status
        if (response.data.user) {
          onUpdateUser({ isMfaSetup: false });
          console.log('✅ MFA reset successful, user updated');
        }
        
        addToast({ type: 'success', message: 'MFA has been reset. Please set it up again on next login.' });
      } catch (error: any) {
        console.error('Failed to reset MFA:', error);
        addToast({ 
          type: 'error', 
          message: error.response?.data?.message || 'Failed to reset MFA' 
        });
      }
    };

    return (
        <div className="space-y-8">
          {/* Change Password Section */}
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
                        <p className="text-xs text-muted-foreground mt-1">
                          Minimum 8 characters
                        </p>
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
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                                title={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                <Icon name={showConfirmPassword ? "eye-off" : "eye"} className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Updating...' : 'Update Password'}
                    </Button>
                </div>
            </form>
          </div>

          {/* MFA Section */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isMfaSetup 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.isMfaSetup ? 'Enabled' : 'Not Enabled'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user.isMfaSetup 
                    ? 'Two-factor authentication is currently enabled for your account.' 
                    : 'Enable two-factor authentication for enhanced security.'}
                </p>
              </div>
              {user.isMfaSetup && (
                <Button 
                  variant="outline" 
                  onClick={handleResetMFA}
                  className="ml-4"
                >
                  Reset MFA
                </Button>
              )}
            </div>
          </div>

          {/* Session Management */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className="text-green-600 text-sm font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
    );
};

// Preferences Form
const PreferencesForm: React.FC<{ user: User }> = ({ user }) => {
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
          // In a real app, save to backend
          await new Promise(resolve => setTimeout(resolve, 500));
          
          addToast({ type: 'success', message: 'Preferences saved successfully!' });
        } catch (error) {
          addToast({ type: 'error', message: 'Failed to save preferences' });
        } finally {
          setSaving(false);
        }
    };

    return (
        <form className="space-y-8" onSubmit={handleSavePreferences}>
          {/* Notification Preferences */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailNotifications}
                    onChange={e => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Leave Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified about leave balance and approvals
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={leaveReminders}
                    onChange={e => setLeaveReminders(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Attendance Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Reminders for clock-in and clock-out
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={attendanceAlerts}
                    onChange={e => setAttendanceAlerts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Task Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications when tasks are assigned or updated
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={taskUpdates}
                    onChange={e => setTaskUpdates(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Display Preferences */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-semibold mb-4">Display Preferences</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select 
                  id="timezone"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option>America/New_York (EST)</option>
                  <option>America/Chicago (CST)</option>
                  <option>America/Denver (MST)</option>
                  <option>America/Los_Angeles (PST)</option>
                  <option>Europe/London (GMT)</option>
                  <option>Asia/Tokyo (JST)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <select 
                  id="dateFormat"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <select 
                  id="language"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
               <Button type="submit" disabled={saving}>
                 {saving ? 'Saving...' : 'Save Preferences'}
               </Button>
          </div>
        </form>
    );
};


export default ProfilePage;
