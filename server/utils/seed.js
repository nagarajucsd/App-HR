import dotenv from 'dotenv';
import mongoose from 'mongoose';
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

// Helper function to generate avatar URL
const generateAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Department.deleteMany({});
    await Attendance.deleteMany({});
    await LeaveRequest.deleteMany({});
    await LeaveBalance.deleteMany({});
    await Payroll.deleteMany({});
    await Notification.deleteMany({});

    console.log('Creating departments...');
    // Create departments
    const departments = await Department.create([
      { name: 'Engineering' },
      { name: 'Human Resources' },
      { name: 'Sales' },
      { name: 'Marketing' }
    ]);

    console.log('Creating users...');
    // Create users
    const adminUser = await User.create({
      name: 'Alex Admin',
      email: 'admin@hrms.com',
      password: 'password123',
      role: 'Admin',
      avatarUrl: generateAvatar('Alex Admin'),
      isMfaSetup: false,
      mfaSecret: 'JBSWY3DPEHPK3PXP'
    });

    const hrUser = await User.create({
      name: 'Harriet HR',
      email: 'hr@hrms.com',
      password: 'password123',
      role: 'HR',
      avatarUrl: generateAvatar('Harriet HR'),
      isMfaSetup: false,
      mfaSecret: 'KRSXG5CTMVRXEZL1'
    });

    const managerUser = await User.create({
      name: 'Mandy Manager',
      email: 'manager@hrms.com',
      password: 'password123',
      role: 'Manager',
      avatarUrl: generateAvatar('Mandy Manager'),
      isMfaSetup: false,
      mfaSecret: 'LBSWY3DPEHPK3PXP'
    });

    const employeeUser = await User.create({
      name: 'Eva Employee',
      email: 'employee@hrms.com',
      password: 'password123',
      role: 'Employee',
      avatarUrl: generateAvatar('Eva Employee'),
      isMfaSetup: false,
      mfaSecret: 'MBRWG5CTMVRXEZL2'
    });

    // Update departments with managers
    departments[0].managerId = managerUser._id; // Engineering
    departments[1].managerId = hrUser._id; // HR
    await departments[0].save();
    await departments[1].save();

    console.log('Creating employees...');
    // Create employee records
    const employees = await Employee.create([
      {
        employeeId: 'ADM001',
        userId: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        phone: '555-ADMIN',
        avatarUrl: adminUser.avatarUrl,
        departmentId: departments[1]._id, // HR
        role: 'System Administrator',
        joinDate: new Date('2020-01-01'),
        status: 'Active',
        employeeType: 'Permanent',
        salary: 110000
      },
      {
        employeeId: 'HR001',
        userId: hrUser._id,
        name: hrUser.name,
        email: hrUser.email,
        phone: '555-HR',
        avatarUrl: hrUser.avatarUrl,
        departmentId: departments[1]._id, // HR
        role: 'Senior HR Generalist',
        joinDate: new Date('2021-02-15'),
        status: 'Active',
        employeeType: 'Permanent',
        salary: 78000
      },
      {
        employeeId: 'MGR001',
        userId: managerUser._id,
        name: managerUser.name,
        email: managerUser.email,
        phone: '555-MANAGER',
        avatarUrl: managerUser.avatarUrl,
        departmentId: departments[0]._id, // Engineering
        role: 'Engineering Manager',
        joinDate: new Date('2021-09-01'),
        status: 'Active',
        employeeType: 'Permanent',
        salary: 105000
      },
      {
        employeeId: 'EMP004',
        userId: employeeUser._id,
        name: employeeUser.name,
        email: employeeUser.email,
        phone: '456-789-0123',
        avatarUrl: employeeUser.avatarUrl,
        departmentId: departments[0]._id, // Engineering
        role: 'Software Engineer',
        joinDate: new Date('2023-03-12'),
        status: 'Active',
        employeeType: 'Permanent',
        salary: 75000
      }
    ]);

    console.log('Creating leave balances...');
    // Create leave balances for all employees (unlimited)
    const leaveBalances = await LeaveBalance.create(
      employees.map(emp => ({
        employeeId: emp._id,
        balances: [
          { type: 'Annual', total: 999, used: Math.floor(Math.random() * 5), pending: 0 },
          { type: 'Sick', total: 999, used: Math.floor(Math.random() * 3), pending: 0 },
          { type: 'Casual', total: 999, used: Math.floor(Math.random() * 2), pending: 0 },
          { type: 'Unpaid', total: 999, used: 0, pending: 0 }
        ]
      }))
    );

    console.log('Creating attendance records...');
    // Create attendance records for the past 30 days
    const today = new Date();
    const attendanceRecords = [];

    for (const emp of employees) {
      for (let i = 30; i >= 1; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const random = Math.random();
        let status = 'Present';
        
        if (random < 0.05) {
          status = 'Absent';
        } else if (random < 0.08) {
          status = 'Leave';
        }

        if (status === 'Present') {
          attendanceRecords.push({
            employeeId: emp._id,
            date: date,
            status: status,
            clockIn: '09:00 AM',
            clockOut: '05:30 PM',
            workHours: '08:30:00'
          });
        } else {
          attendanceRecords.push({
            employeeId: emp._id,
            date: date,
            status: status
          });
        }
      }
    }

    await Attendance.create(attendanceRecords);

    console.log('Creating leave requests...');
    // Create some leave requests
    const futureDate1 = new Date(today);
    futureDate1.setDate(futureDate1.getDate() + 5);
    
    const futureDate2 = new Date(today);
    futureDate2.setDate(futureDate2.getDate() + 10);
    
    const futureDate3 = new Date(today);
    futureDate3.setDate(futureDate3.getDate() + 12);

    await LeaveRequest.create([
      {
        employeeId: employees[3]._id,
        employeeName: employees[3].name,
        leaveType: 'Casual',
        startDate: futureDate1,
        endDate: futureDate1,
        reason: 'Personal commitment',
        status: 'Pending',
        days: 1
      },
      {
        employeeId: employees[2]._id,
        employeeName: employees[2].name,
        leaveType: 'Annual',
        startDate: futureDate2,
        endDate: futureDate3,
        reason: 'Vacation',
        status: 'Pending',
        days: 3
      }
    ]);

    console.log('Creating notifications...');
    // Create some notifications
    await Notification.create([
      {
        userId: adminUser._id,
        title: 'System Update',
        message: 'The HRMS system has been successfully configured.',
        read: false
      },
      {
        userId: employeeUser._id,
        title: 'Welcome',
        message: 'Welcome to the HR Management System!',
        read: false,
        link: 'Dashboard'
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@hrms.com / password123');
    console.log('HR: hr@hrms.com / password123');
    console.log('Manager: manager@hrms.com / password123');
    console.log('Employee: employee@hrms.com / password123');
    console.log('\nAll accounts have MFA disabled for easier testing.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
