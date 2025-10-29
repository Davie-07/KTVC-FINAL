import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, Bot, LogOut, Shield, Menu, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Home', icon: Home, path: '/admin/home' },
    { name: 'Dashboards', icon: LayoutDashboard, path: '/admin/dashboards' },
    { name: 'DeeAI', icon: Bot, path: '/admin/deeai' }
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
          <div className="flex items-center justify-center mb-3">
            <div className="bg-white p-2 lg:p-3 rounded-full">
              <Shield size={32} className="text-red-600 lg:w-10 lg:h-10" />
            </div>
          </div>
          <h2 className="text-center text-base lg:text-lg font-bold">Admin Portal</h2>
        </div>

        {/* User Info */}
        <div className="p-3 lg:p-4 border-b border-red-500">
          <div className="text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-red-600 font-bold text-lg lg:text-2xl">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <p className="font-semibold text-sm lg:text-base">{user?.name}</p>
            <p className="text-xs lg:text-sm text-red-200">System Administrator</p>
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
                    ? 'bg-white text-red-600 shadow-lg'
                    : 'text-white hover:bg-red-500'
                }`
              }
            >
              <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="ml-3 text-sm lg:text-base font-medium">{item.name}</span>
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
