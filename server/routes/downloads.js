const express = require('express');
const router = express.Router();
const xl = require('excel4node');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Fee = require('../models/Fee');
const Performance = require('../models/Performance');

// Utility function to create Excel workbook
const createWorkbook = () => {
  const wb = new xl.Workbook();
  
  // Define styles
  const headerStyle = wb.createStyle({
    font: { bold: true, color: '#FFFFFF', size: 12 },
    fill: { type: 'pattern', patternType: 'solid', fgColor: '#4472C4' },
    alignment: { horizontal: 'center', vertical: 'center' }
  });
  
  const cellStyle = wb.createStyle({
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      left: { style: 'thin', color: '#000000' },
      right: { style: 'thin', color: '#000000' },
      top: { style: 'thin', color: '#000000' },
      bottom: { style: 'thin', color: '#000000' }
    }
  });
  
  return { wb, headerStyle, cellStyle };
};

// @route   GET /api/downloads/admin/teachers
// @desc    Download all teachers/staff data (Admin)
// @access  Private/Admin
router.get('/admin/teachers', protect, authorize('admin'), async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('name email accountCode phoneNumber isActive createdAt')
      .sort('name');

    const { wb, headerStyle, cellStyle } = createWorkbook();
    const ws = wb.addWorksheet('Teachers');

    // Headers
    const headers = ['Name', 'Email', 'Account Code', 'Phone', 'Status', 'Date Joined'];
    headers.forEach((header, i) => {
      ws.cell(1, i + 1).string(header).style(headerStyle);
    });

    // Data
    teachers.forEach((teacher, rowIndex) => {
      const row = rowIndex + 2;
      ws.cell(row, 1).string(teacher.name || '').style(cellStyle);
      ws.cell(row, 2).string(teacher.email || '').style(cellStyle);
      ws.cell(row, 3).string(teacher.accountCode || '').style(cellStyle);
      ws.cell(row, 4).string(teacher.phoneNumber || 'N/A').style(cellStyle);
      ws.cell(row, 5).string(teacher.isActive ? 'Active' : 'Inactive').style(cellStyle);
      ws.cell(row, 6).string(teacher.createdAt.toLocaleDateString()).style(cellStyle);
    });

    // Set column widths
    ws.column(1).setWidth(25);
    ws.column(2).setWidth(30);
    ws.column(3).setWidth(15);
    ws.column(4).setWidth(15);
    ws.column(5).setWidth(12);
    ws.column(6).setWidth(15);

    // Send file
    const fileName = `Teachers_Data_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    wb.write(fileName, res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/downloads/admin/staff
// @desc    Download all staff data (Admin)
// @access  Private/Admin
router.get('/admin/staff', protect, authorize('admin'), async (req, res) => {
  try {
    const staff = await User.find({ 
      role: { $in: ['finance', 'enrollment', 'gateverification', 'admin'] }
    })
      .select('name email role accountId isActive createdAt')
      .sort('role name');

    const { wb, headerStyle, cellStyle } = createWorkbook();
    const ws = wb.addWorksheet('Staff');

    // Headers
    const headers = ['Name', 'Email', 'Role', 'Account ID', 'Status', 'Date Joined'];
    headers.forEach((header, i) => {
      ws.cell(1, i + 1).string(header).style(headerStyle);
    });

    // Data
    staff.forEach((member, rowIndex) => {
      const row = rowIndex + 2;
      ws.cell(row, 1).string(member.name || '').style(cellStyle);
      ws.cell(row, 2).string(member.email || '').style(cellStyle);
      ws.cell(row, 3).string(member.role.toUpperCase()).style(cellStyle);
      ws.cell(row, 4).string(member.accountId || 'N/A').style(cellStyle);
      ws.cell(row, 5).string(member.isActive ? 'Active' : 'Inactive').style(cellStyle);
      ws.cell(row, 6).string(member.createdAt.toLocaleDateString()).style(cellStyle);
    });

    // Set column widths
    ws.column(1).setWidth(25);
    ws.column(2).setWidth(30);
    ws.column(3).setWidth(15);
    ws.column(4).setWidth(15);
    ws.column(5).setWidth(12);
    ws.column(6).setWidth(15);

    const fileName = `Staff_Data_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    wb.write(fileName, res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/downloads/teacher/students
// @desc    Download students data with scores (Teacher)
// @access  Private/Teacher
router.get('/teacher/students', protect, authorize('teacher'), async (req, res) => {
  try {
    const { course } = req.query;
    const query = { role: 'student' };
    if (course) {
      const courseDoc = await require('../models/Course').findOne({ name: course });
      if (courseDoc) query.course = courseDoc._id;
    }

    const students = await User.find(query)
      .populate('course', 'name code')
      .select('name admissionNumber email course level phoneNumber')
      .sort('name');

    // Get performance records for students
    const studentIds = students.map(s => s._id);
    const performances = await Performance.find({ student: { $in: studentIds } })
      .populate('unit', 'name')
      .select('student totalScore grade');

    const { wb, headerStyle, cellStyle } = createWorkbook();
    const ws = wb.addWorksheet('Students');

    // Headers
    const headers = ['Admission No.', 'Name', 'Email', 'Course', 'Level', 'Phone', 'Average Score'];
    headers.forEach((header, i) => {
      ws.cell(1, i + 1).string(header).style(headerStyle);
    });

    // Data
    students.forEach((student, rowIndex) => {
      const row = rowIndex + 2;
      const studentPerformances = performances.filter(p => p.student.toString() === student._id.toString());
      const avgScore = studentPerformances.length > 0 
        ? (studentPerformances.reduce((sum, p) => sum + (p.totalScore || 0), 0) / studentPerformances.length).toFixed(2)
        : 'N/A';

      ws.cell(row, 1).string(student.admissionNumber || '').style(cellStyle);
      ws.cell(row, 2).string(student.name || '').style(cellStyle);
      ws.cell(row, 3).string(student.email || '').style(cellStyle);
      ws.cell(row, 4).string(student.course?.name || 'N/A').style(cellStyle);
      ws.cell(row, 5).string(student.level || 'N/A').style(cellStyle);
      ws.cell(row, 6).string(student.phoneNumber || 'N/A').style(cellStyle);
      ws.cell(row, 7).string(avgScore.toString()).style(cellStyle);
    });

    // Set column widths
    ws.column(1).setWidth(15);
    ws.column(2).setWidth(25);
    ws.column(3).setWidth(30);
    ws.column(4).setWidth(30);
    ws.column(5).setWidth(12);
    ws.column(6).setWidth(15);
    ws.column(7).setWidth(15);

    const fileName = `Students_Data_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    wb.write(fileName, res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/downloads/finance/payments
// @desc    Download fee payment data (Finance)
// @access  Private/Finance
router.get('/finance/payments', protect, authorize('finance'), async (req, res) => {
  try {
    const { course, status } = req.query;
    let query = {};
    
    // Build query
    const students = await User.find({ role: 'student' }).populate('course', 'name');
    const studentIds = students.map(s => s._id);
    
    if (course) {
      const courseStudents = students.filter(s => s.course?.name === course);
      query.student = { $in: courseStudents.map(s => s._id) };
    } else {
      query.student = { $in: studentIds };
    }
    
    if (status) {
      query.status = status;
    }

    const fees = await Fee.find(query)
      .populate('student', 'name admissionNumber course')
      .populate({
        path: 'student',
        populate: { path: 'course', select: 'name' }
      })
      .sort('-createdAt');

    const { wb, headerStyle, cellStyle } = createWorkbook();
    const ws = wb.addWorksheet('Fee Payments');

    // Headers
    const headers = ['Admission No.', 'Student Name', 'Course', 'Total Amount', 'Amount Paid', 'Balance', 'Status', 'Semester', 'Academic Year', 'Payment Date'];
    headers.forEach((header, i) => {
      ws.cell(1, i + 1).string(header).style(headerStyle);
    });

    // Data
    fees.forEach((fee, rowIndex) => {
      const row = rowIndex + 2;
      ws.cell(row, 1).string(fee.student?.admissionNumber || 'N/A').style(cellStyle);
      ws.cell(row, 2).string(fee.student?.name || 'N/A').style(cellStyle);
      ws.cell(row, 3).string(fee.student?.course?.name || 'N/A').style(cellStyle);
      ws.cell(row, 4).number(fee.totalAmount || 0).style(cellStyle);
      ws.cell(row, 5).number(fee.amountPaid || 0).style(cellStyle);
      ws.cell(row, 6).number(fee.balance || 0).style(cellStyle);
      ws.cell(row, 7).string(fee.status || 'N/A').style(cellStyle);
      ws.cell(row, 8).string(fee.semester || 'N/A').style(cellStyle);
      ws.cell(row, 9).string(fee.academicYear || 'N/A').style(cellStyle);
      ws.cell(row, 10).string(fee.createdAt.toLocaleDateString()).style(cellStyle);
    });

    // Set column widths
    ws.column(1).setWidth(15);
    ws.column(2).setWidth(25);
    ws.column(3).setWidth(30);
    ws.column(4).setWidth(15);
    ws.column(5).setWidth(15);
    ws.column(6).setWidth(15);
    ws.column(7).setWidth(12);
    ws.column(8).setWidth(15);
    ws.column(9).setWidth(15);
    ws.column(10).setWidth(15);

    const fileName = `Fee_Payments_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    wb.write(fileName, res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/downloads/student/performance
// @desc    Download student's exam performance (Student)
// @access  Private/Student
router.get('/student/performance', protect, authorize('student'), async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const performances = await Performance.find({ student: studentId })
      .populate('unit', 'name code')
      .sort('-createdAt');

    const { wb, headerStyle, cellStyle } = createWorkbook();
    const ws = wb.addWorksheet('Exam Performance');

    // Student Info
    ws.cell(1, 1).string('Student Name:').style(headerStyle);
    ws.cell(1, 2).string(req.user.name).style(cellStyle);
    ws.cell(2, 1).string('Admission No.:').style(headerStyle);
    ws.cell(2, 2).string(req.user.admissionNumber).style(cellStyle);

    // Headers (starting from row 4)
    const headers = ['Unit', 'Total Score', 'Grade', 'Semester', 'Academic Year'];
    headers.forEach((header, i) => {
      ws.cell(4, i + 1).string(header).style(headerStyle);
    });

    // Data
    performances.forEach((performance, rowIndex) => {
      const row = rowIndex + 5;
      ws.cell(row, 1).string(performance.unit?.name || 'N/A').style(cellStyle);
      ws.cell(row, 2).number(performance.totalScore || 0).style(cellStyle);
      ws.cell(row, 3).string(performance.grade || 'N/A').style(cellStyle);
      ws.cell(row, 4).string(performance.semester || 'N/A').style(cellStyle);
      ws.cell(row, 5).string(performance.academicYear || 'N/A').style(cellStyle);
    });

    // Calculate average
    if (performances.length > 0) {
      const avgScore = (performances.reduce((sum, p) => sum + (p.totalScore || 0), 0) / performances.length).toFixed(2);
      ws.cell(performances.length + 6, 1).string('Average Score:').style(headerStyle);
      ws.cell(performances.length + 6, 2).string(avgScore).style(cellStyle);
    }

    // Set column widths
    ws.column(1).setWidth(40);
    ws.column(2).setWidth(15);
    ws.column(3).setWidth(12);
    ws.column(4).setWidth(18);
    ws.column(5).setWidth(18);

    const fileName = `Exam_Performance_${req.user.admissionNumber}_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    wb.write(fileName, res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/downloads/student/fees
// @desc    Download student's fee payment history (Student)
// @access  Private/Student
router.get('/student/fees', protect, authorize('student'), async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const fees = await Fee.find({ student: studentId })
      .sort('-createdAt');

    const { wb, headerStyle, cellStyle } = createWorkbook();
    const ws = wb.addWorksheet('Fee Payment History');

    // Student Info
    ws.cell(1, 1).string('Student Name:').style(headerStyle);
    ws.cell(1, 2).string(req.user.name).style(cellStyle);
    ws.cell(2, 1).string('Admission No.:').style(headerStyle);
    ws.cell(2, 2).string(req.user.admissionNumber).style(cellStyle);

    // Headers (starting from row 4)
    const headers = ['Semester', 'Academic Year', 'Total Amount', 'Amount Paid', 'Balance', 'Status', 'Gatepass Expiry', 'Payment Date'];
    headers.forEach((header, i) => {
      ws.cell(4, i + 1).string(header).style(headerStyle);
    });

    // Data
    fees.forEach((fee, rowIndex) => {
      const row = rowIndex + 5;
      ws.cell(row, 1).string(fee.semester || 'N/A').style(cellStyle);
      ws.cell(row, 2).string(fee.academicYear || 'N/A').style(cellStyle);
      ws.cell(row, 3).number(fee.totalAmount || 0).style(cellStyle);
      ws.cell(row, 4).number(fee.amountPaid || 0).style(cellStyle);
      ws.cell(row, 5).number(fee.balance || 0).style(cellStyle);
      ws.cell(row, 6).string(fee.status || 'N/A').style(cellStyle);
      ws.cell(row, 7).string(fee.gatepassExpiryDate ? new Date(fee.gatepassExpiryDate).toLocaleDateString() : 'N/A').style(cellStyle);
      ws.cell(row, 8).string(fee.createdAt.toLocaleDateString()).style(cellStyle);
    });

    // Totals
    if (fees.length > 0) {
      const totalAmount = fees.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
      const totalPaid = fees.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
      const totalBalance = fees.reduce((sum, f) => sum + (f.balance || 0), 0);
      
      const totalRow = fees.length + 6;
      ws.cell(totalRow, 1).string('TOTALS:').style(headerStyle);
      ws.cell(totalRow, 3).number(totalAmount).style(headerStyle);
      ws.cell(totalRow, 4).number(totalPaid).style(headerStyle);
      ws.cell(totalRow, 5).number(totalBalance).style(headerStyle);
    }

    // Set column widths
    ws.column(1).setWidth(15);
    ws.column(2).setWidth(15);
    ws.column(3).setWidth(15);
    ws.column(4).setWidth(15);
    ws.column(5).setWidth(15);
    ws.column(6).setWidth(12);
    ws.column(7).setWidth(18);
    ws.column(8).setWidth(15);

    const fileName = `Fee_History_${req.user.admissionNumber}_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    wb.write(fileName, res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
