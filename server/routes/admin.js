const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Quote = require('../models/Quote');

// Helper functions to generate account IDs
const generateAccountCode = async (length, role) => {
  let code;
  let exists = true;

  while (exists) {
    code = Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
    
    if (role === 'teacher') {
      exists = await User.findOne({ accountCode: code });
    } else {
      exists = await User.findOne({ accountId: code });
    }
  }

  return code;
};

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalCourses = await Course.countDocuments();

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort('-createdAt')
      .limit(10);

    res.json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      usersByRole,
      recentUsers
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/create-account
// @desc    Create accounts for different roles
// @access  Private/Admin
router.post('/create-account', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, name, email, password, courseId, level } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    let accountData = {
      name,
      email,
      password,
      role,
      createdBy: req.user._id,
      passwordSet: true,
      firstLogin: true
    };

    // Generate appropriate account ID based on role
    switch (role) {
      case 'teacher':
        accountData.accountCode = await generateAccountCode(6, 'teacher');
        if (courseId) accountData.course = courseId;
        if (level) accountData.level = level;
        break;
      case 'gateverification':
        accountData.accountId = await generateAccountCode(5, 'gate');
        break;
      case 'finance':
        accountData.accountId = await generateAccountCode(7, 'finance');
        break;
      case 'enrollment':
        accountData.accountId = await generateAccountCode(4, 'enrollment');
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.create(accountData);

    // Populate course if it's a teacher
    await user.populate('course', 'name code');

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountCode: user.accountCode,
        accountId: user.accountId,
        course: user.course,
        level: user.level
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.query;

    const query = role && role !== 'all' ? { role } : {};

    const users = await User.find(query)
      .populate('course', 'name code')
      .populate('createdBy', 'name')
      .select('-password')
      .sort('-createdAt');

    res.json(users);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/user/:id
// @desc    Update user account
// @access  Private/Admin
router.put('/user/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, isActive, courseId } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (isActive !== undefined) user.isActive = isActive;
    if (courseId && user.role === 'teacher') user.course = courseId;

    await user.save();
    await user.populate('course', 'name code');

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/user/:id
// @desc    Delete user account
// @access  Private/Admin
router.delete('/user/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/reset-password/:id
// @desc    Reset user password
// @access  Private/Admin
router.post('/reset-password/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { newPassword } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    user.passwordSet = true;
    await user.save();

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================== COURSE MANAGEMENT ==================

// @route   GET /api/admin/courses
// @desc    Get all courses
// @access  Private/Admin
router.get('/courses', protect, authorize('admin'), async (req, res) => {
  try {
    const courses = await Course.find().sort('name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/course
// @desc    Create new course
// @access  Private/Admin
router.post('/course', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, code, description, duration, level } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const course = await Course.create({
      name,
      code,
      description,
      duration,
      level
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/course/:id
// @desc    Update course
// @access  Private/Admin
router.put('/course/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, code, description, duration, level, isActive } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (name) course.name = name;
    if (code) course.code = code;
    if (description) course.description = description;
    if (duration) course.duration = duration;
    if (level) course.level = level;
    if (isActive !== undefined) course.isActive = isActive;

    await course.save();

    res.json({
      success: true,
      message: 'Course updated successfully',
      course
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/course/:id
// @desc    Delete course
// @access  Private/Admin
router.delete('/course/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if any students are enrolled in this course
    const studentsInCourse = await User.countDocuments({ course: course._id, role: 'student' });
    if (studentsInCourse > 0) {
      return res.status(400).json({ 
        message: `Cannot delete course. ${studentsInCourse} students are enrolled in this course.` 
      });
    }

    await course.deleteOne();

    res.json({ message: 'Course deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/course/:id/students
// @desc    Get students in a specific course
// @access  Private/Admin
router.get('/course/:id/students', protect, authorize('admin'), async (req, res) => {
  try {
    const students = await User.find({ 
      course: req.params.id,
      role: 'student'
    }).select('name email admissionNumber level');

    res.json(students);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/quotes
// @desc    Get all quotes
// @access  Private/Admin
router.get('/quotes', protect, authorize('admin'), async (req, res) => {
  try {
    const quotes = await Quote.find().sort('category dayOfWeek');
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/quote
// @desc    Create new quote
// @access  Private/Admin
router.post('/quote', protect, authorize('admin'), async (req, res) => {
  try {
    const { text, author, category, dayOfWeek } = req.body;

    const quote = await Quote.create({
      text,
      author,
      category,
      dayOfWeek
    });

    res.status(201).json({
      success: true,
      message: 'Quote created successfully',
      quote
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
