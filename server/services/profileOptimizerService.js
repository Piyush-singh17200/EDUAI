import axios from 'axios';
import { compactPromptText, getFastModel, parseJsonObject } from './geminiClient.js';

const createFallbackProfileAnalysis = (profileType = 'profile') => ({
  profileScore: 70,
  scoreOutOf: 100,
  strengths: ['Profile has enough information to start improving', 'You can make quick gains with clearer positioning'],
  improvements: [
    {
      area: 'Headline and summary',
      section: 'Headline',
      suggestion: 'Make your target role, strongest skills, and proof of work visible in the first few lines',
      impact: 'high',
      example: 'Frontend Developer | React | Node.js | Built production-style projects'
    },
    {
      area: 'Project proof',
      section: 'Projects',
      suggestion: 'Add 2-3 projects with clear outcomes, links, and technologies used',
      impact: 'high'
    }
  ],
  recommendations: [
    `Optimize the ${profileType} headline for your target role`,
    'Add measurable project outcomes',
    'Use consistent links to portfolio, GitHub, and resume'
  ],
  seoOptimization: ['target role', 'core skills', 'project keywords'],
  fallback: true
});

const createFallbackPortfolioSuggestions = (careerGoal, currentSkills = []) => ({
  projects: [
    {
      name: `${careerGoal || 'Career'} Portfolio Dashboard`,
      description: 'A complete project with auth, data display, and clean UI',
      technologies: currentSkills.length ? currentSkills.slice(0, 4) : ['React', 'Node.js', 'API'],
      difficulty: 'intermediate',
      timeline: '2-3 weeks',
      learningOutcomes: ['Project structure', 'API integration', 'Deployment'],
      gitHubTips: ['Add screenshots', 'Write setup steps', 'Explain the problem solved']
    }
  ],
  fallback: true
});

const ProfileOptimizerService = {
  async analyzeGitHub(username) {
    try {
      const githubHeaders = {
        'Accept': 'application/vnd.github.v3+json'
      };
      if (process.env.GITHUB_TOKEN) {
        githubHeaders.Authorization = `token ${process.env.GITHUB_TOKEN}`;
      }

      // Fetch GitHub profile data
      const [profileResponse, reposResponse] = await Promise.all([
        axios.get(`https://api.github.com/users/${username}`, {
          headers: githubHeaders
        }),
        axios.get(`https://api.github.com/users/${username}/repos`, {
          headers: githubHeaders,
          params: { sort: 'stars', per_page: 10 }
        })
      ]);

      const profile = profileResponse.data;
      const repos = reposResponse.data;

      const model = getFastModel({ maxOutputTokens: 1200, responseMimeType: 'application/json' });
      
      const prompt = `You are EduAI, a senior portfolio reviewer and career mentor.
Analyze this GitHub profile and provide role-ready improvement suggestions.

Quality rules:
- Be specific, practical, and portfolio-focused.
- Mention README, screenshots, pinned repos, commit quality, project proof, and recruiter signal.
- Avoid generic advice; every recommendation should be immediately actionable.

Profile Data:
${compactPromptText(JSON.stringify({
  name: profile.name,
  bio: profile.bio,
  publicRepos: profile.public_repos,
  followers: profile.followers,
  repositories: repos.map(r => ({
    name: r.name,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count
  }))
}), 6000)}

Return JSON:
{
  "profileScore": 75,
  "scoreOutOf": 100,
  "strengths": ["strength1", "strength2"],
  "improvements": [
    {
      "area": "README Quality",
      "suggestion": "Add detailed README with examples",
      "impact": "high"
    }
  ],
  "recommendations": [
    "Create portfolio projects",
    "Improve repository descriptions"
  ]
}

Return ONLY valid JSON.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const analysis = parseJsonObject(text);

      if (!analysis) throw new Error('Invalid response format');

      return analysis;
    } catch (error) {
      console.error('GitHub Analysis Error:', error);
      return createFallbackProfileAnalysis('GitHub');
    }
  },

  async analyzeLinkedIn(profileData) {
    try {
      const model = getFastModel({ maxOutputTokens: 1100, responseMimeType: 'application/json' });
      
      const prompt = `You are EduAI, a LinkedIn growth mentor and recruiter-style profile reviewer.
Analyze this LinkedIn profile and provide practical improvement suggestions.

Quality rules:
- Be specific to target role and student profile quality.
- Improve headline, About section, skills, projects, experience bullets, and keywords.
- Avoid generic advice; give examples where useful.

Profile Data:
${compactPromptText(JSON.stringify(profileData), 6000)}

Return JSON:
{
  "profileScore": 70,
  "scoreOutOf": 100,
  "strengths": ["strength1"],
  "improvements": [
    {
      "section": "Headline",
      "suggestion": "Make it more specific and keyword-rich",
      "example": "Full Stack Developer | React | Node.js"
    }
  ],
  "recommendations": [
    "Add more skills",
    "Request recommendations"
  ],
  "seoOptimization": ["keyword1", "keyword2"]
}

Return ONLY valid JSON.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const analysis = parseJsonObject(text);

      if (!analysis) throw new Error('Invalid response format');

      return analysis;
    } catch (error) {
      console.error('LinkedIn Analysis Error:', error);
      return createFallbackProfileAnalysis('LinkedIn');
    }
  },

  async getPortfolioSuggestions(careerGoal, currentSkills = []) {
    try {
      const model = getFastModel({ maxOutputTokens: 1300, responseMimeType: 'application/json' });
      
      const prompt = `You are EduAI, a career mentor who suggests job-winning portfolio projects.
Suggest portfolio projects for someone targeting "${compactPromptText(careerGoal, 800)}".

Quality rules:
- Projects must prove real skills, not toy tutorial copies.
- Include what it demonstrates, tech/tools, difficulty, timeline, outcomes, and GitHub tips.
- Make suggestions suitable for the user's current skills.

Current Skills: ${currentSkills.join(', ')}

Return JSON:
{
  "projects": [
    {
      "name": "Project Name",
      "description": "What it demonstrates",
      "technologies": ["tech1", "tech2"],
      "difficulty": "beginner/intermediate/advanced",
      "timeline": "2 weeks",
      "learningOutcomes": ["outcome1"],
      "gitHubTips": ["tip1"]
    }
  ]
}

Return ONLY valid JSON.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const suggestions = parseJsonObject(text);

      if (!suggestions) throw new Error('Invalid response format');

      return suggestions;
    } catch (error) {
      console.error('Portfolio Suggestions Error:', error);
      return createFallbackPortfolioSuggestions(careerGoal, currentSkills);
    }
  },

  async optimizeProfile(profileType, currentState) {
    try {
      const model = getFastModel({ maxOutputTokens: 1400, responseMimeType: 'application/json' });
      
      const prompt = `You are EduAI, a senior career profile mentor.
Provide a step-by-step optimization plan for a ${profileType} profile.

Quality rules:
- Make it actionable like a checklist.
- Prioritize quick wins first, then project proof, then long-term authority.
- Include examples where useful.

Current State:
${compactPromptText(JSON.stringify(currentState), 6000)}

Return JSON:
{
  "quickWins": [
    {
      "action": "Update headline",
      "timeRequired": "5 minutes",
      "impact": "high"
    }
  ],
  "mediumTermGoals": [
    {
      "goal": "Add 3 new projects",
      "timeRequired": "2-3 weeks",
      "impact": "high"
    }
  ],
  "longTermStrategy": [
    {
      "phase": "Phase 1: Foundation",
      "duration": "1 month",
      "objectives": ["objective1"]
    }
  ]
}

Return ONLY valid JSON.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();

      const plan = parseJsonObject(text);

      if (!plan) throw new Error('Invalid response format');

      return plan;
    } catch (error) {
      console.error('Profile Optimization Error:', error);
      return {
        quickWins: [
          { action: 'Update headline with target role and top skills', timeRequired: '10 minutes', impact: 'high' },
          { action: 'Add links to GitHub, portfolio, and resume', timeRequired: '10 minutes', impact: 'medium' }
        ],
        mediumTermGoals: [
          { goal: 'Add 2 portfolio projects with screenshots', timeRequired: '2-3 weeks', impact: 'high' }
        ],
        longTermStrategy: [
          {
            phase: 'Phase 1: Positioning',
            duration: '1 month',
            objectives: ['Clarify niche', 'Publish project proof', 'Improve keyword match']
          }
        ],
        fallback: true
      };
    }
  }
};

export default ProfileOptimizerService;
