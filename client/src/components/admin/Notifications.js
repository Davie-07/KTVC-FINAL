import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../services/axios';
import { useToast } from '../../context/ToastContext';
import { Bell, MessageSquare, HelpCircle, AlertCircle, Search, Loader } from 'lucide-react';

const Notifications = () => {
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/complaints');
      setComplaints(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      showToast('Error loading messages', 'error');
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      showToast('Please enter a reply message', 'warning');
      return;
    }

    setReplyLoading(true);
    try {
      await axios.post(`/api/admin/complaints/${selectedComplaint._id}/reply`, {
        message: replyMessage
      });
      showToast('Reply sent successfully!', 'success');
      setReplyMessage('');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error sending reply', 'error');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await axios.put(`/api/admin/complaints/${complaintId}/status`, {
        status: newStatus
      });
      showToast('Status updated successfully!', 'success');
      fetchComplaints();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating status', 'error');
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
        return <Bell className="text-gray-600" size={24} />;
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

  const filteredComplaints = complaints
    .filter(c => filter === 'all' || c.category === filter)
    .filter(c => 
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.student?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const pendingCount = complaints.filter(c => c.status === 'Pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center">
          <Bell className="mr-3" size={32} />
          Student Messages & Complaints
        </h1>
        <p className="text-red-100">View and respond to student feedback, suggestions, and complaints</p>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-sm text-gray-600">Total Messages</div>
          <div className="text-2xl font-bold text-gray-800">{complaints.length}</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 shadow-md border border-yellow-200">
          <div className="text-sm text-yellow-700">Pending</div>
          <div className="text-2xl font-bold text-yellow-800">{pendingCount}</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow-md border border-blue-200">
          <div className="text-sm text-blue-700">In Progress</div>
          <div className="text-2xl font-bold text-blue-800">
            {complaints.filter(c => c.status === 'In Progress').length}
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-md border border-green-200">
          <div className="text-sm text-green-700">Resolved</div>
          <div className="text-2xl font-bold text-green-800">
            {complaints.filter(c => c.status === 'Resolved').length}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by subject, message, or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'Help', 'Complaint', 'Suggestion'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === cat
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
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
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getIcon(complaint.category)}
                </div>
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{complaint.subject}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">
                          From: <strong>{complaint.student?.name}</strong> ({complaint.student?.admissionNumber})
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(complaint.category)}`}>
                          {complaint.category}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg">{complaint.message}</p>

                  {/* Responses */}
                  {complaint.responses && complaint.responses.length > 0 && (
                    <div className="mb-4 border-l-4 border-blue-500 pl-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Responses:</p>
                      {complaint.responses.map((response, idx) => (
                        <div key={idx} className="bg-blue-50 p-3 rounded-lg mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-blue-700">
                              {response.respondent?.name} ({response.respondent?.role})
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(response.date).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition"
                    >
                      Reply
                    </button>
                    <select
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <span className="text-xs text-gray-500 ml-auto">
                      {new Date(complaint.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-md">
            <Bell className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-xl text-gray-500">No messages found</p>
            <p className="text-gray-400 mt-2">All caught up!</p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Reply to Message</h3>
              <button
                onClick={() => {
                  setSelectedComplaint(null);
                  setReplyMessage('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-1">Subject:</p>
              <p className="text-gray-800">{selectedComplaint.subject}</p>
              <p className="text-sm font-semibold text-gray-700 mt-2 mb-1">Message:</p>
              <p className="text-gray-700">{selectedComplaint.message}</p>
            </div>

            <form onSubmit={handleReply}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Reply <span className="text-red-500">*</span>
              </label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                rows="6"
                placeholder="Type your reply here..."
                required
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedComplaint(null);
                    setReplyMessage('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replyLoading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {replyLoading ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Sending...
                    </>
                  ) : (
                    'Send Reply'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
