import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, Bot, LogOut, Menu, X, Bell, Megaphone, Settings } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Logo from '../common/Logo';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { logout } = useContext(AuthContext);
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Home', icon: Home, path: '/admin/home' },
    { name: 'Dashboards', icon: LayoutDashboard, path: '/admin/dashboards' },
    { name: 'Notifications', icon: Bell, path: '/admin/notifications' },
    { name: 'Announcements', icon: Megaphone, path: '/admin/announcements' },
    { name: 'DeeAI', icon: Bot, path: '/admin/deeai' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-red-600 text-white p-2 rounded-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div 
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 lg:w-[17.5%] 
          bg-gradient-to-b from-red-600 to-red-800 
          text-white 
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          shadow-2xl
        `}
      >
        {/* Logo Section */}
        <div className="p-4 lg:p-6 border-b border-red-500">
          <Logo size="md" showText={true} className="text-white" />
          <p className="text-center text-xs lg:text-sm text-red-200 mt-2">Admin Dashboard</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 lg:px-4 py-4 space-y-1 lg:space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-red-600 shadow-lg'
                    : 'text-white hover:bg-red-500'
                }`
              }
            >
              <div className="flex items-center">
                <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="ml-3 text-sm lg:text-base font-medium">{item.name}</span>
              </div>
              {item.name === 'Notifications' && unreadCount > 0 && (
                <span className="bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-3 lg:p-4 border-t border-red-500">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-white hover:bg-red-900 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="ml-3 text-sm lg:text-base font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
