import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const ensureUserStore = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({ users: {} }, null, 2));
};

const readUsers = () => {
  ensureUserStore();
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')).users || {};
};

const writeUsers = (users) => {
  ensureUserStore();
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
};

const publicUser = (user) => ({
  email: user.email,
  name: user.name,
  subjects: user.subjects || [],
  goals: user.goals || '',
  examDate: user.examDate || ''
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, subjects = [], goals = '', examDate = '' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const users = readUsers();
    const normalizedEmail = email.toLowerCase();

    if (users[normalizedEmail]) {
      return res.status(400).json({ error: 'User already exists' });
    }

    users[normalizedEmail] = {
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 10),
      name,
      subjects,
      goals,
      examDate,
      createdAt: new Date()
    };
    writeUsers(users);

    const token = jwt.sign(
      { email: normalizedEmail, name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: publicUser(users[normalizedEmail])
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = readUsers();
    const normalizedEmail = email.toLowerCase();
    const user = users[normalizedEmail];
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email: normalizedEmail, name: user.name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: publicUser(user)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ success: true, data: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
