/**
 * Daily Attendance Job
 * 
 * This job automatically creates attendance records for all active employees
 * every day. It runs at a scheduled time (e.g., 9:00 AM) to mark employees
 * as "NotMarked" initially, which can be updated to "Present", "Absent", etc.
 * 
 * Features:
 * - Creates attendance records for all active employees
 * - Runs automatically every day
 * - Skips if record already exists
 * - Marks as "NotMarked" by default
 * - Can be manually triggered via API
 */

import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * Create daily attendance records for all active employees
 */
export const createDailyAttendanceRecords = async () => {
  try {
    console.log('🔄 Starting daily attendance job...');
    
    const todayDate = getTodayDate();
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log(`⏭️  Skipping attendance creation - Today is ${dayOfWeek === 0 ? 'Sunday' : 'Saturday'}`);
      return {
        success: true,
        skipped: true,
        reason: 'Weekend',
        date: todayDate,
        dayOfWeek: dayOfWeek === 0 ? 'Sunday' : 'Saturday'
      };
    }
    
    console.log(`📅 Creating attendance records for: ${todayDate} (Weekday)`);
    
    // Get all active employees
    const employees = await Employee.find({ isActive: true });
    console.log(`👥 Found ${employees.length} active employees`);
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const employee of employees) {
      try {
        // Check if attendance already exists for this employee today
        const existingAttendance = await Attendance.findOne({
          employeeId: employee._id,
          date: todayDate
        });
        
        if (existingAttendance) {
          skipped++;
          continue;
        }
        
        // Create new attendance record with "NotMarked" status
        await Attendance.create({
          employeeId: employee._id,
          date: todayDate,
          status: 'NotMarked',
          clockIn: null,
          clockOut: null,
          workHours: null,
          workMinutes: 0
        });
        
        created++;
      } catch (error) {
        console.error(`❌ Error creating attendance for employee ${employee._id}:`, error.message);
        errors++;
      }
    }
    
    console.log('✅ Daily attendance job completed:');
    console.log(`   📝 Created: ${created} records`);
    console.log(`   ⏭️  Skipped: ${skipped} records (already exist)`);
    console.log(`   ❌ Errors: ${errors} records`);
    
    return {
      success: true,
      date: todayDate,
      created,
      skipped,
      errors,
      total: employees.length
    };
  } catch (error) {
    console.error('❌ Daily attendance job failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Schedule daily attendance job
 * Runs every day at 9:00 AM
 */
export const scheduleDailyAttendanceJob = () => {
  // Calculate milliseconds until next 9:00 AM
  const now = new Date();
  const next9AM = new Date();
  next9AM.setHours(9, 0, 0, 0);
  
  // If it's already past 9 AM today, schedule for tomorrow
  if (now >= next9AM) {
    next9AM.setDate(next9AM.getDate() + 1);
  }
  
  const msUntilNext9AM = next9AM.getTime() - now.getTime();
  
  console.log(`⏰ Daily attendance job scheduled for: ${next9AM.toLocaleString()}`);
  
  // Schedule first run
  setTimeout(() => {
    createDailyAttendanceRecords();
    
    // Then run every 24 hours
    setInterval(createDailyAttendanceRecords, 24 * 60 * 60 * 1000);
  }, msUntilNext9AM);
};

/**
 * Create attendance records for a specific date
 * Useful for backfilling historical data
 */
export const createAttendanceForDate = async (dateString) => {
  try {
    console.log(`🔄 Creating attendance records for: ${dateString}`);
    
    // Check if the date is a weekend
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log(`⏭️  Skipping ${dateString} - It's a ${dayOfWeek === 0 ? 'Sunday' : 'Saturday'}`);
      return {
        success: true,
        skipped: true,
        reason: 'Weekend',
        date: dateString,
        dayOfWeek: dayOfWeek === 0 ? 'Sunday' : 'Saturday'
      };
    }
    
    // Get all active employees
    const employees = await Employee.find({ isActive: true });
    
    let created = 0;
    let skipped = 0;
    
    for (const employee of employees) {
      // Check if attendance already exists
      const existingAttendance = await Attendance.findOne({
        employeeId: employee._id,
        date: dateString
      });
      
      if (existingAttendance) {
        skipped++;
        continue;
      }
      
      // Create new attendance record
      await Attendance.create({
        employeeId: employee._id,
        date: dateString,
        status: 'NotMarked',
        clockIn: null,
        clockOut: null,
        workHours: null,
        workMinutes: 0
      });
      
      created++;
    }
    
    console.log(`✅ Created ${created} records, skipped ${skipped} for ${dateString}`);
    
    return { success: true, created, skipped };
  } catch (error) {
    console.error(`❌ Error creating attendance for ${dateString}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Backfill attendance records for a date range
 * Useful for creating historical attendance data
 * Automatically skips weekends (Saturday & Sunday)
 */
export const backfillAttendanceRecords = async (startDate, endDate) => {
  try {
    console.log(`🔄 Backfilling attendance from ${startDate} to ${endDate} (weekdays only)`);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const results = [];
    
    // Loop through each date
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      // createAttendanceForDate now handles weekend checking internally
      const result = await createAttendanceForDate(dateString);
      results.push({ date: dateString, ...result });
    }
    
    const totalCreated = results.reduce((sum, r) => sum + (r.created || 0), 0);
    const totalSkipped = results.reduce((sum, r) => sum + (r.skipped || 0), 0);
    const weekendDays = results.filter(r => r.reason === 'Weekend').length;
    
    console.log(`✅ Backfill completed: ${totalCreated} created, ${totalSkipped} skipped (${weekendDays} weekend days)`);
    
    return {
      success: true,
      totalCreated,
      totalSkipped,
      weekendDays,
      results
    };
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    return { success: false, error: error.message };
  }
};

export default {
  createDailyAttendanceRecords,
  scheduleDailyAttendanceJob,
  createAttendanceForDate,
  backfillAttendanceRecords
};
