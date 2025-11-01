import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { Settings, FileText, GraduationCap, Trash2, Edit, Save, X } from 'lucide-react';

const Management = () => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [performances, setPerformances] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
    fetchStudents();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('/api/teacher/assignments');
      setAssignments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setLoading(false);
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

  const fetchStudentPerformances = async (studentId) => {
    try {
      const response = await axios.get(`/api/teacher/student/${studentId}`);
      setPerformances(response.data.performance);
      setSelectedStudent(studentId);
    } catch (error) {
      console.error('Error fetching performances:', error);
    }
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment._id);
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description,
      deadline: new Date(assignment.deadline).toISOString().split('T')[0],
      totalMarks: assignment.totalMarks
    });
  };

  const handleCancelEdit = () => {
    setEditingAssignment(null);
    setAssignmentForm({});
  };

  const handleSaveAssignment = async (assignmentId) => {
    try {
      await axios.put(`/api/teacher/assignments/${assignmentId}`, {
        ...assignmentForm,
        deadline: new Date(assignmentForm.deadline)
      });
      alert('Assignment updated successfully!');
      setEditingAssignment(null);
      fetchAssignments();
    } catch (error) {
      alert('Error updating assignment: ' + error.response?.data?.message);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axios.delete(`/api/teacher/assignments/${assignmentId}`);
        alert('Assignment deleted successfully!');
        fetchAssignments();
      } catch (error) {
        alert('Error deleting assignment: ' + error.response?.data?.message);
      }
    }
  };

  const handleDeletePerformance = async (performanceId) => {
    if (window.confirm('Are you sure you want to delete this performance record?')) {
      try {
        await axios.delete(`/api/teacher/performance/${performanceId}`);
        alert('Performance record deleted successfully!');
        if (selectedStudent) {
          fetchStudentPerformances(selectedStudent);
        }
      } catch (error) {
        alert('Error deleting performance: ' + error.response?.data?.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center">
          <Settings className="mr-3" size={32} />
          Management Dashboard
        </h1>
        <p className="text-orange-100">Edit and manage assignments, grades, and student records</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === 'assignments'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="inline mr-2" size={20} />
            Assignments
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === 'grades'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <GraduationCap className="inline mr-2" size={20} />
            Exam Scores
          </button>
        </div>

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Assignments</h2>
            
            {assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment._id} className="border border-gray-200 rounded-lg p-4">
                    {editingAssignment === assignment._id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={assignmentForm.title}
                            onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={assignmentForm.description}
                            onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            rows="3"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                            <input
                              type="date"
                              value={assignmentForm.deadline}
                              onChange={(e) => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                            <input
                              type="number"
                              value={assignmentForm.totalMarks}
                              onChange={(e) => setAssignmentForm({ ...assignmentForm, totalMarks: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveAssignment(assignment._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                          >
                            <Save size={16} className="mr-2" />
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
                          >
                            <X size={16} className="mr-2" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600">
                                <strong>Unit:</strong> {assignment.unit?.name} ({assignment.unit?.code})
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Course:</strong> {assignment.course?.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Total Marks:</strong> {assignment.totalMarks}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAssignment(assignment)}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAssignment(assignment._id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No assignments found</p>
            )}
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Exam Scores</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
              <select
                onChange={(e) => fetchStudentPerformances(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Choose a student...</option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.name} - {student.admissionNumber}
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && performances.length > 0 && (
              <div className="space-y-4">
                {performances.map((performance) => (
                  <div key={performance._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {performance.unit?.name} ({performance.unit?.code})
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {performance.semester} - {performance.academicYear}
                        </p>
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Assessments:</p>
                          <div className="space-y-2">
                            {performance.assessments.map((assessment, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded">
                                <p className="text-sm">
                                  <strong>{assessment.type}:</strong> {assessment.score}/{assessment.maxScore} 
                                  ({((assessment.score/assessment.maxScore) * 100).toFixed(1)}%)
                                </p>
                                {assessment.remarks && (
                                  <p className="text-xs text-gray-600 mt-1">Remarks: {assessment.remarks}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Date: {new Date(assessment.date).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-4">
                          <p className="text-sm">
                            <strong>Total Score:</strong> 
                            <span className="ml-2 text-lg font-bold text-green-600">{performance.totalScore}%</span>
                          </p>
                          <p className="text-sm">
                            <strong>Grade:</strong> 
                            <span className="ml-2 text-lg font-bold text-blue-600">{performance.grade}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePerformance(performance._id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                        title="Delete Performance Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedStudent && performances.length === 0 && (
              <p className="text-gray-500">No performance records found for this student</p>
            )}

            {!selectedStudent && (
              <p className="text-gray-500">Please select a student to view their performance records</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Management;
