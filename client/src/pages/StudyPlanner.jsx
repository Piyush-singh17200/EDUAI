import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Trash2, Zap, Target, Flame, Calendar, Coffee, AlertTriangle, CheckCircle2, ArrowLeft, X, BookOpen, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const QUADRANTS = [
  {
    id: 'do-first',
    title: 'Do First',
    subtitle: 'Urgent & Important',
    icon: Flame,
    color: 'from-red-500 to-orange-500',
    border: 'border-red-500/20',
    bg: 'bg-red-950/15',
    hoverBg: 'hover:bg-red-950/25',
    textColor: 'text-red-400',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
    glow: 'bg-red-500/5'
  },
  {
    id: 'schedule',
    title: 'Schedule',
    subtitle: 'Important, Not Urgent',
    icon: Calendar,
    color: 'from-indigo-500 to-blue-500',
    border: 'border-indigo-500/20',
    bg: 'bg-indigo-950/15',
    hoverBg: 'hover:bg-indigo-950/25',
    textColor: 'text-indigo-400',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    glow: 'bg-indigo-500/5'
  },
  {
    id: 'delegate',
    title: 'Delegate',
    subtitle: 'Urgent, Not Important',
    icon: AlertTriangle,
    color: 'from-amber-500 to-yellow-500',
    border: 'border-amber-500/20',
    bg: 'bg-amber-950/15',
    hoverBg: 'hover:bg-amber-950/25',
    textColor: 'text-amber-400',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    glow: 'bg-amber-500/5'
  },
  {
    id: 'eliminate',
    title: 'Eliminate',
    subtitle: 'Not Urgent & Not Important',
    icon: Coffee,
    color: 'from-slate-500 to-slate-600',
    border: 'border-slate-700/40',
    bg: 'bg-slate-900/20',
    hoverBg: 'hover:bg-slate-900/40',
    textColor: 'text-slate-400',
    badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    glow: 'bg-slate-500/5'
  }
];

const DEFAULT_MATRIX_TASKS = {
  'do-first': [
    { id: '1', text: 'Complete Data Structures assignment (due tomorrow)', done: false },
    { id: '2', text: 'Study for calculus mid-term exam', done: false }
  ],
  'schedule': [
    { id: '3', text: 'Build portfolio project with React & Node.js', done: false },
    { id: '4', text: 'Read 2 chapters of system design book', done: false }
  ],
  'delegate': [
    { id: '5', text: 'Format lab report for submission', done: false }
  ],
  'eliminate': [
    { id: '6', text: 'Reorganize old class notes folder', done: false }
  ]
};

const MATRIX_STORAGE_KEY = 'eduai-study-matrix';

const loadMatrixTasks = () => {
  try {
    const saved = localStorage.getItem(MATRIX_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_MATRIX_TASKS;
  } catch {
    return DEFAULT_MATRIX_TASKS;
  }
};

const StudyPlanner = () => {
  // Eisenhower Matrix state
  const [tasks, setTasks] = useState(loadMatrixTasks);
  const [showAddModal, setShowAddModal] = useState(null); // quadrant id or null
  const [newTaskText, setNewTaskText] = useState('');

  // Original Schedule Optimizer state
  const [tab, setTab] = useState('matrix'); // 'matrix' | 'optimizer'
  const [schedule, setSchedule] = useState([]);
  const [optimized, setOptimized] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newClass, setNewClass] = useState({
    day: 'Monday',
    time: '09:00-10:00',
    subject: '',
    duration: 60
  });
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    localStorage.setItem(MATRIX_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // --- Eisenhower Matrix Handlers ---
  const addTask = (quadrantId) => {
    if (!newTaskText.trim()) {
      toast.error('Please enter a task description');
      return;
    }
    setTasks(prev => ({
      ...prev,
      [quadrantId]: [...prev[quadrantId], { id: Date.now().toString(), text: newTaskText.trim(), done: false }]
    }));
    setNewTaskText('');
    setShowAddModal(null);
    toast.success('Task added!');
  };

  const toggleTask = (quadrantId, taskId) => {
    setTasks(prev => ({
      ...prev,
      [quadrantId]: prev[quadrantId].map(t => t.id === taskId ? { ...t, done: !t.done } : t)
    }));
  };

  const deleteTask = (quadrantId, taskId) => {
    setTasks(prev => ({
      ...prev,
      [quadrantId]: prev[quadrantId].filter(t => t.id !== taskId)
    }));
  };

  const moveTask = (fromQuadrant, taskId, toQuadrant) => {
    const task = tasks[fromQuadrant].find(t => t.id === taskId);
    if (!task) return;
    setTasks(prev => ({
      ...prev,
      [fromQuadrant]: prev[fromQuadrant].filter(t => t.id !== taskId),
      [toQuadrant]: [...prev[toQuadrant], { ...task, done: false }]
    }));
    toast.success(`Moved to ${QUADRANTS.find(q => q.id === toQuadrant)?.title}`);
  };

  const totalTasks = Object.values(tasks).reduce((sum, arr) => sum + arr.length, 0);
  const completedTasks = Object.values(tasks).reduce((sum, arr) => sum + arr.filter(t => t.done).length, 0);

  // --- Original Schedule Optimizer Handlers ---
  const addClass = () => {
    if (!newClass.subject.trim()) {
      toast.error('Please enter subject name');
      return;
    }
    setSchedule([...schedule, { ...newClass, id: Date.now() }]);
    setNewClass({ day: 'Monday', time: '09:00-10:00', subject: '', duration: 60 });
    toast.success('Class added!');
  };

  const deleteClass = (id) => {
    setSchedule(schedule.filter(c => c.id !== id));
  };

  const generateOptimizedSchedule = async () => {
    if (schedule.length === 0) {
      toast.error('Please add some classes first');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/study-planner/optimize-schedule', {
        timeTableData: { schedule },
        preferences: {
          studyStyle: 'mixed',
          focusAreas: ['mathematics', 'programming'],
          breakIntervals: 25
        }
      });
      setOptimized(data.data);
      toast.success('Schedule optimized!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to optimize schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07050e] text-slate-100 pt-24 pb-16 px-4 md:px-8 relative overflow-hidden font-geist">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 mb-4 transition">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Smart Study Planner</span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base max-w-xl">
                Prioritize your study tasks with the Eisenhower Matrix or optimize your weekly college timetable with AI.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-slate-900/60 border border-slate-800 rounded-xl p-1 self-start">
              <button
                onClick={() => setTab('matrix')}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  tab === 'matrix'
                    ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Target size={14} className="inline mr-1.5 -mt-0.5" /> Eisenhower Matrix
              </button>
              <button
                onClick={() => setTab('optimizer')}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  tab === 'optimizer'
                    ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock size={14} className="inline mr-1.5 -mt-0.5" /> Schedule Optimizer
              </button>
            </div>
          </div>
        </motion.div>

        {/* ============== EISENHOWER MATRIX TAB ============== */}
        {tab === 'matrix' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-5 py-3 flex items-center gap-3">
                <Target size={18} className="text-indigo-400" />
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Tasks</span>
                  <span className="text-lg font-black text-slate-200">{totalTasks}</span>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-5 py-3 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Completed</span>
                  <span className="text-lg font-black text-emerald-400">{completedTasks}</span>
                </div>
              </div>
              {totalTasks > 0 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-5 py-3 flex items-center gap-3">
                  <Zap size={18} className="text-pink-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Progress</span>
                    <span className="text-lg font-black text-pink-400">{Math.round((completedTasks / totalTasks) * 100)}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4-Quadrant Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {QUADRANTS.map((q) => {
                const Icon = q.icon;
                const quadrantTasks = tasks[q.id] || [];

                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${q.bg} backdrop-blur-md border ${q.border} rounded-2xl p-5 shadow-xl relative overflow-hidden group`}
                  >
                    {/* Subtle glow */}
                    <div className={`absolute top-0 right-0 w-24 h-24 ${q.glow} rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${q.color} flex items-center justify-center border border-white/10 shadow-lg`}>
                          <Icon size={18} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-slate-100">{q.title}</h3>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{q.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${q.badgeColor}`}>
                          {quadrantTasks.length} {quadrantTasks.length === 1 ? 'task' : 'tasks'}
                        </span>
                        <button
                          onClick={() => { setShowAddModal(q.id); setNewTaskText(''); }}
                          className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Task List */}
                    <div className="space-y-2 relative z-10 min-h-[80px]">
                      {quadrantTasks.length === 0 && (
                        <div className="text-center py-6">
                          <p className="text-xs text-slate-600">No tasks here yet. Click + to add one.</p>
                        </div>
                      )}
                      <AnimatePresence>
                        {quadrantTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10, height: 0 }}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all group/task ${
                              task.done
                                ? 'bg-slate-950/30 border-slate-900 opacity-60'
                                : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
                            }`}
                          >
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleTask(q.id, task.id)}
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
                                task.done
                                  ? 'bg-emerald-500 border-emerald-500'
                                  : `border-slate-700 hover:border-slate-500`
                              }`}
                            >
                              {task.done && <CheckCircle2 size={12} className="text-white" />}
                            </button>

                            {/* Task text */}
                            <span className={`flex-1 text-xs leading-relaxed ${
                              task.done ? 'line-through text-slate-500' : 'text-slate-200'
                            }`}>
                              {task.text}
                            </span>

                            {/* Actions (visible on hover) */}
                            <div className="flex items-center gap-1 opacity-0 group-hover/task:opacity-100 transition">
                              {/* Move dropdown */}
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    moveTask(q.id, task.id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                defaultValue=""
                                className="bg-slate-900 border border-slate-800 rounded-md text-[10px] text-slate-400 px-1.5 py-1 outline-none cursor-pointer"
                              >
                                <option value="" disabled>Move</option>
                                {QUADRANTS.filter(qd => qd.id !== q.id).map(qd => (
                                  <option key={qd.id} value={qd.id}>{qd.title}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => deleteTask(q.id, task.id)}
                                className="w-6 h-6 rounded-md bg-slate-900 hover:bg-red-500/20 border border-slate-800 hover:border-red-500/30 text-slate-500 hover:text-red-400 flex items-center justify-center transition"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Add Task Modal */}
            <AnimatePresence>
              {showAddModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                  onClick={() => setShowAddModal(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#0e0a1b] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-black text-lg text-slate-100">
                        Add Task to <span className={QUADRANTS.find(q => q.id === showAddModal)?.textColor}>
                          {QUADRANTS.find(q => q.id === showAddModal)?.title}
                        </span>
                      </h3>
                      <button
                        onClick={() => setShowAddModal(null)}
                        className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      {QUADRANTS.find(q => q.id === showAddModal)?.subtitle}
                    </p>
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTask(showAddModal)}
                      placeholder="e.g., Review chapter 5 for tomorrow's quiz..."
                      autoFocus
                      className="w-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition placeholder-slate-500 mb-4"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowAddModal(null)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs hover:bg-slate-800 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => addTask(showAddModal)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold text-xs border border-white/10 hover:shadow-lg hover:shadow-indigo-500/10 transition"
                      >
                        <Plus size={14} className="inline mr-1 -mt-0.5" /> Add Task
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ============== SCHEDULE OPTIMIZER TAB (original functionality preserved) ============== */}
        {tab === 'optimizer' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input Section */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#0e0a1b]/40 backdrop-blur-md border border-slate-900 p-6 rounded-2xl sticky top-24 shadow-xl"
                >
                  <h2 className="text-lg font-black mb-4 text-slate-100">Add Classes</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Day</label>
                      <select
                        value={newClass.day}
                        onChange={(e) => setNewClass({ ...newClass, day: e.target.value })}
                        className="w-full bg-slate-900/80 rounded-xl px-4 py-2.5 border border-slate-800 focus:border-indigo-500/50 outline-none text-sm text-slate-200 transition"
                      >
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Time</label>
                      <input
                        type="text"
                        value={newClass.time}
                        onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                        placeholder="09:00-10:00"
                        className="w-full bg-slate-900/80 rounded-xl px-4 py-2.5 border border-slate-800 focus:border-indigo-500/50 outline-none text-sm text-slate-200 transition placeholder-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Subject</label>
                      <input
                        type="text"
                        value={newClass.subject}
                        onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                        placeholder="e.g., Mathematics"
                        className="w-full bg-slate-900/80 rounded-xl px-4 py-2.5 border border-slate-800 focus:border-indigo-500/50 outline-none text-sm text-slate-200 transition placeholder-slate-600"
                      />
                    </div>

                    <button
                      onClick={addClass}
                      className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 py-2.5 rounded-xl font-bold text-sm text-white hover:shadow-lg hover:shadow-indigo-500/10 transition flex items-center justify-center border border-white/10"
                    >
                      <Plus size={18} className="mr-2" />
                      Add Class
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Schedule Display & Optimization */}
              <div className="lg:col-span-2 space-y-6">
                {schedule.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0e0a1b]/40 backdrop-blur-md border border-slate-900 p-6 rounded-2xl shadow-xl"
                  >
                    <h3 className="text-lg font-black mb-4 flex items-center text-slate-100">
                      <Clock className="mr-2 text-indigo-400" size={20} />
                      Your College Schedule
                    </h3>

                    {days.map(day => {
                      const dayClasses = schedule.filter(c => c.day === day);
                      if (dayClasses.length === 0) return null;
                      return (
                        <div key={day} className="mb-6 last:mb-0">
                          <h4 className="font-bold text-sm mb-3 text-indigo-400 uppercase tracking-wider">{day}</h4>
                          <div className="space-y-2">
                            {dayClasses.map(cls => (
                              <div
                                key={cls.id}
                                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 transition"
                              >
                                <div>
                                  <p className="font-bold text-sm text-slate-200">{cls.subject}</p>
                                  <p className="text-xs text-slate-500">{cls.time}</p>
                                </div>
                                <button
                                  onClick={() => deleteClass(cls.id)}
                                  className="text-slate-500 hover:text-red-400 transition"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={generateOptimizedSchedule}
                      disabled={loading}
                      className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center border border-white/10"
                    >
                      <Zap size={18} className="mr-2" />
                      {loading ? 'Optimizing...' : 'Generate Optimized Schedule'}
                    </button>
                  </motion.div>
                )}

                {/* Optimized Schedule */}
                {optimized && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0e0a1b]/40 backdrop-blur-md border border-emerald-500/10 p-6 rounded-2xl shadow-xl"
                  >
                    <h3 className="text-lg font-black mb-4 text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 size={20} /> Optimized Study Schedule
                    </h3>

                    {optimized.optimizedSchedule?.map((daySchedule, dayIdx) => (
                      <div key={dayIdx} className="mb-6">
                        <h4 className="font-bold text-sm mb-3 text-indigo-400 uppercase tracking-wider">{daySchedule.day}</h4>
                        <div className="space-y-2">
                          {daySchedule.schedule?.map((block, blockIdx) => (
                            <div
                              key={blockIdx}
                              className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-bold text-sm text-indigo-400">{block.time}</p>
                                <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded-full font-bold text-slate-400 border border-slate-700">
                                  {block.type}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mb-1">{block.activity}</p>
                              {block.resources && (
                                <p className="flex items-start gap-1.5 text-[10px] text-slate-500">
                                  <BookOpen size={12} className="mt-0.5 flex-shrink-0 text-indigo-300" />
                                  <span>{block.resources?.join(', ')}</span>
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {optimized.recommendations && (
                      <div className="mt-6 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/10">
                        <h4 className="font-bold text-sm text-indigo-400 mb-2 flex items-center gap-2">
                          <Lightbulb size={15} />
                          Pro Tips
                        </h4>
                        <ul className="space-y-1">
                          {optimized.recommendations?.map((tip, idx) => (
                            <li key={idx} className="text-xs text-slate-400">• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}

                {schedule.length === 0 && !optimized && (
                  <div className="bg-[#0e0a1b]/40 backdrop-blur-md border border-slate-900 p-12 rounded-2xl text-center shadow-xl">
                    <Clock size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-500 text-sm">Add your college classes to get started with AI optimization</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudyPlanner;
