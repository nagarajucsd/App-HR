import mongoose from 'mongoose';

const employeeDocumentSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: ['ID Card', 'Passport', 'Driver License', 'Educational Certificate', 'Experience Letter', 'Offer Letter', 'Contract', 'Other']
  },
  documentName: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const EmployeeDocument = mongoose.model('EmployeeDocument', employeeDocumentSchema);

export default EmployeeDocument;
