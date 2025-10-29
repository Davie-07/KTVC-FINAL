const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  payments: [{
    amount: Number,
    date: Date,
    receiptNumber: String,
    paymentMethod: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  status: {
    type: String,
    enum: ['Paid', 'Partial', 'Unpaid', 'Overdue'],
    default: 'Unpaid'
  },
  dueDate: Date,
  gatepassExpiryDate: {
    type: Date,
    default: null
  },
  lastUnpaidBalance: {
    type: Number,
    default: 0
  },
  unpaidBalanceSemester: String,
  unpaidBalanceYear: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Fee', feeSchema);
