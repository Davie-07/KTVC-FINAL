import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import GateDashboard from './pages/GateDashboard';
import EnrollmentDashboard from './pages/EnrollmentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/student/*" element={<StudentDashboard />} />
              <Route path="/teacher/*" element={<TeacherDashboard />} />
              <Route path="/finance/*" element={<FinanceDashboard />} />
              <Route path="/gate" element={<GateDashboard />} />
              <Route path="/enrollment/*" element={<EnrollmentDashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Routes>
          </Router>
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
