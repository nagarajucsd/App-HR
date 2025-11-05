import mongoose from 'mongoose';

const leaveBalanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true
  },
  balances: [{
    type: {
      type: String,
      enum: ['Annual', 'Sick', 'Casual', 'Unpaid'],
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    used: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);

export default LeaveBalance;
