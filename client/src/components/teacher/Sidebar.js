import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Settings, 
  Briefcase, 
  Bell, 
  Bot, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import Logo from '../common/Logo';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Home', icon: Home, path: '/teacher/home' },
    { name: 'Users', icon: Users, path: '/teacher/users' },
    { name: 'Management', icon: Settings, path: '/teacher/management' },
    { name: 'Services', icon: Briefcase, path: '/teacher/services' },
    { name: 'Notifications', icon: Bell, path: '/teacher/notifications' },
    { name: 'DeeAI', icon: Bot, path: '/teacher/deeai' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-green-600 text-white p-2 rounded-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div 
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 lg:w-[17.5%] 
          bg-gradient-to-b from-green-600 to-green-800 
          text-white 
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          shadow-2xl
        `}
      >
        {/* Logo Section */}
        <div className="p-4 lg:p-6 border-b border-green-500">
          <Logo size="md" showText={true} className="text-white" />
          <p className="text-center text-xs lg:text-sm text-green-200 mt-2">Teacher Dashboard</p>
        </div>

        {/* User Info */}
        <div className="p-3 lg:p-4 border-b border-green-500">
          <div className="text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold text-lg lg:text-2xl">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <p className="font-semibold text-sm lg:text-base">{user?.name}</p>
            <p className="text-xs lg:text-sm text-green-200">Teacher</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 lg:px-4 py-4 space-y-1 lg:space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-green-600 shadow-lg'
                    : 'text-white hover:bg-green-500'
                }`
              }
            >
              <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="ml-3 text-sm lg:text-base font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-3 lg:p-4 border-t border-green-500">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-white hover:bg-red-500 transition-all duration-200"
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
