import { getFastModel, compactPromptText, parseJsonObject } from './geminiClient.js';

const getFallbackInterviewQuestion = (role, level) => {
  const levelText = level ? level.toUpperCase() : 'MID-LEVEL';
  const roleText = role ? role.toUpperCase() : 'SOFTWARE ENGINEER';
  
  const questions = {
    'SOFTWARE ENGINEER': [
      `As a ${levelText} developer, how would you design a scalable notification system that handles millions of push notifications daily while preventing duplicates?`,
      `Can you explain the difference between optimistic and pessimistic locking, and in what scenario you would choose one over the other?`,
      `Explain how React's virtual DOM works under the hood and how key properties optimize render cycles.`
    ],
    'PRODUCT MANAGER': [
      `How would you design an elevator system for a 100-story skyscraper? What metrics would you track?`,
      `If our primary conversion metric dropped by 15% week-over-week, walk me through how you would diagnose the root cause.`,
      `How do you prioritize your product roadmap when faced with competing demands from sales, engineering, and active users?`
    ],
    'DATA ANALYST': [
      `Explain the difference between a LEFT JOIN and an INNER JOIN with a real-world scenario.`,
      `What is A/B testing, and how do you determine if a sample size is statistically significant?`,
      `How do you handle missing values or outliers in a dataset before conducting your analysis?`
    ],
    'UX DESIGNER': [
      `Walk me through your design process when redesigning a complex multi-step checkout funnel.`,
      `How do you balance user-centered design requirements with strict, aggressive business conversion goals?`,
      `Can you describe a time when user feedback conflicted with your own design intuition? How did you resolve it?`
    ]
  };

  const roleKey = Object.keys(questions).find(k => roleText.includes(k)) || 'SOFTWARE ENGINEER';
  const list = questions[roleKey];
  return list[Math.floor(Math.random() * list.length)];
};

const getFallbackEvaluation = (role, level, question, answer) => {
  return {
    score: 75,
    strength: "You showed a clear, general understanding of the topic and expressed your thoughts structured logically.",
    constructiveAdvice: "Consider incorporating more specific technical jargon, concrete architectural components, or industry methodologies (e.g. STAR method) to make your answer more concrete and stellar.",
    modelAnswer: `For a ${level} ${role} role, a top-tier answer should systematically define the core components, provide a concrete real-world example, and address trade-offs or performance optimization strategies explicitly.`,
    nextQuestion: `That was a solid start. Let's delve deeper: how would you optimize or scale this solution under high concurrent user load?`
  };
};

const InterviewService = {
  async startInterview(role, level = 'mid-level') {
    try {
      const model = getFastModel({ maxOutputTokens: 600 });
      
      const systemPrompt = `You are a highly seasoned, elite technical interviewer for a top-tier tech firm.
      
      Task:
      - Generate ONE professional, challenging, and realistic interview question for a candidate applying for a ${level} level "${role}" position.
      - The question can be behavioral, technical, situational, or architectural.
      - Return ONLY the question itself. Do not write any greetings, introductions, or explanatory text.`;

      const response = await model.generateContent(systemPrompt);
      const question = response.response.text().trim();
      
      if (!question) throw new Error('Empty question generated');

      return {
        question,
        sessionId: Date.now().toString()
      };
    } catch (error) {
      console.error('Interview Start Service Error:', error);
      return {
        question: getFallbackInterviewQuestion(role, level),
        sessionId: Date.now().toString(),
        fallback: true
      };
    }
  },

  async evaluateAnswer(role, level, question, answer, history = []) {
    try {
      const model = getFastModel({ maxOutputTokens: 1400, responseMimeType: 'application/json' });
      
      const historyText = history && history.length 
        ? history.map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.text}`).join('\n')
        : 'No history.';

      const prompt = `You are an elite, senior tech interviewer. Evaluate the candidate's response to your question.
      
      Role applied: ${level} level ${role}
      Interviewer Question: "${question}"
      Candidate Answer: "${compactPromptText(answer, 1500)}"
      
      Interview Context/History:
      ${historyText}

      Your evaluation MUST be returned as a JSON object with this precise structure:
      {
        "score": number between 0 and 100,
        "strength": "Summarize what was strong/correct about their answer in 2-3 sentences",
        "constructiveAdvice": "Provide highly actionable, specific advice in 2-3 sentences outlining key terms, structures, or viewpoints they missed",
        "modelAnswer": "An exemplary, elite, high-scoring model response to the question",
        "nextQuestion": "The next logical follow-up or new question in the interview sequence"
      }
      
      Return ONLY valid JSON, do not wrap in markdown or include backticks.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const evaluation = parseJsonObject(text);

      if (!evaluation || typeof evaluation.score !== 'number') {
        throw new Error('Failed to parse interview evaluation JSON');
      }

      return evaluation;
    } catch (error) {
      console.error('Interview Evaluation Service Error:', error);
      return getFallbackEvaluation(role, level, question, answer);
    }
  }
};

export default InterviewService;
