# Profile & Settings Guide

## Overview

The HR Management System now includes comprehensive Profile and Settings pages that provide all users with complete control over their personal information, security, and application preferences.

## Features

### Profile Page

The Profile page is accessible to all user types (Admin, HR, Manager, Employee) and provides:

#### 1. Personal Information Management
- **Profile Photo**: Upload and update profile picture (max 5MB, image files only)
- **Full Name**: Edit your display name
- **Email Address**: Update your email (requires verification)
- **Role**: View your current role (contact HR to change)

#### 2. Employee Details Display
- Employee ID
- Department
- Position/Job Title
- Employment Type (Permanent, Contract, Intern)
- Join Date
- Employment Status (Active/Inactive)

#### 3. Contact Information
- **Phone Number**: Update your contact number
- **Work Email**: View your work email (read-only)
- **Emergency Contact**: Information about contacting HR for emergency contact updates

#### 4. Security Settings
- **Change Password**: 
  - Requires current password verification
  - Minimum 8 characters for new password
  - Confirmation field to prevent typos
- **Two-Factor Authentication (MFA)**:
  - View MFA status (Enabled/Not Enabled)
  - Reset MFA if needed
- **Active Sessions**: View current login session information

#### 5. Preferences
- **Notification Preferences**:
  - Email Notifications toggle
  - Leave Reminders toggle
  - Attendance Alerts toggle
  - Task Updates toggle
- **Display Preferences**:
  - Timezone selection
  - Date format (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
  - Language selection (English, Spanish, French, German)

### Settings Page

The Settings page provides system-wide configuration options organized into four sections:

#### 1. General Settings

**Regional Settings:**
- Timezone (8 major timezones)
- Date Format (4 formats)
- Time Format (12-hour/24-hour)
- Language (8 languages including Arabic, Chinese, Japanese)
- Currency (USD, EUR, GBP, JPY, AED, INR)

**Work Week Settings:**
- First Day of Week (Sunday/Monday/Saturday)
- Working Days (checkbox for each day)
- Standard Work Hours per Week (default: 40)

#### 2. Notification Settings

**Email Notifications:**
- Leave Requests
- Attendance Alerts
- Task Assignments
- Payroll Updates
- System Announcements

**In-App Notifications:**
- Desktop Notifications
- Sound Alerts
- Badge Counter

**Notification Frequency:**
- Email Digest (Real-time, Daily, Weekly, Never)
- Quiet Hours (From/To time selection)

#### 3. Privacy & Security

**Profile Visibility:**
- Show Email to Colleagues
- Show Phone Number
- Show Birthday
- Show Work Anniversary

**Activity Tracking:**
- Track Login Activity
- Activity History

**Data Management:**
- Export Your Data (download personal data)
- Delete Account (contact HR required)

#### 4. System Settings

**Application Info:**
- Version
- Build Number
- Environment
- Last Updated

**Performance:**
- Clear Cache
- Enable Animations
- Auto-refresh Data

**Advanced:**
- Developer Mode
- Beta Features
- Reset All Settings

**Support:**
- Documentation
- Help Center
- Contact Support

## User Access

All features are available to all user types:
- **Admin**: Full access to all profile and settings features
- **HR**: Full access to all profile and settings features
- **Manager**: Full access to all profile and settings features
- **Employee**: Full access to all profile and settings features

## Navigation

### Accessing Profile
1. Click on your avatar in the top-right corner, OR
2. Click "Profile" in the sidebar footer

### Accessing Settings
1. Click "Settings" in the sidebar footer

## API Integration

### Profile Endpoints

**Update User Profile:**
```
PUT /api/users/:id
Body: { name, email, avatarUrl }
```

**Update Employee Contact:**
```
PUT /api/employees/:id
Body: { phone }
```

**Change Password:**
```
POST /api/auth/change-password
Body: { currentPassword, newPassword }
```

**Reset MFA:**
```
POST /api/auth/reset-mfa
```

### Data Persistence

- Profile changes are saved to the database immediately
- Settings preferences are stored in localStorage for instant access
- Avatar images are stored as base64 data URLs
- All changes trigger real-time updates across the application

## Security Features

### Password Requirements
- Minimum 8 characters
- Must provide current password for verification
- Confirmation field to prevent typos
- Passwords are hashed using bcrypt before storage

### MFA Management
- Users can reset their MFA if they lose access
- MFA reset requires email verification
- Recovery codes available for account recovery

### Session Management
- Active session tracking
- Automatic logout on password change (optional)
- Session timeout after inactivity

## Best Practices

### For Users
1. **Keep Profile Updated**: Ensure your contact information is current
2. **Use Strong Passwords**: Change your password regularly
3. **Enable MFA**: Add an extra layer of security to your account
4. **Review Privacy Settings**: Control what information is visible to colleagues
5. **Set Notification Preferences**: Customize alerts to avoid notification fatigue

### For Administrators
1. **Encourage Profile Completion**: Remind users to complete their profiles
2. **Monitor Security Settings**: Ensure users have MFA enabled
3. **Regular Audits**: Review user access and permissions periodically
4. **Data Privacy**: Respect user privacy settings and data export requests

## Troubleshooting

### Common Issues

**Profile Photo Won't Upload:**
- Check file size (must be under 5MB)
- Ensure file is an image format (JPG, PNG, GIF)
- Try a different browser if issues persist

**Password Change Fails:**
- Verify current password is correct
- Ensure new password meets minimum requirements
- Check that new password and confirmation match

**Settings Not Saving:**
- Check browser console for errors
- Clear browser cache and try again
- Ensure you have a stable internet connection

**MFA Reset Not Working:**
- Check your email for the reset link
- Ensure the link hasn't expired (valid for 1 hour)
- Contact HR if you still can't access your account

## Future Enhancements

Planned features for future releases:
- Social media profile links
- Custom avatar backgrounds
- Dark mode preference
- Keyboard shortcuts customization
- Email signature editor
- Calendar integration preferences
- Mobile app settings sync
- Biometric authentication support

## Support

For assistance with Profile or Settings features:
- **Email**: support@hrms.com
- **Help Center**: Click "Help Center" in Settings > System > Support
- **HR Department**: Contact your HR representative for account-related issues

---

**Last Updated**: November 3, 2025
**Version**: 2.0.0
