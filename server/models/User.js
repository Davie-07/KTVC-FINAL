const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin', 'finance', 'gateverification', 'enrollment'],
    required: true
  },
  admissionNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  // Account IDs for different roles
  accountCode: {
    type: String,
    unique: true,
    sparse: true // 6-digit for teachers
  },
  accountId: {
    type: String,
    unique: true,
    sparse: true // 5-digit gate, 7-digit finance, 4-digit enrollment
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  level: {
    type: String,
    enum: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6']
  },
  profileImage: String,
  phone: String,
  dateOfBirth: Date,
  countyOfBirth: String,
  address: String,
  yearOfStudy: String,
  firstName: String,
  lastName: String,
  isActive: {
    type: Boolean,
    default: true
  },
  firstLogin: {
    type: Boolean,
    default: true
  },
  passwordSet: {
    type: Boolean,
    default: false
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationCode: {
    type: String,
    // Remove the inline index if you also have schema.index({ verificationCode: 1 })
    // index: true, <-- remove this line if schema.index(...) exists elsewhere
  },
  // Registration workflow for new students
  registrationStatus: {
    type: String,
    enum: ['pending', 'finance-approved', 'teacher-approved', 'active'],
    default: 'active' // Default for non-students, will be 'pending' for new students
  },
  phoneNumber: String // Additional phone number field
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Ensure verificationCode index is defined only once to avoid duplicate-index warnings
if (!userSchema.indexes().some(ix => ix[0] && ix[0].verificationCode !== undefined)) {
  userSchema.index({ verificationCode: 1 });
}

module.exports = mongoose.model('User', userSchema);
