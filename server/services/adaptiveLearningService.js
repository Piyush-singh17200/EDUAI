import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { compactPromptText, getFastModel, parseJsonArray } from './geminiClient.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'adaptive-learning.json');
const REVIEW_INTERVALS = [1, 3, 7, 14];

const ensureStore = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ users: {} }, null, 2));
};

const readStore = () => {
  ensureStore();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

const writeStore = (store) => {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
};

const userIdFrom = (user = {}) => String(user.email || user.id || 'demo-user').toLowerCase();
const todayKey = (date = new Date()) => date.toISOString().slice(0, 10);
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const topicKey = (subject, topic) =>
  `${String(subject || 'General').trim().toLowerCase()}::${String(topic || 'General').trim().toLowerCase()}`;

const getUserState = (store, user) => {
  const id = userIdFrom(user);

  if (!store.users[id]) {
    store.users[id] = {
      profile: {
        email: user.email,
        name: user.name,
        subjects: [],
        goals: '',
        examDate: '',
        dailyTargetMinutes: 120
      },
      studyLogs: [],
      quizResults: [],
      topics: {},
      revisions: [],
      plannerTasks: [],
      focusSessions: [],
      streak: {
        current: 0,
        longest: 0,
        lastStudyDate: ''
      }
    };
  }

  return store.users[id];
};

const getOrCreateTopic = (state, subject, topic) => {
  const key = topicKey(subject, topic);

  if (!state.topics[key]) {
    state.topics[key] = {
      id: key,
      subject: String(subject || 'General').trim(),
      topic: String(topic || 'General').trim(),
      totalMinutes: 0,
      attempts: 0,
      correct: 0,
      incorrect: 0,
      skipped: 0,
      reviewStage: 0,
      nextReviewDate: '',
      lastStudiedAt: '',
      strength: 50,
      weaknessScore: 50
    };
  }

  return state.topics[key];
};

const updateTopicScores = (topic) => {
  const accuracy = topic.attempts > 0 ? topic.correct / topic.attempts : 0.55;
  const lastStudied = topic.lastStudiedAt ? new Date(topic.lastStudiedAt) : null;
  const daysSinceStudy = lastStudied
    ? Math.max(0, Math.floor((Date.now() - lastStudied.getTime()) / 86400000))
    : 7;
  const practiceCredit = Math.min(15, Math.floor(topic.totalMinutes / 20));
  const errorPressure = topic.incorrect * 10 + topic.skipped * 14;
  const stalePressure = Math.min(18, daysSinceStudy * 2);

  topic.weaknessScore = Math.round(clamp((1 - accuracy) * 55 + errorPressure + stalePressure - practiceCredit));
  topic.strength = Math.round(clamp(100 - topic.weaknessScore));
};

const scheduleReview = (state, topic, reason = 'Study review') => {
  const interval = REVIEW_INTERVALS[Math.min(topic.reviewStage, REVIEW_INTERVALS.length - 1)];
  topic.nextReviewDate = todayKey(addDays(new Date(), interval));

  const existing = state.revisions.find((item) =>
    item.status === 'pending'
    && item.subject.toLowerCase() === topic.subject.toLowerCase()
    && item.topic.toLowerCase() === topic.topic.toLowerCase()
  );

  if (existing) {
    existing.dueDate = topic.nextReviewDate;
    existing.reason = reason;
    return existing;
  }

  const revision = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    subject: topic.subject,
    topic: topic.topic,
    dueDate: topic.nextReviewDate,
    status: 'pending',
    reason,
    createdAt: new Date().toISOString()
  };
  state.revisions.push(revision);
  return revision;
};

const updateStreak = (state, date = new Date()) => {
  const today = todayKey(date);
  const yesterday = todayKey(addDays(date, -1));

  if (state.streak.lastStudyDate === today) return;

  state.streak.current = state.streak.lastStudyDate === yesterday ? state.streak.current + 1 : 1;
  state.streak.longest = Math.max(state.streak.longest, state.streak.current);
  state.streak.lastStudyDate = today;
};

const getWeakTopics = (state, limit = 6) =>
  Object.values(state.topics)
    .map((topic) => {
      updateTopicScores(topic);
      return topic;
    })
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, limit);

const getStudySeries = (state, days = 7) => {
  const labels = Array.from({ length: days }, (_, index) => todayKey(addDays(new Date(), index - days + 1)));

  return labels.map((date) => ({
    date,
    minutes: state.studyLogs
      .filter((log) => todayKey(new Date(log.createdAt)) === date)
      .reduce((total, log) => total + Number(log.minutes || 0), 0)
  }));
};

const getAccuracySeries = (state, days = 7) => {
  const labels = Array.from({ length: days }, (_, index) => todayKey(addDays(new Date(), index - days + 1)));

  return labels.map((date) => {
    const attempts = state.quizResults.filter((result) => todayKey(new Date(result.createdAt)) === date);
    const total = attempts.reduce((sum, result) => sum + Number(result.total || 0), 0);
    const correct = attempts.reduce((sum, result) => sum + Number(result.correct || 0), 0);

    return {
      date,
      accuracy: total ? Math.round((correct / total) * 100) : 0
    };
  });
};

const buildPlannerTasks = (state, { examDate, subjects = [] } = {}) => {
  const weakTopics = getWeakTopics(state, 8);
  const profileSubjects = Array.isArray(state.profile.subjects) ? state.profile.subjects : [];
  const sourceSubjects = subjects.length ? subjects : profileSubjects;
  const planTopics = weakTopics.length
    ? weakTopics.map((item) => ({ subject: item.subject, topic: item.topic, priority: 'weak topic' }))
    : sourceSubjects.map((subject) => ({ subject, topic: 'Core concepts', priority: 'syllabus' }));
  const daysToPlan = 7;
  const tasks = [];

  for (let index = 0; index < daysToPlan; index += 1) {
    const dueDate = todayKey(addDays(new Date(), index));
    const first = planTopics[index % Math.max(1, planTopics.length)] || { subject: 'General', topic: 'Revision', priority: 'revision' };
    const revision = state.revisions
      .filter((item) => item.status === 'pending')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[index];

    tasks.push({
      id: `plan-${Date.now()}-${index}`,
      dueDate,
      subject: first.subject,
      topic: first.topic,
      title: `${first.subject}: ${first.topic}`,
      type: index % 3 === 0 ? 'concept' : index % 3 === 1 ? 'practice' : 'revision',
      estimatedMinutes: index % 3 === 1 ? 60 : 45,
      priority: first.priority,
      status: 'pending',
      reason: revision ? `Includes upcoming revision: ${revision.topic}` : `Planned toward ${examDate || state.profile.examDate || 'your goal'}`
    });
  }

  const today = todayKey();
  const overdue = state.plannerTasks
    .filter((task) => task.status === 'pending' && task.dueDate < today)
    .slice(0, 3)
    .map((task) => ({ ...task, id: `${task.id}-carry`, dueDate: today, reason: 'Carried forward because it was missed' }));

  state.plannerTasks = [...overdue, ...tasks];
  return state.plannerTasks;
};

const AdaptiveLearningService = {
  getSummary(user) {
    const store = readStore();
    const state = getUserState(store, user);
    const weakTopics = getWeakTopics(state);
    const today = todayKey();
    const todayPlan = state.plannerTasks.filter((task) => task.dueDate === today && task.status === 'pending');
    const upcomingRevisions = state.revisions
      .filter((item) => item.status === 'pending')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 6);
    const totalQuestions = state.quizResults.reduce((sum, result) => sum + Number(result.total || 0), 0);
    const totalCorrect = state.quizResults.reduce((sum, result) => sum + Number(result.correct || 0), 0);

    writeStore(store);

    return {
      profile: state.profile,
      todayPlan,
      weakTopics,
      upcomingRevisions,
      stats: {
        studyMinutes: state.studyLogs.reduce((sum, log) => sum + Number(log.minutes || 0), 0),
        accuracy: totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
        topicsTracked: Object.keys(state.topics).length,
        pendingRevisions: upcomingRevisions.length,
        streak: state.streak.current,
        longestStreak: state.streak.longest
      },
      charts: this.getAnalytics(user)
    };
  },

  updateProfile(user, payload = {}) {
    const store = readStore();
    const state = getUserState(store, user);
    const subjects = Array.isArray(payload.subjects)
      ? payload.subjects
      : String(payload.subjects || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    state.profile = {
      ...state.profile,
      subjects,
      goals: String(payload.goals || state.profile.goals || '').trim(),
      examDate: payload.examDate || state.profile.examDate || '',
      dailyTargetMinutes: Number.parseInt(payload.dailyTargetMinutes, 10) || state.profile.dailyTargetMinutes || 120
    };

    writeStore(store);
    return state.profile;
  },

  logStudy(user, payload = {}) {
    const subject = cleanValue(payload.subject, 'General');
    const topic = cleanValue(payload.topic, 'General');
    const minutes = Math.max(1, Number.parseInt(payload.minutes, 10) || 25);
    const store = readStore();
    const state = getUserState(store, user);
    const log = {
      id: `log-${Date.now()}`,
      subject,
      topic,
      minutes,
      notes: String(payload.notes || '').trim(),
      createdAt: payload.createdAt || new Date().toISOString()
    };
    const topicState = getOrCreateTopic(state, subject, topic);

    state.studyLogs.unshift(log);
    topicState.totalMinutes += minutes;
    topicState.lastStudiedAt = log.createdAt;
    updateTopicScores(topicState);
    scheduleReview(state, topicState, 'Spaced repetition after study session');
    updateStreak(state, new Date(log.createdAt));

    writeStore(store);
    return { log, topic: topicState, revisions: state.revisions.filter((item) => item.status === 'pending') };
  },

  recordQuizResult(user, payload = {}) {
    const subject = cleanValue(payload.subject, 'General');
    const topic = cleanValue(payload.topic, 'Quiz Topic');
    const total = Math.max(1, Number.parseInt(payload.total, 10) || Number(payload.questions?.length) || 1);
    const correct = Math.max(0, Number.parseInt(payload.correct, 10) || 0);
    const mistakes = Array.isArray(payload.mistakes) ? payload.mistakes : [];
    const skipped = Math.max(0, Number.parseInt(payload.skipped, 10) || 0);
    const store = readStore();
    const state = getUserState(store, user);
    const topicState = getOrCreateTopic(state, subject, topic);
    const score = Math.round((correct / total) * 100);
    const result = {
      id: `quiz-${Date.now()}`,
      subject,
      topic,
      total,
      correct,
      incorrect: Math.max(0, total - correct - skipped),
      skipped,
      score,
      mistakes,
      createdAt: new Date().toISOString()
    };

    state.quizResults.unshift(result);
    topicState.attempts += total;
    topicState.correct += correct;
    topicState.incorrect += result.incorrect;
    topicState.skipped += skipped;
    topicState.reviewStage = score >= 80
      ? Math.min(topicState.reviewStage + 1, REVIEW_INTERVALS.length - 1)
      : 0;
    topicState.lastStudiedAt = result.createdAt;
    updateTopicScores(topicState);
    scheduleReview(state, topicState, score >= 80 ? 'Reinforcement review' : 'Weak topic review after quiz mistakes');
    updateStreak(state, new Date(result.createdAt));

    writeStore(store);
    return { result, topic: topicState, weakTopics: getWeakTopics(state) };
  },

  completeRevision(user, revisionId, confidence = 'medium') {
    const store = readStore();
    const state = getUserState(store, user);
    const revision = state.revisions.find((item) => item.id === revisionId);

    if (!revision) throw new Error('Revision not found');

    revision.status = 'completed';
    revision.completedAt = new Date().toISOString();
    revision.confidence = confidence;

    const topic = getOrCreateTopic(state, revision.subject, revision.topic);
    topic.reviewStage = confidence === 'high'
      ? Math.min(topic.reviewStage + 1, REVIEW_INTERVALS.length - 1)
      : confidence === 'low'
        ? 0
        : topic.reviewStage;
    topic.lastStudiedAt = revision.completedAt;
    updateTopicScores(topic);
    scheduleReview(state, topic, 'Next spaced repetition review');
    updateStreak(state);

    writeStore(store);
    return { revision, nextReviewDate: topic.nextReviewDate };
  },

  generatePlan(user, payload = {}) {
    const store = readStore();
    const state = getUserState(store, user);

    if (payload.examDate || payload.subjects) {
      this.updateProfile(user, {
        ...state.profile,
        examDate: payload.examDate || state.profile.examDate,
        subjects: payload.subjects || state.profile.subjects
      });
    }

    const freshStore = readStore();
    const freshState = getUserState(freshStore, user);
    const tasks = buildPlannerTasks(freshState, payload);
    writeStore(freshStore);
    return tasks;
  },

  updatePlanTask(user, taskId, updates = {}) {
    const store = readStore();
    const state = getUserState(store, user);
    const task = state.plannerTasks.find((item) => item.id === taskId);

    if (!task) throw new Error('Plan task not found');
    Object.assign(task, updates, { updatedAt: new Date().toISOString() });
    writeStore(store);
    return task;
  },

  logFocusSession(user, payload = {}) {
    const minutes = Math.max(1, Number.parseInt(payload.minutes, 10) || 25);
    const store = readStore();
    const state = getUserState(store, user);
    const session = {
      id: `focus-${Date.now()}`,
      subject: cleanValue(payload.subject, 'Focus'),
      topic: cleanValue(payload.topic, 'Deep Work'),
      minutes,
      createdAt: new Date().toISOString()
    };

    state.focusSessions.unshift(session);
    updateStreak(state);
    writeStore(store);
    return session;
  },

  getAnalytics(user) {
    const store = readStore();
    const state = getUserState(store, user);
    const topicStrength = Object.values(state.topics)
      .map((topic) => {
        updateTopicScores(topic);
        return {
          topic: topic.topic,
          subject: topic.subject,
          strength: topic.strength,
          weakness: topic.weaknessScore
        };
      })
      .sort((a, b) => a.strength - b.strength)
      .slice(0, 8);

    writeStore(store);

    return {
      studyTime: getStudySeries(state),
      accuracy: getAccuracySeries(state),
      topicStrength,
      focusMinutes: state.focusSessions.reduce((sum, session) => sum + Number(session.minutes || 0), 0)
    };
  },

  async generateNotes(user, payload = {}) {
    const subject = cleanValue(payload.subject, 'General');
    const topic = cleanValue(payload.topic, 'Topic');
    const model = getFastModel({ maxOutputTokens: 600 });
    const prompt = `Create concise revision notes for ${subject}: ${topic}.
    Be direct, use bullet points, and avoid long paragraphs.
    Include 3 key points, 2 examples, and 3 practice questions.`;

    const response = await model.generateContent(prompt);
    return {
      subject,
      topic,
      notes: response.response.text(),
      createdAt: new Date().toISOString()
    };
  },

  async generatePractice(user, payload = {}) {
    const subject = cleanValue(payload.subject, 'General');
    const topic = cleanValue(payload.topic, 'Topic');
    const count = Math.min(6, Math.max(2, Number.parseInt(payload.count, 10) || 3));
    const model = getFastModel({ maxOutputTokens: 800, responseMimeType: 'application/json' });
    const prompt = `Generate ${count} concise practice questions for ${subject}: ${topic}.
    Return ONLY JSON array. Be brief.`;
    const response = await model.generateContent(prompt);
    return parseJsonArray(response.response.text()) || [];
  }
};

const cleanValue = (value, fallback) => String(value || fallback).trim();

export default AdaptiveLearningService;
