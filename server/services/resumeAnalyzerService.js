import pdf from 'pdf-parse';
import fs from 'fs';
import { compactPromptText, getFastModel, parseJsonArray, parseJsonObject } from './geminiClient.js';

const SKILL_KEYWORDS = [
  'javascript', 'typescript', 'react', 'node', 'express', 'mongodb', 'sql', 'python',
  'java', 'html', 'css', 'tailwind', 'git', 'api', 'redux', 'next.js', 'aws', 'docker'
];

const titleCase = (value) =>
  value
    .split(/[\s.-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const extractSkills = (resumeText) => {
  const lowerResume = String(resumeText || '').toLowerCase();
  return SKILL_KEYWORDS
    .filter((skill) => lowerResume.includes(skill))
    .map(titleCase);
};

const createFallbackResumeAnalysis = (resumeText, companyDescription) => {
  const technical = extractSkills(resumeText);
  const score = Math.min(88, 55 + technical.length * 4);
  const target = String(companyDescription || 'target role').trim();

  return {
    atsScore: {
      overallScore: score,
      scoreOutOf: 100,
      strengths: [
        technical.length ? `Relevant technical skills detected: ${technical.slice(0, 4).join(', ')}` : 'Resume text was readable and ready for review',
        'Experience and project details can be matched against the target role'
      ],
      weaknesses: [
        'Add more quantified impact such as percentages, users, revenue, or performance gains',
        'Make sure each project lists technologies, role, and measurable outcome'
      ],
      improvements: [
        `Add 3-5 keywords from ${target} job descriptions`,
        'Use strong action verbs and keep bullet points concise'
      ]
    },
    skills: {
      technical: technical.length ? technical : ['Project Work', 'Problem Solving'],
      soft: ['Communication', 'Ownership', 'Learning Agility'],
      missingCritical: ['Role-specific keywords', 'Quantified achievements']
    },
    jobMatch: {
      matchPercentage: score,
      relevantExperience: `Resume has partial alignment for ${target}. Strengthen it with role keywords and measurable project outcomes.`,
      missingRequirements: ['Exact job-description keywords', 'Impact metrics'],
      strongPoints: technical.slice(0, 3)
    },
    recommendations: [
      'Start each bullet with an action verb and end with measurable impact',
      'Add a skills section grouped by frontend, backend, tools, and databases',
      `Tailor the top summary for ${target}`
    ],
    fallback: true
  };
};

const getRoleJDDetails = (jobTitle, company) => {
  const title = String(jobTitle || 'Software Developer').trim();
  const lowerTitle = title.toLowerCase();
  const companyName = String(company || 'the company').trim();

  if (/front.?end|react|ui developer/.test(lowerTitle)) {
    return {
      jobDescription: `Build responsive, accessible, user-facing web features for ${companyName}, collaborate with designers/backend engineers, and turn product requirements into polished interfaces.`,
      responsibilities: [
        'Develop reusable UI components and pages using modern frontend tools',
        'Integrate REST/JSON APIs and handle loading, empty, and error states',
        'Improve performance, accessibility, responsiveness, and browser compatibility',
        'Write clean code, review pull requests, and document important UI decisions'
      ],
      requirements: ['HTML', 'CSS', 'JavaScript', 'React', 'API integration', 'Git', 'responsive design'],
      goodToHaveSkills: ['TypeScript', 'testing', 'Tailwind CSS', 'Next.js', 'basic UX', 'deployment'],
      jdKeywords: ['React', 'components', 'state management', 'responsive UI', 'accessibility', 'REST API']
    };
  }

  if (/back.?end|node|api|server/.test(lowerTitle)) {
    return {
      jobDescription: `Design and maintain backend services for ${companyName}, build APIs, manage data flow, and keep systems reliable, secure, and easy to scale.`,
      responsibilities: [
        'Build REST APIs with validation, authentication, and clear error handling',
        'Design database schemas and optimize common queries',
        'Integrate third-party services and maintain environment-based configuration',
        'Write documentation, tests, and logs for maintainable services'
      ],
      requirements: ['Node.js', 'Express', 'REST APIs', 'database design', 'authentication', 'Git'],
      goodToHaveSkills: ['Docker', 'cloud deployment', 'Redis', 'message queues', 'testing'],
      jdKeywords: ['API', 'backend', 'Express', 'database', 'JWT', 'security', 'scalability']
    };
  }

  if (/full.?stack|mern|web developer/.test(lowerTitle)) {
    return {
      jobDescription: `Build end-to-end web features for ${companyName}, covering frontend UI, backend APIs, database logic, authentication, and deployment-ready polish.`,
      responsibilities: [
        'Create responsive frontend screens and connect them to backend APIs',
        'Implement CRUD flows, authentication, validation, and role-safe access',
        'Design database models and keep data handling reliable',
        'Deploy projects, debug production issues, and maintain clear documentation'
      ],
      requirements: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB/SQL', 'REST APIs'],
      goodToHaveSkills: ['TypeScript', 'testing', 'Docker', 'cloud deployment', 'CI/CD'],
      jdKeywords: ['MERN', 'full stack', 'CRUD', 'auth', 'REST API', 'database', 'deployment']
    };
  }

  if (/data|analyst|analytics|machine learning|ai|ml/.test(lowerTitle)) {
    return {
      jobDescription: `Analyze data for ${companyName}, create dashboards/reports, identify insights, and support decisions with clean data storytelling.`,
      responsibilities: [
        'Clean, transform, and validate datasets from multiple sources',
        'Write SQL queries and build dashboards or notebooks',
        'Explain trends, anomalies, and business recommendations clearly',
        'Document assumptions, metrics, and limitations of analysis'
      ],
      requirements: ['SQL', 'Python', 'Excel', 'Pandas', 'data visualization', 'statistics'],
      goodToHaveSkills: ['Power BI/Tableau', 'machine learning basics', 'A/B testing', 'data modeling'],
      jdKeywords: ['SQL', 'Python', 'dashboard', 'analysis', 'KPIs', 'visualization', 'insights']
    };
  }

  if (/cyber|security|soc|penetration|pentest|ethical/.test(lowerTitle)) {
    return {
      jobDescription: `Support ${companyName}'s security work by monitoring risks, investigating alerts, documenting findings, and improving defensive controls.`,
      responsibilities: [
        'Analyze logs, alerts, vulnerabilities, and suspicious activity',
        'Use security tools to triage issues and document evidence',
        'Write clear remediation notes and incident summaries',
        'Follow safe, legal, and ethical security testing practices'
      ],
      requirements: ['Networking', 'Linux', 'security fundamentals', 'OWASP', 'Nmap', 'Wireshark', 'report writing'],
      goodToHaveSkills: ['Burp Suite', 'SIEM', 'Python scripting', 'cloud security', 'CTF/lab writeups'],
      jdKeywords: ['SOC', 'incident response', 'OWASP', 'vulnerability', 'SIEM', 'Linux', 'networking']
    };
  }

  return {
    jobDescription: `Work as a ${title} at ${companyName}, solve role-specific problems, collaborate with teams, and deliver measurable outcomes.`,
    responsibilities: [
      `Execute day-to-day ${title} responsibilities with clear ownership`,
      'Communicate progress, blockers, and decisions professionally',
      'Use relevant tools and workflows for the role',
      'Document outcomes and improve based on feedback'
    ],
    requirements: ['Role fundamentals', 'relevant tools', 'communication', 'problem solving', 'portfolio/project proof'],
    goodToHaveSkills: ['domain knowledge', 'documentation', 'team collaboration'],
    jdKeywords: [title, 'problem solving', 'communication', 'tools', 'project proof']
  };
};

const createFallbackJobs = (jobTitle, experience) => {
  const title = String(jobTitle || 'Software Developer').trim();
  const level = String(experience || 'mid-level').trim();
  const companies = ['TechNova Labs', 'CloudBridge Systems', 'BrightPath AI', 'PixelForge Studio', 'DataNest'];

  return companies.map((company, index) => {
    const jd = getRoleJDDetails(title, company);

    return {
      id: index + 1,
      company,
      position: `${level} ${title}`,
      salary: '$70,000 - $120,000',
      location: index % 2 === 0 ? 'Remote' : 'Hybrid',
      requirements: jd.requirements,
      goodToHaveSkills: jd.goodToHaveSkills,
      responsibilities: jd.responsibilities,
      jdKeywords: jd.jdKeywords,
      jobDescription: jd.jobDescription,
      resumeTips: [
        `Add 2-3 resume bullets proving ${jd.requirements.slice(0, 3).join(', ')}`,
        `Use JD keywords naturally: ${jd.jdKeywords.slice(0, 4).join(', ')}`,
        'Attach project links, GitHub, portfolio, or measurable outcomes wherever possible'
      ],
      sourceNote: 'Sample JD generated from the role. Verify live openings on the company careers page.',
      link: 'https://company.com/careers'
    };
  });
};

const ResumeAnalyzerService = {
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF Extraction Error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  },

  async analyzeResume(resumeText, companyDescription = 'Tech Company') {
    try {
      const model = getFastModel({ maxOutputTokens: 1000, responseMimeType: 'application/json' });
      const compactResumeText = compactPromptText(resumeText, 8000);
      
      const prompt = `You are EduAI, an ATS expert. Analyze this resume for ATS score and role fit for "${companyDescription}".
      
      Quality rules:
      - Be extremely concise. Use short bullet points.
      - Every improvement must be actionable.
      - Identify the 3 most critical missing skills.

Resume:
${compactResumeText}

Provide a detailed analysis in JSON format:
{
  "atsScore": {
    "overallScore": 85,
    "scoreOutOf": 100,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "improvements": ["improvement1", "improvement2"]
  },
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "missingCritical": ["skill1"]
  },
  "jobMatch": {
    "matchPercentage": 75,
    "relevantExperience": "description",
    "missingRequirements": ["requirement1"],
    "strongPoints": ["point1"]
  },
  "recommendations": [
    "recommendation1",
    "recommendation2"
  ]
}

Return ONLY valid JSON.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const analysis = parseJsonObject(text);

      if (!analysis) throw new Error('Invalid response format');

      return analysis;
    } catch (error) {
      console.error('Resume Analysis Error:', error);
      return createFallbackResumeAnalysis(resumeText, companyDescription);
    }
  },

  async findJobOpenings(jobTitle, experience = 'mid-level') {
    try {
      // This would typically call a job API like LinkedIn Jobs, Glassdoor API, etc.
      // For demo, we'll use Google to search
      
      const model = getFastModel({ maxOutputTokens: 1200, responseMimeType: 'application/json' });
      
      const prompt = `Generate realistic JD-style job ideas for "${compactPromptText(jobTitle, 500)}" position at ${experience} level.

Important:
- The app does not have a live job board connected here, so do not pretend these are verified live openings.
- Give realistic company/job-card examples with JD details that help the student tailor their resume.
- Each job must include role summary, responsibilities, must-have requirements, good-to-have skills, JD keywords, and resume tailoring tips.
      
      Return as JSON array:
      [
        {
          "id": 1,
          "company": "Company Name",
          "position": "Job Title",
          "salary": "$80,000 - $120,000",
          "location": "City, State",
          "requirements": ["requirement1", "requirement2"],
          "goodToHaveSkills": ["skill1", "skill2"],
          "responsibilities": ["responsibility1", "responsibility2"],
          "jdKeywords": ["keyword1", "keyword2"],
          "jobDescription": "Short JD summary",
          "resumeTips": ["resume tailoring tip 1", "resume tailoring tip 2"],
          "sourceNote": "Sample JD generated from the role; verify live openings on the company careers page.",
          "link": "https://company.com/careers/job-id"
        }
      ]
      
      Return ONLY valid JSON array with 5 realistic positions.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const jobs = parseJsonArray(text);

      if (!jobs) throw new Error('Invalid response format');

      return jobs;
    } catch (error) {
      console.error('Job Search Error:', error);
      return createFallbackJobs(jobTitle, experience);
    }
  },

  async calculateMatchScore(resumeAnalysis, jobRequirements) {
    try {
      const model = getFastModel({ maxOutputTokens: 700, responseMimeType: 'application/json' });
      
      const prompt = `Calculate the match percentage between a resume and job requirements.

Resume Skills:
${JSON.stringify(resumeAnalysis.skills)}

Job Requirements:
${JSON.stringify(jobRequirements)}

Return JSON:
{
  "matchPercentage": 85,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1"],
  "recommendations": ["recommendation1"]
}

Return ONLY valid JSON.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const matchScore = parseJsonObject(text);

      if (!matchScore) throw new Error('Invalid response format');

      return matchScore;
    } catch (error) {
      console.error('Match Score Calculation Error:', error);
      return {
        matchPercentage: 65,
        matchedSkills: resumeAnalysis?.skills?.technical?.slice(0, 4) || [],
        missingSkills: ['Role-specific keywords'],
        recommendations: ['Add missing skills from the job post and quantify project outcomes'],
        fallback: true
      };
    }
  }
};

export default ResumeAnalyzerService;
