import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { useToast } from '../../context/ToastContext';
import { Settings, FileText, GraduationCap, Trash2, Edit, Save, X, BookOpen, Plus } from 'lucide-react';

const Management = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [performances, setPerformances] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAssignmentForm, setNewAssignmentForm] = useState({
    title: '',
    description: '',
    deadline: '',
    totalMarks: ''
  });
  
  // Units state
  const [units, setUnits] = useState([]);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitForm, setUnitForm] = useState({
    name: '',
    code: '',
    credits: '',
    description: ''
  });
  const [confirmDeleteUnit, setConfirmDeleteUnit] = useState(null);

  useEffect(() => {
    fetchAssignments();
    fetchStudents();
    fetchUnits();
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
      // Handle both array response (old format) and object response (new format)
      const studentsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.students || [];
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]); // Ensure students is always an array
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

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/teacher/assignments', {
        ...newAssignmentForm,
        deadline: new Date(newAssignmentForm.deadline)
      });
      showToast('Assignment created successfully!', 'success');
      setShowCreateForm(false);
      setNewAssignmentForm({
        title: '',
        description: '',
        deadline: '',
        totalMarks: ''
      });
      fetchAssignments();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error creating assignment', 'error');
    }
  };

  // Units Management Functions
  const fetchUnits = async () => {
    try {
      const response = await axios.get('/api/teacher/units');
      setUnits(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUnit) {
        await axios.put(`/api/teacher/units/${editingUnit._id}`, unitForm);
        showToast('Unit updated successfully!', 'success');
      } else {
        await axios.post('/api/teacher/units', unitForm);
        showToast('Unit created successfully!', 'success');
      }
      setShowUnitForm(false);
      setEditingUnit(null);
      setUnitForm({ name: '', code: '', credits: '', description: '' });
      fetchUnits();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving unit', 'error');
    }
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setUnitForm({
      name: unit.name,
      code: unit.code,
      credits: unit.credits || '',
      description: unit.description || ''
    });
    setShowUnitForm(true);
  };

  const handleDeleteUnit = (unitId) => {
    setConfirmDeleteUnit(unitId);
  };

  const confirmDeleteUnitAction = async () => {
    try {
      await axios.delete(`/api/teacher/units/${confirmDeleteUnit}`);
      showToast('Unit deleted successfully!', 'success');
      fetchUnits();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error deleting unit', 'error');
    }
    setConfirmDeleteUnit(null);
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
          <button
            onClick={() => setActiveTab('units')}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === 'units'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="inline mr-2" size={20} />
            Units
          </button>
        </div>

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Manage Assignments</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center transition"
              >
                {showCreateForm ? <X size={20} className="mr-2" /> : <FileText size={20} className="mr-2" />}
                {showCreateForm ? 'Cancel' : 'Create Assignment'}
              </button>
            </div>

            {/* Create Assignment Form */}
            {showCreateForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Assignment</h3>
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAssignmentForm.title}
                      onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newAssignmentForm.description}
                      onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deadline <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newAssignmentForm.deadline}
                        onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, deadline: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Marks <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={newAssignmentForm.totalMarks}
                        onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, totalMarks: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                  >
                    Create Assignment
                  </button>
                </form>
              </div>
            )}
            
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

        {/* Units Tab */}
        {activeTab === 'units' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Manage Course Units</h2>
              <button
                onClick={() => {
                  setShowUnitForm(!showUnitForm);
                  setEditingUnit(null);
                  setUnitForm({ name: '', code: '', credits: '', description: '' });
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center transition"
              >
                {showUnitForm ? <X size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
                {showUnitForm ? 'Cancel' : 'Create Unit'}
              </button>
            </div>

            {/* Create/Edit Unit Form */}
            {showUnitForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {editingUnit ? 'Edit Unit' : 'Create New Unit'}
                </h3>
                <form onSubmit={handleUnitSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={unitForm.name}
                        onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., Web Development"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={unitForm.code}
                        onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., DIT401"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credits
                    </label>
                    <input
                      type="number"
                      value={unitForm.credits}
                      onChange={(e) => setUnitForm({ ...unitForm, credits: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., 4"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={unitForm.description}
                      onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Brief description of the unit"
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition"
                  >
                    <Save className="inline mr-2" size={18} />
                    {editingUnit ? 'Update Unit' : 'Create Unit'}
                  </button>
                </form>
              </div>
            )}

            {/* Units List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {units.length > 0 ? (
                units.map((unit) => (
                  <div key={unit._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{unit.name}</h3>
                        <p className="text-sm text-gray-600">{unit.code}</p>
                        {unit.credits && (
                          <p className="text-xs text-gray-500 mt-1">{unit.credits} Credits</p>
                        )}
                      </div>
                      <BookOpen className="text-orange-500" size={24} />
                    </div>
                    {unit.description && (
                      <p className="text-sm text-gray-600 mb-3">{unit.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mb-3">
                      Course: {unit.course?.name} ({unit.course?.code})
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditUnit(unit)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded flex items-center justify-center transition"
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUnit(unit._id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded flex items-center justify-center transition"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600 text-lg font-semibold mb-2">No Units Yet</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Create units to organize your course content and assignments
                  </p>
                  <button
                    onClick={() => {
                      setShowUnitForm(true);
                      setEditingUnit(null);
                      setUnitForm({ name: '', code: '', credits: '', description: '' });
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg inline-flex items-center transition"
                  >
                    <Plus size={20} className="mr-2" />
                    Create Your First Unit
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Unit Dialog */}
      {confirmDeleteUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Delete Unit?</h3>
                <p className="text-gray-600 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this unit? This will affect assignments and timetables linked to it.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteUnit(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUnitAction}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Management;
