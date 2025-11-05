import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 0,
    max: 11
  },
  year: {
    type: Number,
    required: true
  },
  basic: {
    type: Number,
    required: true
  },
  allowances: {
    hra: {
      type: Number,
      default: 0
    },
    special: {
      type: Number,
      default: 0
    }
  },
  deductions: {
    tax: {
      type: Number,
      default: 0
    },
    providentFund: {
      type: Number,
      default: 0
    },
    absence: {
      type: Number,
      default: 0
    }
  },
  grossPay: {
    type: Number,
    required: true
  },
  netPay: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Generated', 'Pending Approval', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending Approval'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  payslipUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create compound index for unique employee-month-year combination
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);

export default Payroll;
