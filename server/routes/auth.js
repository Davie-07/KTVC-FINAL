const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter, constantTimeDelay } = require('../middleware/security');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, admissionNumber, course, level } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      admissionNumber,
      course,
      level
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        admissionNumber: user.admissionNumber,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/check-student
// @desc    Check if new student needs password setup
// @access  Public
router.post('/check-student', async (req, res) => {
  try {
    const { admissionNumber, course } = req.body;

    const user = await User.findOne({ 
      admissionNumber, 
      role: 'student' 
    }).populate('course');

    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check course match
    if (course) {
      const courseMatch = user.course && 
        (user.course.name.toLowerCase() === course.toLowerCase() || 
         user.course.code.toLowerCase() === course.toLowerCase());
      
      if (!courseMatch) {
        return res.status(400).json({ message: 'Course does not match student records' });
      }
    }

    // Check if this is a newly enrolled student (activated by teacher) who needs password setup
    const needsPasswordSetup = 
      user.registrationStatus === 'active' && 
      !user.passwordSet && 
      user.firstLogin;

    res.json({
      needsPasswordSetup,
      studentId: user._id,
      studentName: user.name,
      isActive: user.isActive
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Unified login for all roles
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { identifier, password, course } = req.body;

    let user;
    let query = {};

    if (/^STD/.test(identifier)) {
      // Student login
      query = { admissionNumber: identifier, role: 'student' };
    } else if (identifier.length === 6 && /^\d+$/.test(identifier)) {
      // Teacher login
      query = { accountCode: identifier, role: 'teacher' };
    } else if (identifier.length === 5 && /^\d+$/.test(identifier)) {
      // Gate verification login
      query = { accountId: identifier, role: 'gateverification' };
    } else if (identifier.length === 7 && /^\d+$/.test(identifier)) {
      // Finance login
      query = { accountId: identifier, role: 'finance' };
    } else if (identifier.length === 4 && /^\d+$/.test(identifier)) {
      // Enrollment login
      query = { accountId: identifier, role: 'enrollment' };
    } else if (identifier.includes('@')) {
      // Admin login using email
      query = { email: identifier.toLowerCase(), role: 'admin' };
    }

    // Find user and populate course if exists
    user = await User.findOne(query).populate('course');

    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Verify account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Check course match for students
    if (user.role === 'student' && course) {
      const courseMatch = user.course && 
        (user.course.name.toLowerCase() === course.toLowerCase() || 
         user.course.code.toLowerCase() === course.toLowerCase());
      
      if (!courseMatch) {
        return res.status(400).json({ message: 'Course does not match student records' });
      }
    }

    // Check password
    if (password) {
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid password' });
      }
    } else if (user.passwordSet) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Generate token and send response
    const token = generateToken(user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      admissionNumber: user.admissionNumber,
      accountCode: user.accountCode,
      accountId: user.accountId,
      course: user.course,
      level: user.level,
      firstLogin: user.firstLogin,
      passwordSet: user.passwordSet,
      token
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/set-password
// @desc    Set password for first-time login
// @access  Public
router.post('/set-password', passwordResetLimiter, async (req, res) => {
  try {
    const { userId, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password;
    user.passwordSet = true;
    user.firstLogin = false;
    await user.save();

    res.json({
      message: 'Password set successfully',
      _id: user._id,
      name: user.name,
      role: user.role,
      admissionNumber: user.admissionNumber,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/verify-admission
// @desc    Check if admission number exists
// @access  Public
router.post('/verify-admission', async (req, res) => {
  try {
    const { admissionNumber } = req.body;

    const student = await User.findOne({ 
      admissionNumber,
      role: 'student'
    }).populate('course');

    if (!student) {
      return res.status(404).json({ 
        exists: false,
        message: 'Admission number does not exist or not approved' 
      });
    }

    res.json({
      exists: true,
      requiresPasswordSetup: !student.passwordSet,
      course: student.course?.name,
      level: student.level
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/forgot-password-verify
// @desc    Verify student account for password reset
// @access  Public
router.post('/forgot-password-verify', passwordResetLimiter, async (req, res) => {
  try {
    const { admissionNumber, course, email } = req.body;

    // Find student with matching details
    const student = await User.findOne({ 
      admissionNumber,
      email: email.toLowerCase(),
      role: 'student'
    }).populate('course');

    if (!student) {
      return res.status(404).json({ 
        exists: false,
        message: 'No account found with provided details' 
      });
    }

    // Check if course matches
    if (student.course && student.course.name !== course) {
      return res.status(400).json({ 
        exists: false,
        message: 'Course does not match student records' 
      });
    }

    res.json({
      exists: true,
      userId: student._id,
      message: 'Account verified. You can now reset your password.'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('course');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
