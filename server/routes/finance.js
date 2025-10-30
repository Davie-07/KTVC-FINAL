const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Fee = require('../models/Fee');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');

// @route   GET /api/finance/students
// @desc    Get all students with their fee information
// @access  Private/Finance
router.get('/students', protect, authorize('finance'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .populate('course', 'name code')
      .sort('name');

    // Get fee information for each student
    const studentsWithFees = await Promise.all(
      students.map(async (student) => {
        const fees = await Fee.find({ student: student._id })
          .sort('-createdAt')
          .limit(1);

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          admissionNumber: student.admissionNumber,
          course: student.course,
          level: student.level,
          yearOfStudy: student.yearOfStudy || 'Year 1',
          currentFee: fees[0] || null
        };
      })
    );

    res.json(studentsWithFees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/finance/student/:id
// @desc    Get specific student fee details
// @access  Private/Finance
router.get('/student/:id', protect, authorize('finance'), async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .populate('course', 'name code');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const fees = await Fee.find({ student: student._id })
      .sort('-createdAt');

    res.json({
      student,
      fees
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/finance/fee
// @desc    Create or update fee record
// @access  Private/Finance
router.post('/fee', protect, authorize('finance'), async (req, res) => {
  try {
    const {
      studentId,
      totalAmount,
      amountPaid,
      balance,
      semester,
      academicYear,
      gatepassExpiryDate,
      lastUnpaidBalance,
      unpaidBalanceSemester,
      unpaidBalanceYear,
      status,
      paymentAmount,
      paymentMethod,
      receiptNumber
    } = req.body;

    // Check if fee record exists for this semester
    let fee = await Fee.findOne({
      student: studentId,
      semester,
      academicYear
    });

    if (fee) {
      // Update existing fee
      fee.totalAmount = totalAmount;
      fee.amountPaid = amountPaid;
      fee.balance = balance;
      fee.status = status;
      fee.gatepassExpiryDate = gatepassExpiryDate;
      fee.lastUnpaidBalance = lastUnpaidBalance || 0;
      fee.unpaidBalanceSemester = unpaidBalanceSemester;
      fee.unpaidBalanceYear = unpaidBalanceYear;

      // Add payment if provided
      if (paymentAmount && paymentAmount > 0) {
        fee.payments.push({
          amount: paymentAmount,
          date: new Date(),
          receiptNumber: receiptNumber || `RCP${Date.now()}`,
          paymentMethod: paymentMethod || 'Cash',
          processedBy: req.user._id
        });
      }

      await fee.save();
    } else {
      // Create new fee record
      const paymentData = [];
      if (paymentAmount && paymentAmount > 0) {
        paymentData.push({
          amount: paymentAmount,
          date: new Date(),
          receiptNumber: receiptNumber || `RCP${Date.now()}`,
          paymentMethod: paymentMethod || 'Cash',
          processedBy: req.user._id
        });
      }

      fee = await Fee.create({
        student: studentId,
        totalAmount,
        amountPaid,
        balance,
        semester,
        academicYear,
        status,
        gatepassExpiryDate,
        lastUnpaidBalance: lastUnpaidBalance || 0,
        unpaidBalanceSemester,
        unpaidBalanceYear,
        payments: paymentData
      });
    }

    const populatedFee = await Fee.findById(fee._id)
      .populate('student', 'name email admissionNumber')
      .populate('payments.processedBy', 'name');

    // Send notification to student
    await Notification.create({
      recipient: studentId,
      sender: req.user._id,
      type: 'fee',
      title: 'Fee Record Updated',
      message: `Your fee record for ${semester} ${academicYear} has been updated. Balance: KES ${balance}`,
      priority: balance > 0 ? 'high' : 'medium'
    });

    res.status(201).json(populatedFee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/finance/fee/:id
// @desc    Update fee record
// @access  Private/Finance
router.put('/fee/:id', protect, authorize('finance'), async (req, res) => {
  try {
    const {
      totalAmount,
      amountPaid,
      balance,
      status,
      gatepassExpiryDate,
      lastUnpaidBalance,
      unpaidBalanceSemester,
      unpaidBalanceYear,
      paymentAmount,
      paymentMethod,
      receiptNumber
    } = req.body;

    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    // Update fields
    if (totalAmount !== undefined) fee.totalAmount = totalAmount;
    if (amountPaid !== undefined) fee.amountPaid = amountPaid;
    if (balance !== undefined) fee.balance = balance;
    if (status) fee.status = status;
    if (gatepassExpiryDate !== undefined) fee.gatepassExpiryDate = gatepassExpiryDate;
    if (lastUnpaidBalance !== undefined) fee.lastUnpaidBalance = lastUnpaidBalance;
    if (unpaidBalanceSemester) fee.unpaidBalanceSemester = unpaidBalanceSemester;
    if (unpaidBalanceYear) fee.unpaidBalanceYear = unpaidBalanceYear;

    // Add payment if provided
    if (paymentAmount && paymentAmount > 0) {
      fee.payments.push({
        amount: paymentAmount,
        date: new Date(),
        receiptNumber: receiptNumber || `RCP${Date.now()}`,
        paymentMethod: paymentMethod || 'Cash',
        processedBy: req.user._id
      });
    }

    await fee.save();

    const populatedFee = await Fee.findById(fee._id)
      .populate('student', 'name email admissionNumber')
      .populate('payments.processedBy', 'name');

    // Send notification to student
    await Notification.create({
      recipient: fee.student,
      sender: req.user._id,
      type: 'fee',
      title: 'Fee Record Updated',
      message: `Your fee record has been updated. Balance: KES ${fee.balance}`,
      priority: fee.balance > 0 ? 'high' : 'medium'
    });

    res.json(populatedFee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/finance/fee/:id
// @desc    Delete fee record
// @access  Private/Finance
router.delete('/fee/:id', protect, authorize('finance'), async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);

    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    res.json({ message: 'Fee record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/finance/dashboard
// @desc    Get finance dashboard statistics
// @access  Private/Finance
router.get('/dashboard', protect, authorize('finance'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    const fees = await Fee.find({});
    
    const totalExpected = fees.reduce((sum, fee) => sum + fee.totalAmount, 0);
    const totalCollected = fees.reduce((sum, fee) => sum + fee.amountPaid, 0);
    const totalPending = fees.reduce((sum, fee) => sum + fee.balance, 0);

    const paidCount = fees.filter(f => f.status === 'Paid').length;
    const partialCount = fees.filter(f => f.status === 'Partial').length;
    const unpaidCount = fees.filter(f => f.status === 'Unpaid').length;

    res.json({
      totalStudents,
      totalExpected,
      totalCollected,
      totalPending,
      paidCount,
      partialCount,
      unpaidCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/finance/payments
// @desc    Get all payments
// @access  Private
router.get('/payments', protect, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('student', 'name admissionNumber')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

// @route   GET /api/finance/stats
// @desc    Get finance statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const totalPayments = await Payment.aggregate([
      { $match: { status: 'Confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const todayPayments = await Payment.aggregate([
      {
        $match: {
          status: 'Confirmed',
          date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalCollected: totalPayments[0]?.total || 0,
      todayCollected: todayPayments[0]?.total || 0,
      pendingPayments: await Payment.countDocuments({ status: 'Pending' }),
      totalStudents: await User.countDocuments({ role: 'student' })
    });
  } catch (error) {
    console.error('Error fetching finance stats:', error);
    res.status(500).json({ message: 'Error fetching finance statistics' });
  }
});

// @route   POST /api/finance/payments
// @desc    Create new payment
// @access  Private
router.post('/payments', protect, async (req, res) => {
  try {
    const {
      studentId,
      amount,
      paymentMethod,
      description,
      semester,
      academicYear
    } = req.body;

    const payment = await Payment.create({
      student: studentId,
      amount,
      paymentMethod,
      description,
      semester,
      academicYear,
      processedBy: req.user._id,
      receiptNumber: `RCP${Date.now()}`,
      status: 'Confirmed'
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('student', 'name admissionNumber')
      .populate('processedBy', 'name');

    res.status(201).json(populatedPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Error creating payment' });
  }
});

module.exports = router;
