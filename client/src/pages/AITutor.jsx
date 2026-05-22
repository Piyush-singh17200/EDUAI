import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Book, Brain, Lightbulb } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const stripLeadingQuestionNumber = (value = '') =>
  String(value).replace(/^\s*(?:question\s*)?\d+[\s.)-]+/i, '').trim();

const AITutor = () => {
  const [activeTab, setActiveTab] = useState('ask');
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('General');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const [quizTopic, setQuizTopic] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('intermediate');
  const [quiz, setQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    setResponse({ answer: '', subject, timestamp: new Date() });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/tutor/ask-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ question, subject })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to AI service');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                fullAnswer += data.text;
                setResponse(prev => ({ ...prev, answer: fullAnswer }));
              } else if (data.error) {
                toast.error(data.error);
              }
            } catch (e) {
              // Ignore parse errors for incomplete JSON
            }
          }
        }
      }
      toast.success('Answer completed!');
    } catch (error) {
      toast.error(error.message || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!quizTopic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/tutor/quiz', {
        topic: quizTopic,
        difficulty: quizDifficulty,
        numberOfQuestions: 5
      });
      setQuiz(data.data);
      setQuizAnswers({});
      setQuizResult(null);
      toast.success('Quiz generated!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async () => {
    let correct = 0;
    const mistakes = [];
    quiz.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correct++;
      } else {
        mistakes.push({
          question: q.question,
          selectedAnswer: quizAnswers[q.id] || 'Skipped',
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || ''
        });
      }
    });
    const percentage = Math.round((correct / quiz.length) * 100);
    setQuizResult({ correct, total: quiz.length, percentage, mistakes });

    try {
      await api.post('/learning/quiz-results', {
        subject,
        topic: quizTopic,
        total: quiz.length,
        correct,
        skipped: quiz.filter((q) => !quizAnswers[q.id]).length,
        mistakes
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Quiz scored, but adaptive tracking failed');
    }

    toast.success(`You scored ${percentage}%!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 gradient-text">AI Learning Companion</h1>
          <p className="text-slate-400">Get instant answers, generate quizzes, and master any subject</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('ask')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'ask'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Send size={18} className="inline mr-2" />
            Ask a Question
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'quiz'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Brain size={18} className="inline mr-2" />
            Quiz Generator
          </button>
        </div>

        {/* Ask Question Tab */}
        {activeTab === 'ask' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Input Form */}
            <div className="lg:col-span-1">
              <div className="glass p-6 rounded-xl sticky top-24">
                <h2 className="text-xl font-bold mb-4">Ask Tutor</h2>
                <form onSubmit={handleAskQuestion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-700 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 outline-none"
                    >
                      <option>General</option>
                      <option>Mathematics</option>
                      <option>Physics</option>
                      <option>Chemistry</option>
                      <option>Biology</option>
                      <option>Programming</option>
                      <option>Computer Science</option>
                      <option>History</option>
                      <option>Geography</option>
                      <option>Economics</option>
                      <option>Career</option>
                      <option>Resume & Jobs</option>
                      <option>Interview Prep</option>
                      <option>Aptitude</option>
                      <option>English</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Question</label>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything..."
                      className="w-full bg-slate-700 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 outline-none h-24 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
                  >
                    {loading ? 'Thinking...' : 'Get Answer'}
                  </button>
                </form>
              </div>
            </div>

            {/* Response */}
            <div className="lg:col-span-2">
              {response ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-8 rounded-xl"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Lightbulb size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">AI Tutor Response</h3>
                      <p className="text-sm text-slate-400">{response.subject}</p>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none text-slate-300 mb-6">
                    <p className="whitespace-pre-wrap leading-relaxed">{response.answer}</p>
                  </div>
                  <button
                    onClick={() => {
                      setQuestion('');
                      setResponse(null);
                    }}
                    className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
                  >
                    Ask Another Question
                  </button>
                </motion.div>
              ) : (
                <div className="glass p-12 rounded-xl text-center">
                  <Book size={48} className="mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-400">Ask a question to get started</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {!quiz ? (
              <div className="glass p-8 rounded-xl max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Generate Quiz</h2>
                <form onSubmit={handleGenerateQuiz} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Topic</label>
                    <input
                      type="text"
                      value={quizTopic}
                      onChange={(e) => setQuizTopic(e.target.value)}
                      placeholder="e.g., Photosynthesis, JavaScript, World War 2"
                      className="w-full bg-slate-700 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                    <select
                      value={quizDifficulty}
                      onChange={(e) => setQuizDifficulty(e.target.value)}
                      className="w-full bg-slate-700 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 outline-none"
                    >
                      <option value="easy">Easy</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
                  >
                    {loading ? 'Generating...' : 'Generate Quiz'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {quiz.map((quizQuestion, idx) => (
                  <motion.div
                    key={quizQuestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass p-6 rounded-xl"
                  >
                    <h3 className="font-semibold mb-4">
                      {idx + 1}. {stripLeadingQuestionNumber(quizQuestion.question)}
                    </h3>
                    <div className="space-y-2">
                      {quizQuestion.options.map((option) => (
                        <label
                          key={option}
                          className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-slate-700/50 transition"
                        >
                          <input
                            type="radio"
                            name={`question-${quizQuestion.id}`}
                            value={option}
                            checked={quizAnswers[quizQuestion.id] === option}
                            onChange={(e) =>
                              setQuizAnswers({
                                ...quizAnswers,
                                [quizQuestion.id]: e.target.value
                              })
                            }
                            className="mr-3"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                ))}
                <button
                  onClick={handleQuizSubmit}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Submit Quiz
                </button>
                {quizResult && (
                  <div className="glass p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-2">Score: {quizResult.percentage}%</h3>
                    <p className="text-slate-400 mb-4">
                      {quizResult.correct}/{quizResult.total} correct. Mistakes were sent to the adaptive weakness engine.
                    </p>
                    {quizResult.mistakes.length > 0 && (
                      <div className="space-y-3">
                        {quizResult.mistakes.map((mistake, index) => (
                          <div key={`${mistake.question}-${index}`} className="rounded-lg bg-slate-800/60 p-4">
                            <p className="font-semibold">{stripLeadingQuestionNumber(mistake.question)}</p>
                            <p className="mt-2 text-sm text-red-300">Your answer: {mistake.selectedAnswer}</p>
                            <p className="text-sm text-emerald-300">Correct: {mistake.correctAnswer}</p>
                            {mistake.explanation && (
                              <p className="mt-2 text-sm text-slate-400">{mistake.explanation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AITutor;
