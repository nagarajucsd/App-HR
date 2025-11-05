import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: String, // Store as YYYY-MM-DD string to avoid timezone issues
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Leave', 'Half-Day', 'Not Marked'],
    default: 'Not Marked'
  },
  clockIn: {
    type: String,
    default: null
  },
  clockInTimestamp: {
    type: Date,
    default: null
  },
  clockOut: {
    type: String,
    default: null
  },
  clockOutTimestamp: {
    type: Date,
    default: null
  },
  workHours: {
    type: String,
    default: null
  },
  workMinutes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret.__v;
      return ret;
    }
  }
});

// Create compound index for unique employee-date combination
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
