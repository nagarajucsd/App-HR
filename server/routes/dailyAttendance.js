/**
 * Daily Attendance Routes
 * 
 * API endpoints for managing automatic daily attendance creation
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createDailyAttendanceRecords,
  createAttendanceForDate,
  backfillAttendanceRecords
} from '../jobs/dailyAttendanceJob.js';

const router = express.Router();

// @route   POST /api/daily-attendance/create-today
// @desc    Manually trigger daily attendance creation for today
// @access  Private (Admin, HR)
router.post('/create-today', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const result = await createDailyAttendanceRecords();
    
    if (result.success) {
      res.json({
        message: 'Daily attendance records created successfully',
        ...result
      });
    } else {
      res.status(500).json({
        message: 'Failed to create daily attendance records',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Create today attendance error:', error);
    res.status(500).json({ message: 'Server error creating daily attendance' });
  }
});

// @route   POST /api/daily-attendance/create-date
// @desc    Create attendance records for a specific date
// @access  Private (Admin, HR)
router.post('/create-date', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required (YYYY-MM-DD format)' });
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    const result = await createAttendanceForDate(date);
    
    if (result.success) {
      res.json({
        message: `Attendance records created for ${date}`,
        ...result
      });
    } else {
      res.status(500).json({
        message: `Failed to create attendance records for ${date}`,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Create date attendance error:', error);
    res.status(500).json({ message: 'Server error creating attendance for date' });
  }
});

// @route   POST /api/daily-attendance/backfill
// @desc    Backfill attendance records for a date range
// @access  Private (Admin, HR)
router.post('/backfill', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Start date and end date are required (YYYY-MM-DD format)' 
      });
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }
    
    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ 
        message: 'Start date must be before or equal to end date' 
      });
    }
    
    const result = await backfillAttendanceRecords(startDate, endDate);
    
    if (result.success) {
      res.json({
        message: `Attendance records backfilled from ${startDate} to ${endDate}`,
        ...result
      });
    } else {
      res.status(500).json({
        message: 'Failed to backfill attendance records',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Backfill attendance error:', error);
    res.status(500).json({ message: 'Server error backfilling attendance' });
  }
});

export default router;
