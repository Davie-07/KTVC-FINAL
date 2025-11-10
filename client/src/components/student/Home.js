import React, { useState, useEffect, useContext } from 'react';
import axios from '../../services/axios';
import { AuthContext } from '../../context/AuthContext';
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  MessageSquare,
  Clock,
  Download
} from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState({
    category: 'Help',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/student/dashboard');
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleDownloadPerformance = async () => {
    try {
      const response = await axios.get('/api/downloads/student/performance', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Exam_Performance_${user.admissionNumber}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error downloading performance data: ' + error.message);
    }
  };

  const handleDownloadFees = async () => {
    try {
      const response = await axios.get('/api/downloads/student/fees', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Fee_History_${user.admissionNumber}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error downloading fee history: ' + error.message);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/student/complaints', complaint);
      setSubmitStatus({ type: 'success', message: 'Your message has been sent to admin!' });
      setComplaint({ category: 'Help', subject: '', message: '' });
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  // Prepare performance data for chart
  const performanceData = dashboardData?.performance?.map(p => ({
    unit: p.unit?.code || 'N/A',
    score: p.totalScore || 0
  })) || [];

  // Calculate average performance
  const averageScore = performanceData.length > 0
    ? (performanceData.reduce((sum, p) => sum + p.score, 0) / performanceData.length).toFixed(2)
    : 0;

  // Prepare fee data for pie chart
  const totalFees = dashboardData?.fees?.reduce((sum, f) => sum + f.totalAmount, 0) || 0;
  const totalPaid = dashboardData?.fees?.reduce((sum, f) => sum + f.amountPaid, 0) || 0;
  const totalBalance = totalFees - totalPaid;

  const feeData = [
    { name: 'Paid', value: totalPaid },
    { name: 'Balance', value: totalBalance }
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-blue-100 mb-4 text-sm lg:text-base">
          {dashboardData?.quote?.text || "Keep learning and growing!"}
        </p>
        {dashboardData?.quote?.author && (
          <p className="text-xs lg:text-sm text-blue-200 italic">
            - {dashboardData.quote.author}
          </p>
        )}
      </div>

      {/* Course Info */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Enrolled Course</h2>
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <BookOpen className="text-blue-600" size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {user?.course?.name || 'Not Enrolled'}
            </h3>
            <p className="text-gray-600">
              {user?.course?.code} - {user?.level}
            </p>
          </div>
        </div>
      </div>

      {/* Enrolled Units & Assignments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Enrolled Units */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BookOpen className="mr-2 text-blue-600" size={24} />
            Enrolled Units
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {dashboardData?.units?.length > 0 ? (
              dashboardData.units.map((unit) => (
                <div key={unit._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition">
                  <h3 className="font-semibold text-gray-800">{unit.name}</h3>
                  <p className="text-sm text-gray-600">{unit.code} - {unit.credits} Credits</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Teacher: {unit.teacher?.name || 'TBA'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No units enrolled yet</p>
            )}
          </div>
        </div>

        {/* Assignments */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Clock className="mr-2 text-orange-600" size={24} />
            Assignments
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {dashboardData?.assignments?.length > 0 ? (
              dashboardData.assignments.map((assignment) => {
                const daysLeft = Math.ceil((new Date(assignment.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                const isOverdue = daysLeft < 0;
                
                return (
                  <div key={assignment._id} className={`border rounded-lg p-4 ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <h3 className="font-semibold text-gray-800">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{assignment.unit?.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        Due: {new Date(assignment.deadline).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${isOverdue ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'}`}>
                        {isOverdue ? 'Overdue' : `${daysLeft} days left`}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No assignments at the moment</p>
            )}
          </div>
        </div>
      </div>

      {/* Download Data Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center mb-6">
          <Download className="text-blue-600 mr-3" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Download My Data</h2>
            <p className="text-sm text-gray-600">Export your academic records to Excel</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleDownloadPerformance}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg flex items-center justify-center transition"
          >
            <Download size={20} className="mr-2" />
            Download Exam Performance
          </button>
          
          <button
            onClick={handleDownloadFees}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg flex items-center justify-center transition"
          >
            <Download size={20} className="mr-2" />
            Download Fee Payment History
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          📊 <strong>Performance:</strong> Includes all exam scores, grades, and average performance<br/>
          💰 <strong>Fee History:</strong> Includes all payment records, balances, and gatepass expiry dates
        </p>
      </div>

      {/* Timetable */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Calendar className="mr-2 text-purple-600" size={24} />
          Class Timetable
        </h2>
        {dashboardData?.timetable?.schedule?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Day</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Time</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Unit</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Teacher</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Venue</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.timetable.schedule.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{entry.day}</td>
                    <td className="border border-gray-300 px-4 py-2">{entry.time}</td>
                    <td className="border border-gray-300 px-4 py-2">{entry.unit?.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{entry.teacher?.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{entry.venue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No timetable published yet</p>
        )}
      </div>

      {/* Performance & Fee Payments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Performance */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-green-600" size={24} />
            My Performance
          </h2>
          {performanceData.length > 0 ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-green-600">{averageScore}%</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="unit" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-gray-500">No performance data available yet</p>
          )}
        </div>

        {/* Fee Payments */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <DollarSign className="mr-2 text-blue-600" size={24} />
            Fee Payments
          </h2>
          {totalFees > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600">Total Fees</p>
                  <p className="text-lg font-bold text-gray-800">KES {totalFees.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Paid</p>
                  <p className="text-lg font-bold text-green-600">KES {totalPaid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Balance</p>
                  <p className="text-lg font-bold text-red-600">KES {totalBalance.toLocaleString()}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={feeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {feeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-gray-500">No fee records available</p>
          )}
        </div>
      </div>

      {/* Help, Suggestions, Complaints */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <MessageSquare className="mr-2 text-indigo-600" size={24} />
          Help, Suggestions & Complaints
        </h2>
        
        {submitStatus && (
          <div className={`mb-4 p-4 rounded-lg ${submitStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleComplaintSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Category
            </label>
            <select
              value={complaint.category}
              onChange={(e) => setComplaint({ ...complaint, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Help">Help</option>
              <option value="Suggestion">Suggestion</option>
              <option value="Complaint">Complaint</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Subject
            </label>
            <input
              type="text"
              value={complaint.subject}
              onChange={(e) => setComplaint({ ...complaint, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief subject"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Message
            </label>
            <textarea
              value={complaint.message}
              onChange={(e) => setComplaint({ ...complaint, message: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Describe your issue or suggestion..."
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
