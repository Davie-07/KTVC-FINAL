const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admissionNumber: {
    type: String,
    required: true
  },
  verificationCode: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  isValid: {
    type: Boolean,
    default: true
  },
  verificationCount: {
    type: Number,
    default: 1
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GatePass', gatePassSchema);
