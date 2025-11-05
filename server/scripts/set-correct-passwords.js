import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from '../models/Employee.js';
import User from '../models/User.js';

dotenv.config();

// Define the correct passwords for each user
const userPasswords = {
  'admin@hrms.com': 'admin123',
  'hr@hrms.com': 'hr123',
  'manager@hrms.com': 'manager123',
  'employee@hrms.com': 'employee123',
  'n@gmail.com': 'password'
};

const setCorrectPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('🔄 UPDATING PASSWORDS TO CORRECT VALUES');
    console.log('═══════════════════════════════════════════════════════\n');

    for (const [email, password] of Object.entries(userPasswords)) {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        console.log(`⚠️  User not found: ${email}`);
        continue;
      }

      // Update user password (will be hashed by pre-save hook)
      user.password = password;
      await user.save();

      // Update employee currentPassword
      await Employee.updateOne(
        { userId: user._id },
        { $set: { currentPassword: password } }
      );

      console.log(`✅ Updated ${user.name} (${email})`);
      console.log(`   Password: ${password}\n`);
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ALL PASSWORDS UPDATED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════\n');

    // Display final credentials
    console.log('📋 CURRENT CREDENTIALS:\n');
    const employees = await Employee.find({}).sort({ employeeId: 1 });
    
    employees.forEach(emp => {
      console.log(`${emp.name}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Password: ${emp.currentPassword}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

setCorrectPasswords();
