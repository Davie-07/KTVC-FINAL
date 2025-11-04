const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Unit = require('../models/Unit');
const Timetable = require('../models/Timetable');
const Assignment = require('../models/Assignment');
const Performance = require('../models/Performance');
const Notification = require('../models/Notification');
const Complaint = require('../models/Complaint');
const Quote = require('../models/Quote');

// @route   GET /api/teacher/dashboard
// @desc    Get teacher dashboard data
// @access  Private/Teacher
router.get('/dashboard', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get students count for teacher's units
    const units = await Unit.find({ teacher: teacherId });
    const courseIds = [...new Set(units.map(u => u.course))];
    
    const students = await User.find({ 
      role: 'student', 
      course: { $in: courseIds } 
    });

    // Get assignments count
    const assignments = await Assignment.find({ teacher: teacherId });

    // Get teacher quote
    const dayOfWeek = new Date().getDay();
    const quote = await Quote.findOne({ dayOfWeek, category: 'teacher' });

    // Get timetables created by this teacher
    const timetables = await Timetable.find({})
      .populate('course', 'name code')
      .populate('schedule.unit', 'name code')
      .sort('-createdAt');

    // Get recent complaints/help requests
    const complaints = await Complaint.find({ status: 'Pending' })
      .populate('student', 'name email admissionNumber')
      .sort('-createdAt')
      .limit(10);

    res.json({
      studentsCount: students.length,
      assignmentsCount: assignments.length,
      quote,
      students,
      units,
      timetables,
      complaints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/teacher/students
// @desc    Get students in teacher's course (filtered by level or all)
// @access  Private/Teacher
router.get('/students', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id);
    const { viewAll } = req.query; // ?viewAll=true to see all levels

    if (!teacher.course) {
      return res.status(400).json({ message: 'Teacher must have an assigned course' });
    }

    // Build query
    const query = { 
      role: 'student', 
      course: teacher.course,
      isActive: true
    };

    // Filter by teacher's level unless viewAll is true
    if (!viewAll || viewAll === 'false') {
      query.level = teacher.level;
    }
    
    const students = await User.find(query)
      .populate('course', 'name code')
      .sort('name');

    // Get counts by level for the teacher's course
    const levelCounts = await User.aggregate([
      { 
        $match: { 
          role: 'student', 
          course: teacher.course,
          isActive: true
        } 
      },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);

    // Total students in course
    const totalInCourse = await User.countDocuments({
      role: 'student',
      course: teacher.course,
      isActive: true
    });

    res.json({
      students,
      levelCounts,
      totalInCourse,
      teacherLevel: teacher.level,
      teacherCourse: await Course.findById(teacher.course).select('name code'),
      currentFilter: viewAll === 'true' ? 'all' : teacher.level
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/teacher/new-students
// @desc    Get students pending teacher approval (finance-approved)
// @access  Private/Teacher
router.get('/new-students', protect, authorize('teacher'), async (req, res) => {
  try {
    const newStudents = await User.find({ 
      role: 'student', 
      registrationStatus: 'finance-approved' 
    })
      .populate('course', 'name code')
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.json(newStudents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/teacher/approve-student/:id
// @desc    Approve student and activate account (final approval)
// @access  Private/Teacher
router.post('/approve-student/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .populate('course', 'name code');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.registrationStatus !== 'finance-approved') {
      return res.status(400).json({ 
        message: `Student is ${student.registrationStatus}. Only finance-approved students can be activated.`,
        currentStatus: student.registrationStatus
      });
    }

    // Final activation
    student.registrationStatus = 'active';
    student.isActive = true;
    await student.save();

    // Send welcome notification to student
    await Notification.create({
      recipient: student._id,
      sender: req.user._id,
      type: 'enrollment',
      title: 'Account Activated - Welcome!',
      message: `Your student account has been fully activated. Admission Number: ${student.admissionNumber}. You can now access all system features. Please login and set your password.`,
      priority: 'high'
    });

    res.json({
      success: true,
      message: 'Student account activated successfully',
      student
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/teacher/student/:id
// @desc    Get specific student details with units
// @access  Private/Teacher
router.get('/student/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .populate('course', 'name code');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get units for student's course and level
    const units = await Unit.find({ 
      course: student.course._id, 
      level: student.level 
    }).populate('teacher', 'name');

    // Get student's performance records
    const performance = await Performance.find({ student: student._id })
      .populate('unit', 'name code');

    res.json({
      student,
      units,
      performance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/teacher/timetable
// @desc    Create timetable
// @access  Private/Teacher
router.post('/timetable', protect, authorize('teacher'), async (req, res) => {
  try {
    const { course, level, schedule, semester, academicYear } = req.body;

    const timetable = await Timetable.create({
      course,
      level,
      schedule,
      semester,
      academicYear,
      isActive: false
    });

    const populated = await Timetable.findById(timetable._id)
      .populate('course', 'name code')
      .populate('schedule.unit', 'name code')
      .populate('schedule.teacher', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/teacher/timetable/:id
// @desc    Update timetable
// @access  Private/Teacher
router.put('/timetable/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('course', 'name code')
      .populate('schedule.unit', 'name code')
      .populate('schedule.teacher', 'name');

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/teacher/timetable/:id/publish
// @desc    Publish timetable
// @access  Private/Teacher
router.put('/timetable/:id/publish', protect, authorize('teacher'), async (req, res) => {
  try {
    // Unpublish all other timetables for the same course and level
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    await Timetable.updateMany(
      { course: timetable.course, level: timetable.level, _id: { $ne: req.params.id } },
      { isActive: false }
    );

    // Publish this timetable
    timetable.isActive = true;
    await timetable.save();

    const populated = await Timetable.findById(timetable._id)
      .populate('course', 'name code')
      .populate('schedule.unit', 'name code')
      .populate('schedule.teacher', 'name');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/teacher/timetable/:id
// @desc    Delete timetable
// @access  Private/Teacher
router.delete('/timetable/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/teacher/performance
// @desc    Add/Update student performance
// @access  Private/Teacher
router.post('/performance', protect, authorize('teacher'), async (req, res) => {
  try {
    const { studentId, unitId, type, score, maxScore, semester, academicYear, remarks } = req.body;

    let performance = await Performance.findOne({ 
      student: studentId, 
      unit: unitId,
      semester,
      academicYear
    });

    const assessmentData = {
      type,
      score,
      maxScore,
      date: new Date(),
      remarks
    };

    if (performance) {
      // Add new assessment
      performance.assessments.push(assessmentData);
      
      // Calculate total score (average percentage)
      const totalPercentage = performance.assessments.reduce((sum, a) => {
        return sum + (a.score / a.maxScore * 100);
      }, 0) / performance.assessments.length;
      
      performance.totalScore = totalPercentage;
      
      // Assign grade
      if (totalPercentage >= 70) performance.grade = 'A';
      else if (totalPercentage >= 60) performance.grade = 'B';
      else if (totalPercentage >= 50) performance.grade = 'C';
      else if (totalPercentage >= 40) performance.grade = 'D';
      else performance.grade = 'E';
      
      await performance.save();
    } else {
      // Create new performance record
      const percentage = (score / maxScore * 100);
      let grade;
      if (percentage >= 70) grade = 'A';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';
      else grade = 'E';

      performance = await Performance.create({
        student: studentId,
        unit: unitId,
        assessments: [assessmentData],
        totalScore: percentage,
        grade,
        semester,
        academicYear
      });
    }

    // Send notification to student
    await Notification.create({
      recipient: studentId,
      sender: req.user._id,
      type: 'performance',
      title: 'New Grade Posted',
      message: `Your ${type} score for ${unitId} has been posted. Check your performance section.`,
      priority: 'high'
    });

    const populated = await Performance.findById(performance._id)
      .populate('student', 'name email admissionNumber')
      .populate('unit', 'name code');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/teacher/student/:id
// @desc    Update student information
// @access  Private/Teacher
router.put('/student/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const { course, level } = req.body;

    const student = await User.findByIdAndUpdate(
      req.params.id,
      { course, level },
      { new: true, runValidators: true }
    ).populate('course', 'name code');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/teacher/assignments
// @desc    Get teacher's assignments
// @access  Private/Teacher
router.get('/assignments', protect, authorize('teacher'), async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacher: req.user._id })
      .populate('unit', 'name code')
      .populate('course', 'name code')
      .sort('-createdAt');

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/teacher/assignments
// @desc    Create assignment
// @access  Private/Teacher
router.post('/assignments', protect, authorize('teacher'), async (req, res) => {
  try {
    // Auto-populate course and level from teacher's account
    const assignment = await Assignment.create({
      ...req.body,
      teacher: req.user._id,
      course: req.user.course,
      level: req.user.level
    });

    const populated = await Assignment.findById(assignment._id)
      .populate('unit', 'name code')
      .populate('course', 'name code');

    // Notify students in the same course and level
    const students = await User.find({ 
      course: req.user.course, 
      level: req.user.level,
      role: 'student'
    });

    const notifications = students.map(student => ({
      recipient: student._id,
      sender: req.user._id,
      type: 'assignment',
      title: 'New Assignment Posted',
      message: `New assignment: ${req.body.title}. Due: ${new Date(req.body.deadline).toLocaleDateString()}`,
      priority: 'high'
    }));

    await Notification.insertMany(notifications);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/teacher/assignments/:id
// @desc    Update assignment
// @access  Private/Teacher
router.put('/assignments/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('unit', 'name code')
      .populate('course', 'name code');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/teacher/assignments/:id
// @desc    Delete assignment
// @access  Private/Teacher
router.delete('/assignments/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      teacher: req.user._id
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/teacher/performance/:id
// @desc    Delete performance record
// @access  Private/Teacher
router.delete('/performance/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const performance = await Performance.findByIdAndDelete(req.params.id);

    if (!performance) {
      return res.status(404).json({ message: 'Performance record not found' });
    }

    res.json({ message: 'Performance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/teacher/notifications
// @desc    Get teacher notifications (help requests from students)
// @access  Private/Teacher
router.get('/notifications', protect, authorize('teacher'), async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .populate('student', 'name email admissionNumber course level')
      .populate('responses.respondent', 'name role')
      .sort('-createdAt');

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/teacher/notifications/:id/respond
// @desc    Respond to student complaint/help request
// @access  Private/Teacher
router.post('/notifications/:id/respond', protect, authorize('teacher'), async (req, res) => {
  try {
    const { message, newStatus } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Request not found' });
    }

    complaint.responses.push({
      respondent: req.user._id,
      message,
      date: new Date()
    });

    if (newStatus) {
      complaint.status = newStatus;
    }

    await complaint.save();

    const populated = await Complaint.findById(complaint._id)
      .populate('student', 'name email admissionNumber')
      .populate('responses.respondent', 'name role');

    // Notify student
    await Notification.create({
      recipient: complaint.student._id,
      sender: req.user._id,
      type: 'general',
      title: 'Response to Your Request',
      message: `A teacher has responded to your ${complaint.category.toLowerCase()}.`,
      priority: 'medium'
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/teacher/courses
// @desc    Get all courses
// @access  Private/Teacher
router.get('/courses', protect, authorize('teacher'), async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort('name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/teacher/units
// @desc    Get teacher's units
// @access  Private/Teacher
router.get('/units', protect, authorize('teacher'), async (req, res) => {
  try {
    const units = await Unit.find({ teacher: req.user._id })
      .populate('course', 'name code')
      .sort('name');
    res.json(units);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/teacher/units
// @desc    Create a new unit
// @access  Private/Teacher
router.post('/units', protect, authorize('teacher'), async (req, res) => {
  try {
    const { name, code, credits, description } = req.body;
    const teacher = await User.findById(req.user._id);

    if (!teacher.course || !teacher.level) {
      return res.status(400).json({ message: 'Teacher must have an assigned course and level' });
    }

    // Check if unit code already exists
    const existingUnit = await Unit.findOne({ code });
    if (existingUnit) {
      return res.status(400).json({ message: 'Unit code already exists' });
    }

    const unit = await Unit.create({
      name,
      code,
      course: teacher.course,
      level: teacher.level,
      teacher: teacher._id,
      credits,
      description
    });

    const populated = await Unit.findById(unit._id).populate('course', 'name code');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/teacher/units/:id
// @desc    Update a unit
// @access  Private/Teacher
router.put('/units/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const unit = await Unit.findOne({ _id: req.params.id, teacher: req.user._id });

    if (!unit) {
      return res.status(404).json({ message: 'Unit not found or unauthorized' });
    }

    // Check if code is being changed and if it already exists
    if (req.body.code && req.body.code !== unit.code) {
      const existingUnit = await Unit.findOne({ code: req.body.code });
      if (existingUnit) {
        return res.status(400).json({ message: 'Unit code already exists' });
      }
    }

    const updatedUnit = await Unit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'name code');

    res.json(updatedUnit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/teacher/units/:id
// @desc    Delete a unit
// @access  Private/Teacher
router.delete('/units/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const unit = await Unit.findOne({ _id: req.params.id, teacher: req.user._id });

    if (!unit) {
      return res.status(404).json({ message: 'Unit not found or unauthorized' });
    }

    // Check if unit has assignments
    const assignmentsCount = await Assignment.countDocuments({ unit: req.params.id });
    if (assignmentsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete unit. It has ${assignmentsCount} assignment(s) linked to it. Delete the assignments first.` 
      });
    }

    // Check if unit has performance records
    const performanceCount = await Performance.countDocuments({ unit: req.params.id });
    if (performanceCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete unit. It has ${performanceCount} performance record(s). Delete them first.` 
      });
    }

    await Unit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
