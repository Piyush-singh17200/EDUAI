import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, BookOpen, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useStore } from '../store';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    subjects: '',
    goals: '',
    examDate: ''
  });

  const navigate = useNavigate();
  const { setToken, setUser } = useStore();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = {
        ...formData,
        subjects: formData.subjects
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      };
      const { data } = await api.post(endpoint, payload);

      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      toast.success(isLogin ? 'Logged in successfully!' : 'Account created!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BookOpen size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">EduAI</h1>
          </div>
          <p className="text-slate-400">Your AI-powered learning companion</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 rounded-xl"
        >
          <h2 className="text-2xl font-bold mb-6">
            {isLogin ? 'Welcome Back' : 'Join EduAI'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subjects</label>
                  <input
                    type="text"
                    name="subjects"
                    value={formData.subjects}
                    onChange={handleChange}
                    placeholder="Math, Physics, HTML"
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Goal</label>
                  <input
                    type="text"
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    placeholder="Semester exam, placement, boards"
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Exam Date</label>
                  <input
                    type="date"
                    name="examDate"
                    value={formData.examDate}
                    onChange={handleChange}
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 outline-none transition"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full bg-slate-700 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-slate-700 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center"
            >
              <LogIn size={18} className="mr-2" />
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-slate-400 text-sm mb-3">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: '', password: '', name: '', subjects: '', goals: '', examDate: '' });
              }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 20 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-2 gap-4"
        >
          {[
            { icon: BookOpen, title: 'AI Tutor', desc: 'Learn anything' },
            { icon: Zap, title: 'Smart Plans', desc: 'Optimized study' }
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="glass p-4 rounded-lg text-center">
                <Icon size={20} className="mx-auto text-indigo-400 mb-2" />
                <p className="font-semibold text-sm">{feature.title}</p>
                <p className="text-xs text-slate-400">{feature.desc}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
