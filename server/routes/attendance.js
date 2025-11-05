import express from 'express';
import Attendance from '../models/Attendance.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/attendance
// @desc    Get all attendance records (with optional filters)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    
    let query = {};
    
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('employeeId')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error fetching attendance' });
  }
});

// @route   GET /api/attendance/:id
// @desc    Get attendance record by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate('employeeId');
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error fetching attendance' });
  }
});

// @route   POST /api/attendance
// @desc    Create attendance record (clock in)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { employeeId, date, status, clockIn, clockInTimestamp } = req.body;

    // Ensure date is in YYYY-MM-DD format
    const dateString = date.includes('T') ? date.split('T')[0] : date;

    // ENHANCED: Check if attendance already exists for this employee and date
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: dateString
    });

    if (existingAttendance) {
      console.log(`⚠️ Duplicate clock-in attempt prevented for employee ${employeeId} on ${dateString}`);
      
      // Return existing record instead of error for better UX
      const populatedExisting = await Attendance.findById(existingAttendance._id).populate('employeeId');
      return res.status(200).json({
        ...populatedExisting.toObject(),
        message: 'You have already clocked in today',
        isDuplicate: true
      });
    }

    const now = new Date();
    const attendance = await Attendance.create({
      employeeId,
      date: dateString,
      status: status || 'Present',
      clockIn: clockIn || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      clockInTimestamp: clockInTimestamp || now
    });

    const populatedAttendance = await Attendance.findById(attendance._id).populate('employeeId');

    console.log(`✅ Attendance created for employee ${employeeId} on ${dateString} at ${attendance.clockIn}`);

    res.status(201).json(populatedAttendance);
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({ message: 'Server error creating attendance' });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record (clock out, update status)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const { status, clockIn, clockInTimestamp, clockOut, clockOutTimestamp, workHours, workMinutes } = req.body;

    if (status) attendance.status = status;
    if (clockIn) attendance.clockIn = clockIn;
    if (clockInTimestamp) attendance.clockInTimestamp = clockInTimestamp;
    if (clockOut) attendance.clockOut = clockOut;
    if (clockOutTimestamp) attendance.clockOutTimestamp = clockOutTimestamp;
    if (workHours) attendance.workHours = workHours;
    if (workMinutes !== undefined) attendance.workMinutes = workMinutes;

    const updatedAttendance = await attendance.save();
    const populatedAttendance = await Attendance.findById(updatedAttendance._id).populate('employeeId');

    console.log(`✅ Attendance updated for record ${attendance._id}`);

    res.json(populatedAttendance);
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error updating attendance' });
  }
});

// @route   POST /api/attendance/clock-out
// @desc    Clock out for today
// @access  Private
router.post('/clock-out', protect, async (req, res) => {
  try {
    const { employeeId, clockOut, workHours, workMinutes } = req.body;
    
    // Get today's date as string (YYYY-MM-DD)
    const now = new Date();
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const attendance = await Attendance.findOne({
      employeeId,
      date: todayString
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No attendance record found for today' });
    }

    if (attendance.clockOut) {
      return res.status(400).json({ message: 'Already clocked out' });
    }

    attendance.clockOut = clockOut;
    attendance.clockOutTimestamp = now;
    attendance.workHours = workHours;
    attendance.workMinutes = workMinutes || 0;

    const updatedAttendance = await attendance.save();
    const populatedAttendance = await Attendance.findById(updatedAttendance._id).populate('employeeId');

    res.json(populatedAttendance);
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ message: 'Server error clocking out' });
  }
});

// @route   GET /api/attendance/weekly/:employeeId
// @desc    Get weekly work hours for employee
// @access  Private
router.get('/weekly/:employeeId', protect, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diff);
    const mondayString = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    
    // Get all attendance records for this week
    const weekAttendance = await Attendance.find({
      employeeId,
      date: { $gte: mondayString }
    }).sort({ date: 1 });
    
    // Calculate total work minutes
    let totalMinutes = 0;
    weekAttendance.forEach(record => {
      if (record.workMinutes) {
        totalMinutes += record.workMinutes;
      }
    });
    
    res.json({
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(2),
      weekStart: mondayString,
      records: weekAttendance
    });
  } catch (error) {
    console.error('Get weekly hours error:', error);
    res.status(500).json({ message: 'Server error fetching weekly hours' });
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private (Admin, HR)
router.delete('/:id', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await attendance.deleteOne();

    res.json({ message: 'Attendance record removed' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ message: 'Server error deleting attendance' });
  }
});

export default router;
