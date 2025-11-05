# System Architecture

## Overview

The HR Management System follows a modern three-tier architecture pattern with clear separation between presentation, business logic, and data layers. The system is built as a full-stack JavaScript application using React for the frontend and Node.js/Express for the backend, with MongoDB as the database.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │         React Application (Port 5173)              │     │
│  │  - TypeScript Components                           │     │
│  │  - State Management                                │     │
│  │  - Routing & Navigation                            │     │
│  │  - UI/UX Layer                                     │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │ (Axios HTTP Client)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │      Express.js Server (Port 5000)                 │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────┐     │     │
│  │  │         Middleware Layer                 │     │     │
│  │  │  - CORS                                  │     │     │
│  │  │  - Body Parser                           │     │     │
│  │  │  - Authentication (JWT)                  │     │     │
│  │  │  - Authorization (Role-based)            │     │     │
│  │  │  - Error Handling                        │     │     │
│  │  └──────────────────────────────────────────┘     │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────┐     │     │
│  │  │         API Routes                       │     │     │
│  │  │  /api/auth          - Authentication     │     │     │
│  │  │  /api/users         - User Management    │     │     │
│  │  │  /api/employees     - Employee CRUD      │     │     │
│  │  │  /api/departments   - Department CRUD    │     │     │
│  │  │  /api/attendance    - Attendance Tracking│     │     │
│  │  │  /api/leaves        - Leave Management   │     │     │
│  │  │  /api/payroll       - Payroll Processing │     │     │
│  │  │  /api/notifications - Notifications      │     │     │
│  │  │  /api/tasks         - Task Management    │     │     │
│  │  │  /api/reports       - Reports & Analytics│     │     │
│  │  └──────────────────────────────────────────┘     │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────┐     │     │
│  │  │      Business Logic Layer                │     │     │
│  │  │  - Controllers                           │     │     │
│  │  │  - Services                              │     │     │
│  │  │  - Validators                            │     │     │
│  │  │  - Utilities                             │     │     │
│  │  └──────────────────────────────────────────┘     │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────┐     │     │
│  │  │      Background Jobs                     │     │     │
│  │  │  - Daily Attendance Creation (Cron)      │     │     │
│  │  │  - Email Notifications                   │     │     │
│  │  └──────────────────────────────────────────┘     │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │         MongoDB Database                           │     │
│  │                                                     │     │
│  │  Collections:                                      │     │
│  │  - users                                           │     │
│  │  - employees                                       │     │
│  │  - departments                                     │     │
│  │  - attendances                                     │     │
│  │  - leaverequests                                   │     │
│  │  - leavebalances                                   │     │
│  │  - payrolls                                        │     │
│  │  - notifications                                   │     │
│  │  - tasks                                           │     │
│  │  - exitinterviews                                  │     │
│  │  - employeedocuments                               │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Backups & Replication
                            ▼
                    [Cloud Storage / Backup]
```

## Component Details

### 1. Client Layer (Frontend)

**Technology Stack:**
- React 19.2.0 with TypeScript
- Vite for build tooling
- Axios for HTTP requests

**Key Components:**
- **Authentication Components**: Login, MFA setup, password reset
- **Dashboard Components**: Employee stats, live timer, analytics
- **Layout Components**: Sidebar navigation, topbar with notifications
- **Feature Components**: Employee management, attendance, leave, payroll
- **Common Components**: Forms, modals, tables, notifications

**State Management:**
- React hooks (useState, useEffect, useContext)
- Local storage for JWT tokens
- Context API for global state

**Routing:**
- Client-side routing with React Router
- Protected routes with authentication guards
- Role-based route access control

### 2. Application Layer (Backend)

**Technology Stack:**
- Node.js runtime
- Express.js framework
- Mongoose ODM

**Architecture Pattern:**
- MVC (Model-View-Controller) pattern
- RESTful API design
- Middleware-based request processing

**Key Modules:**

#### Authentication & Authorization
- JWT-based stateless authentication
- Token generation and validation
- Role-based access control (RBAC)
- MFA with TOTP (Time-based One-Time Password)
- Account lockout mechanism

#### API Routes
Each route module handles specific domain logic:
- **auth.js**: Login, logout, MFA, password reset
- **users.js**: User account management
- **employees.js**: Employee CRUD operations
- **departments.js**: Department management
- **attendance.js**: Clock in/out, attendance records
- **leaves.js**: Leave requests and approvals
- **payroll.js**: Salary calculations and records
- **notifications.js**: Real-time notifications
- **tasks.js**: Task assignment and tracking
- **reports.js**: Analytics and reporting

#### Middleware Stack
1. **CORS**: Cross-origin resource sharing configuration
2. **Body Parser**: JSON and URL-encoded request parsing
3. **Authentication**: JWT token verification
4. **Authorization**: Role-based permission checks
5. **Validation**: Request data validation
6. **Error Handling**: Centralized error management

#### Background Jobs
- **Daily Attendance Job**: Automatically creates attendance records at midnight
- **Email Service**: Sends notifications and alerts
- **Scheduled Tasks**: Cron-based automation

### 3. Data Layer (Database)

**Technology:**
- MongoDB (NoSQL document database)
- Mongoose ODM for schema modeling

**Database Design:**
- Document-based storage
- Embedded and referenced relationships
- Indexes for query optimization
- Compound indexes for unique constraints

**Data Models:**
- **User**: Authentication and account information
- **Employee**: Employee profile and work details
- **Department**: Organizational structure
- **Attendance**: Daily attendance records
- **LeaveRequest**: Leave applications
- **LeaveBalance**: Leave quota tracking
- **Payroll**: Salary and payment records
- **Notification**: System notifications
- **Task**: Task assignments
- **ExitInterview**: Exit process data

## Data Flow

### 1. Authentication Flow

```
User Login Request
    ↓
Frontend (React) → POST /api/auth/login
    ↓
Backend validates credentials
    ↓
Check MFA status
    ↓
If MFA enabled → Request TOTP code
    ↓
Validate TOTP
    ↓
Generate JWT token
    ↓
Return token + user data
    ↓
Frontend stores token in localStorage
    ↓
Include token in subsequent requests (Authorization header)
```

### 2. Attendance Clock-In Flow

```
Employee clicks "Clock In"
    ↓
Frontend → POST /api/attendance/clock-in
    ↓
Backend verifies JWT token
    ↓
Check if already clocked in today
    ↓
Create/Update attendance record
    ↓
Record clock-in timestamp
    ↓
Return updated attendance data
    ↓
Frontend updates UI with timer
    ↓
Background job tracks work hours
```

### 3. Leave Request Flow

```
Employee submits leave request
    ↓
Frontend → POST /api/leaves
    ↓
Backend validates request
    ↓
Check leave balance (if applicable)
    ↓
Create leave request (status: Pending)
    ↓
Create notification for manager
    ↓
Manager receives notification
    ↓
Manager approves/rejects
    ↓
Update leave request status
    ↓
Update attendance records for leave dates
    ↓
Notify employee of decision
```

### 4. Real-Time Notification Flow

```
System Event (e.g., leave approval)
    ↓
Create notification document in DB
    ↓
Notification includes:
  - User ID
  - Message
  - Type
  - Link
  - Timestamp
    ↓
Frontend polls /api/notifications
    ↓
Update notification badge count
    ↓
Display in notification dropdown
    ↓
User clicks notification
    ↓
Mark as read
    ↓
Navigate to relevant page
```

## Security Architecture

### Authentication Security
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with expiration
- Secure token storage (httpOnly cookies recommended for production)
- MFA with TOTP for additional security

### Authorization Security
- Role-based access control (Admin, HR, Manager, Employee)
- Route-level permission checks
- Resource-level authorization

### Data Security
- Input validation and sanitization
- SQL injection prevention (NoSQL injection for MongoDB)
- XSS protection
- CSRF protection (for production)

### Account Security
- Account lockout after 5 failed login attempts
- Password reset with time-limited tokens
- MFA recovery codes
- Email verification for sensitive operations

## Scalability Considerations

### Horizontal Scaling
- Stateless API design (JWT tokens)
- Load balancer compatible
- Session-less architecture

### Database Scaling
- MongoDB replica sets for high availability
- Sharding for large datasets
- Indexes for query performance

### Caching Strategy
- Client-side caching with localStorage
- API response caching (Redis recommended for production)
- Static asset caching

### Performance Optimization
- Database query optimization with indexes
- Pagination for large datasets
- Lazy loading for frontend components
- Code splitting with Vite

## Deployment Architecture

### Development Environment
```
Developer Machine
├── Frontend (Vite Dev Server) - Port 5173
├── Backend (Node.js) - Port 5000
└── MongoDB (Local) - Port 27017
```

### Production Environment
```
Cloud Infrastructure
├── Frontend (CDN/Static Hosting)
│   └── Vercel / Netlify / AWS S3 + CloudFront
├── Backend (Container/VM)
│   └── AWS EC2 / Azure VM / DigitalOcean
│   └── PM2 Process Manager
│   └── Nginx Reverse Proxy
└── Database (Managed Service)
    └── MongoDB Atlas / AWS DocumentDB
```

## Monitoring & Logging

### Application Monitoring
- Error logging with stack traces
- API request/response logging
- Performance metrics

### Database Monitoring
- Query performance tracking
- Connection pool monitoring
- Storage usage alerts

### Security Monitoring
- Failed login attempt tracking
- Suspicious activity detection
- Access log analysis

## Technology Choices Rationale

**React**: Component-based architecture, large ecosystem, excellent TypeScript support

**Node.js/Express**: JavaScript full-stack, non-blocking I/O, extensive middleware ecosystem

**MongoDB**: Flexible schema, horizontal scalability, JSON-like documents match JavaScript objects

**JWT**: Stateless authentication, scalable, works well with microservices

**TypeScript**: Type safety, better IDE support, reduced runtime errors

**Vite**: Fast build times, modern tooling, excellent developer experience
