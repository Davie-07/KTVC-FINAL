import React, { useState, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/admin/Sidebar';
import Home from '../components/admin/Home';
import Dashboards from '../components/admin/Dashboards';
import DeeAI from '../components/student/DeeAI'; // Reuse DeeAI component

const AdminDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboards" element={<Dashboards />} />
          <Route path="/deeai" element={<DeeAI />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
