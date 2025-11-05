/**
 * Clear All Demo Data
 * Use this script when client wants to start fresh with their own data
 * 
 * This will DELETE:
 * - All demo users
 * - All demo employees
 * - All attendance records
 * - All leave requests
 * - All payroll records
 * - All notifications
 * - All tasks
 * - All departments (optional)
 * 
 * This will KEEP:
 * - Database structure (collections and indexes)
 * - Application code
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import LeaveBalance from '../models/LeaveBalance.js';
import Payroll from '../models/Payroll.js';
import Notification from '../models/Notification.js';
import Task from '../models/Task.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hr_management_system';

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function clearDemoData() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('⚠️  CLEAR DEMO DATA - WARNING');
    console.log('='.repeat(60));
    console.log('\nThis script will DELETE ALL demo data from the database:');
    console.log('  ❌ All users');
    console.log('  ❌ All employees');
    console.log('  ❌ All attendance records');
    console.log('  ❌ All leave requests');
    console.log('  ❌ All payroll records');
    console.log('  ❌ All notifications');
    console.log('  ❌ All tasks');
    console.log('  ❌ All exit interviews');
    console.log('\nOptional:');
    console.log('  ⚠️  All departments (you can choose to keep)');
    console.log('\nThis action CANNOT be undone!\n');

    const confirm1 = await question('Are you sure you want to continue? (yes/no): ');
    
    if (confirm1.toLowerCase() !== 'yes') {
      console.log('\n❌ Operation cancelled.\n');
      rl.close();
      process.exit(0);
    }

    const confirm2 = await question('\nType "DELETE ALL DATA" to confirm: ');
    
    if (confirm2 !== 'DELETE ALL DATA') {
      console.log('\n❌ Confirmation failed. Operation cancelled.\n');
      rl.close();
      process.exit(0);
    }

    const keepDepartments = await question('\nDo you want to KEEP departments? (yes/no): ');
    const shouldKeepDepartments = keepDepartments.toLowerCase() === 'yes';

    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🗑️  Starting data deletion...\n');

    // Count records before deletion
    const counts = {
      users: await User.countDocuments(),
      employees: await Employee.countDocuments(),
      departments: await Department.countDocuments(),
      attendance: await Attendance.countDocuments(),
      leaveRequests: await LeaveRequest.countDocuments(),
      leaveBalances: await LeaveBalance.countDocuments(),
      payroll: await Payroll.countDocuments(),
      notifications: await Notification.countDocuments(),
      tasks: await Task.countDocuments()
    };

    console.log('📊 Current data count:');
    console.log(`   Users: ${counts.users}`);
    console.log(`   Employees: ${counts.employees}`);
    console.log(`   Departments: ${counts.departments}`);
    console.log(`   Attendance: ${counts.attendance}`);
    console.log(`   Leave Requests: ${counts.leaveRequests}`);
    console.log(`   Leave Balances: ${counts.leaveBalances}`);
    console.log(`   Payroll: ${counts.payroll}`);
    console.log(`   Notifications: ${counts.notifications}`);
    console.log(`   Tasks: ${counts.tasks}`);
    console.log('');

    // Delete data
    console.log('1️⃣ Deleting notifications...');
    await Notification.deleteMany({});
    console.log('✅ Deleted all notifications\n');

    console.log('2️⃣ Deleting tasks...');
    await Task.deleteMany({});
    console.log('✅ Deleted all tasks\n');

    console.log('3️⃣ Deleting payroll records...');
    await Payroll.deleteMany({});
    console.log('✅ Deleted all payroll records\n');

    console.log('4️⃣ Deleting leave balances...');
    await LeaveBalance.deleteMany({});
    console.log('✅ Deleted all leave balances\n');

    console.log('5️⃣ Deleting leave requests...');
    await LeaveRequest.deleteMany({});
    console.log('✅ Deleted all leave requests\n');

    console.log('6️⃣ Deleting attendance records...');
    await Attendance.deleteMany({});
    console.log('✅ Deleted all attendance records\n');

    console.log('8️⃣ Deleting employees...');
    await Employee.deleteMany({});
    console.log('✅ Deleted all employees\n');

    if (!shouldKeepDepartments) {
      console.log('9️⃣ Deleting departments...');
      await Department.deleteMany({});
      console.log('✅ Deleted all departments\n');
    } else {
      console.log('9️⃣ Keeping departments (as requested)\n');
    }

    console.log('🔟 Deleting users...');
    await User.deleteMany({});
    console.log('✅ Deleted all users\n');

    // Verify deletion
    const finalCounts = {
      users: await User.countDocuments(),
      employees: await Employee.countDocuments(),
      departments: await Department.countDocuments(),
      attendance: await Attendance.countDocuments(),
      leaveRequests: await LeaveRequest.countDocuments(),
      leaveBalances: await LeaveBalance.countDocuments(),
      payroll: await Payroll.countDocuments(),
      notifications: await Notification.countDocuments(),
      tasks: await Task.countDocuments()
    };

    console.log('='.repeat(60));
    console.log('📊 DELETION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Users: ${counts.users} → ${finalCounts.users}`);
    console.log(`Employees: ${counts.employees} → ${finalCounts.employees}`);
    console.log(`Departments: ${counts.departments} → ${finalCounts.departments}`);
    console.log(`Attendance: ${counts.attendance} → ${finalCounts.attendance}`);
    console.log(`Leave Requests: ${counts.leaveRequests} → ${finalCounts.leaveRequests}`);
    console.log(`Leave Balances: ${counts.leaveBalances} → ${finalCounts.leaveBalances}`);
    console.log(`Payroll: ${counts.payroll} → ${finalCounts.payroll}`);
    console.log(`Notifications: ${counts.notifications} → ${finalCounts.notifications}`);
    console.log(`Tasks: ${counts.tasks} → ${finalCounts.tasks}`);
    console.log('='.repeat(60));
    console.log('\n✅ All demo data has been cleared!\n');
    console.log('📝 Next steps:');
    console.log('   1. Create your first admin user');
    console.log('   2. Add departments (if you deleted them)');
    console.log('   3. Add employees');
    console.log('   4. Start using the system with real data\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error clearing demo data:', error);
    rl.close();
    process.exit(1);
  }
}

// Run the script
clearDemoData();
