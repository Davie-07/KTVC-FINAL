import React, { useState, useEffect, useContext } from 'react';
import axios from '../../services/axios';
import { AuthContext } from '../../context/AuthContext';
import { UserPlus, Check, AlertCircle, Loader } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countyOfBirth: '',
    dateOfBirth: '',
    courseId: '',
    level: 'Level 4',
    admissionNumber: '',
    phone: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/enrollment/courses');
      // Ensure response.data is an array
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]); // Set to empty array on error
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 3-second loading animation
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const response = await axios.post('/api/enrollment/register-student', formData);

      if (response.data.success) {
        setRegistrationSuccess(true);
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            countyOfBirth: '',
            dateOfBirth: '',
            courseId: '',
            level: 'Level 4',
            admissionNumber: '',
            phone: ''
          });
          setRegistrationSuccess(false);
        }, 5000);
      }

    } catch (error) {
      if (error.response?.data?.code === 'ADMISSION_EXISTS') {
        setError('This admission number is already registered!');
      } else if (error.response?.data?.code === 'EMAIL_EXISTS') {
        setError('This email address is already registered!');
      } else {
        setError(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Welcome, {user?.name}! 🎓
        </h1>
        <p className="text-purple-100 text-lg">
          New Student Enrollment Portal - Register new students to the school
        </p>
      </div>

      {/* Registration Form */}
      <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
        <div className="flex items-center mb-6">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <UserPlus className="text-purple-600" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Student Registration Form</h2>
            <p className="text-sm text-gray-600">Fill in all required fields to enroll a new student</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="text-red-600 mr-2 flex-shrink-0" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {registrationSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
            <Check className="text-green-600 mr-2 flex-shrink-0" size={20} />
            <div className="text-green-800">
              <p className="font-semibold">Registration Successful! ✅</p>
              <p className="text-sm mt-1">
                Student has been enrolled successfully. They can now login with their admission number and course.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter first name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="student@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="0712345678"
                required
              />
            </div>
          </div>

          {/* County and Date of Birth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                County of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="countyOfBirth"
                value={formData.countyOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="e.g., Nairobi, Kiambu, Murang'a"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Course and Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              >
                <option value="">Select a course</option>
                {(Array.isArray(courses) ? courses : []).map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Level <span className="text-red-500">*</span>
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              >
                <option value="Level 4">Level 4</option>
                <option value="Level 5">Level 5</option>
                <option value="Level 6">Level 6</option>
              </select>
            </div>
          </div>

          {/* Admission Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Student Admission Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="admissionNumber"
              value={formData.admissionNumber}
              onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="e.g., STD20240001"
              required
            />
            <p className="text-xs text-gray-600 mt-1">
              This admission number will be used for student login
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center text-lg"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={24} />
                Registering Student...
              </>
            ) : (
              <>
                <UserPlus className="mr-2" size={24} />
                Register Student
              </>
            )}
          </button>

          {loading && (
            <div className="text-center text-sm text-gray-600">
              <p>Please wait while we process the registration...</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Home;
