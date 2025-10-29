const mongoose = require('mongoose');

const kraPinSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taxpayerType: {
    type: String,
    default: 'KE',
    enum: ['KE']
  },
  identificationNumber: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  emailAddress: {
    type: String,
    required: true
  },
  isPinWithNoOblig: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'Yes'
  },
  pin: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed'],
    default: 'pending'
  },
  responseCode: String,
  responseMessage: String,
  kraResponse: Object,
  requestId: String,
  errorMessage: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('KRAPin', kraPinSchema);
