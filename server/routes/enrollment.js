const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Notification = require('../models/Notification');

// Helper to generate unique admission number
const generateAdmissionNumber = async () => {
  const year = new Date().getFullYear();
  let admissionNumber;
  let exists = true;

  while (exists) {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    admissionNumber = `STD${year}${random}`;
    exists = await User.findOne({ admissionNumber });
  }

  return admissionNumber;
};

// @route   POST /api/enrollment/check-admission
// @desc    Check if admission number is available
// @access  Private/Enrollment
router.post('/check-admission', protect, authorize('enrollment'), async (req, res) => {
  try {
    const { admissionNumber } = req.body;

    const exists = await User.findOne({ admissionNumber });

    res.json({
      available: !exists,
      message: exists ? 'Admission number already exists' : 'Admission number is available'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/enrollment/register-student
// @desc    Register a new student
// @access  Private/Enrollment
router.post('/register-student', protect, authorize('enrollment'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      countyOfBirth,
      dateOfBirth,
      courseId,
      level,
      admissionNumber,
      phone
    } = req.body;

    // Check if admission number already exists
    const existingStudent = await User.findOne({ admissionNumber });
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Admission number already exists',
        code: 'ADMISSION_EXISTS'
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ 
        message: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Generate default password (will be changed on first login)
    const defaultPassword = `temp${admissionNumber}`;

    // Create student account with 'pending' status (needs finance approval)
    const student = await User.create({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      password: defaultPassword,
      role: 'student',
      admissionNumber,
      course: courseId,
      level,
      countyOfBirth,
      dateOfBirth,
      phoneNumber: phone,
      passwordSet: false,
      firstLogin: true,
      registrationStatus: 'pending', // Awaiting finance approval
      isActive: false, // Not active until fully approved
      createdBy: req.user._id
    });

    // Notify finance department about new student
    const financeUsers = await User.find({ role: 'finance', isActive: true });
    for (const financeUser of financeUsers) {
      await Notification.create({
        recipient: financeUser._id,
        sender: req.user._id,
        type: 'enrollment',
        title: 'New Student Registration',
        message: `New student ${student.name} (${admissionNumber}) has been enrolled and requires fee processing.`,
        priority: 'high'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: {
        _id: student._id,
        name: student.name,
        admissionNumber: student.admissionNumber,
        email: student.email,
        course: course.name,
        level: student.level
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/enrollment/students
// @desc    Get all enrolled students
// @access  Private/Enrollment
router.get('/students', protect, authorize('enrollment'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .populate('course', 'name code')
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.json(students);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/enrollment/dashboard
// @desc    Get enrollment dashboard stats
// @access  Private/Enrollment
router.get('/dashboard', protect, authorize('enrollment'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const recentEnrollments = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const studentsByLevel = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);

    const studentsByCourse = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'courseData' } },
      { $unwind: '$courseData' },
      { $project: { courseName: '$courseData.name', count: 1 } }
    ]);

    res.json({
      totalStudents,
      recentEnrollments,
      studentsByLevel,
      studentsByCourse
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/enrollment/courses
// @desc    Get all available courses for enrollment
// @access  Private/Enrollment
router.get('/courses', protect, authorize('enrollment'), async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort('name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/enrollment/student/:id
// @desc    Delete a student (if enrollment was a mistake)
// @access  Private/Enrollment
router.delete('/student/:id', protect, authorize('enrollment'), async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.deleteOne();

    res.json({ message: 'Student removed successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
