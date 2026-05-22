import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Briefcase,
  CheckCircle2,
  FileText,
  Lightbulb,
  Target,
  Upload,
  XCircle,
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useStore } from '../store';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [company, setCompany] = useState('Software Engineer');
  const [analysis, setAnalysis] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { setResumeAnalysis } = useStore();

  const selectFile = (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setAnalysis(null);
    setJobs(null);
    toast.success('Resume selected');
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === 'dragenter' || event.type === 'dragover');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  const handleFileChange = (event) => {
    selectFile(event.target.files?.[0]);
  };

  const handleAnalyzeResume = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error('Please upload your resume first');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('company', company);

      const { data } = await api.post('/resume/analyze', formData);
      setAnalysis(data.data);
      setResumeAnalysis(data.data);

      const jobsResponse = await api.post('/resume/job-search', {
        jobTitle: company,
        experience: 'mid-level',
      });
      setJobs(jobsResponse.data.data);

      toast.success('Resume analyzed successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const score = analysis?.atsScore?.overallScore || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
            <Award size={16} />
            ATS, skills, and role-fit analysis
          </div>
          <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight">
            <span className="gradient-text">Resume Analyzer</span>
          </h1>
          <p className="mt-4 max-w-2xl text-slate-400 text-lg">
            Upload your resume and get a clear AI report with score, strengths,
            missing skills, and matching job ideas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.5fr] gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-6 rounded-xl h-fit lg:sticky lg:top-24"
          >
            <h2 className="text-xl font-bold mb-5">Upload Resume</h2>

            <form onSubmit={handleAnalyzeResume} className="space-y-5">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`rounded-xl border-2 border-dashed p-6 text-center transition ${
                  dragActive
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : file
                      ? 'border-emerald-500/60 bg-emerald-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <input
                  id="resume-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />

                <label htmlFor="resume-upload" className="block cursor-pointer">
                  {file ? (
                    <CheckCircle2 className="mx-auto mb-3 text-emerald-400" size={34} />
                  ) : (
                    <Upload className="mx-auto mb-3 text-slate-400" size={34} />
                  )}
                  <p className="font-semibold text-white">
                    {file ? file.name : 'Drop your resume here'}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected` : 'PDF resume supported'}
                  </p>
                </label>

                {file && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setAnalysis(null);
                      setJobs(null);
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 transition"
                  >
                    <XCircle size={14} />
                    Remove file
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Role</label>
                <input
                  type="text"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="e.g., Frontend Developer"
                  className="w-full bg-slate-800 rounded-lg px-4 py-3 border border-slate-700 focus:border-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Analyzing resume...' : 'Analyze Resume'}
              </button>
            </form>
          </motion.div>

          <div className="space-y-6">
            {analysis ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-8 rounded-xl"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm uppercase text-slate-400">ATS Score</p>
                      <h3 className="mt-2 text-2xl font-bold">Resume readiness report</h3>
                    </div>
                    <div className="text-6xl font-bold gradient-text">{score}</div>
                  </div>

                  <div className="mt-6 h-3 w-full rounded-full bg-slate-800">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <ResultList
                      icon={CheckCircle2}
                      title="Strengths"
                      tone="text-green-400"
                      items={analysis.atsScore?.strengths}
                    />
                    <ResultList
                      icon={Target}
                      title="Areas to improve"
                      tone="text-orange-400"
                      items={analysis.atsScore?.weaknesses}
                    />
                  </div>

                  <ResultList
                    icon={Lightbulb}
                    title="Recommendations"
                    tone="text-blue-400"
                    items={analysis.recommendations}
                    className="mt-8"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass p-6 rounded-xl"
                >
                  <h3 className="text-xl font-bold mb-5">Detected Skills</h3>
                  <SkillGroup label="Technical Skills" skills={analysis.skills?.technical} tone="bg-blue-500/20 text-blue-300" />
                  <SkillGroup label="Soft Skills" skills={analysis.skills?.soft} tone="bg-purple-500/20 text-purple-300" />
                  <SkillGroup label="Missing Critical Skills" skills={analysis.skills?.missingCritical} tone="bg-orange-500/20 text-orange-300" />
                </motion.div>

                {Array.isArray(jobs) && jobs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-6 rounded-xl"
                  >
                    <h3 className="text-xl font-bold mb-5 flex items-center">
                      <Briefcase className="mr-2 text-pink-400" />
                      Matching Job Ideas
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {jobs.map((job, index) => (
                        <div key={`${job.company}-${index}`} className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
                          <p className="font-semibold text-lg">{job.position}</p>
                          <p className="text-sm text-slate-400">{job.company}</p>
                          <p className="mt-3 text-sm text-slate-300">{job.location}</p>
                          <p className="mt-2 font-semibold text-green-400">{job.salary}</p>
                          {job.jobDescription && (
                            <p className="mt-3 text-sm leading-relaxed text-slate-300">{job.jobDescription}</p>
                          )}
                          <JobDetailList title="Responsibilities" items={job.responsibilities} />
                          <JobDetailList title="Must-have skills" items={job.requirements} compact />
                          <JobDetailList title="JD keywords" items={job.jdKeywords} compact tone="bg-pink-500/10 text-pink-300" />
                          <JobDetailList title="Resume tips" items={job.resumeTips} />
                          {job.sourceNote && (
                            <p className="mt-3 rounded bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
                              {job.sourceNote}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="glass p-12 rounded-xl text-center">
                <FileText size={52} className="mx-auto text-slate-500 mb-4" />
                <h3 className="text-xl font-semibold">No resume analyzed yet</h3>
                <p className="mt-2 text-slate-400">Upload a resume and run analysis to see your report.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultList = ({ icon: Icon, title, tone, items = [], className = '' }) => {
  if (!items?.length) return null;

  return (
    <div className={className}>
      <h4 className={`mb-3 flex items-center font-semibold ${tone}`}>
        <Icon size={17} className="mr-2" />
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex items-start text-sm text-slate-300">
            <span className="mr-2 text-slate-500">-</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const SkillGroup = ({ label, skills = [], tone }) => {
  if (!skills?.length) return null;

  return (
    <div className="mb-5 last:mb-0">
      <p className="mb-2 text-sm text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span key={`${skill}-${index}`} className={`rounded-full px-3 py-1 text-sm ${tone}`}>
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

const JobDetailList = ({ title, items = [], compact = false, tone = 'bg-blue-500/10 text-blue-300' }) => {
  if (!items?.length) return null;

  return (
    <div className="mt-3">
      <p className="mb-2 text-xs uppercase text-slate-500">{title}</p>
      {compact ? (
        <div className="flex flex-wrap gap-2">
          {items.slice(0, 8).map((item, index) => (
            <span key={`${item}-${index}`} className={`rounded px-2 py-1 text-xs ${tone}`}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 3).map((item, index) => (
            <li key={`${item}-${index}`} className="text-sm text-slate-300">
              - {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
