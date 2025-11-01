import React, { useState, useEffect, useContext } from 'react';
import axios from '../../services/axios';
import { AuthContext } from '../../context/AuthContext';
import { 
  Users, 
  FileText, 
  Calendar, 
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  X,
  Save,
  Download
} from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTimetableForm, setShowTimetableForm] = useState(false);
  const [showGradingForm, setShowGradingForm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [units, setUnits] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');

  // Timetable form state
  const [timetableForm, setTimetableForm] = useState({
    course: '',
    level: '',
    semester: 'Semester 1',
    academicYear: '2024/2025',
    schedule: []
  });

  // Grading form state
  const [gradingForm, setGradingForm] = useState({
    studentId: '',
    unitId: '',
    type: 'CAT',
    score: '',
    maxScore: '',
    semester: 'Semester 1',
    academicYear: '2024/2025',
    remarks: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetchDashboardData();
    fetchCourses();
    fetchUnits();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/teacher/dashboard');
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/teacher/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await axios.get('/api/teacher/units');
      setUnits(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/teacher/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await axios.get(`/api/teacher/student/${studentId}`);
      setStudentDetails(response.data);
      setSelectedStudent(studentId);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const addScheduleEntry = () => {
    setTimetableForm({
      ...timetableForm,
      schedule: [...timetableForm.schedule, {
        day: 'Monday',
        time: '',
        unit: '',
        venue: ''
      }]
    });
  };

  const updateScheduleEntry = (index, field, value) => {
    const newSchedule = [...timetableForm.schedule];
    newSchedule[index][field] = value;
    setTimetableForm({ ...timetableForm, schedule: newSchedule });
  };

  const removeScheduleEntry = (index) => {
    const newSchedule = timetableForm.schedule.filter((_, i) => i !== index);
    setTimetableForm({ ...timetableForm, schedule: newSchedule });
  };

  const handleCreateTimetable = async (e) => {
    e.preventDefault();
    try {
      // Add teacher to each schedule entry
      const scheduleWithTeacher = timetableForm.schedule.map(entry => ({
        ...entry,
        teacher: user._id
      }));

      await axios.post('/api/teacher/timetable', {
        ...timetableForm,
        schedule: scheduleWithTeacher
      });

      alert('Timetable created successfully!');
      setShowTimetableForm(false);
      setTimetableForm({
        course: '',
        level: '',
        semester: 'Semester 1',
        academicYear: '2024/2025',
        schedule: []
      });
      fetchDashboardData();
    } catch (error) {
      alert('Error creating timetable: ' + error.response?.data?.message);
    }
  };

  const handlePublishTimetable = async (id) => {
    try {
      await axios.put(`/api/teacher/timetable/${id}/publish`);
      alert('Timetable published successfully!');
      fetchDashboardData();
    } catch (error) {
      alert('Error publishing timetable: ' + error.response?.data?.message);
    }
  };

  const handleDownloadStudentsData = async () => {
    try {
      const response = await axios.get('/api/downloads/teacher/students', {
        params: { course: selectedCourse },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Students_Data_${selectedCourse || 'All'}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error downloading students data: ' + error.message);
    }
  };

  const handleDeleteTimetable = async (id) => {
    if (window.confirm('Are you sure you want to delete this timetable?')) {
      try {
        await axios.delete(`/api/teacher/timetable/${id}`);
        alert('Timetable deleted successfully!');
        fetchDashboardData();
      } catch (error) {
        alert('Error deleting timetable: ' + error.response?.data?.message);
      }
    }
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/teacher/performance', gradingForm);
      alert('Grade submitted successfully!');
      setGradingForm({
        studentId: '',
        unitId: '',
        type: 'CAT',
        score: '',
        maxScore: '',
        semester: 'Semester 1',
        academicYear: '2024/2025',
        remarks: ''
      });
      setStudentDetails(null);
      setSelectedStudent(null);
    } catch (error) {
      alert('Error submitting grade: ' + error.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-green-100 text-lg mb-3">
          Welcome to the Teacher Dashboard. All systems green - let's make a difference!
        </p>
        {dashboardData?.quote && (
          <>
            <p className="text-green-50 italic mb-2">"{dashboardData.quote.text}"</p>
            <p className="text-xs text-green-200">- {dashboardData.quote.author}</p>
          </>
        )}
      </div>

      {/* Count Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Students Registered</p>
              <p className="text-4xl font-bold text-green-600">
                {dashboardData?.studentsCount || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">in your courses</p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <Users className="text-green-600" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Assignments</p>
              <p className="text-4xl font-bold text-blue-600">
                {dashboardData?.assignmentsCount || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {dashboardData?.assignmentsCount === 0 ? 'No assigned assignments' : 'assigned to students'}
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <FileText className="text-blue-600" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Download Data Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center mb-6">
          <Download className="text-green-600 mr-3" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Download Students Data</h2>
            <p className="text-sm text-gray-600">Export student data with scores to Excel</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Course (Optional)</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course.name}>{course.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleDownloadStudentsData}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center justify-center transition"
            >
              <Download size={20} className="mr-2" />
              Download Students Data
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          📊 Excel file includes: Admission No., Names, Emails, Courses, Levels, Phone Numbers, and Average Scores
        </p>
      </div>

      {/* Timetable Section */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Calendar className="mr-2 text-purple-600" size={24} />
            Timetable Management
          </h2>
          <button
            onClick={() => setShowTimetableForm(!showTimetableForm)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center transition"
          >
            <Plus size={20} className="mr-2" />
            Create Timetable
          </button>
        </div>

        {/* Timetable Creation Form */}
        {showTimetableForm && (
          <form onSubmit={handleCreateTimetable} className="mb-6 bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Create New Timetable</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  value={timetableForm.course}
                  onChange={(e) => setTimetableForm({ ...timetableForm, course: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  value={timetableForm.level}
                  onChange={(e) => setTimetableForm({ ...timetableForm, level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Level</option>
                  {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'].map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Schedule Entries */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Schedule</label>
                <button
                  type="button"
                  onClick={addScheduleEntry}
                  className="text-purple-600 hover:text-purple-700 text-sm flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Entry
                </button>
              </div>

              {timetableForm.schedule.map((entry, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3 p-3 bg-white rounded border">
                  <select
                    value={entry.day}
                    onChange={(e) => updateScheduleEntry(index, 'day', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Time (e.g., 8:00 AM - 10:00 AM)"
                    value={entry.time}
                    onChange={(e) => updateScheduleEntry(index, 'time', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    required
                  />

                  <select
                    value={entry.unit}
                    onChange={(e) => updateScheduleEntry(index, 'unit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Unit</option>
                    {units.map(unit => (
                      <option key={unit._id} value={unit._id}>{unit.name}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Venue"
                    value={entry.venue}
                    onChange={(e) => updateScheduleEntry(index, 'venue', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => removeScheduleEntry(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center"
              >
                <Save size={20} className="mr-2" />
                Save Timetable
              </button>
              <button
                type="button"
                onClick={() => setShowTimetableForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Existing Timetables */}
        <div className="space-y-4">
          {dashboardData?.timetables?.length > 0 ? (
            dashboardData.timetables.map((timetable) => (
              <div key={timetable._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{timetable.course?.name}</h3>
                    <p className="text-sm text-gray-600">{timetable.level} - {timetable.semester}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      timetable.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {timetable.isActive ? 'Published' : 'Draft'}
                    </span>
                    {!timetable.isActive && (
                      <button
                        onClick={() => handlePublishTimetable(timetable._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center"
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTimetable(timetable._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Day</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Time</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Unit</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Venue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timetable.schedule.map((entry, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">{entry.day}</td>
                          <td className="border border-gray-300 px-4 py-2">{entry.time}</td>
                          <td className="border border-gray-300 px-4 py-2">{entry.unit?.name}</td>
                          <td className="border border-gray-300 px-4 py-2">{entry.venue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No timetables created yet</p>
          )}
        </div>
      </div>

      {/* Grading Section */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
          <GraduationCap className="mr-2 text-indigo-600" size={24} />
          Student Grading
        </h2>

        <button
          onClick={() => {
            setShowGradingForm(!showGradingForm);
            if (!showGradingForm) fetchStudents();
          }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg mb-4"
        >
          {showGradingForm ? 'Hide Grading Form' : 'Grade Students'}
        </button>

        {showGradingForm && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Enter Student Grade</h3>

            {/* Student Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
              <select
                value={selectedStudent || ''}
                onChange={(e) => fetchStudentDetails(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose a student...</option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.name} - {student.admissionNumber} ({student.course?.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Show student's units when selected */}
            {studentDetails && (
              <form onSubmit={handleSubmitGrade}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enrolled Units</label>
                  <select
                    value={gradingForm.unitId}
                    onChange={(e) => setGradingForm({ ...gradingForm, unitId: e.target.value, studentId: selectedStudent })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Unit</option>
                    {studentDetails.units.map(unit => (
                      <option key={unit._id} value={unit._id}>{unit.name} ({unit.code})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Type</label>
                    <select
                      value={gradingForm.type}
                      onChange={(e) => setGradingForm({ ...gradingForm, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="CAT">CAT</option>
                      <option value="Assignment">Assignment</option>
                      <option value="Exam">Exam</option>
                      <option value="Project">Project</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                    <select
                      value={gradingForm.semester}
                      onChange={(e) => setGradingForm({ ...gradingForm, semester: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                    <input
                      type="number"
                      value={gradingForm.score}
                      onChange={(e) => setGradingForm({ ...gradingForm, score: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter score"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Out of (Max Score)</label>
                    <input
                      type="number"
                      value={gradingForm.maxScore}
                      onChange={(e) => setGradingForm({ ...gradingForm, maxScore: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Maximum score"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks (Optional)</label>
                  <textarea
                    value={gradingForm.remarks}
                    onChange={(e) => setGradingForm({ ...gradingForm, remarks: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows="2"
                    placeholder="Add feedback or comments..."
                  />
                </div>

                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center"
                >
                  <CheckCircle size={20} className="mr-2" />
                  Submit Grade
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
