import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { MessageSquare, HelpCircle, AlertCircle, CheckCircle, Clock, Loader } from 'lucide-react';

const Messages = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get('/api/student/complaints');
      setComplaints(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setLoading(false);
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'Help':
        return <HelpCircle className="text-blue-600" size={24} />;
      case 'Complaint':
        return <AlertCircle className="text-red-600" size={24} />;
      case 'Suggestion':
        return <MessageSquare className="text-green-600" size={24} />;
      default:
        return <MessageSquare className="text-gray-600" size={24} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Help':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Complaint':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Suggestion':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="text-yellow-600" size={16} />;
      case 'In Progress':
        return <Loader className="text-blue-600" size={16} />;
      case 'Resolved':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'Closed':
        return <CheckCircle className="text-gray-600" size={16} />;
      default:
        return <Clock className="text-gray-600" size={16} />;
    }
  };

  const filteredComplaints = filter === 'all' 
    ? complaints 
    : complaints.filter(c => c.category === filter);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center">
          <MessageSquare className="mr-3" size={32} />
          My Messages
        </h1>
        <p className="text-blue-100">View your submitted messages and responses from admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-sm text-gray-600">Total Messages</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 shadow-md border border-yellow-200">
          <div className="text-sm text-yellow-700">Pending</div>
          <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow-md border border-blue-200">
          <div className="text-sm text-blue-700">In Progress</div>
          <div className="text-2xl font-bold text-blue-800">{stats.inProgress}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-md border border-green-200">
          <div className="text-sm text-green-700">Resolved</div>
          <div className="text-2xl font-bold text-green-800">{stats.resolved}</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
        <div className="flex flex-wrap gap-2">
          {['all', 'Help', 'Complaint', 'Suggestion'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Messages' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <div
              key={complaint._id}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  {getIcon(complaint.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{complaint.subject}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(complaint.category)}`}>
                          {complaint.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(complaint.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(complaint.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Original Message */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Your Message:</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{complaint.message}</p>
              </div>

              {/* Priority Badge */}
              <div className="mb-4">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  complaint.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                  complaint.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                  complaint.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  Priority: {complaint.priority}
                </span>
              </div>

              {/* Responses Section */}
              {complaint.responses && complaint.responses.length > 0 ? (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <p className="text-sm font-bold text-green-700">
                      Admin/Teacher Response ({complaint.responses.length})
                    </p>
                  </div>
                  <div className="space-y-3">
                    {complaint.responses.map((response, idx) => (
                      <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {response.respondent?.name?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-blue-900">
                                {response.respondent?.name || 'Admin'}
                              </p>
                              <p className="text-xs text-blue-600">
                                {response.respondent?.role || 'Admin'}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(response.date).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock size={18} />
                    <p className="text-sm">Awaiting response from admin/teacher...</p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-md">
            <MessageSquare className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-xl text-gray-500">No messages found</p>
            <p className="text-gray-400 mt-2">Submit a message from the Home page to get help!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
