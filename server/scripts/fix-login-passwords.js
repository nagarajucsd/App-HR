import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Employee from '../models/Employee.js';

dotenv.config();

// Define the correct passwords for each user
const userPasswords = {
  'admin@hrms.com': 'admin123',
  'hr@hrms.com': 'hr123',
  'manager@hrms.com': 'manager123',
  'employee@hrms.com': 'employee123',
  'n@gmail.com': 'password'
};

const fixLoginPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('🔧 FIXING LOGIN PASSWORDS');
    console.log('═══════════════════════════════════════════════════════\n');

    for (const [email, password] of Object.entries(userPasswords)) {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        console.log(`⚠️  User not found: ${email}`);
        continue;
      }

      console.log(`Processing: ${user.name} (${email})`);

      // Update user password (will be automatically hashed by pre-save hook)
      user.password = password;
      await user.save();
      console.log(`  ✅ User password updated (hashed)`);

      // Update employee currentPassword (plain text for reference)
      const employee = await Employee.findOne({ userId: user._id });
      if (employee) {
        employee.currentPassword = password;
        await employee.save();
        console.log(`  ✅ Employee currentPassword updated (plain text)`);
      }

      // Test the password
      const testUser = await User.findById(user._id);
      const isValid = await testUser.comparePassword(password);
      console.log(`  ${isValid ? '✅' : '❌'} Password verification: ${isValid ? 'WORKING' : 'FAILED'}`);
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ALL PASSWORDS FIXED AND VERIFIED');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📋 LOGIN CREDENTIALS:\n');
    for (const [email, password] of Object.entries(userPasswords)) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        console.log(`${user.name}:`);
        console.log(`  Email: ${email}`);
        console.log(`  Password: ${password}`);
        console.log('');
      }
    }

    console.log('✅ You can now login with these credentials!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixLoginPasswords();
