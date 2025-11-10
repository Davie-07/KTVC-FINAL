const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'teachers', 'specific-course'],
    default: 'all'
  },
  targetCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for querying active announcements
announcementSchema.index({ validUntil: 1, isActive: 1 });
announcementSchema.index({ targetAudience: 1, validUntil: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
