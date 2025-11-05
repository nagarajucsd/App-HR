# Project Structure

## HR Management System - File Organization

---

## 📁 Root Directory

```
hr-management-system/
├── components/              # React components
├── services/               # API service layer
├── utils/                  # Utility functions
├── server/                 # Backend application
├── docs/                   # Documentation
├── PROJECT_DELIVERY/       # Client delivery package
├── .env                    # Frontend environment variables
├── .env.example           # Frontend environment template
├── package.json           # Frontend dependencies
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Main project documentation
```

---

## 🎨 Frontend Structure

### Components (`/components`)

```
components/
├── auth/                   # Authentication components
│   ├── LoginPage.tsx
│   └── PasswordResetPage.tsx
├── common/                 # Reusable components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Dialog.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   └── Table.tsx
├── dashboard/              # Dashboard components
│   ├── AttendanceCalendar.tsx
│   ├── EmployeeStats.tsx
│   └── LiveWorkTimer.tsx
├── layout/                 # Layout components
│   ├── Sidebar.tsx
│   └── Topbar.tsx
├── leave/                  # Leave management
│   ├── LeaveApplyForm.tsx
│   ├── LeaveHistoryTable.tsx
│   └── HolidayList.tsx
├── mfa/                    # Multi-factor authentication
│   ├── MFASetupPage.tsx
│   ├── MFAVerificationPage.tsx
│   └── CaptchaVerificationPage.tsx
└── pages/                  # Page components
    ├── DashboardPage.tsx
    ├── EmployeesPage.tsx
    ├── AttendancePage.tsx
    ├── LeavePage.tsx
    ├── PayrollPage.tsx
    ├── ReportsPage.tsx
    ├── TasksPage.tsx
    └── NotificationsPage.tsx
```

### Services (`/services`)

```
services/
├── api.ts                  # Axios configuration
├── authService.ts          # Authentication API
├── employeeService.ts      # Employee API
├── attendanceService.ts    # Attendance API
├── leaveService.ts         # Leave API
├── payrollService.ts       # Payroll API
├── taskService.ts          # Task API
└── notificationService.ts  # Notification API
```

---

## 🔧 Backend Structure

### Server (`/server`)

```
server/
├── config/                 # Configuration files
│   └── db.js              # Database connection
├── jobs/                   # Background jobs
│   └── dailyAttendanceJob.js
├── middleware/             # Express middleware
│   ├── auth.js            # Authentication middleware
│   └── errorHandler.js    # Error handling
├── models/                 # Mongoose models
│   ├── User.js
│   ├── Employee.js
│   ├── Department.js
│   ├── Attendance.js
│   ├── LeaveRequest.js
│   ├── Payroll.js
│   ├── Task.js
│   └── Notification.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── employees.js
│   ├── departments.js
│   ├── attendance.js
│   ├── leaves.js
│   ├── payroll.js
│   ├── tasks.js
│   ├── notifications.js
│   └── reports.js
├── scripts/                # Utility scripts
│   ├── seed.js            # Seed initial data
│   ├── clear.js           # Clear database
│   └── create-october-2025-data.js
├── utils/                  # Utility functions
│   └── emailService.js    # Email functionality
├── .env                    # Environment variables
├── .env.example           # Environment template
├── package.json           # Backend dependencies
└── server.js              # Main server file
```

---

## 📚 Documentation (`/docs`)

```
docs/
├── ARCHITECTURE.md         # System architecture
├── DATABASE_SCHEMA.md      # Database structure
├── API_REFERENCE.md        # API documentation
├── DEPLOYMENT_GUIDE.md     # Deployment instructions
└── TROUBLESHOOTING.md      # Common issues
```

---

## 📦 Client Delivery (`/PROJECT_DELIVERY`)

```
PROJECT_DELIVERY/
├── documentation/          # Essential docs
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_REFERENCE.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── TROUBLESHOOTING.md
├── CLIENT_HANDOVER.md      # Main handover document
├── PROJECT_STRUCTURE.md    # This file
├── CLEANUP_TEMP_FILES.bat  # Cleanup script
└── .env.example           # Environment template
```

---

## 🗄️ Database Collections

```
hr_management_system (Database)
├── users                   # User accounts
├── employees              # Employee records
├── departments            # Department data
├── attendances            # Attendance records
├── leaverequests          # Leave requests
├── payrolls               # Payroll records
├── tasks                  # Task assignments
└── notifications          # System notifications
```

---

## 🔑 Key Files

### Configuration Files
- `.env` - Frontend environment variables
- `server/.env` - Backend environment variables
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

### Entry Points
- `index.html` - Frontend entry point
- `src/main.tsx` - React application entry
- `server/server.js` - Backend server entry
- `App.tsx` - Main React component

### Important Scripts
- `server/scripts/seed.js` - Initialize database
- `server/scripts/clear.js` - Clear database
- `server/scripts/create-october-2025-data.js` - Create sample data

---

## 📝 File Naming Conventions

### Frontend
- **Components:** PascalCase (e.g., `DashboardPage.tsx`)
- **Services:** camelCase (e.g., `employeeService.ts`)
- **Utils:** camelCase (e.g., `timeAgo.ts`)
- **Types:** PascalCase (e.g., `types.ts`)

### Backend
- **Models:** PascalCase (e.g., `Employee.js`)
- **Routes:** camelCase (e.g., `employees.js`)
- **Middleware:** camelCase (e.g., `auth.js`)
- **Utils:** camelCase (e.g., `emailService.js`)

---

## 🚫 Files to Ignore

### Development Files (Not for Production)
- `node_modules/` - Dependencies (install via npm)
- `.env` - Environment variables (create from .env.example)
- `dist/` - Build output (generated)
- `.vite/` - Vite cache
- `*.log` - Log files

### Temporary Files (Can be deleted)
- Test files (`test-*.js`)
- Fix documents (`*_FIX.md`, `*_COMPLETE.md`)
- Temporary scripts in `server/scripts/`

---

## 📊 File Count Summary

### Frontend
- Components: ~50 files
- Services: 8 files
- Utils: 5 files
- Pages: 12 files

### Backend
- Models: 8 files
- Routes: 9 files
- Middleware: 2 files
- Scripts: 3 essential files

### Documentation
- Essential docs: 5 files
- Client delivery: 3 files

### Total
- **Application files:** ~100 files
- **Documentation:** 8 files
- **Configuration:** 6 files

---

## 🎯 Essential Files for Client

### Must Include
1. All `/components` files
2. All `/services` files
3. All `/server` files (except temp scripts)
4. All `/docs` files
5. `README.md`
6. `.env.example` files
7. `package.json` files
8. `PROJECT_DELIVERY/` folder

### Can Remove
1. Test files (`test-*.js`)
2. Fix documents (`*_FIX.md`)
3. Temporary scripts
4. Development logs
5. `.git/` folder (if sharing source only)

---

## 🔄 Build Output

### Development
```
npm run dev
# Runs on http://localhost:3001
# Hot reload enabled
```

### Production Build
```
npm run build
# Creates /dist folder
# Optimized for production
# Ready to deploy
```

---

## 📦 Dependencies

### Frontend Dependencies
- React, TypeScript, Vite
- Axios for API calls
- React Router for navigation
- ~20 total dependencies

### Backend Dependencies
- Express, Mongoose, JWT
- Nodemailer for emails
- Bcrypt for passwords
- ~15 total dependencies

---

## ✅ Clean Project Checklist

- [ ] Remove all test files
- [ ] Remove all fix documents
- [ ] Remove temporary scripts
- [ ] Keep only essential documentation
- [ ] Verify all application code intact
- [ ] Test application still works
- [ ] Package PROJECT_DELIVERY folder
- [ ] Ready for client handover

---

**This structure represents a professional, production-ready application.**

All files are organized logically and follow industry best practices.
