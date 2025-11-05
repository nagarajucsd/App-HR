import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import employeeRoutes from './routes/employees.js';
import departmentRoutes from './routes/departments.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leaves.js';
import payrollRoutes from './routes/payroll.js';
import notificationRoutes from './routes/notifications.js';
import reportsRoutes from './routes/reports.js';
import apiInfoRoutes from './routes/api-info.js';
import taskRoutes from './routes/tasks.js';
import dailyAttendanceRoutes from './routes/dailyAttendance.js';

// Import jobs
import { scheduleDailyAttendanceJob } from './jobs/dailyAttendanceJob.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// --- CORS Configuration ---
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://hrapp.onrender.com',
  'https://app-hr-nine.vercel.app',  // ✅ your actual frontend
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Required when using secure cookies behind a proxy (like Render)
app.set('trust proxy', 1);

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/info', apiInfoRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/daily-attendance', dailyAttendanceRoutes);

// --- Health check endpoint ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HR Management API is running' });
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start cron job
  scheduleDailyAttendanceJob();
  console.log('✅ Daily attendance job scheduler started');
});
