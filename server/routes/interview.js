import express from 'express';
import InterviewService from '../services/interviewService.js';

const router = express.Router();

// Start a mock interview session
router.post('/start', async (req, res) => {
  try {
    const { role, level = 'mid-level' } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Job role is required to start interview' });
    }

    const session = await InterviewService.startInterview(role, level);
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Evaluate current answer and get next question
router.post('/evaluate', async (req, res) => {
  try {
    const { role, level = 'mid-level', question, answer, history = [] } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and candidate answer are required for evaluation' });
    }

    const evaluation = await InterviewService.evaluateAnswer(role, level, question, answer, history);
    res.json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
