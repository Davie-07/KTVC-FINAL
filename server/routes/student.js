const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Unit = require('../models/Unit');
const Assignment = require('../models/Assignment');
const Timetable = require('../models/Timetable');
const Performance = require('../models/Performance');
const Fee = require('../models/Fee');
const Notification = require('../models/Notification');
const Complaint = require('../models/Complaint');
const Quote = require('../models/Quote');
const GatePass = require('../models/GatePass');
const Announcement = require('../models/Announcement');
const path = require('path');
const fs = require('fs');

// @route   GET /api/student/dashboard
// @desc    Get student dashboard data
// @access  Private/Student
router.get('/dashboard', protect, authorize('student'), async (req, res) => {
  try {
    const studentId = req.user._id;
    const course = req.user.course;
    const level = req.user.level;

    // Get enrolled units
    const units = await Unit.find({ course, level }).populate('teacher', 'name email');

    // Get assignments
    const assignments = await Assignment.find({ course, level })
      .populate('unit', 'name code')
      .populate('teacher', 'name')
      .sort('-createdAt')
      .limit(10);

    // Get timetable
    const timetable = await Timetable.findOne({ course, level, isActive: true })
      .populate('schedule.unit', 'name code')
      .populate('schedule.teacher', 'name');

    // Get performance
    const performance = await Performance.find({ student: studentId })
      .populate('unit', 'name code')
      .sort('-createdAt');

    // Get fee information
    const fees = await Fee.find({ student: studentId })
      .sort('-academicYear -semester');

    // Get daily quote
    const dayOfWeek = new Date().getDay();
    const quote = await Quote.findOne({ dayOfWeek, isActive: true });

    res.json({
      units,
      assignments,
      timetable,
      performance,
      fees,
      quote
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/student/units
// @desc    Get enrolled units
// @access  Private/Student
router.get('/units', protect, authorize('student'), async (req, res) => {
  try {
    const units = await Unit.find({ 
      course: req.user.course, 
      level: req.user.level 
    }).populate('teacher', 'name email');

    res.json(units);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/student/assignments
// @desc    Get student assignments
// @access  Private/Student
router.get('/assignments', protect, authorize('student'), async (req, res) => {
  try {
    const assignments = await Assignment.find({ 
      course: req.user.course, 
      level: req.user.level 
    })
      .populate('unit', 'name code')
      .populate('teacher', 'name')
      .sort('-deadline');

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/student/timetable
// @desc    Get student timetable
// @access  Private/Student
router.get('/timetable', protect, authorize('student'), async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ 
      course: req.user.course, 
      level: req.user.level,
      isActive: true 
    })
      .populate('schedule.unit', 'name code')
      .populate('schedule.teacher', 'name');

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/student/performance
// @desc    Get student performance
// @access  Private/Student
router.get('/performance', protect, authorize('student'), async (req, res) => {
  try {
    const performance = await Performance.find({ student: req.user._id })
      .populate('unit', 'name code')
      .sort('-createdAt');

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/student/fees
// @desc    Get student fee information
// @access  Private/Student
router.get('/fees', protect, authorize('student'), async (req, res) => {
  try {
    const fees = await Fee.find({ student: req.user._id })
      .sort('-academicYear -semester');

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/student/notifications
// @desc    Get student notifications
// @access  Private/Student
router.get('/notifications', protect, authorize('student'), async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name role')
      .sort('-createdAt')
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/student/notifications/:id/read
// @desc    Mark notification as read
// @access  Private/Student
router.put('/notifications/:id/read', protect, authorize('student'), async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/student/complaints
// @desc    Submit complaint/suggestion/help request
// @access  Private/Student
router.post('/complaints', protect, authorize('student'), async (req, res) => {
  try {
    const { category, subject, message } = req.body;

    const complaint = await Complaint.create({
      student: req.user._id,
      category,
      subject,
      message
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('student', 'name email admissionNumber');

    res.status(201).json(populatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/student/complaints
// @desc    Get student complaints
// @access  Private/Student
router.get('/complaints', protect, authorize('student'), async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user._id })
      .populate('responses.respondent', 'name role')
      .sort('-createdAt');

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/student/gatepass
// @desc    Get student's active gatepass
// @access  Private/Student
router.get('/gatepass', protect, authorize('student'), async (req, res) => {
  try {
    const gatepass = await GatePass.findOne({ 
      student: req.user._id,
      isValid: true,
      validUntil: { $gte: new Date() }
    }).sort('-createdAt');

    res.json(gatepass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/student/quote
// @desc    Get daily quote
// @access  Private/Student
router.get('/quote', protect, authorize('student'), async (req, res) => {
  try {
    const dayOfWeek = new Date().getDay();
    const quote = await Quote.findOne({ dayOfWeek, isActive: true });

    if (!quote) {
      // Default quote if none found
      return res.json({
        text: "Education is the most powerful weapon which you can use to change the world.",
        author: "Nelson Mandela"
      });
    }

    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/student/notifications/unread-count
// @desc    Get unread notification count
// @access  Private/Student
router.get('/notifications/unread-count', protect, authorize('student'), async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/student/deeai/chat
// @desc    Chat with Gemini AI
// @access  Private (All authenticated users)
router.post('/deeai/chat', protect, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build conversation context
    let prompt = `You are DeeAI, a friendly and knowledgeable AI assistant for students at Kisumu Technical and Vocational College (KTVC). 
Your role is to help students with their academic questions, provide study guidance, explain concepts, and offer support.
Be encouraging, patient, and educational in your responses.

Student: ${message}`;

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      const context = conversationHistory
        .slice(-6) // Last 6 messages for context
        .map(msg => `${msg.role === 'user' ? 'Student' : 'DeeAI'}: ${msg.content}`)
        .join('\n');
      prompt = `Previous conversation:\n${context}\n\n${prompt}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ 
      response: text,
      success: true 
    });

  } catch (error) {
    console.error('Gemini AI Error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from AI',
      message: error.message 
    });
  }
});

// @route   GET /api/student/announcements
// @desc    Get active announcements for student
// @access  Private/Student
router.get('/announcements', protect, authorize('student'), async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'students' },
        { targetAudience: 'specific-course', targetCourse: req.user.course }
      ]
    })
      .populate('createdBy', 'name role')
      .populate('targetCourse', 'name code')
      .sort({ priority: -1, createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/student/announcements/:id/read
// @desc    Mark announcement as read
// @access  Private/Student
router.put('/announcements/:id/read', protect, authorize('student'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (!announcement.readBy.includes(req.user._id)) {
      announcement.readBy.push(req.user._id);
      await announcement.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/student/download/:filename
// @desc    Download uploaded file
// @access  Private
router.get('/download/:filename', protect, async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
