import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Map, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useStore } from '../store';

const CareerRoadmap = () => {
  const [careerGoal, setCareerGoal] = useState('Full Stack Web Developer');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [timelineWeeks, setTimelineWeeks] = useState(8);
  const [collegeCommitment, setCollegeCommitment] = useState('balanced');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setCareerRoadmap } = useStore();

  const generateRoadmap = async (e) => {
    e.preventDefault();
    if (!careerGoal.trim()) {
      toast.error('Please enter a career goal');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/career-roadmap/generate', {
        careerGoal,
        currentLevel,
        timelineWeeks: parseInt(timelineWeeks),
        collegeCommitment
      });

      setRoadmap(data.data);
      setCareerRoadmap(data.data);
      toast.success('Roadmap generated!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 gradient-text">Career Roadmap</h1>
          <p className="text-slate-400">Create a personalized roadmap balancing college and career goals</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass p-6 rounded-xl sticky top-24">
              <h2 className="text-xl font-bold mb-4">Career Goal</h2>
              <form onSubmit={generateRoadmap} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">What's your goal?</label>
                  <input
                    type="text"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="e.g., Full Stack Developer"
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Current Level</label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Timeline (weeks)</label>
                  <select
                    value={timelineWeeks}
                    onChange={(e) => setTimelineWeeks(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 outline-none"
                  >
                    <option value="4">4 weeks</option>
                    <option value="8">8 weeks</option>
                    <option value="12">12 weeks</option>
                    <option value="24">6 months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">College Commitment</label>
                  <select
                    value={collegeCommitment}
                    onChange={(e) => setCollegeCommitment(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 outline-none"
                  >
                    <option value="light">Light (focus on career)</option>
                    <option value="balanced">Balanced</option>
                    <option value="heavy">Heavy (focus on college)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
                >
                  {loading ? 'Generating...' : 'Generate Roadmap'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Roadmap Display */}
          <div className="lg:col-span-3">
            {roadmap ? (
              <div className="space-y-6">
                {/* Phases */}
                {roadmap.phases?.map((phase, phaseIdx) => (
                  <motion.div
                    key={phaseIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: phaseIdx * 0.1 }}
                    className="glass p-6 rounded-xl"
                  >
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center flex-shrink-0 font-bold">
                        {phaseIdx + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{phase.name}</h3>
                        <p className="text-sm text-slate-400">{phase.duration}</p>
                      </div>
                    </div>

                    {/* Objectives */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-green-400 mb-2 flex items-center">
                        <CheckCircle size={16} className="mr-2" />
                        Objectives
                      </h4>
                      <ul className="space-y-1">
                        {phase.objectives?.map((obj, idx) => (
                          <li key={idx} className="text-sm text-slate-300 ml-6">• {obj}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Weekly Tasks */}
                    {phase.weeklyTasks && (
                      <div>
                        <h4 className="font-semibold mb-3">Weekly Breakdown</h4>
                        <div className="space-y-3">
                          {phase.weeklyTasks.map((week, weekIdx) => (
                            <div key={weekIdx} className="p-3 rounded-lg bg-slate-700/30">
                              <p className="font-semibold text-indigo-400 mb-2">Week {week.week}</p>
                              <ul className="text-sm space-y-1 text-slate-300">
                                {week.tasks?.slice(0, 3).map((task, idx) => (
                                  <li key={idx}>• {task}</li>
                                ))}
                                {week.tasks?.length > 3 && (
                                  <li className="text-slate-400">+{week.tasks.length - 3} more tasks</li>
                                )}
                              </ul>
                              <div className="flex space-x-4 mt-2 text-xs text-slate-400">
                                <span>⏱ {week.estimatedHours}h</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Skills Section */}
                {roadmap.skills && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass p-6 rounded-xl"
                  >
                    <h3 className="text-xl font-bold mb-4">Skills to Develop</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-blue-400 mb-3">Technical Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {roadmap.skills.technical?.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-purple-400 mb-3">Soft Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {roadmap.skills.soft?.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Topic-wise Projects */}
                {Array.isArray(roadmap.topicProjects) && roadmap.topicProjects.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="glass p-6 rounded-xl"
                  >
                    <h3 className="text-xl font-bold mb-4">Topic-wise Projects</h3>
                    <div className="space-y-4">
                      {roadmap.topicProjects.map((item, idx) => (
                        <div key={`${item.topic}-${idx}`} className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-indigo-300">{item.topic}</p>
                              <p className="mt-1 text-lg font-semibold">{item.project}</p>
                            </div>
                            {item.whenToBuild && (
                              <span className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300">
                                {item.whenToBuild}
                              </span>
                            )}
                          </div>
                          <p className="mt-3 text-sm text-slate-300">{item.description}</p>
                          {Array.isArray(item.deliverables) && item.deliverables.length > 0 && (
                            <div className="mt-3">
                              <p className="mb-2 text-xs uppercase text-slate-500">Deliverables</p>
                              <div className="flex flex-wrap gap-2">
                                {item.deliverables.map((deliverable, deliverableIdx) => (
                                  <span
                                    key={`${deliverable}-${deliverableIdx}`}
                                    className="rounded bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300"
                                  >
                                    {deliverable}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {Array.isArray(item.skills) && item.skills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                              {item.skills.map((skill, skillIdx) => (
                                <span key={`${skill}-${skillIdx}`} className="inline-flex items-center gap-1">
                                  <ArrowRight size={12} />
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Projects */}
                {roadmap.projects && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass p-6 rounded-xl"
                  >
                    <h3 className="text-xl font-bold mb-4">Portfolio Projects</h3>
                    <div className="space-y-3">
                      {roadmap.projects?.slice(0, 3).map((project, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-slate-700/30">
                          <p className="font-semibold mb-1">{project.name}</p>
                          <p className="text-sm text-slate-400 mb-2">{project.description}</p>
                          <div className="flex space-x-2 text-xs">
                            <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300">
                              {project.difficulty}
                            </span>
                            <span className="px-2 py-1 rounded bg-slate-600/50">
                              {project.timeline}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="glass p-12 rounded-xl text-center">
                <Map size={48} className="mx-auto text-slate-500 mb-4" />
                <p className="text-slate-400">Fill in your details and generate your personalized roadmap</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerRoadmap;
