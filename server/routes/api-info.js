import express from 'express';

const router = express.Router();

// @route   GET /api/info
// @desc    Get complete API structure and backend information
// @access  Public
router.get('/', (req, res) => {
  const apiInfo = {
    name: 'HR Management System API',
    version: '1.0.0',
    status: 'operational',
    description: 'Complete REST API for HR Management with MongoDB',
    baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    apiUrl: `${req.protocol}://${req.get('host')}/api`,
    
    endpoints: {
      authentication: {
        basePath: '/api/auth',
        description: 'User authentication and security',
        routes: [
          {
            method: 'POST',
            path: '/api/auth/login',
            description: 'User login with email and password',
            access: 'Public',
            body: { email: 'string', password: 'string' }
          },
          {
            method: 'POST',
            path: '/api/auth/mfa/setup',
            description: 'Setup MFA with QR code',
            access: 'Public',
            body: { userId: 'string' }
          },
          {
            method: 'POST',
            path: '/api/auth/mfa/verify',
            description: 'Verify MFA token',
            access: 'Public',
            body: { userId: 'string', token: 'string', isSetup: 'boolean' }
          },
          {
            method: 'GET',
            path: '/api/auth/me',
            description: 'Get current authenticated user',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'POST',
            path: '/api/auth/forgot-password',
            description: 'Request password reset email',
            access: 'Public',
            body: { email: 'string' }
          },
          {
            method: 'POST',
            path: '/api/auth/reset-password/:token',
            description: 'Reset password with token',
            access: 'Public',
            body: { password: 'string' }
          },
          {
            method: 'POST',
            path: '/api/auth/change-password',
            description: 'Change password for logged in user',
            access: 'Private',
            requiresAuth: true,
            body: { currentPassword: 'string', newPassword: 'string' }
          }
        ]
      },

      employees: {
        basePath: '/api/employees',
        description: 'Employee management',
        routes: [
          {
            method: 'GET',
            path: '/api/employees',
            description: 'Get all employees',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/employees/:id',
            description: 'Get employee by ID',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'POST',
            path: '/api/employees',
            description: 'Create new employee (auto ID generation)',
            access: 'Private - Admin/HR',
            requiresAuth: true,
            body: { name: 'string', email: 'string', department: 'string', role: 'string', salary: 'number' }
          },
          {
            method: 'PUT',
            path: '/api/employees/:id',
            description: 'Update employee',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'DELETE',
            path: '/api/employees/:id',
            description: 'Delete employee',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/employees/department/:departmentId',
            description: 'Get employees by department',
            access: 'Private',
            requiresAuth: true
          }
        ]
      },

      departments: {
        basePath: '/api/departments',
        description: 'Department management',
        routes: [
          {
            method: 'GET',
            path: '/api/departments',
            description: 'Get all departments',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/departments/:id',
            description: 'Get department by ID',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'POST',
            path: '/api/departments',
            description: 'Create new department',
            access: 'Private - Admin/HR',
            requiresAuth: true,
            body: { name: 'string', description: 'string', headId: 'string' }
          },
          {
            method: 'PUT',
            path: '/api/departments/:id',
            description: 'Update department',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'DELETE',
            path: '/api/departments/:id',
            description: 'Delete department',
            access: 'Private - Admin/HR',
            requiresAuth: true
          }
        ]
      },

      attendance: {
        basePath: '/api/attendance',
        description: 'Time and attendance tracking',
        routes: [
          {
            method: 'GET',
            path: '/api/attendance',
            description: 'Get all attendance records',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/attendance/today',
            description: 'Get today\'s attendance for current user',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/attendance/employee/:employeeId',
            description: 'Get attendance by employee',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/attendance/range',
            description: 'Get attendance for date range',
            access: 'Private',
            requiresAuth: true,
            query: { startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }
          },
          {
            method: 'POST',
            path: '/api/attendance/clock-in',
            description: 'Clock in (automatic)',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'POST',
            path: '/api/attendance/clock-out',
            description: 'Clock out (automatic)',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'POST',
            path: '/api/attendance',
            description: 'Create attendance record (Admin)',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'PUT',
            path: '/api/attendance/:id',
            description: 'Update attendance record',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'DELETE',
            path: '/api/attendance/:id',
            description: 'Delete attendance record',
            access: 'Private - Admin/HR',
            requiresAuth: true
          }
        ]
      },

      leaves: {
        basePath: '/api/leaves',
        description: 'Leave management with approval workflow',
        routes: [
          {
            method: 'GET',
            path: '/api/leaves',
            description: 'Get all leave requests',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/leaves/:id',
            description: 'Get leave request by ID',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/leaves/employee/:employeeId',
            description: 'Get leave requests by employee',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/leaves/balance/:employeeId',
            description: 'Get leave balance for employee',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/leaves/balances',
            description: 'Get all leave balances',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'POST',
            path: '/api/leaves',
            description: 'Submit leave request',
            access: 'Private',
            requiresAuth: true,
            body: { leaveType: 'string', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', reason: 'string' }
          },
          {
            method: 'PUT',
            path: '/api/leaves/:id/status',
            description: 'Update leave status (Approve/Reject)',
            access: 'Private - Admin/HR/Manager',
            requiresAuth: true,
            body: { status: 'Approved | Rejected' }
          },
          {
            method: 'DELETE',
            path: '/api/leaves/:id',
            description: 'Delete leave request',
            access: 'Private',
            requiresAuth: true
          }
        ]
      },

      payroll: {
        basePath: '/api/payroll',
        description: 'Payroll management with approval workflow',
        routes: [
          {
            method: 'GET',
            path: '/api/payroll',
            description: 'Get all payroll records',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/payroll/:id',
            description: 'Get payroll by ID',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/payroll/employee/:employeeId',
            description: 'Get payroll records by employee',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'POST',
            path: '/api/payroll',
            description: 'Create payroll record',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'POST',
            path: '/api/payroll/process',
            description: 'Process payroll for month',
            access: 'Private - Admin/HR',
            requiresAuth: true,
            body: { month: 'string', year: 'number' }
          },
          {
            method: 'PUT',
            path: '/api/payroll/:id',
            description: 'Update payroll record',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'DELETE',
            path: '/api/payroll/:id',
            description: 'Delete payroll record',
            access: 'Private - Admin/HR',
            requiresAuth: true
          }
        ]
      },

      notifications: {
        basePath: '/api/notifications',
        description: 'In-app notifications',
        routes: [
          {
            method: 'GET',
            path: '/api/notifications',
            description: 'Get all notifications for current user',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'PUT',
            path: '/api/notifications/:id/read',
            description: 'Mark notification as read',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'PUT',
            path: '/api/notifications/read-all',
            description: 'Mark all notifications as read',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'DELETE',
            path: '/api/notifications/:id',
            description: 'Delete notification',
            access: 'Private',
            requiresAuth: true
          }
        ]
      },

      exitInterviews: {
        basePath: '/api/exit-interviews',
        description: 'Exit interview management',
        routes: [
          {
            method: 'GET',
            path: '/api/exit-interviews',
            description: 'Get all exit interviews',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/exit-interviews/my',
            description: 'Get current employee\'s exit interview',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/exit-interviews/:id',
            description: 'Get exit interview by ID',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'POST',
            path: '/api/exit-interviews',
            description: 'Submit exit interview',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'PUT',
            path: '/api/exit-interviews/:id/approve',
            description: 'Approve exit interview',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'PUT',
            path: '/api/exit-interviews/:id/reject',
            description: 'Reject exit interview with reason',
            access: 'Private - Admin/HR',
            requiresAuth: true,
            body: { reason: 'string' }
          }
        ]
      },

      reports: {
        basePath: '/api/reports',
        description: 'Reports and analytics',
        routes: [
          {
            method: 'GET',
            path: '/api/reports/employee',
            description: 'Employee reports with filters',
            access: 'Private - Admin/HR',
            requiresAuth: true,
            query: { department: 'string', role: 'string', status: 'string' }
          },
          {
            method: 'GET',
            path: '/api/reports/attendance',
            description: 'Attendance analytics',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/reports/leave',
            description: 'Leave statistics',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/reports/payroll',
            description: 'Payroll summaries',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/reports/exit-interviews',
            description: 'Exit interview analytics',
            access: 'Private - Admin/HR',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/reports/dashboard-stats',
            description: 'Real-time dashboard KPIs',
            access: 'Private',
            requiresAuth: true
          }
        ]
      },

      users: {
        basePath: '/api/users',
        description: 'User management',
        routes: [
          {
            method: 'GET',
            path: '/api/users',
            description: 'Get all users',
            access: 'Private - Admin',
            requiresAuth: true
          },
          {
            method: 'GET',
            path: '/api/users/:id',
            description: 'Get user by ID',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'PUT',
            path: '/api/users/:id',
            description: 'Update user',
            access: 'Private',
            requiresAuth: true
          },
          {
            method: 'DELETE',
            path: '/api/users/:id',
            description: 'Delete user',
            access: 'Private - Admin',
            requiresAuth: true
          }
        ]
      }
    },

    database: {
      type: 'MongoDB',
      status: 'Connected',
      models: [
        'User',
        'Employee',
        'Department',
        'Attendance',
        'LeaveRequest',
        'LeaveBalance',
        'Payroll',
        'Notification',
        'ExitInterview',
        'EmployeeDocument'
      ]
    },

    security: {
      authentication: 'JWT (JSON Web Tokens)',
      mfa: 'TOTP (Time-based One-Time Password)',
      passwordHashing: 'bcrypt',
      cors: 'Enabled',
      rateLimit: 'Recommended for production'
    },

    features: [
      'User Authentication with MFA',
      'Role-based Access Control (Admin, HR, Manager, Employee)',
      'Employee Management with Auto ID Generation',
      'Department Management',
      'Attendance Tracking (Clock In/Out)',
      'Leave Management with Approval Workflow',
      'Payroll Management with Multi-stage Approval',
      'Exit Interviews',
      'In-app Notifications',
      'Email Notifications',
      'Comprehensive Reports & Analytics',
      'Password Reset Flow',
      'Account Locking after Failed Attempts'
    ],

    statistics: {
      totalEndpoints: '45+',
      totalModels: 10,
      authentication: 'JWT + MFA',
      database: 'MongoDB'
    },

    documentation: {
      setupGuide: '/FULLSTACK_SETUP.md',
      apiReference: '/API_DOCUMENTATION.md',
      integrationGuide: '/API_INTEGRATION_GUIDE.md',
      quickReference: '/QUICK_REFERENCE.md'
    },

    support: {
      healthCheck: '/api/health',
      apiInfo: '/api/info',
      documentation: 'See documentation files in root directory'
    }
  };

  res.json(apiInfo);
});

export default router;
