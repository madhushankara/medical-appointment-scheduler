import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary-700 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-white text-xl font-bold">Medical Appointment Scheduler</Link>
          
          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white">Hello, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-primary-700 px-3 py-1 rounded hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="bg-white text-primary-700 px-3 py-1 rounded hover:bg-gray-100">Login</Link>
                <Link to="/register" className="bg-white text-primary-700 px-3 py-1 rounded hover:bg-gray-100">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}