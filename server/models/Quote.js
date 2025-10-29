const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  author: String,
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
    required: true
  },
  category: {
    type: String,
    default: 'motivation'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quote', quoteSchema);
