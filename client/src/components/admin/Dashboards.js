import React, { useState, useEffect } from 'react';
import axios from '../../services/axios'; // use project's axios instance
import { useToast } from '../../context/ToastContext';
import { UserPlus, Users, Edit, Trash2, Search, Shield, DollarSign, ShieldCheck, UserCheck, Eye, EyeOff } from 'lucide-react';

const Dashboards = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [accountForm, setAccountForm] = useState({
    role: 'teacher',
    name: '',
    email: '',
    password: '',
    courseId: '',
    level: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');

      // Accept either an array response or { users: [...] } or nested shapes
      const usersData = Array.isArray(response.data)
        ? response.data
        : (response.data?.users || response.data?.data || []);

      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // ensure users is always an array
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/admin/courses');
      const coursesData = Array.isArray(response.data) ? response.data : (response.data?.courses || []);
      setCourses(Array.isArray(coursesData) ? coursesData.filter(c => c.isActive) : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/admin/create-account', accountForm);

      if (response.data.success) {
        const user = response.data.user;
        let credentialMessage = '';

        switch (user.role) {
          case 'teacher':
            const courseInfo = user.course ? `\nCourse: ${user.course.name} (${user.course.code})` : '';
            const levelInfo = user.level ? `\nLevel: ${user.level}` : '';
            credentialMessage = `Teacher Account Created!\n\nLogin Credentials:\nAccount Code: ${user.accountCode}\nPassword: ${accountForm.password}${courseInfo}${levelInfo}\n\nThe teacher can login using their 6-digit code.`;
            break;
          case 'gateverification':
            credentialMessage = `Gate Verification Account Created!\n\nLogin Credentials:\nAccount ID: ${user.accountId}\nPassword: ${accountForm.password}\n\nThe officer can login using their 5-digit ID.`;
            break;
          case 'finance':
            credentialMessage = `Finance Account Created!\n\nLogin Credentials:\nAccount ID: ${user.accountId}\nPassword: ${accountForm.password}\n\nThe officer can login using their 7-digit ID.`;
            break;
          case 'enrollment':
            credentialMessage = `Enrollment Account Created!\n\nLogin Credentials:\nAccount ID: ${user.accountId}\nPassword: ${accountForm.password}\n\nThe officer can login using their 4-digit ID.`;
            break;
        }

        alert(credentialMessage);
        showToast('Account created successfully!', 'success');
        
        setAccountForm({
          role: 'teacher',
          name: '',
          email: '',
          password: '',
          courseId: '',
          level: ''
        });
        
        fetchUsers();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Account creation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;

    try {
      await axios.delete(`/api/admin/user/${userId}`);
      alert('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'teacher':
        return <UserCheck className="text-blue-600" size={20} />;
      case 'finance':
        return <DollarSign className="text-green-600" size={20} />;
      case 'gateverification':
        return <ShieldCheck className="text-purple-600" size={20} />;
      case 'enrollment':
        return <UserPlus className="text-orange-600" size={20} />;
      default:
        return <Shield className="text-gray-600" size={20} />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'teacher':
        return 'bg-blue-100 text-blue-700';
      case 'finance':
        return 'bg-green-100 text-green-700';
      case 'gateverification':
        return 'bg-purple-100 text-purple-700';
      case 'enrollment':
        return 'bg-orange-100 text-orange-700';
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'student':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Safely compute filtered users
  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const name = (user.name || '').toString().toLowerCase();
    const email = (user.email || '').toString().toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch = name.includes(term) || email.includes(term);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Dashboard Accounts Management</h1>
        <p className="text-red-100">Create and manage accounts for all dashboard types</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-4 font-semibold transition ${
              activeTab === 'create'
                ? 'border-b-4 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <UserPlus className="inline mr-2" size={20} />
            Create Account
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-4 font-semibold transition ${
              activeTab === 'manage'
                ? 'border-b-4 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <Users className="inline mr-2" size={20} />
            Manage Users
          </button>
        </div>

        {/* Create Account Tab */}
        {activeTab === 'create' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Dashboard Account</h2>
            
            <form onSubmit={handleCreateAccount} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dashboard Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={accountForm.role}
                  onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="teacher">Teacher Dashboard (6-digit code)</option>
                  <option value="gateverification">Gate Verification Dashboard (5-digit ID)</option>
                  <option value="finance">Finance Dashboard (7-digit ID)</option>
                  <option value="enrollment">NewStudent Enrollment Dashboard (4-digit ID)</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {accountForm.role === 'teacher' && 'Teacher accounts receive a 6-digit login code'}
                  {accountForm.role === 'gateverification' && 'Gate officers receive a 5-digit login ID'}
                  {accountForm.role === 'finance' && 'Finance officers receive a 7-digit login ID'}
                  {accountForm.role === 'enrollment' && 'Enrollment officers receive a 4-digit login ID'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={accountForm.password}
                  onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Enter password"
                  minLength="8"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <p className="text-xs text-gray-600 mt-1">Minimum 8 characters</p>
              </div>

              {accountForm.role === 'teacher' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={accountForm.courseId}
                      onChange={(e) => setAccountForm({ ...accountForm, courseId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name} ({course.code})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-600 mt-1">Select which course this teacher will handle</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={accountForm.level}
                      onChange={(e) => setAccountForm({ ...accountForm, level: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Select a level</option>
                      <option value="Level 1">Level 1</option>
                      <option value="Level 2">Level 2</option>
                      <option value="Level 3">Level 3</option>
                      <option value="Level 4">Level 4</option>
                      <option value="Level 5">Level 5</option>
                      <option value="Level 6">Level 6</option>
                    </select>
                    <p className="text-xs text-gray-600 mt-1">Select which level this teacher will teach</p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Upon creation, the system will automatically generate the appropriate account ID/code based on the dashboard type selected. This will be displayed after successful creation.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        )}

        {/* Manage Users Tab */}
        {activeTab === 'manage' && (
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Search users by name or email..."
                />
              </div>

              {/* Filter by Role */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Roles</option>
                <option value="teacher">Teachers</option>
                <option value="finance">Finance</option>
                <option value="gateverification">Gate Verification</option>
                <option value="enrollment">Enrollment</option>
                <option value="student">Students</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Account ID/Code</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getRoleIcon(user.role)}
                          <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.accountCode && (
                          <span className="font-mono bg-blue-100 px-2 py-1 rounded">{user.accountCode}</span>
                        )}
                        {user.accountId && (
                          <span className="font-mono bg-green-100 px-2 py-1 rounded">{user.accountId}</span>
                        )}
                        {user.admissionNumber && (
                          <span className="font-mono bg-purple-100 px-2 py-1 rounded">{user.admissionNumber}</span>
                        )}
                        {!user.accountCode && !user.accountId && !user.admissionNumber && (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.course?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No users found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboards;
