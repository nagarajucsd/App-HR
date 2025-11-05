# Database Schema Documentation

## Overview

The HR Management System uses MongoDB as its database, with Mongoose ODM for schema modeling and validation. The database consists of 10 primary collections with relationships established through ObjectId references.

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│  (Auth)     │
└──────┬──────┘
       │ 1:1
       │
┌──────▼──────────┐         ┌──────────────┐
│   Employee      │◄────────┤  Department  │
│                 │  N:1    │              │
└────┬────┬───┬───┘         └──────────────┘
     │    │   │
     │    │   │ 1:N
     │    │   │
     │    │   └──────────────┐
     │    │                  │
     │    │ 1:N         ┌────▼─────────┐
     │    │             │    Task      │
     │    │             └──────────────┘
     │    │
     │    │ 1:N
     │    │
     │    └──────────────┬──────────────┬──────────────┐
     │                   │              │              │
     │              ┌────▼────────┐ ┌──▼──────────┐ ┌─▼──────────┐
     │              │ Attendance  │ │LeaveRequest │ │  Payroll   │
     │              └─────────────┘ └─────────────┘ └────────────┘
     │
     │ 1:N
     │
┌────▼──────────┐
│ Notification  │
└───────────────┘
```

## Collections

### 1. users

Stores authentication and account information for all system users.

**Schema:**
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: String (enum: ['Admin', 'HR', 'Manager', 'Employee'], default: 'Employee'),
  avatarUrl: String,
  isMfaSetup: Boolean (default: false),
  mfaSecret: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  loginAttempts: Number (default: 0),
  lockUntil: Date,
  isActive: Boolean (default: true),
  mfaRecoveryToken: String,
  mfaRecoveryExpire: Date,
  mfaEmailCode: String,
  mfaEmailCodeExpire: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique)

**Virtual Fields:**
- `isLocked`: Computed field checking if account is currently locked

**Security Features:**
- Password hashing with bcrypt (pre-save hook)
- Password comparison method
- Password excluded from JSON responses

**Relationships:**
- 1:1 with Employee (via userId reference)
- 1:N with Notifications

---

### 2. employees

Stores employee profile and work-related information.

**Schema:**
```javascript
{
  _id: ObjectId,
  employeeId: String (required, unique),
  userId: ObjectId (ref: 'User', required),
  name: String (required),
  email: String (required),
  phone: String (required),
  avatarUrl: String,
  departmentId: ObjectId (ref: 'Department', required),
  role: String (required),
  joinDate: Date (required),
  status: String (enum: ['Active', 'Inactive'], default: 'Active'),
  employeeType: String (enum: ['Permanent', 'Contract', 'Intern'], default: 'Permanent'),
  salary: Number (required),
  currentPassword: String (default: ''),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `employeeId` (unique)
- `userId` (for lookups)
- `departmentId` (for department queries)

**Relationships:**
- N:1 with User
- N:1 with Department
- 1:N with Attendance
- 1:N with LeaveRequest
- 1:N with Payroll
- 1:N with Task (as assignee)

---

### 3. departments

Stores organizational department information.

**Schema:**
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  managerId: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `name` (unique)

**Relationships:**
- 1:N with Employee
- 1:N with Task

---

### 4. attendances

Stores daily attendance records with clock in/out times.

**Schema:**
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: 'Employee', required),
  date: String (required, format: 'YYYY-MM-DD'),
  status: String (enum: ['Present', 'Absent', 'Leave', 'Half-Day', 'Not Marked'], default: 'Not Marked'),
  clockIn: String,
  clockInTimestamp: Date,
  clockOut: String,
  clockOutTimestamp: Date,
  workHours: String,
  workMinutes: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound index: `{ employeeId: 1, date: 1 }` (unique)

**Business Rules:**
- One attendance record per employee per day
- Date stored as string to avoid timezone issues
- Work hours calculated from clock in/out timestamps
- Automatically created daily by background job

**Relationships:**
- N:1 with Employee

---

### 5. leaverequests

Stores employee leave applications and their approval status.

**Schema:**
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: 'Employee', required),
  employeeName: String (required),
  leaveType: String (enum: ['Annual', 'Sick', 'Casual', 'Unpaid'], required),
  startDate: Date (required),
  endDate: Date (required),
  reason: String (required),
  status: String (enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending'),
  days: Number (required),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `employeeId` (for employee queries)
- `status` (for filtering)

**Business Rules:**
- Days calculated from start and end dates
- Approved leaves update attendance records
- Notifications created on status change

**Relationships:**
- N:1 with Employee

---

### 6. leavebalances

Stores leave quota and balance for employees.

**Schema:**
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: 'Employee', required),
  year: Number (required),
  leaveType: String (required),
  total: Number (required),
  used: Number (default: 0),
  remaining: Number (required),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound index: `{ employeeId: 1, year: 1, leaveType: 1 }` (unique)

**Business Rules:**
- Updated when leave requests are approved
- Reset annually
- Remaining = Total - Used

**Relationships:**
- N:1 with Employee

---

### 7. payrolls

Stores monthly payroll records with salary breakdown.

**Schema:**
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: 'Employee', required),
  month: Number (required, 0-11),
  year: Number (required),
  basic: Number (required),
  allowances: {
    hra: Number (default: 0),
    special: Number (default: 0)
  },
  deductions: {
    tax: Number (default: 0),
    providentFund: Number (default: 0),
    absence: Number (default: 0)
  },
  grossPay: Number (required),
  netPay: Number (required),
  status: String (enum: ['Generated', 'Pending Approval', 'Approved', 'Rejected', 'Paid'], default: 'Pending Approval'),
  approvedBy: ObjectId (ref: 'User'),
  approvedAt: Date,
  rejectionReason: String,
  payslipUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound index: `{ employeeId: 1, month: 1, year: 1 }` (unique)

**Business Rules:**
- One payroll record per employee per month
- Gross Pay = Basic + Allowances
- Net Pay = Gross Pay - Deductions
- Requires approval workflow

**Relationships:**
- N:1 with Employee
- N:1 with User (approver)

---

### 8. notifications

Stores system notifications for users.

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  title: String (required),
  message: String (required),
  read: Boolean (default: false),
  link: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId` (for user queries)
- `read` (for filtering unread)
- Compound index: `{ userId: 1, read: 1 }` (for efficient queries)

**Business Rules:**
- Created for various system events
- Link provides navigation to related resource
- Marked as read when user views

**Relationships:**
- N:1 with User

---

### 9. tasks

Stores task assignments and tracking.

**Schema:**
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  priority: String (enum: ['Low', 'Medium', 'High'], default: 'Medium'),
  status: String (enum: ['To Do', 'In Progress', 'Done'], default: 'To Do'),
  assignedTo: ObjectId (ref: 'Employee', required),
  assignedBy: ObjectId (ref: 'User', required),
  departmentId: ObjectId (ref: 'Department', required),
  dueDate: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `assignedTo` (for employee queries)
- `departmentId` (for department queries)
- `status` (for filtering)

**Relationships:**
- N:1 with Employee (assignee)
- N:1 with User (assigner)
- N:1 with Department

---

### 10. employeedocuments

Stores employee document metadata and file references.

**Schema:**
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: 'Employee', required),
  documentType: String (required),
  fileName: String (required),
  fileUrl: String (required),
  uploadedBy: ObjectId (ref: 'User', required),
  uploadedAt: Date (default: Date.now),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `employeeId`

**Relationships:**
- N:1 with Employee
- N:1 with User (uploader)

---

## Data Relationships Summary

### One-to-One Relationships
- User ↔ Employee

### One-to-Many Relationships
- Department → Employee
- Employee → Attendance
- Employee → LeaveRequest
- Employee → LeaveBalance
- Employee → Payroll
- Employee → Task (as assignee)
- User → Notification
- User → Task (as assigner)
- Department → Task

### Many-to-One Relationships
- Employee → User
- Employee → Department
- Attendance → Employee
- LeaveRequest → Employee
- Payroll → Employee
- Notification → User
- Task → Employee
- Task → Department

## Indexing Strategy

### Primary Indexes
- All collections have default `_id` index

### Unique Indexes
- `users.email`
- `employees.employeeId`
- `departments.name`
- `attendances.{employeeId, date}` (compound)
- `payrolls.{employeeId, month, year}` (compound)

### Query Optimization Indexes
- `employees.userId`
- `employees.departmentId`
- `attendances.employeeId`
- `leaverequests.employeeId`
- `notifications.userId`
- `notifications.{userId, read}` (compound)
- `tasks.assignedTo`
- `tasks.departmentId`

## Data Integrity Rules

### Referential Integrity
- Foreign key references use ObjectId
- Mongoose populate for joins
- Cascade deletes handled at application level

### Validation Rules
- Required fields enforced at schema level
- Enum values for status fields
- Email format validation
- Date range validation for leave requests
- Salary must be positive number

### Business Logic Constraints
- One attendance record per employee per day
- One payroll record per employee per month
- Leave days must be positive
- Clock out must be after clock in
- End date must be after start date

## Backup and Recovery

### Backup Strategy
- Daily automated backups
- Point-in-time recovery capability
- Backup retention: 30 days

### Recommended Tools
- MongoDB Atlas automated backups
- mongodump for manual backups
- Replica sets for high availability

## Performance Considerations

### Query Optimization
- Use indexes for frequently queried fields
- Limit result sets with pagination
- Use projection to return only needed fields
- Avoid N+1 queries with populate

### Data Growth Management
- Archive old attendance records (> 2 years)
- Archive old payroll records (> 7 years for compliance)
- Implement data retention policies
- Regular index maintenance

### Monitoring
- Track slow queries
- Monitor index usage
- Watch collection sizes
- Alert on unusual growth patterns
