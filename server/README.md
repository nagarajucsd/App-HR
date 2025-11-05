# HR Management System - Backend API

Complete backend API for the HR Management System built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Multi-factor authentication (MFA) with TOTP
  - Role-based access control (Admin, HR, Manager, Employee)

- **Employee Management**
  - CRUD operations for employees
  - Employee profile management
  - Department assignments

- **Department Management**
  - Create and manage departments
  - Assign department managers

- **Attendance Tracking**
  - Clock in/out functionality
  - Attendance history
  - Work hours calculation

- **Leave Management**
  - Leave request submission
  - Leave approval/rejection workflow
  - Leave balance tracking

- **Payroll System**
  - Automated payroll generation
  - Salary calculations with deductions
  - Payslip generation

- **Notifications**
  - Real-time notifications
  - User-specific notifications

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

3. Start MongoDB:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux with systemd
sudo systemctl start mongod

# On Windows
net start MongoDB
```

4. Seed the database with sample data:
```bash
npm run seed
```

5. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/mfa/setup` - Setup MFA
- `POST /api/auth/mfa/verify` - Verify MFA token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create new department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/:id` - Get attendance by ID
- `POST /api/attendance` - Create attendance record
- `PUT /api/attendance/:id` - Update attendance
- `POST /api/attendance/clock-out` - Clock out
- `DELETE /api/attendance/:id` - Delete attendance

### Leave Requests
- `GET /api/leaves` - Get leave requests
- `GET /api/leaves/balance/:employeeId` - Get leave balance
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/:id` - Update leave request
- `DELETE /api/leaves/:id` - Delete leave request

### Payroll
- `GET /api/payroll` - Get payroll records
- `GET /api/payroll/:id` - Get payroll by ID
- `POST /api/payroll/generate` - Generate payroll
- `PUT /api/payroll/:id` - Update payroll
- `DELETE /api/payroll/:id` - Delete payroll

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Default Test Accounts

After seeding, you can use these accounts:

- **Admin**: admin@hrms.com / password123
- **HR**: hr@hrms.com / password123
- **Manager**: manager@hrms.com / password123
- **Employee**: employee@hrms.com / password123

## Database Schema

### User
- name, email, password, role, avatarUrl, isMfaSetup, mfaSecret

### Employee
- employeeId, userId, name, email, phone, avatarUrl, departmentId, role, joinDate, status, employeeType, salary

### Department
- name, managerId

### Attendance
- employeeId, date, status, clockIn, clockOut, workHours

### LeaveRequest
- employeeId, employeeName, leaveType, startDate, endDate, reason, status, days

### LeaveBalance
- employeeId, balances (array of leave types with total, used, pending)

### Payroll
- employeeId, month, year, basic, allowances, deductions, grossPay, netPay, status

### Notification
- userId, title, message, read, link

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run database seed script
npm run seed
```

## Production

1. Set `NODE_ENV=production` in `.env`
2. Use a proper MongoDB instance (not localhost)
3. Use a strong `JWT_SECRET`
4. Enable HTTPS
5. Set up proper CORS configuration

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## License

ISC
