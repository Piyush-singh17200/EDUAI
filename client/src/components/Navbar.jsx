import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut, Home, BookOpen, Briefcase, Code, Brain } from 'lucide-react';
import { useStore } from '../store';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, clearToken } = useStore();

  const handleLogout = () => {
    clearToken();
    window.location.href = '/login';
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">EduAI</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition">
              <Home size={18} />
              <span>Dashboard</span>
            </Link>
            <Link to="/tutor" className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition">
              <BookOpen size={18} />
              <span>Tutor</span>
            </Link>
            <Link to="/adaptive-learning" className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition">
              <Brain size={18} />
              <span>Adaptive</span>
            </Link>
            <Link to="/study-planner" className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition">
              <Code size={18} />
              <span>Study Plan</span>
            </Link>
            <Link to="/career-roadmap" className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition">
              <Briefcase size={18} />
              <span>Career</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-300">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg hover:opacity-90 transition"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-slate-300"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block px-3 py-2 rounded-lg hover:bg-slate-700/50">
              Dashboard
            </Link>
            <Link to="/tutor" className="block px-3 py-2 rounded-lg hover:bg-slate-700/50">
              AI Tutor
            </Link>
            <Link to="/study-planner" className="block px-3 py-2 rounded-lg hover:bg-slate-700/50">
              Study Planner
            </Link>
            <Link to="/adaptive-learning" className="block px-3 py-2 rounded-lg hover:bg-slate-700/50">
              Adaptive Learning
            </Link>
            <Link to="/career-roadmap" className="block px-3 py-2 rounded-lg hover:bg-slate-700/50">
              Career Roadmap
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
