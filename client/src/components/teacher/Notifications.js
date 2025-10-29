import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, MessageSquare, Clock, Send } from 'lucide-react';

const Notifications = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get('/api/teacher/notifications');
      setComplaints(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleRespond = async (complaintId) => {
    if (!responseMessage.trim()) {
      alert('Please enter a response message');
      return;
    }

    try {
      await axios.post(`/api/teacher/notifications/${complaintId}/respond`, {
        message: responseMessage,
        newStatus: newStatus || undefined
      });
      alert('Response sent successfully!');
      setResponseMessage('');
      setNewStatus('');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      alert('Error sending response: ' + error.response?.data?.message);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Help':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Suggestion':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Complaint':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Resolved':
        return 'bg-green-100 text-green-700';
      case 'Closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredComplaints = filter === 'all' 
    ? complaints 
    : complaints.filter(c => c.category === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center">
              <Bell className="mr-3" size={32} />
              Student Requests & Notifications
            </h1>
            <p className="text-blue-100">Help requests, suggestions, and complaints from students</p>
          </div>
          <div className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold">
            {complaints.filter(c => c.status === 'Pending').length} Pending
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
        <div className="flex flex-wrap gap-2">
          {['all', 'Help', 'Suggestion', 'Complaint'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <div key={complaint._id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(complaint.category)}`}>
                        {complaint.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        complaint.priority === 'High' || complaint.priority === 'Urgent' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {complaint.priority}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{complaint.subject}</h3>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>From:</strong> {complaint.student?.name} ({complaint.student?.admissionNumber})
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Course:</strong> {complaint.student?.course?.name}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Clock size={14} className="mr-1" />
                        {new Date(complaint.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-800">{complaint.message}</p>
                    </div>

                    {/* Previous Responses */}
                    {complaint.responses.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Previous Responses:</h4>
                        <div className="space-y-2">
                          {complaint.responses.map((response, index) => (
                            <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                              <p className="text-sm text-gray-800 mb-1">{response.message}</p>
                              <p className="text-xs text-gray-600">
                                By {response.respondent?.name} ({response.respondent?.role}) - {new Date(response.date).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Response Form */}
                    {selectedComplaint === complaint._id ? (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Respond to this request:</h4>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Update Status (Optional)</label>
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Keep current status</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>

                        <textarea
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          placeholder="Type your response here..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
                          rows="4"
                        />
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespond(complaint._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center transition"
                          >
                            <Send size={16} className="mr-2" />
                            Send Response
                          </button>
                          <button
                            onClick={() => {
                              setSelectedComplaint(null);
                              setResponseMessage('');
                              setNewStatus('');
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedComplaint(complaint._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition"
                      >
                        <MessageSquare size={16} className="mr-2" />
                        Respond
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-md">
            <Bell className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-xl text-gray-500">No requests found</p>
            <p className="text-gray-400 mt-2">All student requests have been addressed!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
