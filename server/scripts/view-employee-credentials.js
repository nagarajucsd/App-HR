import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from '../models/Employee.js';

dotenv.config();

const viewEmployeeCredentials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const employees = await Employee.find({}).sort({ employeeId: 1 });
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                  EMPLOYEE CREDENTIALS DATABASE                 ');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.name}`);
      console.log(`   ├─ Employee ID: ${emp.employeeId}`);
      console.log(`   ├─ Email: ${emp.email}`);
      console.log(`   ├─ Password: ${emp.currentPassword || '(not set)'}`);
      console.log(`   ├─ Role: ${emp.role}`);
      console.log(`   ├─ Status: ${emp.status}`);
      console.log(`   └─ Department: ${emp.departmentId}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Total Employees: ${employees.length}`);
    console.log(`With Credentials: ${employees.filter(e => e.currentPassword).length}`);
    console.log(`Missing Credentials: ${employees.filter(e => !e.currentPassword).length}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

viewEmployeeCredentials();
