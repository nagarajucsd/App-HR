import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import LeaveBalance from '../models/LeaveBalance.js';
import Payroll from '../models/Payroll.js';
import Notification from '../models/Notification.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing all collections...');
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Department.deleteMany({}),
      Attendance.deleteMany({}),
      LeaveRequest.deleteMany({}),
      LeaveBalance.deleteMany({}),
      Payroll.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('✅ All collections cleared successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
