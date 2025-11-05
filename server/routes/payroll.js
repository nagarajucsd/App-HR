import express from 'express';
import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendPayrollGeneratedEmail } from '../utils/emailService.js';

const router = express.Router();

// @route   GET /api/payroll
// @desc    Get all payroll records (with optional filters)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;
    
    let query = {};
    
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    if (month !== undefined) {
      query.month = parseInt(month);
    }
    
    if (year) {
      query.year = parseInt(year);
    }

    const payroll = await Payroll.find(query)
      .populate('employeeId')
      .sort({ year: -1, month: -1 });
    
    res.json(payroll);
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ message: 'Server error fetching payroll' });
  }
});

// @route   GET /api/payroll/:id
// @desc    Get payroll record by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employeeId');
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    res.json(payroll);
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ message: 'Server error fetching payroll' });
  }
});

// @route   POST /api/payroll/generate
// @desc    Generate payroll for a month
// @access  Private (Admin, HR)
router.post('/generate', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const { month, year } = req.body;

    if (month === undefined || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    // Get all active employees
    const employees = await Employee.find({ status: 'Active' });

    // Filter out employees who already have payroll for this period
    const employeesNeedingPayroll = [];
    for (const emp of employees) {
      const existingPayroll = await Payroll.findOne({
        employeeId: emp._id,
        month: parseInt(month),
        year: parseInt(year)
      });
      
      if (!existingPayroll) {
        employeesNeedingPayroll.push(emp);
      }
    }

    if (employeesNeedingPayroll.length === 0) {
      return res.status(400).json({ message: 'Payroll already exists for all employees in this period' });
    }

    const payrollRecords = [];

    for (const emp of employeesNeedingPayroll) {
      // Calculate payroll
      const grossPay = emp.salary / 12;
      const basic = grossPay * 0.5;
      const hra = basic * 0.4;
      const special = grossPay - basic - hra;

      // Get absent days
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, parseInt(month) + 1, 0);

      const absentDays = await Attendance.countDocuments({
        employeeId: emp._id,
        date: { $gte: startDate, $lte: endDate },
        status: 'Absent'
      });

      const absenceDeduction = absentDays * (grossPay / 22);
      const providentFund = basic * 0.12;
      const tax = grossPay > 5000 ? (grossPay - 5000) * 0.1 : 0;

      const totalDeductions = absenceDeduction + providentFund + tax;
      const netPay = grossPay - totalDeductions;

      const payrollRecord = await Payroll.create({
        employeeId: emp._id,
        month: parseInt(month),
        year: parseInt(year),
        basic: parseFloat(basic.toFixed(2)),
        allowances: {
          hra: parseFloat(hra.toFixed(2)),
          special: parseFloat(special.toFixed(2))
        },
        deductions: {
          tax: parseFloat(tax.toFixed(2)),
          providentFund: parseFloat(providentFund.toFixed(2)),
          absence: parseFloat(absenceDeduction.toFixed(2))
        },
        grossPay: parseFloat(grossPay.toFixed(2)),
        netPay: parseFloat(netPay.toFixed(2)),
        status: 'Pending Approval'
      });

      payrollRecords.push(payrollRecord);
    }

    const populatedPayroll = await Payroll.find({
      month: parseInt(month),
      year: parseInt(year)
    }).populate('employeeId');

    res.status(201).json(populatedPayroll);
  } catch (error) {
    console.error('Generate payroll error:', error);
    res.status(500).json({ message: 'Server error generating payroll' });
  }
});

// @route   PUT /api/payroll/:id/approve
// @desc    Approve payroll record
// @access  Private (Admin, HR)
router.put('/:id/approve', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employeeId');

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    if (payroll.status === 'Approved' || payroll.status === 'Paid') {
      return res.status(400).json({ message: 'Payroll already approved' });
    }

    payroll.status = 'Approved';
    payroll.approvedBy = req.user._id;
    payroll.approvedAt = new Date();

    await payroll.save();

    // Send notification to employee
    const employee = await Employee.findById(payroll.employeeId._id).populate('userId');
    if (employee && employee.userId) {
      // Get month name
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      const monthName = monthNames[payroll.month];
      
      // Get approver name
      const approverName = req.user.name || 'HR';
      
      await Notification.create({
        userId: employee.userId._id,
        title: `${approverName} approved your ${monthName} ${payroll.year} Payroll`,
        message: `${approverName} has approved your payroll for ${monthName} ${payroll.year}. Net pay: $${payroll.netPay.toFixed(2)}`,
        type: 'payroll',
        relatedId: payroll._id,
        link: '/payroll'
      });

      // Send email notification
      await sendPayrollGeneratedEmail(
        employee.email,
        employee.name,
        payroll.month,
        payroll.year,
        payroll.netPay
      );
    }

    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('employeeId')
      .populate('approvedBy', 'name email');

    res.json(populatedPayroll);
  } catch (error) {
    console.error('Approve payroll error:', error);
    res.status(500).json({ message: 'Server error approving payroll' });
  }
});

// @route   PUT /api/payroll/:id/reject
// @desc    Reject payroll record
// @access  Private (Admin, HR)
router.put('/:id/reject', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const payroll = await Payroll.findById(req.params.id).populate('employeeId');

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    payroll.status = 'Rejected';
    payroll.rejectionReason = rejectionReason || '';
    payroll.approvedBy = req.user._id;
    payroll.approvedAt = new Date();

    await payroll.save();

    // Send notification to employee
    const employee = await Employee.findById(payroll.employeeId._id).populate('userId');
    if (employee && employee.userId) {
      // Get month name
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      const monthName = monthNames[payroll.month];
      
      // Get rejector name
      const rejectorName = req.user.name || 'HR';
      
      await Notification.create({
        userId: employee.userId._id,
        title: `${rejectorName} rejected your ${monthName} ${payroll.year} Payroll`,
        message: `${rejectorName} has rejected your payroll for ${monthName} ${payroll.year}. Reason: ${rejectionReason || 'Not specified'}`,
        type: 'payroll',
        relatedId: payroll._id,
        link: '/payroll'
      });
    }

    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('employeeId')
      .populate('approvedBy', 'name email');

    res.json(populatedPayroll);
  } catch (error) {
    console.error('Reject payroll error:', error);
    res.status(500).json({ message: 'Server error rejecting payroll' });
  }
});

// @route   PUT /api/payroll/:id
// @desc    Update payroll record (mark as paid)
// @access  Private (Admin, HR)
router.put('/:id', protect, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    const { status } = req.body;

    if (status) {
      payroll.status = status;
    }

    const updatedPayroll = await payroll.save();
    const populatedPayroll = await Payroll.findById(updatedPayroll._id)
      .populate('employeeId')
      .populate('approvedBy', 'name email');

    res.json(populatedPayroll);
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({ message: 'Server error updating payroll' });
  }
});

// @route   DELETE /api/payroll/:id
// @desc    Delete payroll record
// @access  Private (Admin)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    await payroll.deleteOne();

    res.json({ message: 'Payroll record removed' });
  } catch (error) {
    console.error('Delete payroll error:', error);
    res.status(500).json({ message: 'Server error deleting payroll' });
  }
});

export default router;
