/**
 * Create October 2025 Data for Existing Employees
 * - Attendance records for all working days
 * - Leave requests
 * - Payroll records
 * - Notifications
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Payroll from '../models/Payroll.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hr_management_system';

// Helper function to check if date is weekend
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

// Helper function to generate random time
function randomTime(start, end) {
  const startHour = parseInt(start.split(':')[0]);
  const endHour = parseInt(end.split(':')[0]);
  const hour = startHour + Math.floor(Math.random() * (endHour - startHour));
  const minute = Math.floor(Math.random() * 60);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

// Helper function to calculate work hours
function calculateWorkHours(clockIn, clockOut) {
  // Parse time strings like "09:00 AM"
  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };
  
  const inMinutes = parseTime(clockIn);
  const outMinutes = parseTime(clockOut);
  const diffMinutes = outMinutes - inMinutes;
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  return {
    workHours: `${hours}h ${minutes}m`,
    workMinutes: diffMinutes
  };
}

async function createOctober2025Data() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all existing employees
    console.log('👥 Fetching existing employees...');
    const employees = await Employee.find({ status: 'Active' });
    console.log(`✅ Found ${employees.length} active employees\n`);

    if (employees.length === 0) {
      console.log('❌ No employees found. Please seed the database first.');
      process.exit(1);
    }

    // Display employees
    console.log('📋 Employees:');
    employees.forEach((emp, index) => {
      console.log(`   ${index + 1}. ${emp.name} (${emp.employeeId}) - ${emp.role}`);
    });
    console.log('');

    // October 2025 date range
    const startDate = new Date('2025-10-01');
    const endDate = new Date('2025-10-31');
    
    console.log('📅 Creating October 2025 data...');
    console.log(`   Date range: ${startDate.toDateString()} to ${endDate.toDateString()}\n`);

    // Step 1: Create Attendance Records
    console.log('1️⃣ Creating attendance records...');
    let attendanceCount = 0;
    let leaveCount = 0;

    // Delete existing October 2025 attendance
    const deletedAttendance = await Attendance.deleteMany({
      date: {
        $gte: '2025-10-01',
        $lte: '2025-10-31'
      }
    });
    console.log(`   Deleted ${deletedAttendance.deletedCount} existing October 2025 records`);

    for (const employee of employees) {
      const currentDate = new Date(startDate);
      
      // Randomly assign 2-3 leave days for each employee
      const leaveDays = [];
      const numLeaveDays = Math.floor(Math.random() * 2) + 2; // 2-3 days
      
      while (leaveDays.length < numLeaveDays) {
        const randomDay = Math.floor(Math.random() * 31) + 1;
        const leaveDate = new Date(2025, 9, randomDay); // October is month 9
        
        if (!isWeekend(leaveDate) && !leaveDays.some(d => d.getDate() === randomDay)) {
          leaveDays.push(leaveDate);
        }
      }

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Skip weekends
        if (isWeekend(currentDate)) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        // Check if this is a leave day
        const isLeaveDay = leaveDays.some(d => d.toDateString() === currentDate.toDateString());
        
        let status, clockIn, clockOut, clockInTimestamp, clockOutTimestamp, workHours, workMinutes;
        
        if (isLeaveDay) {
          status = 'Leave';
          leaveCount++;
        } else {
          // 95% present, 5% absent
          const isPresent = Math.random() > 0.05;
          
          if (isPresent) {
            status = 'Present';
            
            // Generate realistic clock in/out times
            const clockInTime = randomTime('08:00', '09:30');
            const clockOutTime = randomTime('17:00', '18:30');
            
            clockIn = clockInTime;
            clockOut = clockOutTime;
            
            // Create timestamps
            clockInTimestamp = new Date(currentDate);
            const [inTime, inPeriod] = clockInTime.split(' ');
            let [inHour, inMin] = inTime.split(':').map(Number);
            if (inPeriod === 'PM' && inHour !== 12) inHour += 12;
            if (inPeriod === 'AM' && inHour === 12) inHour = 0;
            clockInTimestamp.setHours(inHour, inMin, 0, 0);
            
            clockOutTimestamp = new Date(currentDate);
            const [outTime, outPeriod] = clockOutTime.split(' ');
            let [outHour, outMin] = outTime.split(':').map(Number);
            if (outPeriod === 'PM' && outHour !== 12) outHour += 12;
            if (outPeriod === 'AM' && outHour === 12) outHour = 0;
            clockOutTimestamp.setHours(outHour, outMin, 0, 0);
            
            // Calculate work hours
            const workData = calculateWorkHours(clockInTime, clockOutTime);
            workHours = workData.workHours;
            workMinutes = workData.workMinutes;
          } else {
            status = 'Absent';
          }
        }

        await Attendance.create({
          employeeId: employee._id,
          date: dateStr,
          status,
          clockIn,
          clockOut,
          clockInTimestamp,
          clockOutTimestamp,
          workHours,
          workMinutes
        });

        attendanceCount++;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    console.log(`✅ Created ${attendanceCount} attendance records`);
    console.log(`   - ${leaveCount} leave days assigned\n`);

    // Step 2: Create Leave Requests for October 2025
    console.log('2️⃣ Creating leave requests...');
    
    // Delete existing October 2025 leave requests
    const deletedLeaves = await LeaveRequest.deleteMany({
      startDate: {
        $gte: new Date('2025-10-01'),
        $lte: new Date('2025-10-31')
      }
    });
    console.log(`   Deleted ${deletedLeaves.deletedCount} existing October 2025 leave requests`);

    let leaveRequestCount = 0;
    const leaveTypes = ['Annual', 'Sick', 'Casual'];

    for (const employee of employees) {
      // Get this employee's leave days from attendance
      const employeeLeaves = await Attendance.find({
        employeeId: employee._id,
        date: {
          $gte: '2025-10-01',
          $lte: '2025-10-31'
        },
        status: 'Leave'
      }).sort({ date: 1 });

      if (employeeLeaves.length > 0) {
        // Group consecutive leave days
        const leaveGroups = [];
        let currentGroup = [employeeLeaves[0]];

        for (let i = 1; i < employeeLeaves.length; i++) {
          const prevDate = new Date(employeeLeaves[i - 1].date);
          const currDate = new Date(employeeLeaves[i].date);
          const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

          if (dayDiff <= 3) { // Group if within 3 days
            currentGroup.push(employeeLeaves[i]);
          } else {
            leaveGroups.push(currentGroup);
            currentGroup = [employeeLeaves[i]];
          }
        }
        leaveGroups.push(currentGroup);

        // Create leave request for each group
        for (const group of leaveGroups) {
          const startDate = new Date(group[0].date);
          const endDate = new Date(group[group.length - 1].date);
          const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
          
          // 80% approved, 20% pending
          const status = Math.random() > 0.2 ? 'Approved' : 'Pending';

          await LeaveRequest.create({
            employeeId: employee._id,
            employeeName: employee.name,
            leaveType,
            startDate,
            endDate,
            reason: leaveType === 'Sick' 
              ? 'Medical appointment' 
              : leaveType === 'Annual' 
              ? 'Family vacation' 
              : 'Personal matters',
            status,
            days: group.length
          });

          leaveRequestCount++;
        }
      }
    }

    console.log(`✅ Created ${leaveRequestCount} leave requests\n`);

    // Step 3: Create Payroll for October 2025
    console.log('3️⃣ Creating payroll records...');
    
    // Delete existing October 2025 payroll
    const deletedPayroll = await Payroll.deleteMany({
      month: 9, // October is month 9 (0-indexed)
      year: 2025
    });
    console.log(`   Deleted ${deletedPayroll.deletedCount} existing October 2025 payroll`);

    let payrollCount = 0;

    for (const employee of employees) {
      const basic = employee.salary;
      const hra = Math.round(basic * 0.4); // 40% HRA
      const special = Math.round(basic * 0.2); // 20% Special allowance
      
      const grossPay = basic + hra + special;
      
      const tax = Math.round(grossPay * 0.1); // 10% tax
      const providentFund = Math.round(basic * 0.12); // 12% PF
      
      // Calculate absence deduction
      const absences = await Attendance.countDocuments({
        employeeId: employee._id,
        date: {
          $gte: '2025-10-01',
          $lte: '2025-10-31'
        },
        status: 'Absent'
      });
      
      const perDayDeduction = Math.round(basic / 22); // Assuming 22 working days
      const absenceDeduction = absences * perDayDeduction;
      
      const totalDeductions = tax + providentFund + absenceDeduction;
      const netPay = grossPay - totalDeductions;

      await Payroll.create({
        employeeId: employee._id,
        month: 9, // October
        year: 2025,
        basic,
        allowances: {
          hra,
          special
        },
        deductions: {
          tax,
          providentFund,
          absence: absenceDeduction
        },
        grossPay,
        netPay,
        status: 'Approved' // All October payroll approved
      });

      payrollCount++;
    }

    console.log(`✅ Created ${payrollCount} payroll records\n`);

    // Step 4: Create Notifications (mark as read to avoid popups)
    console.log('4️⃣ Creating notifications...');
    
    let notificationCount = 0;
    const users = await User.find();

    for (const user of users) {
      // Find employee for this user
      const employee = employees.find(emp => 
        emp.email === user.email || emp.userId?.toString() === user._id.toString()
      );

      if (employee) {
        // Payroll notification (marked as read)
        await Notification.create({
          userId: user._id,
          title: 'October 2025 Payroll Generated',
          message: 'Your payroll for October 2025 has been processed and approved.',
          read: true, // Mark as read to avoid popups
          link: '/payroll'
        });
        notificationCount++;

        // Leave approval notification (if has approved leaves)
        const approvedLeaves = await LeaveRequest.countDocuments({
          employeeId: employee._id,
          status: 'Approved',
          startDate: {
            $gte: new Date('2025-10-01'),
            $lte: new Date('2025-10-31')
          }
        });

        if (approvedLeaves > 0) {
          await Notification.create({
            userId: user._id,
            title: 'Leave Request Approved',
            message: `Your leave request for October 2025 has been approved.`,
            read: true, // Mark as read to avoid popups
            link: '/leaves'
          });
          notificationCount++;
        }
      }
    }

    console.log(`✅ Created ${notificationCount} notifications (all marked as read)\n`);

    // Summary
    console.log('=' .repeat(60));
    console.log('📊 OCTOBER 2025 DATA CREATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Employees: ${employees.length}`);
    console.log(`✅ Attendance Records: ${attendanceCount}`);
    console.log(`✅ Leave Requests: ${leaveRequestCount}`);
    console.log(`✅ Payroll Records: ${payrollCount}`);
    console.log(`✅ Notifications: ${notificationCount} (all marked as read)`);
    console.log('='.repeat(60));
    console.log('\n✅ October 2025 data created successfully!');
    console.log('📅 Calendar will now show October 2025 with colored dates\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating October 2025 data:', error);
    process.exit(1);
  }
}

// Run the script
createOctober2025Data();
