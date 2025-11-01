const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Fee = require('../models/Fee');
const GateVerification = require('../models/GateVerification');
const VerificationReceipt = require('../models/VerificationReceipt');
const Notification = require('../models/Notification');

// Helper function to generate 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to get today's date at midnight
const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Helper function to get today's date at 23:59:59
const getTodayEnd = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

// @route   POST /api/gate/verify
// @desc    Verify student gate pass
// @access  Private/Gate
router.post('/verify', protect, authorize('gate', 'gateverification'), async (req, res) => {
  try {
    const { admissionNumber, course, verificationCode } = req.body;

    // Find student
    const student = await User.findOne({ 
      admissionNumber,
      role: 'student'
    }).populate('course', 'name code');

    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found with this admission number' 
      });
    }

    // Check if course matches
    if (student.course.name !== course && student.course.code !== course) {
      return res.status(400).json({ 
        success: false,
        message: 'Course does not match student records' 
      });
    }

    // Get today's date range
    const todayStart = getTodayStart();
    const todayEnd = getTodayEnd();

    // Check how many times this admission was verified today
    const verificationsToday = await GateVerification.countDocuments({
      admissionNumber,
      verificationDate: {
        $gte: todayStart,
        $lte: todayEnd
      }
    });

    console.log(`Admission ${admissionNumber} has been verified ${verificationsToday} times today`);

    // If verified 2+ times today (3rd attempt), require verification code
    if (verificationsToday >= 2 && !verificationCode) {
      // Check if code already exists for today
      let receipt = await VerificationReceipt.findOne({
        student: student._id,
        generatedDate: {
          $gte: todayStart,
          $lte: todayEnd
        },
        isUsed: false
      });

      // Generate new code if doesn't exist
      if (!receipt) {
        const code = generateVerificationCode();
        const expiresAt = new Date();
        expiresAt.setHours(23, 59, 59, 999); // Expires at end of day

        receipt = await VerificationReceipt.create({
          student: student._id,
          admissionNumber,
          verificationCode: code,
          expiresAt
        });

        // Send notification to student with the code
        await Notification.create({
          recipient: student._id,
          sender: req.user._id,
          type: 'gatepass',
          title: 'Gate Verification Code Required',
          message: `SECURITY ALERT: Your admission number has been used for verification multiple times today. Your verification code is: ${code}. This code is valid until end of day. If you did not request this, please contact security.`,
          priority: 'high'
        });
      }

      return res.status(400).json({
        success: false,
        requiresCode: true,
        message: 'This admission has been verified twice today already. For security, a 6-digit verification code has been sent to the student dashboard. Please ask the student for the code.',
        codeSentToStudent: true,
        verificationsToday
      });
    }

    // If code is required (2+ verifications) and provided, validate it
    if (verificationsToday >= 2 && verificationCode) {
      const receipt = await VerificationReceipt.findOne({
        student: student._id,
        verificationCode,
        isUsed: false,
        expiresAt: { $gt: new Date() }
      });

      if (!receipt) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code'
        });
      }

      // Mark code as used
      receipt.isUsed = true;
      receipt.usedAt = new Date();
      await receipt.save();
    }

    // Get student's fee information
    const latestFee = await Fee.findOne({ 
      student: student._id 
    }).sort('-createdAt');

    if (!latestFee) {
      return res.status(400).json({
        success: false,
        message: 'No fee records found for this student'
      });
    }

    // Check if gatepass has expiry date and if it's valid
    const now = new Date();
    let status = 'Valid';
    let isExpired = false;

    if (latestFee.gatepassExpiryDate) {
      if (now > new Date(latestFee.gatepassExpiryDate)) {
        status = 'Expired';
        isExpired = true;
      }
    } else {
      // No expiry date set
      status = 'Denied';
      return res.status(400).json({
        success: false,
        message: 'No gate pass expiry date set for this student. Please contact finance office.'
      });
    }

    // Create verification record
    const verification = await GateVerification.create({
      student: student._id,
      admissionNumber,
      verificationDate: new Date(),
      verificationTime: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      status,
      expiryDate: latestFee.gatepassExpiryDate,
      verifiedBy: req.user._id
    });

    // Get previous verification time for warning message
    let previousVerificationTime = null;
    if (verificationsToday === 1) {
      const previousVerification = await GateVerification.findOne({
        admissionNumber,
        verificationDate: {
          $gte: todayStart,
          $lte: todayEnd
        }
      }).sort('createdAt');
      previousVerificationTime = previousVerification?.verificationTime;
    }

    // Return verification result
    res.json({
      success: !isExpired,
      isExpired,
      student: {
        name: student.name,
        admissionNumber: student.admissionNumber,
        course: student.course.name,
        level: student.level
      },
      expiryDate: latestFee.gatepassExpiryDate,
      verificationTime: verification.verificationTime,
      status,
      balance: latestFee.balance,
      verificationsToday: verificationsToday + 1, // Include current verification
      previousVerificationTime,
      warning: verificationsToday === 1 
        ? `This admission was already verified today at ${previousVerificationTime}. Next verification will require a security code.`
        : null,
      message: isExpired 
        ? `Gate pass expired on ${new Date(latestFee.gatepassExpiryDate).toLocaleDateString()}. Please pay your fees.`
        : `Valid gate pass until ${new Date(latestFee.gatepassExpiryDate).toLocaleDateString()}`
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   GET /api/gate/verifications/today
// @desc    Get today's verifications
// @access  Private/Gate
router.get('/verifications/today', protect, authorize('gate', 'gateverification'), async (req, res) => {
  try {
    const todayStart = getTodayStart();
    const todayEnd = getTodayEnd();

    const verifications = await GateVerification.find({
      verificationDate: {
        $gte: todayStart,
        $lte: todayEnd
      }
    })
      .populate('student', 'name admissionNumber course level')
      .populate('verifiedBy', 'name')
      .sort('-createdAt');

    res.json(verifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/gate/verifications/history
// @desc    Get verification history
// @access  Private/Gate
router.get('/verifications/history', protect, authorize('gate', 'gateverification'), async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.verificationDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const verifications = await GateVerification.find(query)
      .populate('student', 'name admissionNumber course level')
      .populate('verifiedBy', 'name')
      .sort('-createdAt')
      .limit(parseInt(limit));

    res.json(verifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/gate/student/:admissionNumber/receipts
// @desc    Get student's verification receipts
// @access  Private/Student
router.get('/student/:admissionNumber/receipts', protect, async (req, res) => {
  try {
    const student = await User.findOne({ 
      admissionNumber: req.params.admissionNumber,
      role: 'student'
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if requesting user is the student or has appropriate role
    if (req.user.role === 'student' && req.user._id.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const receipts = await VerificationReceipt.find({
      student: student._id,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort('-generatedDate');

    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/gate/dashboard
// @desc    Get gate verification dashboard stats
// @access  Private/Gate
router.get('/dashboard', protect, authorize('gate', 'gateverification'), async (req, res) => {
  try {
    const todayStart = getTodayStart();
    const todayEnd = getTodayEnd();

    const todayVerifications = await GateVerification.countDocuments({
      verificationDate: {
        $gte: todayStart,
        $lte: todayEnd
      }
    });

    const validToday = await GateVerification.countDocuments({
      verificationDate: {
        $gte: todayStart,
        $lte: todayEnd
      },
      status: 'Valid'
    });

    const expiredToday = await GateVerification.countDocuments({
      verificationDate: {
        $gte: todayStart,
        $lte: todayEnd
      },
      status: 'Expired'
    });

    const totalStudents = await User.countDocuments({ role: 'student' });

    res.json({
      todayVerifications,
      validToday,
      expiredToday,
      totalStudents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
