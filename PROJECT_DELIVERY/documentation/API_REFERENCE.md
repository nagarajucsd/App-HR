# API Reference Documentation

## Base URL

**Development:** `http://localhost:5000/api`  
**Production:** `https://your-domain.com/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Acquisition
Tokens are obtained through the login flow and MFA verification.

### Token Expiration
Tokens expire after 30 days. Implement token refresh logic in production.

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password.

**Access:** Public

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@company.com",
    "role": "Employee",
    "avatarUrl": "https://...",
    "isMfaSetup": true,
    "mfaEnabled": true
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `423` - Account locked
- `403` - Account deactivated

---

#### POST /api/auth/mfa/setup
Setup MFA for a user account.

**Access:** Public (requires userId)

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

**Success Response (200):**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "message": "MFA setup initiated. Scan QR code with authenticator app."
}
```

---

#### POST /api/auth/mfa/verify
Verify MFA code and complete login.

**Access:** Public

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "token": "123456"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@company.com",
    "role": "Employee",
    "avatarUrl": "https://...",
    "isMfaSetup": true
  }
}
```

**Error Response:**
- `401` - Invalid MFA code

---

#### POST /api/auth/mfa/recovery/request
Request MFA recovery code via email.

**Access:** Public

**Request Body:**
```json
{
  "email": "user@company.com"
}
```

**Success Response (200):**
```json
{
  "message": "Recovery code sent to your email"
}
```

---

#### POST /api/auth/mfa/recovery/verify
Verify recovery code and reset MFA.

**Access:** Public

**Request Body:**
```json
{
  "email": "user@company.com",
  "recoveryCode": "ABC123XYZ"
}
```

**Success Response (200):**
```json
{
  "message": "MFA has been reset. Please set up MFA again.",
  "user": { ... }
}
```

---

#### POST /api/auth/forgot-password
Request password reset email.

**Access:** Public

**Request Body:**
```json
{
  "email": "user@company.com"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset email sent"
}
```

---

#### POST /api/auth/reset-password
Reset password with token.

**Access:** Public

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "newPassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successful"
}
```

---

### User Endpoints

#### GET /api/users
Get all users.

**Access:** Private (Admin, HR)

**Query Parameters:**
- `role` (optional) - Filter by role

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "Employee",
    "avatarUrl": "https://...",
    "isActive": true,
    "isMfaSetup": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

#### GET /api/users/:id
Get user by ID.

**Access:** Private

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@company.com",
  "role": "Employee",
  "avatarUrl": "https://...",
  "isActive": true,
  "isMfaSetup": true
}
```

---

#### PUT /api/users/:id
Update user.

**Access:** Private (Admin, HR, or own profile)

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@company.com",
  "role": "Manager"
}
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Updated",
  "email": "john.updated@company.com",
  "role": "Manager"
}
```

---

#### DELETE /api/users/:id
Delete user.

**Access:** Private (Admin only)

**Success Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

### Employee Endpoints

#### GET /api/employees
Get all employees.

**Access:** Private

**Query Parameters:**
- `departmentId` (optional) - Filter by department

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "employeeId": "EMP001",
    "name": "John Doe",
    "email": "john@company.com",
    "phone": "+1234567890",
    "departmentId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Engineering"
    },
    "role": "Software Engineer",
    "joinDate": "2024-01-01T00:00:00.000Z",
    "status": "Active",
    "employeeType": "Permanent",
    "salary": 75000
  }
]
```

---

#### GET /api/employees/:id
Get employee by ID.

**Access:** Private

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "employeeId": "EMP001",
  "name": "John Doe",
  "email": "john@company.com",
  "phone": "+1234567890",
  "departmentId": { ... },
  "userId": { ... },
  "role": "Software Engineer",
  "joinDate": "2024-01-01T00:00:00.000Z",
  "status": "Active",
  "employeeType": "Permanent",
  "salary": 75000
}
```

---

#### POST /api/employees
Create new employee.

**Access:** Private (Admin, HR)

**Request Body:**
```json
{
  "employeeId": "EMP001",
  "name": "John Doe",
  "email": "john@company.com",
  "phone": "+1234567890",
  "departmentId": "507f1f77bcf86cd799439012",
  "role": "Software Engineer",
  "joinDate": "2024-01-01",
  "status": "Active",
  "employeeType": "Permanent",
  "salary": 75000,
  "password": "tempPassword123"
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "employeeId": "EMP001",
  "name": "John Doe",
  ...
}
```

---

#### PUT /api/employees/:id
Update employee.

**Access:** Private (Admin, HR)

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+1234567891",
  "salary": 80000
}
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "employeeId": "EMP001",
  "name": "John Updated",
  ...
}
```

---

#### DELETE /api/employees/:id
Delete employee.

**Access:** Private (Admin only)

**Success Response (200):**
```json
{
  "message": "Employee deleted successfully"
}
```

---

### Department Endpoints

#### GET /api/departments
Get all departments.

**Access:** Private

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Engineering",
    "managerId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Jane Manager"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

#### POST /api/departments
Create new department.

**Access:** Private (Admin, HR)

**Request Body:**
```json
{
  "name": "Engineering",
  "managerId": "507f1f77bcf86cd799439011"
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Engineering",
  "managerId": "507f1f77bcf86cd799439011"
}
```

---

#### PUT /api/departments/:id
Update department.

**Access:** Private (Admin, HR)

**Request Body:**
```json
{
  "name": "Engineering & Technology",
  "managerId": "507f1f77bcf86cd799439013"
}
```

---

#### DELETE /api/departments/:id
Delete department.

**Access:** Private (Admin only)

**Success Response (200):**
```json
{
  "message": "Department deleted successfully"
}
```

---

### Attendance Endpoints

#### GET /api/attendance
Get attendance records.

**Access:** Private

**Query Parameters:**
- `employeeId` (optional) - Filter by employee
- `startDate` (optional) - Filter from date (YYYY-MM-DD)
- `endDate` (optional) - Filter to date (YYYY-MM-DD)

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "employeeId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "date": "2024-11-02",
    "status": "Present",
    "clockIn": "09:00 AM",
    "clockInTimestamp": "2024-11-02T09:00:00.000Z",
    "clockOut": "05:30 PM",
    "clockOutTimestamp": "2024-11-02T17:30:00.000Z",
    "workHours": "8h 30m",
    "workMinutes": 510
  }
]
```

---

#### POST /api/attendance (Clock In)
Create attendance record / clock in.

**Access:** Private

**Request Body:**
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "date": "2024-11-02",
  "status": "Present",
  "clockIn": "09:00 AM",
  "clockInTimestamp": "2024-11-02T09:00:00.000Z"
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "employeeId": { ... },
  "date": "2024-11-02",
  "status": "Present",
  "clockIn": "09:00 AM",
  "clockInTimestamp": "2024-11-02T09:00:00.000Z"
}
```

---

#### PUT /api/attendance/:id (Clock Out)
Update attendance record / clock out.

**Access:** Private

**Request Body:**
```json
{
  "clockOut": "05:30 PM",
  "clockOutTimestamp": "2024-11-02T17:30:00.000Z",
  "workHours": "8h 30m",
  "workMinutes": 510
}
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "clockOut": "05:30 PM",
  "workHours": "8h 30m",
  ...
}
```

---

### Leave Endpoints

#### GET /api/leaves
Get leave requests.

**Access:** Private

**Query Parameters:**
- `employeeId` (optional) - Filter by employee
- `status` (optional) - Filter by status (Pending, Approved, Rejected)

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "employeeId": "507f1f77bcf86cd799439011",
    "employeeName": "John Doe",
    "leaveType": "Annual",
    "startDate": "2024-11-10T00:00:00.000Z",
    "endDate": "2024-11-12T00:00:00.000Z",
    "reason": "Family vacation",
    "status": "Pending",
    "days": 3,
    "createdAt": "2024-11-02T00:00:00.000Z"
  }
]
```

---

#### POST /api/leaves
Create leave request.

**Access:** Private

**Request Body:**
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "employeeName": "John Doe",
  "leaveType": "Annual",
  "startDate": "2024-11-10",
  "endDate": "2024-11-12",
  "reason": "Family vacation",
  "days": 3
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "employeeId": "507f1f77bcf86cd799439011",
  "status": "Pending",
  ...
}
```

---

#### PUT /api/leaves/:id
Update leave request (approve/reject).

**Access:** Private (Admin, HR, Manager)

**Request Body:**
```json
{
  "status": "Approved"
}
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "status": "Approved",
  ...
}
```

---

### Payroll Endpoints

#### GET /api/payroll
Get payroll records.

**Access:** Private

**Query Parameters:**
- `employeeId` (optional) - Filter by employee
- `month` (optional) - Filter by month (0-11)
- `year` (optional) - Filter by year

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "employeeId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "month": 10,
    "year": 2024,
    "basic": 60000,
    "allowances": {
      "hra": 10000,
      "special": 5000
    },
    "deductions": {
      "tax": 8000,
      "providentFund": 5000,
      "absence": 0
    },
    "grossPay": 75000,
    "netPay": 62000,
    "status": "Approved"
  }
]
```

---

#### POST /api/payroll
Generate payroll record.

**Access:** Private (Admin, HR)

**Request Body:**
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "month": 10,
  "year": 2024,
  "basic": 60000,
  "allowances": {
    "hra": 10000,
    "special": 5000
  },
  "deductions": {
    "tax": 8000,
    "providentFund": 5000
  }
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "grossPay": 75000,
  "netPay": 62000,
  "status": "Pending Approval",
  ...
}
```

---

#### PUT /api/payroll/:id/approve
Approve payroll record.

**Access:** Private (Admin, HR)

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "status": "Approved",
  "approvedBy": "507f1f77bcf86cd799439001",
  "approvedAt": "2024-11-02T10:00:00.000Z"
}
```

---

### Notification Endpoints

#### GET /api/notifications
Get user notifications.

**Access:** Private

**Query Parameters:**
- `read` (optional) - Filter by read status (true/false)

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439016",
    "userId": "507f1f77bcf86cd799439011",
    "title": "Leave Request Approved",
    "message": "Your leave request for Nov 10-12 has been approved",
    "read": false,
    "link": "/leaves",
    "createdAt": "2024-11-02T10:00:00.000Z"
  }
]
```

---

#### PUT /api/notifications/:id/read
Mark notification as read.

**Access:** Private

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "read": true
}
```

---

#### PUT /api/notifications/mark-all-read
Mark all notifications as read.

**Access:** Private

**Success Response (200):**
```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

---

### Task Endpoints

#### GET /api/tasks
Get tasks.

**Access:** Private

**Query Parameters:**
- `assignedTo` (optional) - Filter by assignee
- `status` (optional) - Filter by status
- `departmentId` (optional) - Filter by department

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439017",
    "title": "Complete Q4 Report",
    "description": "Prepare and submit quarterly report",
    "priority": "High",
    "status": "In Progress",
    "assignedTo": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "assignedBy": {
      "_id": "507f1f77bcf86cd799439002",
      "name": "Jane Manager"
    },
    "dueDate": "2024-11-15",
    "createdAt": "2024-11-01T00:00:00.000Z"
  }
]
```

---

#### POST /api/tasks
Create task.

**Access:** Private (Admin, HR, Manager)

**Request Body:**
```json
{
  "title": "Complete Q4 Report",
  "description": "Prepare and submit quarterly report",
  "priority": "High",
  "assignedTo": "507f1f77bcf86cd799439011",
  "departmentId": "507f1f77bcf86cd799439012",
  "dueDate": "2024-11-15"
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439017",
  "status": "To Do",
  ...
}
```

---

#### PUT /api/tasks/:id
Update task.

**Access:** Private

**Request Body:**
```json
{
  "status": "Done",
  "priority": "Medium"
}
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439017",
  "status": "Done",
  ...
}
```

---

### Reports Endpoints

#### GET /api/reports/attendance-summary
Get attendance summary report.

**Access:** Private (Admin, HR, Manager)

**Query Parameters:**
- `startDate` (required) - Start date (YYYY-MM-DD)
- `endDate` (required) - End date (YYYY-MM-DD)
- `departmentId` (optional) - Filter by department

**Success Response (200):**
```json
{
  "totalEmployees": 50,
  "presentCount": 45,
  "absentCount": 3,
  "leaveCount": 2,
  "averageAttendance": 90,
  "details": [ ... ]
}
```

---

#### GET /api/reports/leave-summary
Get leave summary report.

**Access:** Private (Admin, HR, Manager)

**Query Parameters:**
- `year` (required) - Year
- `departmentId` (optional) - Filter by department

**Success Response (200):**
```json
{
  "totalLeaveRequests": 120,
  "approvedLeaves": 100,
  "pendingLeaves": 15,
  "rejectedLeaves": 5,
  "leavesByType": {
    "Annual": 60,
    "Sick": 30,
    "Casual": 20,
    "Unpaid": 10
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, token required"
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error"
}
```

---

## Rate Limiting

**Development:** No rate limiting  
**Production:** Implement rate limiting (recommended: 100 requests per 15 minutes per IP)

## CORS Configuration

**Development:** Allows localhost origins  
**Production:** Configure specific allowed origins in environment variables

## Pagination

For endpoints returning large datasets, implement pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Webhooks

Not currently implemented. Consider for future versions for real-time integrations.
