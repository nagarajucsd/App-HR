import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from '../models/Employee.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const updateEmployeePasswords = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all employees
    const employees = await Employee.find({});
    console.log(`📋 Found ${employees.length} employees`);

    let updated = 0;
    let skipped = 0;

    for (const employee of employees) {
      // Skip if currentPassword is already set
      if (employee.currentPassword && employee.currentPassword !== '') {
        console.log(`⏭️  Skipping ${employee.name} - password already set`);
        skipped++;
        continue;
      }

      // Find the associated user
      const user = await User.findById(employee.userId);
      
      if (!user) {
        console.log(`⚠️  No user found for employee ${employee.name}`);
        continue;
      }

      // Set currentPassword to a placeholder (since we can't decrypt the hashed password)
      // In production, you might want to set this to empty string or a default value
      employee.currentPassword = 'password'; // Default password
      await employee.save();
      
      console.log(`✅ Updated ${employee.name} (${employee.email})`);
      updated++;
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📋 Total: ${employees.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

updateEmployeePasswords();
