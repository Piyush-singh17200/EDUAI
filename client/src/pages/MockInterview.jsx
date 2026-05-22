import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Award, ArrowLeft, Send, Sparkles, AlertCircle, RefreshCw, CheckCircle2, ChevronRight, Bookmark, ArrowRight, Clipboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MockInterview = () => {
  // Navigation & session states
  const [step, setStep] = useState('setup'); // 'setup', 'interview', 'scorecard'
  const [role, setRole] = useState('Software Engineer');
  const [level, setLevel] = useState('mid-level');
  
  // Chat & dialog states
  const [questionCount, setQuestionCount] = useState(1);
  const [maxQuestions] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [evaluations, setEvaluations] = useState([]);

  // Scorecard & feedback states
  const [scorecard, setScorecard] = useState(null);
  
  const chatEndRef = useRef(null);

  const roles = [
    { name: 'Software Engineer', desc: 'DSA, System Design, React, Node.js, Databases' },
    { name: 'Product Manager', desc: 'Product Sense, Metrics, Prioritization, Roadmap' },
    { name: 'Data Analyst', desc: 'SQL, A/B Testing, Statistics, Python, Clean Data' },
    { name: 'UX Designer', desc: 'User Journeys, Wireframes, Figma, Checkout Funnels' }
  ];

  const levels = [
    { value: 'junior', label: 'Junior (0-2 yrs)' },
    { value: 'mid-level', label: 'Mid-Level (2-5 yrs)' },
    { value: 'senior', label: 'Senior (5+ yrs)' }
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (step === 'interview') {
      scrollToBottom();
    }
  }, [history, step]);

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const response = await api.post('/interview/start', { role, level });
      const initialQuestion = response.data?.data?.question;
      
      setCurrentQuestion(initialQuestion);
      setHistory([
        {
          role: 'assistant',
          text: `Welcome! Let's begin the interview. I am your interviewer today for the ${level} ${role} role. Here is your first question:\n\n"${initialQuestion}"`
        }
      ]);
      setQuestionCount(1);
      setEvaluations([]);
      setStep('interview');
    } catch (err) {
      console.error(err);
      toast.error('Failed to initiate interview session. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || submitting) return;

    const candidateAnswer = answer;
    setAnswer('');
    setSubmitting(true);

    // Append candidate response to chat history
    const updatedHistory = [
      ...history,
      { role: 'user', text: candidateAnswer }
    ];
    setHistory(updatedHistory);

    try {
      const response = await api.post('/interview/evaluate', {
        role,
        level,
        question: currentQuestion,
        answer: candidateAnswer,
        history: updatedHistory.slice(0, -1) // pass history excluding the last answer
      });

      const data = response.data?.data;
      const currentEvaluation = {
        questionNumber: questionCount,
        question: currentQuestion,
        answer: candidateAnswer,
        score: data.score,
        strength: data.strength,
        constructiveAdvice: data.constructiveAdvice,
        modelAnswer: data.modelAnswer
      };
      const nextEvaluations = [...evaluations, currentEvaluation];
      setEvaluations(nextEvaluations);
      
      if (questionCount >= maxQuestions) {
        const averageScore = Math.round(
          nextEvaluations.reduce((sum, item) => sum + Number(item.score || 0), 0) / nextEvaluations.length
        );
        // Final question answered, compile and present the scorecard
        setScorecard({
          score: averageScore,
          strength: data.strength,
          constructiveAdvice: data.constructiveAdvice,
          modelAnswer: data.modelAnswer,
          evaluations: nextEvaluations,
          finalSummary: "Excellent work! You have finished all 5 questions in the simulated technical assessment."
        });
        setStep('scorecard');
      } else {
        // Show next question
        const nextQ = data.nextQuestion || 'Tell me about a time you solved a challenging bug.';
        setCurrentQuestion(nextQ);
        setQuestionCount(prev => prev + 1);
        
        setHistory(prev => [
          ...prev,
          {
            role: 'assistant',
            text: `Feedback on your previous answer:\n- **Score**: ${data.score}/100\n- **Strength**: ${data.strength}\n\n**Next Question (${questionCount + 1}/${maxQuestions}):**\n\n"${nextQ}"`
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection timed out or failed to evaluate answer. Proceeding anyway.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Model response copied to clipboard!');
  };

  const getScoreClassification = (score) => {
    if (score >= 90) return { title: 'FAANG Ready', color: 'text-emerald-400', border: 'border-emerald-500/30' };
    if (score >= 75) return { title: 'Strong Candidate', color: 'text-indigo-400', border: 'border-indigo-500/30' };
    return { title: 'Developing', color: 'text-amber-400', border: 'border-amber-500/30' };
  };

  return (
    <div className="min-h-screen bg-[#07050e] text-slate-100 pt-24 pb-16 px-4 md:px-8 relative overflow-hidden font-geist">
      {/* Background radial overlays */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* SETUP SCREEN */}
        {step === 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0e0a1b]/40 backdrop-blur-xl border border-slate-900 rounded-3xl p-6 md:p-10 shadow-2xl relative"
          >
            {/* Top link to dashboard */}
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 mb-6 transition">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                AI Mock Interview Simulator
              </h1>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
                Test your expertise with roleplay-based dynamic interview simulations. The AI evaluates your inputs in real time, scores your responses out of 100, and drafts corrective model answers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              
              {/* Role selector panel */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xs text-indigo-400 uppercase tracking-widest font-black mb-1">1. Choose Target Career Path</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {roles.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setRole(r.name)}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        role === r.name
                          ? 'bg-indigo-950/30 border-indigo-500 shadow-lg shadow-indigo-500/5'
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-[#120f26]/30'
                      }`}
                    >
                      <h4 className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                        {r.name}
                        {role === r.name && <CheckCircle2 className="text-indigo-400" size={16} />}
                      </h4>
                      <p className="text-xs text-slate-500 leading-normal">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience level panel */}
              <div className="space-y-4">
                <h3 className="text-xs text-indigo-400 uppercase tracking-widest font-black mb-1">2. Experience Level</h3>
                <div className="space-y-3">
                  {levels.map((l, i) => (
                    <button
                      key={i}
                      onClick={() => setLevel(l.value)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                        level === l.value
                          ? 'bg-indigo-950/20 border-indigo-500/50 text-indigo-300 font-bold'
                          : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{l.label}</span>
                      {level === l.value && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Launch simulation */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-900">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <AlertCircle size={14} className="text-indigo-400/80" />
                <span>Interview consists of 5 interactive technical questions.</span>
              </div>
              <button
                onClick={handleStartInterview}
                disabled={loading}
                className="btn-hero-primary px-8 py-3.5 flex items-center gap-2 text-sm font-black disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} /> Initiating Session...
                  </>
                ) : (
                  <>
                    Start Simulation <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ACTIVE INTERVIEW SCREEN */}
        {step === 'interview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left sidebar widgets */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* Active Session Info */}
              <div className="bg-[#0e0a1b]/40 backdrop-blur-xl border border-slate-900 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl" />
                <h3 className="text-xs text-slate-500 font-black uppercase tracking-widest mb-3 pl-0.5">Assessment Info</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Role</span>
                    <h4 className="text-lg font-bold text-slate-200">{role}</h4>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Level</span>
                      <h4 className="text-sm font-bold text-slate-200 capitalize">{level}</h4>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-right">
                      <span className="text-[10px] text-slate-500 font-bold block">Status</span>
                      <span className="text-xs text-emerald-400 font-black flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Roleplay
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Tracker Widget */}
              <div className="bg-[#0e0a1b]/40 backdrop-blur-xl border border-slate-900 rounded-2xl p-5 shadow-xl">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-400">Interview Progress</span>
                  <span className="text-xs text-pink-400 font-black">Question {questionCount} of {maxQuestions}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-[1.5px]">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${(questionCount / maxQuestions) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2.5 leading-relaxed">
                  Provide detailed, technical answers using core terminologies. The AI evaluates each answer before raising the next query.
                </p>
              </div>

              {/* Dynamic Assessment Guide */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 shadow-xl space-y-3">
                <h4 className="font-bold text-sm text-slate-300 flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-400" /> Scoring Metrics
                </h4>
                <ul className="text-xs text-slate-500 space-y-2 leading-relaxed">
                  <li>• **Technical Accuracy**: Correctly explaining system details/methodologies.</li>
                  <li>• **Structural Clarity**: Expressing core ideas using structural framework models.</li>
                  <li>• **Completeness**: Addressing all dimensions of the interviewer's question.</li>
                </ul>
              </div>
            </motion.div>

            {/* Right side active chat container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 flex flex-col h-[600px] bg-[#0c0a1b]/95 border border-slate-900 rounded-3xl shadow-2xl overflow-hidden relative"
            >
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/40 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center border border-white/10">
                    <Briefcase size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-100">Virtual Technical Recruiter</h3>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Dynamic Roleplay Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to end this interview session? Your progress will be discarded.")) {
                      setStep('setup');
                      setEvaluations([]);
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-red-400 transition bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
                >
                  Terminate
                </button>
              </div>

              {/* Chat Content Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar relative z-10">
                {history.map((msg, index) => {
                  const isAssistant = msg.role === 'assistant';
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3.5 ${!isAssistant ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                        isAssistant
                          ? 'bg-slate-900 border-slate-800 text-indigo-400'
                          : 'bg-indigo-600 border-indigo-500 text-white'
                      }`}>
                        {isAssistant ? <Briefcase size={16} /> : <Award size={16} />}
                      </div>
                      
                      <div className={`max-w-[80%] p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                        isAssistant
                          ? 'bg-slate-900/60 border border-slate-805/40 text-slate-200 rounded-tl-sm'
                          : 'bg-indigo-950/30 border border-indigo-500/20 text-indigo-100 rounded-tr-sm'
                      }`}>
                        {/* Process markdown-like sections manually or simply formatting text nicely */}
                        {msg.text.split('\n').map((line, i) => {
                          if (line.startsWith('- **Score**') || line.startsWith('- **Strength**') || line.startsWith('**Next Question')) {
                            // Style status updates elegantly
                            return (
                              <p key={i} className="mt-1.5 font-bold text-slate-300 border-l-2 border-indigo-500/50 pl-2 py-0.5 bg-slate-950/20 rounded-r-md">
                                {line.replace(/\*\*/g, '')}
                              </p>
                            );
                          }
                          return <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>;
                        })}
                      </div>
                    </div>
                  );
                })}
                
                {submitting && (
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center">
                      <Briefcase size={16} />
                    </div>
                    <div className="p-4 bg-slate-900/60 border border-slate-805/40 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-bold mr-1">Interviewer is scoring answer</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Footer */}
              <div className="p-4 border-t border-slate-900 bg-slate-950/20 relative z-10 flex gap-2">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your structured answer here. Include specific technologies, steps, and explanations..."
                  disabled={submitting}
                  rows={2}
                  className="flex-1 bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-100 outline-none transition placeholder-slate-500 disabled:opacity-50 resize-none custom-scrollbar"
                />
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !answer.trim()}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center border border-white/10 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition"
                >
                  <Send size={18} />
                </button>
              </div>

            </motion.div>
          </div>
        )}

        {/* EVALUATION SCORECARD SCREEN */}
        {step === 'scorecard' && scorecard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0e0a1b]/40 backdrop-blur-xl border border-slate-900 rounded-3xl p-6 md:p-10 shadow-2xl relative"
          >
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-900 mb-8">
              <div>
                <span className="text-xs text-indigo-400 uppercase tracking-widest font-black block mb-1">Assessment Complete</span>
                <h1 className="text-3xl font-black text-slate-100 flex items-center gap-2">
                  Technical Interview Scorecard
                </h1>
                <p className="text-slate-400 text-xs md:text-sm mt-1">
                  Evaluated across {scorecard.evaluations?.length || 1} answers for: <strong className="text-slate-300 capitalize">{level} {role}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setStep('setup');
                  setEvaluations([]);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/20 text-white font-bold rounded-xl flex items-center gap-2 transition text-xs shadow-lg shadow-indigo-950/50"
              >
                <RefreshCw size={14} /> Restart Assessment
              </button>
            </div>

            {/* Scoring and classification layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              
              {/* Score panel */}
              <div className="bg-gradient-to-br from-indigo-950/20 to-slate-900/40 border border-indigo-500/10 rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
                
                {/* SVG circular gauge */}
                <div className="relative mb-4">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle cx="72" cy="72" r="62" stroke="#100d23" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="72"
                      cy="72"
                      r="62"
                      stroke="url(#scoreGrad)"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="389.5"
                      strokeDashoffset={389.5 - (389.5 * scorecard.score) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{scorecard.score}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Out of 100</span>
                  </div>
                </div>

                <div className="text-center">
                  <span className={`text-sm font-black tracking-wide block ${getScoreClassification(scorecard.score).color}`}>
                    {getScoreClassification(scorecard.score).title}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Grading Classification</p>
                </div>
              </div>

              {/* Strengths & constructive feedback summary */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Strengths */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                  <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2 mb-2 pl-2">
                    <CheckCircle2 size={16} /> Key Strengths
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed pl-2">
                    {scorecard.strength}
                  </p>
                </div>

                {/* Constructive advice */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500" />
                  <h3 className="font-bold text-sm text-orange-400 flex items-center gap-2 mb-2 pl-2">
                    <AlertCircle size={16} /> Constructive Suggestions
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed pl-2">
                    {scorecard.constructiveAdvice}
                  </p>
                </div>

              </div>

            </div>

            {/* Model Response feedback card */}
            <div className="bg-gradient-to-r from-[#0c0a1b]/80 to-[#120f26]/40 border border-indigo-500/10 rounded-2xl p-6 relative overflow-hidden mb-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-sm text-slate-200 flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-400" /> Technical Model Response
                </h3>
                <button
                  onClick={() => copyToClipboard(scorecard.modelAnswer)}
                  className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg flex items-center gap-1.5 text-xs transition"
                >
                  <Clipboard size={12} /> Copy Answer
                </button>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-900 max-h-56 overflow-y-auto custom-scrollbar">
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono">
                  {scorecard.modelAnswer}
                </p>
              </div>
            </div>

            {Array.isArray(scorecard.evaluations) && scorecard.evaluations.length > 0 && (
              <div className="mb-8 rounded-2xl border border-slate-900 bg-slate-900/30 p-5">
                <h3 className="mb-4 text-sm font-black text-slate-200">Question-by-question review</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {scorecard.evaluations.map((item) => (
                    <div key={item.questionNumber} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Question {item.questionNumber}</p>
                        <span className="rounded-lg bg-indigo-500/10 px-2 py-1 text-xs font-bold text-indigo-300">{item.score}/100</span>
                      </div>
                      <p className="line-clamp-2 text-xs text-slate-400">{item.question}</p>
                      <p className="mt-3 text-xs leading-relaxed text-slate-300">{item.constructiveAdvice}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Return action footer */}
            <div className="pt-6 border-t border-slate-900 flex items-center justify-between">
              <Link
                to="/"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-xl flex items-center gap-2 transition text-xs"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </Link>
              <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                <Award size={12} className="text-indigo-400" />
                <span>Simulation results are tracked locally to reward XP!</span>
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
};

export default MockInterview;
