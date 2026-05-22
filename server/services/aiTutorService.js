import { compactPromptText, getFastModel, parseJsonArray, parseJsonObject } from './geminiClient.js';

const cleanText = (value, fallback) => String(value || fallback).trim();

const normalizeLookupText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const needsLongAnswer = (question = '') =>
  /roadmap|plan|schedule|timetable|time table|career|month|week|semester|syllabus|complete|full stack|job ready|kaise padhna|how to study/i
    .test(String(question));

const getErrorMessage = (error) =>
  String(error?.message || error?.response?.data?.error?.message || 'Unknown AI service error');

const createUnavailableAnswer = (error) => {
  const message = getErrorMessage(error).toLowerCase();

  if (message.includes('temporarily rate-limited upstream')) {
    return 'OpenRouter free model is temporarily rate-limited upstream. Wait a few seconds and try again, or add your own provider key in OpenRouter integrations to get separate rate limits.';
  }

  if (message.includes('quota') || message.includes('429') || message.includes('too many requests')) {
    return 'AI provider quota or rate limit is exhausted right now, so I cannot generate a fresh answer. Wait for the quota reset or use an API key with available quota, then try again.';
  }

  if (message.includes('api key is missing')) {
    return 'AI API key is missing. Add the provider API key in server/.env, restart the backend, and try again.';
  }

  if (
    message.includes('api key not valid')
    || message.includes('api_key_invalid')
    || message.includes('permission_denied')
    || message.includes('no auth credentials')
    || message.includes('invalid api key')
    || message.includes('401')
  ) {
    return 'AI API key is invalid or does not have permission. Replace the key in server/.env, restart the backend, and try again.';
  }

  if (message.includes('fetch failed') || message.includes('timeout') || message.includes('network')) {
    return 'The AI provider could not be reached from this backend. Check your internet connection/firewall, then restart the backend and try again.';
  }

  return 'The live AI service is unavailable right now, so I cannot generate a real model answer. Check the API key, quota, provider settings, and backend logs, then try again.';
};

const stripQuestionNumber = (value = '') =>
  String(value).replace(/^\s*(?:question\s*)?\d+[\s.)-]+/i, '').trim();

const normalizeQuiz = (quiz, numberOfQuestions) => {
  const count = Math.min(10, Math.max(3, Number.parseInt(numberOfQuestions, 10) || 5));
  const seenQuestions = new Set();

  return (Array.isArray(quiz) ? quiz : [])
    .map((item, index) => {
      const question = stripQuestionNumber(item?.question);
      const options = Array.isArray(item?.options)
        ? item.options.map((option) => String(option).trim()).filter(Boolean)
        : [];
      const correctAnswer = String(item?.correctAnswer || '').trim();

      return {
        id: Number.isFinite(Number(item?.id)) ? Number(item.id) : index + 1,
        question,
        options,
        correctAnswer,
        explanation: String(item?.explanation || '').trim()
      };
    })
    .filter((item) => {
      const key = normalizeLookupText(item.question);
      if (!item.question || item.options.length < 4 || !item.correctAnswer || seenQuestions.has(key)) {
        return false;
      }

      seenQuestions.add(key);
      return true;
    })
    .slice(0, count)
    .map((item, index) => ({ ...item, id: index + 1 }));
};

const createFallbackLearningPath = (subject, targetLevel, weeksDuration) => {
  const safeSubject = cleanText(subject, 'Subject');
  const weeks = Math.min(12, Math.max(1, Number.parseInt(weeksDuration, 10) || 8));

  return {
    subject: safeSubject,
    duration: weeks,
    weeks: Array.from({ length: weeks }, (_, index) => ({
      week: index + 1,
      title: `${safeSubject} week ${index + 1}`,
      topics: [
        index === 0 ? 'Fundamentals and setup' : 'Core concepts',
        'Worked examples',
        'Practice and revision'
      ],
      resources: ['class notes', 'official documentation', 'practice problems'],
      practiceProjects: [`Build a small ${safeSubject} exercise`],
      estimatedHours: targetLevel === 'advanced' ? 10 : 6,
      milestones: [`Complete week ${index + 1} practice set`]
    }))
  };
};

const AITutorService = {
  async askQuestionStream(question, subject = 'General') {
    const model = getFastModel({ maxOutputTokens: needsLongAnswer(question) ? 2200 : 950 });
    
    const systemPrompt = `You are EduAI, a ChatGPT-like AI mentor for students.
    Behavior:
    - Answer any safe, useful question.
    - Start with direct answer, then add context.
    - Be direct, practical, and student-friendly.
    - Keep answers fast.
    - Use clear formatting.`;

    return getFastModel({ maxOutputTokens: needsLongAnswer(question) ? 2200 : 950 }).generateContentStream({
      contents: [{
        role: 'user',
        parts: [{ text: systemPrompt + '\n\nQuestion: ' + compactPromptText(question, 2500) }]
      }]
    });
  },

  async askQuestion(question, subject = 'General') {
    try {
      const model = getFastModel({ maxOutputTokens: needsLongAnswer(question) ? 2200 : 950 });
      
      const systemPrompt = `You are EduAI, a ChatGPT-like AI mentor for students.

You can answer almost anything useful: academics, coding, career roadmaps, study plans, timetables, resume advice, interview prep, productivity, general knowledge, and creative ideas.

Behavior:
- Do not act limited to only one dropdown subject. If the question is outside ${subject}, still answer helpfully.
- Answer any safe, useful question: facts, definitions, why/how explanations, comparisons, coding, academics, career, resume, interview, productivity, and creative work.
- For factual questions, start with the direct answer in the first sentence, then add useful context if needed.
- For "why" or "how" questions, explain the logic step by step with examples.
- Be direct, practical, and student-friendly.
- If the user asks "what to study", "how to study", "make timetable", or "career path", give an actionable plan.
- For coding, include steps, examples, debugging tips, and what to build.
- For career, include skills, projects, portfolio, resume, and interview prep.
- For resume or job/company questions, include a JD-style breakdown: role summary, responsibilities, must-have skills, good-to-have skills, keywords, and how to tailor the resume. If the exact live posting is not provided, clearly call it a role-based sample JD.
- For vague questions, make a reasonable assumption and answer; ask one short follow-up only if the answer would otherwise be misleading.
- Keep answers fast: start with the answer, then give steps.
- Use clear formatting with headings and bullets.
- Refuse only unsafe or harmful requests, and redirect to safe learning.

Tone: confident, warm, practical, like a helpful senior mentor.`;

      const response = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: systemPrompt + '\n\nQuestion: ' + compactPromptText(question, 2500) }]
        }]
      });

      return {
        answer: response.response.text(),
        subject: subject,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('AI Tutor Error:', error);
      return {
        answer: createUnavailableAnswer(error),
        subject,
        timestamp: new Date(),
        fallback: true
      };
    }
  },

  async generateQuiz(topic, difficulty = 'intermediate', numberOfQuestions = 5) {
    try {
      const questionCount = Number.parseInt(numberOfQuestions, 10) || 5;
      const model = getFastModel({
        maxOutputTokens: Math.min(2600, Math.max(1100, questionCount * 380)),
        responseMimeType: 'application/json'
      });
      
      const prompt = `Generate ${questionCount} ${difficulty} level quiz questions about "${compactPromptText(topic, 500)}".

Quality rules:
- Questions must be topic-specific, logical, and well-defined.
- Do not repeat the same question pattern.
- Do not put numbering inside the "question" text.
- Avoid generic study advice questions unless the topic itself is study strategy.
- Mix question types: concept, application, comparison, scenario, mistake/debugging, and reasoning.
- Options must be plausible and similar in length; only one option should be correct.
- Explanations must teach why the answer is correct.
- For coding/web topics, include code behavior, tags/APIs, layout logic, debugging, and real project situations.
- For science/math topics, include definitions, formulas, reasoning, applications, and common misconceptions.
- For career/resume topics, include JD keywords, responsibilities, skill matching, and practical decisions.
      
      Format your response as a JSON array with this structure:
      [
        {
          "id": 1,
          "question": "Question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "Why this is correct"
        }
      ]
      
      Return ONLY valid JSON, no markdown formatting.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const quiz = normalizeQuiz(parseJsonArray(text), questionCount);

      if (quiz.length < Math.min(3, questionCount)) throw new Error('Invalid response format');

      return quiz;
    } catch (error) {
      console.error('Quiz Generation Error:', error);
      throw new Error(createUnavailableAnswer(error));
    }
  },

  async explainConcept(concept, depth = 'beginner') {
    try {
      const model = getFastModel({ maxOutputTokens: 850 });
      
      const depthGuidance = {
        beginner: 'Simple explanation with basic examples',
        intermediate: 'Detailed explanation with applications',
        advanced: 'Deep technical explanation with edge cases'
      };

      const prompt = `Explain "${compactPromptText(concept, 800)}" at a ${depth} level.
      
      Structure your response with:
      1. Definition
      2. Key concepts
      3. Real-world examples
      4. Common misconceptions
      5. Next steps to learn more
      
      ${depthGuidance[depth]}
      Keep it concise and practical.`;

      const response = await model.generateContent(prompt);
      return {
        concept: concept,
        depth: depth,
        explanation: response.response.text(),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Concept Explanation Error:', error);
      return {
        concept,
        depth,
        explanation: createUnavailableAnswer(error),
        timestamp: new Date(),
        fallback: true
      };
    }
  },

  async generateLearningPath(subject, targetLevel = 'intermediate', weeksDuration = 8) {
    try {
      const model = getFastModel({ maxOutputTokens: 1800, responseMimeType: 'application/json' });
      
      const prompt = `Create a ${weeksDuration}-week learning path for "${compactPromptText(subject, 500)}" to reach ${targetLevel} level.
      
      Return as JSON with this structure:
      {
        "subject": "subject name",
        "duration": ${weeksDuration},
        "weeks": [
          {
            "week": 1,
            "title": "Week title",
            "topics": ["topic1", "topic2"],
            "resources": ["resource type and link"],
            "practiceProjects": ["project1"],
            "estimatedHours": 10,
            "milestones": ["milestone1"]
          }
        ]
      }
      
      Return ONLY valid JSON.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const path = parseJsonObject(text);

      if (!path) throw new Error('Invalid response format');

      return path;
    } catch (error) {
      console.error('Learning Path Error:', error);
      return createFallbackLearningPath(subject, targetLevel, weeksDuration);
    }
  }
};

export default AITutorService;
