import React, { useState, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/student/Sidebar';
import Home from '../components/student/Home';
import Notifications from '../components/student/Notifications';
import Messages from '../components/student/Messages';
import KRAServices from '../components/student/KRAServices';
import GateReceipt from '../components/student/GateReceipt';
import DeeAI from '../components/student/DeeAI';

const StudentDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div 
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? 'ml-0' : 'ml-0'
        }`}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/student/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/kra-services" element={<KRAServices />} />
          <Route path="/gate-receipt" element={<GateReceipt />} />
          <Route path="/deeai" element={<DeeAI />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;
