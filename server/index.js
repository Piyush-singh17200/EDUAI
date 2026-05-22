import express from 'express';
import cors from 'cors';
import './config/env.js';
import http from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import routes
import aiTutorRoutes from './routes/aiTutor.js';
import resumeAnalyzerRoutes from './routes/resumeAnalyzer.js';
import studyPlannerRoutes from './routes/studyPlanner.js';
import careerRoadmapRoutes from './routes/careerRoadmap.js';
import profileOptimizerRoutes from './routes/profileOptimizer.js';
import todoRoutes from './routes/todo.js';
import authRoutes from './routes/auth.js';
import adaptiveLearningRoutes from './routes/adaptiveLearning.js';
import interviewRoutes from './routes/interview.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Please upload a PDF resume'));
    }
  }
});

// Make upload available globally
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutor', aiTutorRoutes);
app.use('/api/resume', resumeAnalyzerRoutes);
app.use('/api/study-planner', studyPlannerRoutes);
app.use('/api/career-roadmap', careerRoadmapRoutes);
app.use('/api/profile', profileOptimizerRoutes);
app.use('/api/todo', todoRoutes);
app.use('/api/learning', adaptiveLearningRoutes);
app.use('/api/interview', interviewRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Socket.IO events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Study group events
  socket.on('join-study-group', (groupId) => {
    socket.join(`study-group-${groupId}`);
    io.to(`study-group-${groupId}`).emit('user-joined', { userId: socket.id });
  });

  socket.on('toggle-mic', (data) => {
    io.to(`study-group-${data.groupId}`).emit('mic-toggled', {
      userId: socket.id,
      isActive: data.isActive
    });
  });

  socket.on('toggle-screen-share', (data) => {
    io.to(`study-group-${data.groupId}`).emit('screen-shared', {
      userId: socket.id,
      isSharing: data.isSharing,
      content: data.content
    });
  });

  socket.on('raise-hand', (data) => {
    io.to(`study-group-${data.groupId}`).emit('hand-raised', {
      userId: socket.id,
      userName: data.userName
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('EduAI Platform backend started');
});

export { io };
