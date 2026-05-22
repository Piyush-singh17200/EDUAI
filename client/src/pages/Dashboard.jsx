import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Code, Briefcase, Award, Zap, Target, Brain, CalendarDays, Flame, Trophy, Star, Sparkles, Plus, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { useStore } from '../store';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useStore();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/learning/summary')
      .then(({ data }) => setSummary(data.data))
      .catch(() => setSummary(null));
  }, []);

  // Performance Mock Data for Recharts
  const studyTimeData = [
    { name: 'Mon', minutes: 45, accuracy: 80 },
    { name: 'Tue', minutes: 80, accuracy: 85 },
    { name: 'Wed', minutes: 120, accuracy: 75 },
    { name: 'Thu', minutes: 90, accuracy: 90 },
    { name: 'Fri', minutes: 150, accuracy: 88 },
    { name: 'Sat', minutes: 180, accuracy: 92 },
    { name: 'Sun', minutes: 60, accuracy: 95 }
  ];

  const subjectStrengthData = [
    { subject: 'Math', level: 85, color: '#6366f1' },
    { subject: 'Science', level: 70, color: '#3b82f6' },
    { subject: 'English', level: 90, color: '#a855f7' },
    { subject: 'Coding', level: 95, color: '#ec4899' },
    { subject: 'History', level: 75, color: '#f59e0b' }
  ];

  const badges = [
    { id: 1, title: 'AI Scholar', desc: 'Asked 10 questions to Tutor', unlocked: true, icon: Sparkles, color: 'from-blue-400 to-indigo-500' },
    { id: 2, title: 'ATS Conqueror', desc: 'Scored 85%+ on Resume', unlocked: true, icon: Trophy, color: 'from-amber-400 to-orange-500' },
    { id: 3, title: 'Matrix Master', desc: 'Mapped Eisenhower Planner', unlocked: false, icon: Star, color: 'from-slate-500 to-slate-700' }
  ];

  const cards = [
    {
      icon: Brain,
      title: 'Adaptive Learning',
      description: 'Track memory retention, weak topics, revisions, and analytics',
      color: 'from-indigo-500 to-violet-500',
      link: '/adaptive-learning'
    },
    {
      icon: BookOpen,
      title: 'AI Tutor',
      description: 'Interactive conversation, immediate concept explanations, and quizzes',
      color: 'from-blue-500 to-cyan-500',
      link: '/tutor'
    },
    {
      icon: Code,
      title: 'Study Planner',
      description: 'Schedule study slots and balance your weekly timetable dynamically',
      color: 'from-purple-500 to-pink-500',
      link: '/study-planner'
    },
    {
      icon: Briefcase,
      title: 'Career Roadmap',
      description: 'Discover specialized 8-week career paths and training resources',
      color: 'from-orange-500 to-red-500',
      link: '/career-roadmap'
    },
    {
      icon: Award,
      title: 'Resume Analyzer',
      description: 'Upload PDF resumes for instant ATS feedback and job matching suggestions',
      color: 'from-green-500 to-emerald-500',
      link: '/resume-analyzer'
    },
    {
      icon: Briefcase,
      title: 'Interview Simulator',
      description: 'AI-conducted roleplay interviews, answer assessments, and score cards',
      color: 'from-pink-500 to-rose-500',
      link: '/mock-interview'
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#07050e] text-slate-100 pt-24 pb-16 px-4 md:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
              Welcome Back, <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">{user?.name || 'Scholar'}</span>!
            </h1>
            <p className="text-slate-400 text-lg">
              Unlock your peak educational potential with advanced, real-time study intelligence.
            </p>
          </div>
          
          {/* Quick Streak Widget */}
          <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-800 shadow-xl shadow-indigo-950/10">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Flame className="text-orange-500 fill-orange-500/50 animate-pulse" size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Streak</p>
              <p className="text-xl font-black text-orange-400">{summary?.stats?.streak || 5} Days</p>
            </div>
          </div>
        </motion.div>

        {/* Gamified Achievement & XP Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10"
        >
          {/* XP & Level Panel */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-indigo-500/10 flex items-center gap-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors" />
            <div className="relative">
              {/* Circular Progress Gauge */}
              <svg className="w-24 h-24 transform -rotate-95">
                <circle cx="48" cy="48" r="40" stroke="#1e1b4b" strokeWidth="6" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#indigoGrad)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * 340) / 500}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-indigo-400 uppercase tracking-widest font-black">Level</span>
                <span className="text-3xl font-black text-white">4</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-bold text-slate-400">Total Experience Points</span>
                <span className="text-xs text-pink-400 font-black tracking-wider">340 / 500 XP</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-[2px]">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full" style={{ width: '68%' }} />
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <Sparkles size={12} className="text-indigo-400" />
                Earn 160 XP more to advance to Level 5!
              </p>
            </div>
          </div>

          {/* Badge Gallery */}
          <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Trophy className="text-amber-400" size={20} />
                Unlocked Achievements
              </h3>
              <span className="text-xs font-bold bg-slate-800 text-indigo-400 px-3 py-1 rounded-full border border-slate-700">2 / 3 Unlocked</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {badges.map((b) => {
                const BadgeIcon = b.icon;
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                      b.unlocked
                        ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/20 border-slate-950 opacity-40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${b.color} flex items-center justify-center border border-white/5`}>
                      <BadgeIcon className="text-white" size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-slate-200 truncate">{b.title}</h4>
                      <p className="text-xs text-slate-500 truncate">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-black mb-6 tracking-tight flex items-center gap-2 text-indigo-300">
            <Zap className="text-indigo-400" size={20} />
            AI Study Modules
          </h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  variants={item}
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group cursor-pointer"
                >
                  <Link to={card.link} className="block h-full">
                    <div className="bg-[#0e0a1b]/40 hover:bg-[#130f24]/50 backdrop-blur-md p-6 rounded-2xl h-full border border-slate-900 hover:border-indigo-500/30 transition-all shadow-xl shadow-slate-950/20 flex flex-col justify-between">
                      <div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/10 shadow-lg shadow-indigo-950/30`}>
                          <Icon className="text-white" size={24} />
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-slate-100 group-hover:text-indigo-300 transition-colors">{card.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{card.description}</p>
                      </div>
                      <div className="mt-6 flex items-center text-indigo-400 group-hover:translate-x-2 transition-transform">
                        <span className="text-sm font-bold uppercase tracking-wider">Launch Module</span>
                        <span className="ml-2 font-bold text-lg">→</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Feature 1: Performance Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12"
        >
          {/* Chart 1: Study Activity Area Chart */}
          <div className="bg-[#0e0a1b]/40 backdrop-blur-md p-6 rounded-2xl border border-slate-900 lg:col-span-2 shadow-xl shadow-slate-950/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-lg tracking-tight">Study Time vs. Accuracy</h3>
                <p className="text-xs text-slate-500">Track daily study minutes and concept quiz accuracy scores</p>
              </div>
              <div className="flex gap-4 text-xs font-bold">
                <span className="flex items-center gap-1 text-indigo-400"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Minutes</span>
                <span className="flex items-center gap-1 text-pink-400"><span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Accuracy (%)</span>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studyTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#161427" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#13112b', border: '1px solid #312e81', borderRadius: '12px', color: '#cbd5e1' }} />
                  <Area type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMinutes)" />
                  <Area type="monotone" dataKey="accuracy" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorAccuracy)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Subject Strengths Bar Chart */}
          <div className="bg-[#0e0a1b]/40 backdrop-blur-md p-6 rounded-2xl border border-slate-900 shadow-xl shadow-slate-950/30">
            <div>
              <h3 className="font-black text-lg tracking-tight mb-1">Subject Proficiency</h3>
              <p className="text-xs text-slate-500 mb-6">Subject concept mastery levels based on AI evaluation</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectStrengthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#161427" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="subject" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#13112b', border: '1px solid #312e81', borderRadius: '12px', color: '#cbd5e1' }} />
                  <Bar dataKey="level" radius={[6, 6, 0, 0]} barSize={28}>
                    {subjectStrengthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Adaptive Analytics Details (Weak topics & revisions) */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <div className="bg-[#0e0a1b]/40 backdrop-blur-md rounded-2xl p-6 border border-slate-900 shadow-xl shadow-slate-950/20">
              <h2 className="mb-4 flex items-center text-lg font-black tracking-tight text-red-400">
                <Target className="mr-2" size={20} />
                Flagged Weak Topics
              </h2>
              <div className="space-y-3">
                {summary.weakTopics?.length ? summary.weakTopics.slice(0, 4).map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between rounded-xl bg-slate-900/60 border border-slate-800/40 p-4">
                    <div>
                      <p className="font-bold text-slate-200">{topic.topic}</p>
                      <p className="text-xs text-slate-500">{topic.subject}</p>
                    </div>
                    <span className="text-xs font-bold bg-red-950/50 text-red-400 px-3 py-1 rounded-full border border-red-500/20">
                      Weakness: {topic.weaknessScore}%
                    </span>
                  </div>
                )) : <p className="text-slate-500 text-sm">No weak topics flagged yet. Learn more with our AI Tutor to establish records.</p>}
              </div>
            </div>

            <div className="bg-[#0e0a1b]/40 backdrop-blur-md rounded-2xl p-6 border border-slate-900 shadow-xl shadow-slate-950/20">
              <h2 className="mb-4 flex items-center text-lg font-black tracking-tight text-emerald-400">
                <CalendarDays className="mr-2" size={20} />
                Scheduled Revisions
              </h2>
              <div className="space-y-3">
                {summary.upcomingRevisions?.length ? summary.upcomingRevisions.slice(0, 4).map((revision) => (
                  <div key={revision.id} className="flex items-center justify-between rounded-xl bg-slate-900/60 border border-slate-800/40 p-4">
                    <div>
                      <p className="font-bold text-slate-200">{revision.topic}</p>
                      <p className="text-xs text-slate-500">{revision.subject}</p>
                    </div>
                    <span className="text-xs font-bold bg-emerald-950/50 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                      Due: {revision.dueDate}
                    </span>
                  </div>
                )) : <p className="text-slate-500 text-sm">No revisions scheduled yet.</p>}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
