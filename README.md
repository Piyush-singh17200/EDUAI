npm# EduAI Platform - AI-Powered Learning & Career Development

A comprehensive full-stack platform that combines AI-powered tutoring, smart study planning, career roadmapping, and resume analysis to help students excel academically and professionally.

## 🚀 Features

### 1. **AI Tutor** 📚
- Ask questions and get instant AI-powered answers
- Automatic quiz generation on any topic
- Difficulty levels: Easy, Intermediate, Advanced
- Subject-specific guidance
- Learning path generation with structured timelines

### 2. **Smart Study Planner** 📅
- Upload college timetable and get optimized schedule
- AI identifies free slots for focused study sessions
- Resource recommendations for each subject
- Pomodoro technique integration
- Daily study optimization with break intervals

### 3. **Career Roadmap** 🎯
- Generate personalized career development plans
- Balance college commitments with career goals
- 3-phase structured roadmap (Foundation → Growth → Mastery)
- Weekly task breakdown and milestones
- DSA (Data Structures & Algorithms) learning paths
- Portfolio project suggestions

### 4. **Resume Analyzer** 📄
- Upload resume (PDF/Word) and get ATS score
- Deep skill analysis (Technical & Soft Skills)
- Real job opening recommendations
- Job match percentage calculation
- AI-powered improvement suggestions

### 5. **Profile Optimizer** 👤
- GitHub profile analysis and optimization
- LinkedIn profile enhancement suggestions
- Portfolio project recommendations
- Quick wins for immediate impact
- Long-term career strategy

### 6. **Todo List & Progress Tracker** ✓
- Create tasks by priority and category
- Track completion rates
- Sync with study and career roadmaps
- Real-time progress dashboard

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Google Generative AI (Gemini)** - AI engine
- **Socket.io** - Real-time communication
- **Multer** - File uploads
- **PDF-Parse** - PDF text extraction
- **JWT** - Authentication
- **MongoDB** (Optional) - Database

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API Key
- GitHub Token (optional, for profile analysis)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/eduai-platform.git
cd eduai-platform
```

### 2. Setup Environment Variables

**Server (.env)**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
PORT=5000
NODE_ENV=development
GOOGLE_GENERATIVE_AI_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
```

### 3. Install Dependencies

**For entire project:**
```bash
npm run install:all
```

**Or separately:**
```bash
# Server
cd server
npm install

# Client
cd client
npm install
```

### 4. Get API Keys

**Google Gemini API:**
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add to `.env` as `GOOGLE_GENERATIVE_AI_KEY`

**GitHub Token (Optional):**
1. Go to https://github.com/settings/tokens
2. Generate a personal access token
3. Add to `.env` as `GITHUB_TOKEN`

## 🚀 Running the Application

### Development Mode (with hot reload)
```bash
npm run dev
```

This will start:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

### Production Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify token

### AI Tutor
- `POST /api/tutor/ask` - Ask a question
- `POST /api/tutor/quiz` - Generate quiz
- `POST /api/tutor/explain` - Explain concept
- `POST /api/tutor/learning-path` - Generate learning path

### Resume Analyzer
- `POST /api/resume/analyze` - Analyze uploaded resume
- `POST /api/resume/job-search` - Find job openings
- `POST /api/resume/match-score` - Calculate job match

### Study Planner
- `POST /api/study-planner/parse-timetable` - Parse timetable
- `POST /api/study-planner/optimize-schedule` - Get optimized schedule
- `POST /api/study-planner/resources` - Get study resources

### Career Roadmap
- `POST /api/career-roadmap/generate` - Generate roadmap
- `POST /api/career-roadmap/balance-schedule` - Balance schedule
- `POST /api/career-roadmap/project-ideas` - Get project ideas
- `POST /api/career-roadmap/dsa-path` - Generate DSA path

### Profile Optimizer
- `GET /api/profile/github/:username` - Analyze GitHub
- `POST /api/profile/linkedin` - Analyze LinkedIn
- `POST /api/profile/portfolio-suggestions` - Get suggestions
- `POST /api/profile/optimize` - Optimization plan

### Todo
- `GET /api/todo/:userId` - Get all todos
- `POST /api/todo/:userId` - Create todo
- `PUT /api/todo/:userId/:todoId` - Update todo
- `DELETE /api/todo/:userId/:todoId` - Delete todo
- `GET /api/todo/:userId/stats` - Get statistics

## 📱 Features in Detail

### AI Tutor
1. **Ask Questions** - Get detailed explanations
2. **Generate Quizzes** - Test your knowledge
3. **Learn Concepts** - Depth-based explanations
4. **Learning Paths** - 8-week structured courses

### Study Planner
1. Add college classes with day/time
2. AI identifies free slots
3. Generates optimized daily schedule
4. Recommends resources for each subject
5. Tracks total study hours

### Career Roadmap
1. Input career goal (e.g., "Full Stack Developer")
2. Select current level and timeline
3. Get 3-phase 8-week roadmap
4. View weekly breakdown with tasks
5. See skill requirements and projects
6. Balance with college schedule

### Resume Analyzer
1. Upload resume (PDF/Word)
2. Get ATS score (0-100)
3. Identify strengths and weaknesses
4. See matching job openings
5. Get improvement recommendations
6. View required vs current skills

## 🎨 UI Features

- **Glassmorphism Design** - Modern frosted glass effect
- **Dark Theme** - Eye-friendly dark mode
- **Smooth Animations** - Framer Motion transitions
- **Responsive Design** - Mobile, tablet, desktop
- **Real-time Updates** - Socket.io integration
- **Progress Indicators** - Visual progress bars
- **Gradient Text** - Premium gradient effects

## 📊 Database Schema (Optional MongoDB)

```javascript
// User
{
  email: String,
  name: String,
  password: String,
  createdAt: Date
}

// Study Plan
{
  userId: ObjectId,
  timetable: Array,
  optimizedSchedule: Object,
  createdAt: Date
}

// Career Roadmap
{
  userId: ObjectId,
  goal: String,
  roadmap: Object,
  progress: Number,
  createdAt: Date
}

// Resume Analysis
{
  userId: ObjectId,
  filePath: String,
  atsScore: Number,
  analysis: Object,
  uploadedAt: Date
}
```

## 🔒 Security Features

- JWT authentication
- Password hashing (use bcrypt in production)
- CORS enabled
- File upload validation
- Input sanitization
- Environment variables for secrets

## 🚀 Deployment

### Heroku
```bash
# Create Procfile
web: npm start

# Push to Heroku
git push heroku main
```

### Docker
```bash
docker build -t eduai-platform .
docker run -p 5000:5000 eduai-platform
```

### Vercel (Frontend) + Railway (Backend)
- Deploy client on Vercel
- Deploy server on Railway
- Update API URL in frontend

## 📝 Usage Examples

### Ask AI Tutor
```javascript
const response = await api.post('/api/tutor/ask', {
  question: 'What is photosynthesis?',
  subject: 'Biology'
});
```

### Generate Roadmap
```javascript
const roadmap = await api.post('/api/career-roadmap/generate', {
  careerGoal: 'Full Stack Web Developer',
  currentLevel: 'beginner',
  timelineWeeks: 8,
  collegeCommitment: 'balanced'
});
```

### Analyze Resume
```javascript
const formData = new FormData();
formData.append('resume', file);
const analysis = await api.post('/api/resume/analyze', formData);
```

## 🐛 Troubleshooting

**Issue: AI not responding**
- Check Google API key is valid
- Verify CORS settings
- Check API quota limits

**Issue: File upload fails**
- Ensure file is PDF/Word
- Check file size limits (10MB default)
- Verify `/uploads` directory exists

**Issue: Schedule optimization not working**
- Add at least one class to timetable
- Check API response format
- Verify timezone settings

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Google Generative AI (Gemini) for AI capabilities
- Framer Motion for animations
- Tailwind CSS for styling
- React community for tools and libraries

## 📧 Support

For support, email support@eduai.com or open an issue in the GitHub repository.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Video tutorials integration
- [ ] Live collaborative study groups
- [ ] Advanced analytics dashboard
- [ ] Peer review system
- [ ] Certification programs
- [ ] Payment integration
- [ ] AI-powered coding IDE
- [ ] Integration with major platforms (Google Classroom, Canvas)

---

Built with ❤️ for students worldwide
