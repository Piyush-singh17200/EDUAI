import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, LogOut, Home, BookOpen, Briefcase, Code, Brain, Award, Mic, Sparkles } from 'lucide-react';
import { useStore } from '../store';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/tutor', label: 'Tutor', icon: BookOpen },
  { to: '/adaptive-learning', label: 'Adaptive', icon: Brain },
  { to: '/study-planner', label: 'Study Plan', icon: Code },
  { to: '/career-roadmap', label: 'Career', icon: Briefcase },
  { to: '/resume-analyzer', label: 'Resume', icon: Award },
  { to: '/mock-interview', label: 'Interview', icon: Mic },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, clearToken } = useStore();

  const handleLogout = () => {
    clearToken();
    window.location.href = '/login';
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/82 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-300 via-indigo-400 to-amber-200 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-cyan-500/15">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <span className="block text-lg font-bold gradient-text leading-tight">EduAI</span>
              <span className="hidden text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:block">Student OS</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'bg-white/10 text-white shadow-inner'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100'
                  }`
                }
              >
                <Icon size={17} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden items-center gap-3 lg:flex">
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                  <Sparkles size={15} className="text-amber-200" />
                  <span className="max-w-28 truncate text-sm font-semibold text-slate-200">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/15 text-red-300 transition"
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

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-300"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/[0.06]'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/15"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
