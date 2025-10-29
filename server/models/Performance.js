const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  assessments: [{
    type: {
      type: String,
      enum: ['CAT', 'Assignment', 'Exam', 'Project'],
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    maxScore: {
      type: Number,
      required: true
    },
    date: Date,
    remarks: String
  }],
  totalScore: Number,
  grade: String,
  semester: String,
  academicYear: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Performance', performanceSchema);
