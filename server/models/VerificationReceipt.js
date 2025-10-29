const mongoose = require('mongoose');

const verificationReceiptSchema = new mongoose.Schema({
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
    required: true,
    unique: true
  },
  generatedDate: {
    type: Date,
    default: Date.now
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: Date,
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for quick lookups
// Note: verificationCode already has unique index from field definition above
verificationReceiptSchema.index({ student: 1, generatedDate: 1 });

module.exports = mongoose.model('VerificationReceipt', verificationReceiptSchema);
