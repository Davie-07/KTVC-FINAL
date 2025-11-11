import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import QuickLogin from './pages/QuickLogin';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import GateDashboard from './pages/GateDashboard';
import EnrollmentDashboard from './pages/EnrollmentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import SplashScreen from './components/common/SplashScreen';
import NetworkStatus from './components/common/NetworkStatus';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Request notification permission on app load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <NetworkStatus />
            <Router>
              <Routes>
                <Route path="/" element={<QuickLoginOrLogin />} />
                <Route path="/login" element={<Login />} />
                <Route path="/quick-login" element={<QuickLogin />} />
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
    </ThemeProvider>
  );
}

// Component to decide between quick login and full login
const QuickLoginOrLogin = () => {
  const hasLastUser = localStorage.getItem('lastLoggedInUser');
  return hasLastUser ? <Navigate to="/quick-login" replace /> : <Navigate to="/login" replace />;
};

export default App;
