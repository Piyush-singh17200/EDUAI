# EduAI Platform - Quick Start Guide

## 5-Minute Setup

### Step 1: Clone & Install
```bash
git clone <repository-url>
cd eduai-platform
npm run install:all
```

### Step 2: Get API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Create API key
3. Copy the key

### Step 3: Configure Environment
```bash
cd server
cat > .env << EOF
PORT=5000
NODE_ENV=development
GOOGLE_GENERATIVE_AI_KEY=paste_your_key_here
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
EOF
```

### Step 4: Create Uploads Directory
```bash
mkdir -p uploads
```

### Step 5: Start Application
```bash
# From root directory
npm run dev
```

**That's it!** 🎉

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Demo Credentials

For testing (if using demo auth):
- Email: `test@example.com`
- Password: `password123`

## Features to Try First

1. **AI Tutor**
   - Ask: "Explain Newton's first law of motion"
   - Generate quiz on "Python Programming"

2. **Study Planner**
   - Add some classes: Math (9-10 AM), Physics (11 AM-12 PM)
   - Click "Generate Optimized Schedule"

3. **Career Roadmap**
   - Goal: "Full Stack Web Developer"
   - Select timeline: 8 weeks
   - View your personalized roadmap

4. **Resume Analyzer**
   - Upload a sample resume
   - Get ATS score and improvement tips

## Common Issues & Solutions

### Issue: "Cannot find module '@google/generative-ai'"
```bash
cd server && npm install @google/generative-ai
```

### Issue: Port 5000 already in use
```bash
# Change PORT in .env
PORT=5001
```

### Issue: CORS errors
Check your .env file has correct CORS_ORIGINS set

### Issue: File upload not working
```bash
mkdir -p uploads
chmod 755 uploads
```

## Environment Variables Reference

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# AI & APIs
GOOGLE_GENERATIVE_AI_KEY=your_gemini_key
GITHUB_TOKEN=your_github_token

# JWT
JWT_SECRET=your_jwt_secret_key_here

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# URLs
CLIENT_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
```

## API Testing with cURL

### Ask AI Tutor
```bash
curl -X POST http://localhost:5000/api/tutor/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is machine learning?","subject":"Technology"}'
```

### Generate Quiz
```bash
curl -X POST http://localhost:5000/api/tutor/quiz \
  -H "Content-Type: application/json" \
  -d '{"topic":"Python","difficulty":"intermediate"}'
```

### Generate Roadmap
```bash
curl -X POST http://localhost:5000/api/career-roadmap/generate \
  -H "Content-Type: application/json" \
  -d '{
    "careerGoal":"Full Stack Developer",
    "currentLevel":"beginner",
    "timelineWeeks":8,
    "collegeCommitment":"balanced"
  }'
```

## Project Structure

```
eduai-platform/
├── server/
│   ├── routes/
│   │   ├── aiTutor.js
│   │   ├── resumeAnalyzer.js
│   │   ├── studyPlanner.js
│   │   ├── careerRoadmap.js
│   │   ├── profileOptimizer.js
│   │   ├── todo.js
│   │   └── auth.js
│   ├── services/
│   │   ├── aiTutorService.js
│   │   ├── resumeAnalyzerService.js
│   │   ├── studyPlannerService.js
│   │   ├── careerRoadmapService.js
│   │   └── profileOptimizerService.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── index.js
│   └── package.json
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AITutor.jsx
│   │   │   ├── StudyPlanner.jsx
│   │   │   ├── CareerRoadmap.jsx
│   │   │   ├── ResumeAnalyzer.jsx
│   │   │   └── Login.jsx
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── store/
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## Next Steps

1. **Customize Styling** - Edit `tailwind.config.js`
2. **Add Database** - Connect MongoDB with Mongoose
3. **Deploy** - Push to Heroku/Vercel
4. **Add More Features** - Extend with real-time collaboration
5. **Mobile App** - Build React Native version

## Performance Tips

- Enable caching for API responses
- Use lazy loading for large lists
- Optimize images with compression
- Implement pagination for todos
- Use service workers for offline support

## Need Help?

- Check `README.md` for detailed documentation
- Review example API calls in this guide
- Check browser console for errors
- Check server logs with `npm run dev`

---

Good luck! Happy learning! 🚀
