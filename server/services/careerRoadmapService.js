import { compactPromptText, getFastModel, parseJsonArray, parseJsonObject } from './geminiClient.js';

const normalizeGoal = (careerGoal) => String(careerGoal || 'Software Engineer').trim();

const includesAny = (text, words) => words.some((word) => text.includes(word));

const getCareerProfile = (careerGoal) => {
  const goal = normalizeGoal(careerGoal);
  const lowerGoal = goal.toLowerCase();

  if (includesAny(lowerGoal, ['cyber', 'security', 'ethical hacking', 'soc', 'penetration', 'pentest'])) {
    return {
      label: 'Cybersecurity',
      technical: [
        'Networking TCP/IP',
        'Linux CLI',
        'Python scripting',
        'OWASP Top 10',
        'Nmap',
        'Wireshark',
        'Burp Suite',
        'SIEM basics',
        'Incident response',
        'Cloud security basics'
      ],
      soft: ['Threat modeling', 'Report writing', 'Analytical thinking', 'Calm debugging'],
      weeklyFocus: [
        'computer networking fundamentals: IP, DNS, HTTP, TCP/UDP',
        'Linux commands, users, permissions, processes, and logs',
        'Python scripting for automation, parsing logs, and simple scanners',
        'web security basics: authentication, sessions, cookies, and HTTP headers',
        'OWASP Top 10 with hands-on labs for XSS, SQL injection, and IDOR',
        'Nmap reconnaissance, service enumeration, and basic vulnerability triage',
        'Wireshark packet analysis and suspicious traffic investigation',
        'Burp Suite proxy workflow, repeater, intruder basics, and notes',
        'TryHackMe/HackTheBox beginner rooms with written walkthroughs',
        'SIEM concepts: alerts, logs, correlation, and incident timeline writing',
        'cloud/IAM basics, least privilege, secrets, and misconfiguration risks',
        'resume, GitHub writeups, mock interviews, and portfolio polish'
      ],
      projects: [
        {
          name: 'Home SOC Lab',
          description: 'Set up a small lab with logs, alerts, and an incident report for suspicious activity',
          skills: ['SIEM basics', 'Log analysis', 'Incident response'],
          difficulty: 'medium'
        },
        {
          name: 'OWASP Vulnerability Reports',
          description: 'Complete 3 web security labs and write professional vulnerability reports with evidence and fixes',
          skills: ['OWASP Top 10', 'Burp Suite', 'Report writing'],
          difficulty: 'medium'
        },
        {
          name: 'Network Recon Toolkit',
          description: 'Build a Python-assisted recon checklist using Nmap output, screenshots, and risk notes',
          skills: ['Nmap', 'Python scripting', 'Networking'],
          difficulty: 'medium'
        }
      ],
      dsaTopics: ['Python basics', 'Strings', 'Hash maps', 'File handling', 'Regex']
    };
  }

  if (includesAny(lowerGoal, ['full stack', 'mern', 'web developer', 'backend', 'frontend', 'react', 'node'])) {
    return {
      label: 'Full Stack Development',
      technical: [
        'HTML/CSS',
        'JavaScript',
        'React',
        'Node.js',
        'Express',
        'MongoDB/SQL',
        'REST APIs',
        'Authentication',
        'Testing',
        'Deployment'
      ],
      soft: ['Product thinking', 'Debugging', 'Communication', 'Consistency'],
      weeklyFocus: [
        'HTML, CSS, responsive layout, and accessibility basics',
        'JavaScript fundamentals: functions, arrays, objects, async, fetch',
        'React components, props, state, effects, forms, and routing',
        'backend basics with Node.js, Express routes, middleware, and validation',
        'database modeling with MongoDB/SQL and CRUD APIs',
        'authentication, authorization, JWT, and protected routes',
        'full-stack project structure, error handling, and API integration',
        'testing, deployment, environment variables, and production polish',
        'DSA basics for interviews: arrays, strings, hash maps, two pointers',
        'resume, GitHub README, portfolio case study, and mock interviews'
      ],
      projects: [
        {
          name: 'Student Productivity App',
          description: 'Build a full-stack app with auth, CRUD, dashboard stats, and responsive UI',
          skills: ['React', 'Node.js', 'Database', 'Auth'],
          difficulty: 'medium'
        },
        {
          name: 'API-Driven Job Tracker',
          description: 'Create an app to track applications, notes, status, and analytics',
          skills: ['REST API', 'Forms', 'Charts', 'Deployment'],
          difficulty: 'medium'
        },
        {
          name: 'Portfolio with Case Studies',
          description: 'Ship a portfolio showing project decisions, screenshots, tech stack, and impact',
          skills: ['UI', 'Writing', 'GitHub', 'Deployment'],
          difficulty: 'easy'
        }
      ],
      dsaTopics: ['Arrays', 'Strings', 'Hash maps', 'Two pointers', 'Stacks']
    };
  }

  if (includesAny(lowerGoal, ['data', 'machine learning', 'ai', 'ml', 'analyst'])) {
    return {
      label: 'Data and AI',
      technical: ['Python', 'SQL', 'Pandas', 'Data visualization', 'Statistics', 'Machine learning', 'Model evaluation', 'Dashboards'],
      soft: ['Problem framing', 'Insight communication', 'Experiment thinking'],
      weeklyFocus: [
        'Python, notebooks, clean code, and data structures',
        'SQL joins, aggregation, filtering, and case-based queries',
        'Pandas cleaning, missing values, grouping, and feature creation',
        'visualization and storytelling with charts and dashboards',
        'statistics basics: distributions, correlation, sampling, and bias',
        'machine learning basics: train/test split, metrics, and baselines',
        'end-to-end project with dataset, analysis, model, and report',
        'portfolio, GitHub notebooks, resume bullets, and interview practice'
      ],
      projects: [
        {
          name: 'Student Performance Dashboard',
          description: 'Analyze a dataset, build charts, and explain actionable insights',
          skills: ['Python', 'Pandas', 'Visualization'],
          difficulty: 'medium'
        },
        {
          name: 'Prediction Mini Project',
          description: 'Train a baseline model, evaluate it, and write a clear model report',
          skills: ['Machine learning', 'Metrics', 'Documentation'],
          difficulty: 'medium'
        },
        {
          name: 'SQL Case Study',
          description: 'Solve business-style SQL questions and publish clean explanations',
          skills: ['SQL', 'Analytics', 'Communication'],
          difficulty: 'easy'
        }
      ],
      dsaTopics: ['Python lists', 'Dictionaries', 'SQL patterns', 'Basic statistics']
    };
  }

  return {
    label: goal,
    technical: ['Core fundamentals', 'Tools of the field', 'Portfolio projects', 'Documentation', 'Interview preparation'],
    soft: ['Consistency', 'Communication', 'Problem solving', 'Self-review'],
    weeklyFocus: [
      `fundamentals of ${goal}`,
      `tools and workflows used in ${goal}`,
      `beginner practice tasks for ${goal}`,
      `mini project 1 for ${goal}`,
      `intermediate concepts in ${goal}`,
      `portfolio project with documentation for ${goal}`,
      `resume and interview preparation for ${goal}`,
      `final polish, feedback, and applications for ${goal}`
    ],
    projects: [
      {
        name: `${goal} Portfolio Project`,
        description: `Build a practical project that proves job-ready ${goal} skills`,
        skills: ['Research', 'Implementation', 'Documentation'],
        difficulty: 'medium'
      },
      {
        name: `${goal} Case Study`,
        description: 'Document a real problem, your approach, your output, and lessons learned',
        skills: ['Analysis', 'Communication', 'Presentation'],
        difficulty: 'easy'
      },
      {
        name: `${goal} Practice Sprint`,
        description: 'Complete a focused set of practice tasks and publish your progress',
        skills: ['Practice', 'Consistency', 'Feedback'],
        difficulty: 'easy'
      }
    ],
    dsaTopics: ['Problem solving', 'Pattern practice', 'Communication']
  };
};

const getWeeklyHours = (currentLevel, collegeCommitment) => {
  const byCommitment = {
    light: 16,
    balanced: 10,
    heavy: 6
  };
  const levelBoost = currentLevel === 'advanced' ? 2 : currentLevel === 'intermediate' ? 1 : 0;
  return (byCommitment[collegeCommitment] || byCommitment.balanced) + levelBoost;
};

const getTopicWiseProjects = (careerGoal, currentLevel = 'beginner') => {
  const goal = normalizeGoal(careerGoal);
  const lowerGoal = goal.toLowerCase();
  const level = String(currentLevel || 'beginner');

  if (includesAny(lowerGoal, ['full stack', 'mern', 'web developer', 'backend', 'frontend', 'react', 'node'])) {
    return [
      {
        topic: 'HTML',
        project: 'Semantic Personal Profile Page',
        whenToBuild: 'After HTML basics',
        description: 'Create a clean profile page using semantic tags, forms, tables/lists, links, images, and accessible alt text.',
        deliverables: ['index.html', 'semantic layout', 'contact form markup', 'README with screenshots'],
        skills: ['Semantic HTML', 'forms', 'accessibility']
      },
      {
        topic: 'CSS',
        project: 'Responsive To-do List UI',
        whenToBuild: 'After CSS box model, flexbox, and responsive units',
        description: 'Style the HTML app into a mobile-friendly to-do interface with states, spacing, colors, and responsive layout.',
        deliverables: ['responsive layout', 'hover/focus states', 'mobile and desktop screenshots'],
        skills: ['Box model', 'Flexbox/Grid', 'responsive design']
      },
      {
        topic: 'JavaScript',
        project: 'Interactive To-do List with Local Storage',
        whenToBuild: 'After functions, arrays, DOM, events, and localStorage',
        description: 'Add create, complete, filter, delete, and save behavior without refreshing the page.',
        deliverables: ['DOM interactions', 'localStorage persistence', 'empty/error states'],
        skills: ['DOM', 'events', 'arrays', 'localStorage']
      },
      {
        topic: 'React',
        project: 'Task Dashboard',
        whenToBuild: 'After components, props, state, effects, and routing',
        description: 'Rebuild the task app in React with reusable components, filters, stats, routing, and clean state management.',
        deliverables: ['component structure', 'stateful filters', 'dashboard stats', 'deployed link'],
        skills: ['Components', 'state', 'effects', 'routing']
      },
      {
        topic: 'Node.js and Express',
        project: 'Task Manager REST API',
        whenToBuild: 'After routes, middleware, validation, and error handling',
        description: 'Create backend APIs for tasks, users, validation, status codes, and centralized errors.',
        deliverables: ['CRUD endpoints', 'validation', 'Postman collection', 'API docs'],
        skills: ['Express routes', 'middleware', 'REST APIs']
      },
      {
        topic: 'Database',
        project: 'Persistent Task App',
        whenToBuild: 'After MongoDB/SQL schema design and CRUD',
        description: 'Store users and tasks in a database with filters, timestamps, indexes, and query patterns.',
        deliverables: ['schema/model', 'database CRUD', 'seed data', 'query examples'],
        skills: ['Data modeling', 'CRUD', 'queries']
      },
      {
        topic: 'Authentication',
        project: 'Protected Productivity App',
        whenToBuild: 'After JWT/session basics and protected routes',
        description: 'Add signup, login, protected tasks, user ownership, logout, and basic security checks.',
        deliverables: ['auth flow', 'protected routes', 'user-specific data', 'security notes'],
        skills: ['JWT', 'authorization', 'secure routes']
      },
      {
        topic: 'Deployment',
        project: 'Live Full-stack Portfolio Case Study',
        whenToBuild: 'After the app works end to end',
        description: 'Deploy the app, add environment variables, screenshots, README, architecture notes, and resume bullets.',
        deliverables: ['live URL', 'GitHub README', 'architecture diagram', 'resume bullets'],
        skills: ['Deployment', 'documentation', 'portfolio presentation']
      }
    ];
  }

  if (includesAny(lowerGoal, ['cyber', 'security', 'ethical hacking', 'soc', 'penetration', 'pentest'])) {
    return [
      {
        topic: 'Networking',
        project: 'Packet Analysis Notes',
        whenToBuild: 'After TCP/IP, DNS, HTTP, and ports',
        description: 'Capture safe lab traffic, identify protocols, and explain packet flow with screenshots.',
        deliverables: ['Wireshark screenshots', 'protocol notes', 'traffic summary'],
        skills: ['TCP/IP', 'DNS', 'HTTP', 'Wireshark']
      },
      {
        topic: 'Linux',
        project: 'Linux Investigation Checklist',
        whenToBuild: 'After file system, permissions, processes, and logs',
        description: 'Create a command checklist for inspecting users, permissions, processes, services, and logs.',
        deliverables: ['command cheat sheet', 'sample findings', 'short report'],
        skills: ['Linux CLI', 'permissions', 'logs']
      },
      {
        topic: 'OWASP',
        project: 'Web Vulnerability Report Pack',
        whenToBuild: 'After XSS, SQL injection, auth, sessions, and IDOR basics',
        description: 'Complete safe labs and write reports with evidence, impact, steps to reproduce, and fixes.',
        deliverables: ['3 vulnerability reports', 'screenshots', 'remediation notes'],
        skills: ['Burp Suite', 'OWASP Top 10', 'report writing']
      },
      {
        topic: 'SOC Basics',
        project: 'Mini Incident Timeline',
        whenToBuild: 'After logs, alerts, SIEM concepts, and incident response basics',
        description: 'Analyze sample logs and create a timeline, severity rating, containment steps, and lessons learned.',
        deliverables: ['incident timeline', 'alert notes', 'response checklist'],
        skills: ['SIEM', 'log analysis', 'incident response']
      }
    ];
  }

  if (includesAny(lowerGoal, ['data', 'machine learning', 'ai', 'ml', 'analyst'])) {
    return [
      {
        topic: 'Python',
        project: 'Data Cleaning Notebook',
        whenToBuild: 'After Python lists, dictionaries, functions, and notebooks',
        description: 'Clean a messy dataset, handle missing values, and document every transformation.',
        deliverables: ['notebook', 'clean dataset', 'before/after summary'],
        skills: ['Python', 'Pandas', 'data cleaning']
      },
      {
        topic: 'SQL',
        project: 'Business Query Case Study',
        whenToBuild: 'After joins, grouping, filtering, and subqueries',
        description: 'Solve realistic business questions and explain the query logic and result interpretation.',
        deliverables: ['SQL file', 'question set', 'insight notes'],
        skills: ['SQL joins', 'aggregation', 'analysis']
      },
      {
        topic: 'Visualization',
        project: 'Insight Dashboard',
        whenToBuild: 'After charts, storytelling, and dashboard basics',
        description: 'Build a dashboard that answers clear business/student performance questions.',
        deliverables: ['dashboard screenshots', 'insight summary', 'recommendations'],
        skills: ['Visualization', 'storytelling', 'dashboards']
      },
      {
        topic: 'Machine Learning',
        project: 'Baseline Prediction Report',
        whenToBuild: 'After train/test split, metrics, and model evaluation',
        description: 'Train a baseline model, compare metrics, explain limitations, and suggest improvements.',
        deliverables: ['model notebook', 'metrics table', 'model report'],
        skills: ['ML basics', 'metrics', 'model evaluation']
      }
    ];
  }

  return [
    {
      topic: `${goal} Fundamentals`,
      project: `${goal} Starter Project`,
      whenToBuild: `After learning the core basics of ${goal}`,
      description: `Build a small practical output that proves you understand the basic workflow of ${goal}.`,
      deliverables: ['working output', 'short documentation', 'screenshots or examples'],
      skills: ['Fundamentals', 'practice', 'documentation']
    },
    {
      topic: `${goal} Tools`,
      project: `${goal} Tool Workflow Case Study`,
      whenToBuild: 'After learning common tools and workflows',
      description: 'Use the main tools of the field to solve one realistic task and explain each decision.',
      deliverables: ['workflow notes', 'final output', 'lessons learned'],
      skills: ['Tools', 'workflow', 'decision making']
    },
    {
      topic: `${goal} Portfolio`,
      project: `${goal} Portfolio Proof Project`,
      whenToBuild: 'After intermediate practice',
      description: 'Create a polished portfolio project or case study that can be shown to recruiters/teachers.',
      deliverables: ['portfolio page', 'README/case study', 'resume bullets'],
      skills: ['Portfolio', 'communication', 'presentation']
    }
  ].map((project) => ({ ...project, difficulty: level }));
};

const createFallbackRoadmap = (careerGoal, currentLevel = 'beginner', timelineWeeks = 8, collegeCommitment = 'balanced') => {
  const goal = normalizeGoal(careerGoal);
  const profile = getCareerProfile(goal);
  const topicProjects = getTopicWiseProjects(goal, currentLevel);
  const weeks = Math.max(3, Number.parseInt(timelineWeeks, 10) || 8);
  const phaseLength = Math.ceil(weeks / 3);
  const weeklyHours = getWeeklyHours(currentLevel, collegeCommitment);
  const phaseNames = ['Foundation and Tooling', 'Hands-on Projects', 'Job Ready Polish'];

  return {
    careerGoal: goal,
    totalDuration: `${weeks} weeks`,
    phases: phaseNames.map((name, phaseIndex) => {
      const startWeek = phaseIndex * phaseLength + 1;
      const endWeek = Math.min((phaseIndex + 1) * phaseLength, weeks);

      if (startWeek > weeks) return null;

      return {
        name: `Phase ${phaseIndex + 1}: ${name}`,
        duration: `Weeks ${startWeek}-${endWeek}`,
        objectives: [
          phaseIndex === 0
            ? `Build strong ${profile.label} fundamentals without skipping basics`
            : phaseIndex === 1
              ? 'Create visible portfolio proof through labs, projects, and writeups'
              : 'Convert skills into resume bullets, interview stories, and applications',
          phaseIndex === 0
            ? 'Set up tools, notes, and a weekly revision system'
            : phaseIndex === 1
              ? 'Practice on realistic tasks instead of only watching tutorials'
              : 'Polish GitHub, LinkedIn, resume, and mock interview answers'
        ],
        weeklyTasks: Array.from({ length: phaseLength }, (_, index) => {
        const week = phaseIndex * phaseLength + index + 1;
        const focus = profile.weeklyFocus[(week - 1) % profile.weeklyFocus.length];
        const project = profile.projects[(week - 1) % profile.projects.length];

        return {
          week,
          tasks: [
            `Learn and revise ${focus}`,
            phaseIndex === 0
              ? `Make concise notes and a cheat sheet for ${focus}`
              : phaseIndex === 1
                ? `Build or improve: ${project.name}`
                : `Turn this week's work into resume bullets and interview stories`,
            phaseIndex === 0
              ? `Complete 2-3 beginner labs or exercises related to ${focus}`
              : phaseIndex === 1
                ? `Publish screenshots, README notes, and lessons learned for ${project.name}`
                : 'Apply to 5 relevant internships/jobs and track feedback',
            `Spend one review block fixing weak areas from previous weeks`
          ],
          milestones: [`Week ${week}: ${focus} checkpoint completed`],
          estimatedHours: weeklyHours,
          resources: ['official docs', 'practice labs', 'portfolio notes', 'mock interview questions']
        };
        }).filter((task) => task.week <= weeks)
      };
    }).filter(Boolean),
    skills: {
      technical: profile.technical,
      soft: profile.soft
    },
    topicProjects,
    projects: profile.projects.map((project, index) => ({
      ...project,
      timeline: `Week ${Math.min(weeks, 2 + index * 2)}-${Math.min(weeks, 4 + index * 2)}`
    })),
    dsa: {
      topics: profile.dsaTopics,
      estimatedHours: Math.max(20, weeks * 3),
      resources: ['LeetCode', 'InterviewBit', 'field-specific practice labs']
    },
    recommendations: [
      'Every week must produce proof: notes, lab report, GitHub commit, or project screenshot',
      'Do not only watch tutorials; spend at least 60% time practicing',
      'Maintain a progress tracker with weak topics, completed tasks, and next actions'
    ],
    fallback: true
  };
};

const createFallbackProjects = (careerGoal, level) => {
  const goal = String(careerGoal || 'Software Engineer').trim();
  return [
    {
      id: 1,
      name: `${goal} Dashboard`,
      description: 'A practical dashboard with authentication, CRUD, and charts',
      duration: '2-3 weeks',
      technologies: ['React', 'Node.js', 'API'],
      skills: ['Frontend', 'Backend', 'Deployment'],
      difficulty: level,
      resources: ['official docs', 'GitHub examples'],
      portfolio: true
    },
    {
      id: 2,
      name: `${goal} Automation Tool`,
      description: 'A small tool that solves a real repeated task',
      duration: '1-2 weeks',
      technologies: ['JavaScript', 'REST API'],
      skills: ['Problem solving', 'Integration'],
      difficulty: level,
      resources: ['MDN', 'API docs'],
      portfolio: true
    }
  ];
};

const CareerRoadmapService = {
  async generateRoadmap(careerGoal, currentLevel = 'beginner', timelineWeeks = 8, collegeCommitment = 'balanced') {
    try {
      const weeks = Math.max(3, Number.parseInt(timelineWeeks, 10) || 8);
      const tokenBudget = weeks >= 24 ? 3200 : weeks >= 12 ? 2400 : 1800;
      const profile = getCareerProfile(careerGoal);
      const topicProjects = getTopicWiseProjects(careerGoal, currentLevel);
      const model = getFastModel({ maxOutputTokens: tokenBudget, responseMimeType: 'application/json' });
      
      const prompt = `You are EduAI, a senior career mentor. Create a detailed, practical ${weeks}-week career roadmap.
      
      Career Goal: ${compactPromptText(careerGoal, 800)}
      Current Level: ${currentLevel}
      College Commitment: ${collegeCommitment}
      Detected Domain: ${profile.label}
      
      Quality rules:
      - Be extremely concise and direct. Avoid filler words.
      - Every week must have specific topics, tools, and one clear practice task.
      - Adapt intensity to college commitment.
      - Include topic-wise projects after major milestones.
      - Use minimal but high-impact descriptions.

Return JSON:
{
  "careerGoal": "${careerGoal}",
  "totalDuration": "${weeks} weeks",
  "phases": [
    {
      "name": "Phase 1: Clear phase name",
      "duration": "Weeks 1-3",
      "objectives": ["objective1", "objective2"],
      "weeklyTasks": [
        {
          "week": 1,
          "tasks": ["specific task 1", "specific task 2", "specific task 3", "specific task 4"],
          "milestones": ["milestone1"],
          "estimatedHours": 10,
          "resources": ["specific resource or platform"]
        }
      ]
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"]
  },
  "topicProjects": [
    {
      "topic": "HTML",
      "project": "Semantic Personal Profile Page",
      "whenToBuild": "After HTML basics",
      "description": "What to build and why",
      "deliverables": ["file/output 1", "file/output 2"],
      "skills": ["skill1", "skill2"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "What to build",
      "timeline": "Week X-Y",
      "skills": ["skill1", "skill2"],
      "difficulty": "easy/medium/hard"
    }
  ],
  "dsa": {
    "topics": ["topic1", "topic2"],
    "estimatedHours": 40,
    "resources": ["LeetCode", "InterviewBit"]
  },
  "recommendations": ["recommendation1"]
}

Return ONLY valid JSON.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const roadmap = parseJsonObject(text);

      if (!roadmap) throw new Error('Invalid response format');

      return roadmap;
    } catch (error) {
      console.error('Roadmap Generation Error:', error);
      return createFallbackRoadmap(careerGoal, currentLevel, timelineWeeks, collegeCommitment);
    }
  },

  async balanceSchedule(collegeSchedule, careerGoal, totalHoursPerDay = 10) {
    try {
      const model = getFastModel({ maxOutputTokens: 1600, responseMimeType: 'application/json' });
      
      const prompt = `Balance study time for college and career development.

College Schedule:
${JSON.stringify(collegeSchedule)}

Career Goal: ${compactPromptText(careerGoal, 800)}
Total Hours Available Daily: ${totalHoursPerDay}

Create a balanced schedule that:
1. Maintains college performance
2. Progresses toward career goal
3. Includes breaks and self-care

Return JSON:
{
  "dailyBreakdown": {
    "college": 4,
    "careerDevelopment": 4,
    "dsa": 1,
    "break": 1
  },
  "optimizedSchedule": [
    {
      "day": "Monday",
      "blocks": [
        {
          "time": "08:00-09:00",
          "category": "college/career/dsa",
          "activity": "Activity",
          "priority": "high/medium/low"
        }
      ]
    }
  ],
  "tips": ["tip1", "tip2"]
}

Return ONLY valid JSON.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const schedule = parseJsonObject(text);

      if (!schedule) throw new Error('Invalid response format');

      return schedule;
    } catch (error) {
      console.error('Schedule Balance Error:', error);
      return {
        dailyBreakdown: {
          college: Math.max(3, Math.round(totalHoursPerDay * 0.45)),
          careerDevelopment: Math.max(2, Math.round(totalHoursPerDay * 0.35)),
          dsa: 1,
          break: 1
        },
        optimizedSchedule: [],
        tips: ['Block your hardest work first', 'Keep one short DSA block daily', 'Protect sleep and breaks'],
        fallback: true
      };
    }
  },

  async getProjectIdeas(careerGoal, level = 'beginner') {
    try {
      const model = getFastModel({ maxOutputTokens: 1400, responseMimeType: 'application/json' });
      
      const prompt = `Generate practical project ideas for someone pursuing "${compactPromptText(careerGoal, 800)}" at ${level} level.

Return JSON:
{
  "projects": [
    {
      "id": 1,
      "name": "Project Name",
      "description": "What the project teaches",
      "duration": "2 weeks",
      "technologies": ["tech1", "tech2"],
      "skills": ["skill1"],
      "difficulty": "beginner/intermediate/advanced",
      "resources": ["resource1"],
      "portfolio": true
    }
  ]
}

Return ONLY valid JSON with 5-8 projects.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const parsed = parseJsonArray(text) || parseJsonObject(text);

      if (!parsed) throw new Error('Invalid response format');

      return Array.isArray(parsed) ? parsed : parsed.projects;
    } catch (error) {
      console.error('Project Ideas Error:', error);
      return createFallbackProjects(careerGoal, level);
    }
  },

  async generateDSAPath(careerGoal = 'Software Engineer', duration = 8) {
    try {
      const model = getFastModel({ maxOutputTokens: 1200, responseMimeType: 'application/json' });
      
      const prompt = `Create a ${duration}-week DSA (Data Structures & Algorithms) learning path for someone pursuing "${compactPromptText(careerGoal, 800)}".

Return JSON:
{
  "topics": [
    {
      "week": 1,
      "topics": ["Arrays", "Strings"],
      "problems": 15,
      "platforms": ["LeetCode", "HackerRank"],
      "difficulty": "Easy"
    }
  ],
  "totalProblems": 100,
  "estimatedHours": 40,
  "interviewPrep": true
}

Return ONLY valid JSON.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const path = parseJsonObject(text);

      if (!path) throw new Error('Invalid response format');

      return path;
    } catch (error) {
      console.error('DSA Path Error:', error);
      return {
        topics: [
          { week: 1, topics: ['Arrays', 'Strings'], problems: 15, platforms: ['LeetCode'], difficulty: 'Easy' },
          { week: 2, topics: ['Hash Maps', 'Two Pointers'], problems: 15, platforms: ['LeetCode'], difficulty: 'Easy-Medium' },
          { week: 3, topics: ['Stacks', 'Queues'], problems: 12, platforms: ['LeetCode'], difficulty: 'Medium' }
        ],
        totalProblems: Math.max(40, duration * 10),
        estimatedHours: Math.max(20, duration * 5),
        interviewPrep: true,
        fallback: true
      };
    }
  }
};

export default CareerRoadmapService;
