import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from '../models/Notification.js';

dotenv.config();

const cleanupDuplicateNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('🧹 CLEANING UP DUPLICATE NOTIFICATIONS');
    console.log('═══════════════════════════════════════════════════════\n');

    // Get all notifications
    const allNotifications = await Notification.find({}).sort({ createdAt: -1 });
    console.log(`📋 Total notifications: ${allNotifications.length}\n`);

    // Group by userId and message
    const groups = {};
    allNotifications.forEach(notif => {
      const key = `${notif.userId}_${notif.message}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(notif);
    });

    // Find duplicates (groups with more than 1 notification)
    let duplicatesFound = 0;
    let duplicatesRemoved = 0;

    for (const key in groups) {
      const group = groups[key];
      if (group.length > 1) {
        duplicatesFound += group.length - 1;
        
        // Keep the most recent one, delete the rest
        const toKeep = group[0]; // Already sorted by createdAt desc
        const toDelete = group.slice(1);
        
        console.log(`Found ${group.length} duplicates:`);
        console.log(`  Message: "${toKeep.message.substring(0, 50)}..."`);
        console.log(`  Keeping: ${toKeep.createdAt}`);
        console.log(`  Deleting: ${toDelete.length} older copies`);
        
        // Delete duplicates
        const deleteIds = toDelete.map(n => n._id);
        await Notification.deleteMany({ _id: { $in: deleteIds } });
        duplicatesRemoved += toDelete.length;
        console.log('');
      }
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 CLEANUP SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`Total notifications before: ${allNotifications.length}`);
    console.log(`Duplicates found: ${duplicatesFound}`);
    console.log(`Duplicates removed: ${duplicatesRemoved}`);
    console.log(`Total notifications after: ${allNotifications.length - duplicatesRemoved}\n`);

    if (duplicatesRemoved > 0) {
      console.log('✅ Duplicate notifications cleaned up successfully!');
    } else {
      console.log('✅ No duplicate notifications found!');
    }
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanupDuplicateNotifications();
