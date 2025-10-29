const mongoose = require('mongoose');

const gateVerificationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admissionNumber: {
    type: String,
    required: true
  },
  verificationDate: {
    type: Date,
    required: true
  },
  verificationTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Valid', 'Expired', 'Denied'],
    required: true
  },
  expiryDate: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for quick daily lookups
gateVerificationSchema.index({ student: 1, verificationDate: 1 });
gateVerificationSchema.index({ admissionNumber: 1, verificationDate: 1 });

module.exports = mongoose.model('GateVerification', gateVerificationSchema);
