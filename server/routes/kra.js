const express = require('express');
const router = express.Router();
const axios = require('axios');
const KRAPin = require('../models/KRAPin');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// KRA API Configuration
const KRA_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.kra.go.ke/v1'
  : 'https://sbx.kra.go.ke/v1';

const CONSUMER_KEY = process.env.KRA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.KRA_CONSUMER_SECRET || '';

// Generate Access Token
const generateKRAToken = async () => {
  try {
    const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    const response = await axios.get(`${KRA_BASE_URL}/token/generate`, {
      params: { grant_type: 'client_credentials' },
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('KRA Token Generation Error:', error.response?.data || error.message);
    throw new Error('Failed to generate KRA access token');
  }
};

// @route   POST /api/kra/generate-pin
// @desc    Generate KRA PIN for individual
// @access  Private (Student, Admin, Enrollment)
router.post('/generate-pin', protect, authorize('student', 'admin', 'enrollment'), async (req, res) => {
  try {
    const {
      identificationNumber,
      dateOfBirth,
      mobileNumber,
      emailAddress,
      isPinWithNoOblig,
      studentId
    } = req.body;

    // Determine student ID (use req.user._id if student, or provided studentId if admin/enrollment)
    const targetStudentId = req.user.role === 'student' ? req.user._id : studentId;

    if (!targetStudentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Check if student exists
    const student = await User.findById(targetStudentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if PIN request already exists for this student
    const existingRequest = await KRAPin.findOne({ 
      student: targetStudentId,
      status: { $in: ['success', 'processing'] }
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'PIN request already exists for this student',
        pin: existingRequest.pin,
        status: existingRequest.status
      });
    }

    // Create pending request
    const pinRequest = await KRAPin.create({
      student: targetStudentId,
      taxpayerType: 'KE',
      identificationNumber,
      dateOfBirth,
      mobileNumber,
      emailAddress,
      isPinWithNoOblig: isPinWithNoOblig || 'Yes',
      status: 'processing',
      processedBy: req.user._id
    });

    // Generate KRA Token
    let accessToken;
    try {
      accessToken = await generateKRAToken();
    } catch (tokenError) {
      pinRequest.status = 'failed';
      pinRequest.errorMessage = 'Failed to authenticate with KRA API';
      await pinRequest.save();
      
      return res.status(500).json({ 
        message: 'Failed to authenticate with KRA API',
        error: tokenError.message 
      });
    }

    // Call KRA PIN Generation API
    try {
      const kraResponse = await axios.post(
        `${KRA_BASE_URL}/generate/pin`,
        {
          TAXPAYERDETAILS: {
            TaxpayerType: 'KE',
            IdentificationNumber: identificationNumber,
            DateOfBirth: dateOfBirth,
            MobileNumber: mobileNumber,
            EmailAddress: emailAddress,
            IsPinWithNoOblig: isPinWithNoOblig || 'Yes'
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      // Handle successful response
      if (kraResponse.data.RESPONSE && kraResponse.data.RESPONSE.ResponseCode === '80000') {
        pinRequest.status = 'success';
        pinRequest.pin = kraResponse.data.RESPONSE.PIN;
        pinRequest.responseCode = kraResponse.data.RESPONSE.ResponseCode;
        pinRequest.responseMessage = kraResponse.data.RESPONSE.Message;
        pinRequest.kraResponse = kraResponse.data;
        await pinRequest.save();

        return res.json({
          success: true,
          message: 'KRA PIN generated successfully',
          pin: kraResponse.data.RESPONSE.PIN,
          responseCode: kraResponse.data.RESPONSE.ResponseCode,
          data: pinRequest
        });
      }

    } catch (kraError) {
      // Handle KRA API errors
      const errorData = kraError.response?.data;
      
      pinRequest.status = 'failed';
      pinRequest.requestId = errorData?.RequestId;
      pinRequest.errorMessage = errorData?.ErrorMessage || kraError.message;
      pinRequest.kraResponse = errorData;
      await pinRequest.save();

      return res.status(400).json({
        success: false,
        message: errorData?.ErrorMessage || 'Failed to generate KRA PIN',
        errorCode: errorData?.ErrorCode,
        requestId: errorData?.RequestId,
        data: pinRequest
      });
    }

  } catch (error) {
    console.error('KRA PIN Generation Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/kra/requests
// @desc    Get all KRA PIN requests (for admin) or user's own requests
// @access  Private
router.get('/requests', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'admin' || req.user.role === 'enrollment') {
      // Admin and enrollment can see all requests
      query = {};
    } else {
      return res.status(403).json({ message: 'Not authorized to view KRA requests' });
    }

    const requests = await KRAPin.find(query)
      .populate('student', 'name email admissionNumber')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/kra/request/:id
// @desc    Get specific KRA PIN request
// @access  Private
router.get('/request/:id', protect, async (req, res) => {
  try {
    const request = await KRAPin.findById(req.params.id)
      .populate('student', 'name email admissionNumber')
      .populate('processedBy', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check authorization
    if (req.user.role === 'student' && request.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this request' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/kra/stats
// @desc    Get KRA PIN statistics
// @access  Private (Admin, Enrollment)
router.get('/stats', protect, authorize('admin', 'enrollment'), async (req, res) => {
  try {
    const totalRequests = await KRAPin.countDocuments();
    const successfulRequests = await KRAPin.countDocuments({ status: 'success' });
    const failedRequests = await KRAPin.countDocuments({ status: 'failed' });
    const pendingRequests = await KRAPin.countDocuments({ status: 'processing' });

    res.json({
      totalRequests,
      successfulRequests,
      failedRequests,
      pendingRequests,
      successRate: totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
