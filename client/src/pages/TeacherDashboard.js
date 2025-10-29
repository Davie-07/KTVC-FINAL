import React, { useState, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/teacher/Sidebar';
import Home from '../components/teacher/Home';
import Users from '../components/teacher/Users';
import Management from '../components/teacher/Management';
import Services from '../components/teacher/Services';
import Notifications from '../components/teacher/Notifications';
import DeeAI from '../components/teacher/DeeAI';

const TeacherDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'teacher') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/teacher/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/management" element={<Management />} />
          <Route path="/services" element={<Services />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/deeai" element={<DeeAI />} />
        </Routes>
      </div>
    </div>
  );
};

export default TeacherDashboard;
