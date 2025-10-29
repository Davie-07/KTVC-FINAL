const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  level: String,
  deadline: {
    type: Date,
    required: true
  },
  totalMarks: Number,
  attachments: [String],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: Date,
    files: [String],
    marks: Number,
    feedback: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
