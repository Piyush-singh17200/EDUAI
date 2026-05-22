import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  Play,
  RefreshCw,
  Target,
  TimerReset,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';

const emptySummary = {
  profile: { subjects: [], goals: '', examDate: '', dailyTargetMinutes: 120 },
  todayPlan: [],
  weakTopics: [],
  upcomingRevisions: [],
  stats: {},
  charts: { studyTime: [], accuracy: [], topicStrength: [] },
};

const AdaptiveLearning = () => {
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ subjects: '', goals: '', examDate: '', dailyTargetMinutes: 120 });
  const [studyLog, setStudyLog] = useState({ subject: 'General', topic: '', minutes: 45, notes: '' });
  const [plannerInput, setPlannerInput] = useState({ subjects: '', examDate: '' });
  const [contentInput, setContentInput] = useState({ subject: 'General', topic: '' });
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [focus, setFocus] = useState({ minutes: 25, secondsLeft: 25 * 60, running: false, subject: 'Focus', topic: 'Deep Work' });

  const fetchSummary = async () => {
    try {
      const { data } = await api.get('/learning/summary');
      setSummary(data.data || emptySummary);
      const nextProfile = data.data?.profile || emptySummary.profile;
      setProfile({
        subjects: nextProfile.subjects?.join(', ') || '',
        goals: nextProfile.goals || '',
        examDate: nextProfile.examDate || '',
        dailyTargetMinutes: nextProfile.dailyTargetMinutes || 120,
      });
      setPlannerInput({
        subjects: nextProfile.subjects?.join(', ') || '',
        examDate: nextProfile.examDate || '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load adaptive learning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    if (!focus.running) return undefined;

    const timer = setInterval(() => {
      setFocus((current) => {
        if (current.secondsLeft <= 1) {
          clearInterval(timer);
          logFocusSession(current);
          return { ...current, running: false, secondsLeft: current.minutes * 60 };
        }

        return { ...current, secondsLeft: current.secondsLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [focus.running]);

  const subjects = useMemo(() => {
    const profileSubjects = summary.profile?.subjects || [];
    const weakSubjects = summary.weakTopics?.map((topic) => topic.subject) || [];
    return [...new Set(['General', ...profileSubjects, ...weakSubjects])];
  }, [summary]);

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      await api.put('/learning/profile', profile);
      toast.success('Profile saved');
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save profile');
    }
  };

  const submitStudyLog = async (event) => {
    event.preventDefault();
    if (!studyLog.topic.trim()) {
      toast.error('Enter a topic');
      return;
    }

    try {
      await api.post('/learning/study-logs', studyLog);
      toast.success('Study session logged and revision scheduled');
      setStudyLog({ ...studyLog, topic: '', notes: '' });
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to log study session');
    }
  };

  const generatePlan = async () => {
    try {
      await api.post('/learning/planner/generate', plannerInput);
      toast.success('Smart plan generated');
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate plan');
    }
  };

  const completePlanTask = async (taskId) => {
    try {
      await api.patch(`/learning/planner/${taskId}`, { status: 'completed' });
      toast.success('Task completed');
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update task');
    }
  };

  const completeRevision = async (revisionId, confidence = 'medium') => {
    try {
      await api.post(`/learning/revisions/${revisionId}/complete`, { confidence });
      toast.success('Revision completed and next review scheduled');
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to complete revision');
    }
  };

  const generateNotes = async () => {
    if (!contentInput.topic.trim()) {
      toast.error('Enter a topic');
      return;
    }

    try {
      const { data } = await api.post('/learning/content/notes', contentInput);
      setGeneratedNotes(data.data.notes);
      toast.success('AI notes generated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate notes');
    }
  };

  const downloadNotes = () => {
    const blob = new Blob([generatedNotes], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contentInput.topic || 'notes'}-revision-notes.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const logFocusSession = async (currentFocus = focus) => {
    try {
      await api.post('/learning/focus-sessions', {
        subject: currentFocus.subject,
        topic: currentFocus.topic,
        minutes: currentFocus.minutes,
      });
      toast.success('Focus session logged');
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to log focus session');
    }
  };

  const setFocusMinutes = (minutes) => {
    setFocus((current) => ({ ...current, minutes, secondsLeft: minutes * 60, running: false }));
  };

  const minutes = Math.floor(focus.secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (focus.secondsLeft % 60).toString().padStart(2, '0');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 text-center text-slate-300">
        Loading adaptive learning...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-12 px-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-indigo-300">Adaptive learning system</p>
              <h1 className="mt-2 text-4xl font-bold gradient-text">Personalized Learning Companion</h1>
              <p className="mt-3 max-w-3xl text-slate-400">
                Track study sessions, detect weak topics, schedule spaced revisions, and generate AI notes.
              </p>
            </div>
            <button
              onClick={fetchSummary}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-5">
          <StatCard icon={Clock} label="Study Time" value={`${Math.round((summary.stats.studyMinutes || 0) / 60)}h`} />
          <StatCard icon={Target} label="Accuracy" value={`${summary.stats.accuracy || 0}%`} />
          <StatCard icon={Brain} label="Topics" value={summary.stats.topicsTracked || 0} />
          <StatCard icon={Bell} label="Revisions" value={summary.stats.pendingRevisions || 0} />
          <StatCard icon={Flame} label="Streak" value={`${summary.stats.streak || 0}d`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_1.5fr]">
          <div className="space-y-6">
            <Panel title="Student Profile" icon={BookOpen}>
              <form onSubmit={saveProfile} className="space-y-4">
                <Field label="Subjects">
                  <input
                    value={profile.subjects}
                    onChange={(event) => setProfile({ ...profile, subjects: event.target.value })}
                    placeholder="Math, Physics, HTML"
                    className="input"
                  />
                </Field>
                <Field label="Goal">
                  <input
                    value={profile.goals}
                    onChange={(event) => setProfile({ ...profile, goals: event.target.value })}
                    placeholder="Board exams, placement, semester"
                    className="input"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Exam Date">
                    <input
                      type="date"
                      value={profile.examDate}
                      onChange={(event) => setProfile({ ...profile, examDate: event.target.value })}
                      className="input"
                    />
                  </Field>
                  <Field label="Daily Target">
                    <input
                      type="number"
                      min="15"
                      value={profile.dailyTargetMinutes}
                      onChange={(event) => setProfile({ ...profile, dailyTargetMinutes: event.target.value })}
                      className="input"
                    />
                  </Field>
                </div>
                <button className="btn-primary w-full" type="submit">Save Profile</button>
              </form>
            </Panel>

            <Panel title="Study Tracker" icon={Clock}>
              <form onSubmit={submitStudyLog} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Subject">
                    <select
                      value={studyLog.subject}
                      onChange={(event) => setStudyLog({ ...studyLog, subject: event.target.value })}
                      className="input"
                    >
                      {subjects.map((subject) => <option key={subject}>{subject}</option>)}
                    </select>
                  </Field>
                  <Field label="Minutes">
                    <input
                      type="number"
                      min="1"
                      value={studyLog.minutes}
                      onChange={(event) => setStudyLog({ ...studyLog, minutes: event.target.value })}
                      className="input"
                    />
                  </Field>
                </div>
                <Field label="Topic">
                  <input
                    value={studyLog.topic}
                    onChange={(event) => setStudyLog({ ...studyLog, topic: event.target.value })}
                    placeholder="e.g., HTML forms"
                    className="input"
                  />
                </Field>
                <Field label="Notes">
                  <textarea
                    value={studyLog.notes}
                    onChange={(event) => setStudyLog({ ...studyLog, notes: event.target.value })}
                    className="input h-20 resize-none"
                    placeholder="What did you finish?"
                  />
                </Field>
                <button className="btn-primary w-full" type="submit">Log Study Session</button>
              </form>
            </Panel>

            <Panel title="Focus Mode" icon={TimerReset}>
              <div className="text-center">
                <p className="text-6xl font-bold gradient-text">{minutes}:{seconds}</p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[25, 45, 60].map((item) => (
                    <button
                      key={item}
                      onClick={() => setFocusMinutes(item)}
                      className="rounded-lg bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
                    >
                      {item}m
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setFocus({ ...focus, running: !focus.running })}
                  className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2"
                >
                  <Play size={16} />
                  {focus.running ? 'Pause' : 'Start Focus'}
                </button>
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title="Today's Study Plan" icon={CalendarDays}>
                <TaskList tasks={summary.todayPlan} onComplete={completePlanTask} />
                <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
                  <Field label="Subjects">
                    <input
                      value={plannerInput.subjects}
                      onChange={(event) => setPlannerInput({ ...plannerInput, subjects: event.target.value })}
                      className="input"
                    />
                  </Field>
                  <Field label="Exam Date">
                    <input
                      type="date"
                      value={plannerInput.examDate}
                      onChange={(event) => setPlannerInput({ ...plannerInput, examDate: event.target.value })}
                      className="input"
                    />
                  </Field>
                  <button onClick={generatePlan} className="btn-primary w-full" type="button">
                    Generate Smart Plan
                  </button>
                </div>
              </Panel>

              <Panel title="Upcoming Revisions" icon={Bell}>
                {summary.upcomingRevisions.length ? (
                  <div className="space-y-3">
                    {summary.upcomingRevisions.map((revision) => (
                      <div key={revision.id} className="rounded-lg bg-slate-800/60 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{revision.topic}</p>
                            <p className="text-sm text-slate-400">{revision.subject} - Due {revision.dueDate}</p>
                            <p className="mt-1 text-xs text-slate-500">{revision.reason}</p>
                          </div>
                          <button
                            onClick={() => completeRevision(revision.id, 'medium')}
                            className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty text="No revisions scheduled yet. Log a study session to start spaced repetition." />
                )}
              </Panel>
            </div>

            <Panel title="Weak Topics" icon={Target}>
              {summary.weakTopics.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {summary.weakTopics.map((topic) => (
                    <div key={topic.id} className="rounded-lg bg-slate-800/60 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{topic.topic}</p>
                          <p className="text-sm text-slate-400">{topic.subject}</p>
                        </div>
                        <span className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-300">
                          Weak {topic.weaknessScore}
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-700">
                        <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-emerald-400" style={{ width: `${topic.strength}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Next review: {topic.nextReviewDate || 'not scheduled'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty text="No weak topics yet. Take quizzes or log study sessions to build your map." />
              )}
            </Panel>

            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title="Study Time" icon={BarChart3}>
                <Chart height={220}>
                  <BarChart data={summary.charts.studyTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                    <Bar dataKey="minutes" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </Chart>
              </Panel>

              <Panel title="Accuracy Trend" icon={CheckCircle2}>
                <Chart height={220}>
                  <LineChart data={summary.charts.accuracy}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                    <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={3} dot={false} />
                  </LineChart>
                </Chart>
              </Panel>
            </div>

            <Panel title="AI Notes & Revision Pack" icon={Brain}>
              <div className="grid gap-3 md:grid-cols-[1fr_1.2fr_auto]">
                <select
                  value={contentInput.subject}
                  onChange={(event) => setContentInput({ ...contentInput, subject: event.target.value })}
                  className="input"
                >
                  {subjects.map((subject) => <option key={subject}>{subject}</option>)}
                </select>
                <input
                  value={contentInput.topic}
                  onChange={(event) => setContentInput({ ...contentInput, topic: event.target.value })}
                  placeholder="Topic for notes"
                  className="input"
                />
                <button onClick={generateNotes} className="btn-primary" type="button">Generate</button>
              </div>
              {generatedNotes && (
                <div className="mt-4 rounded-lg bg-slate-950/60 p-4">
                  <div className="mb-3 flex justify-end">
                    <button onClick={downloadNotes} className="inline-flex items-center gap-2 rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">
                      <Download size={15} />
                      Export Notes
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{generatedNotes}</pre>
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="glass rounded-xl p-4">
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-400">{label}</p>
      <Icon size={18} className="text-indigo-300" />
    </div>
    <p className="mt-3 text-3xl font-bold gradient-text">{value}</p>
  </div>
);

const Panel = ({ title, icon: Icon, children }) => (
  <section className="glass rounded-xl p-5">
    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
      <Icon size={19} className="text-indigo-300" />
      {title}
    </h2>
    {children}
  </section>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
    {children}
  </label>
);

const TaskList = ({ tasks = [], onComplete }) => {
  if (!tasks.length) return <Empty text="No tasks for today. Generate a smart plan to fill this." />;

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="rounded-lg bg-slate-800/60 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{task.title}</p>
              <p className="text-sm text-slate-400">{task.type} - {task.estimatedMinutes} min</p>
              <p className="mt-1 text-xs text-slate-500">{task.reason}</p>
            </div>
            <button
              onClick={() => onComplete(task.id)}
              className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300"
            >
              Done
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const Empty = ({ text }) => (
  <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400">
    {text}
  </div>
);

const Chart = ({ height, children }) => (
  <div style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
);

export default AdaptiveLearning;
