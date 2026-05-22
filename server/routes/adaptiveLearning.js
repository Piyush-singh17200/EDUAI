import express from 'express';
import auth from '../middleware/auth.js';
import AdaptiveLearningService from '../services/adaptiveLearningService.js';

const router = express.Router();

router.use(auth);

router.get('/summary', (req, res) => {
  try {
    res.json({ success: true, data: AdaptiveLearningService.getSummary(req.user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', (req, res) => {
  try {
    res.json({ success: true, data: AdaptiveLearningService.updateProfile(req.user, req.body) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/study-logs', (req, res) => {
  try {
    if (!req.body.subject || !req.body.topic) {
      return res.status(400).json({ error: 'Subject and topic are required' });
    }

    res.json({ success: true, data: AdaptiveLearningService.logStudy(req.user, req.body) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/quiz-results', (req, res) => {
  try {
    if (!req.body.subject || !req.body.topic) {
      return res.status(400).json({ error: 'Subject and topic are required' });
    }

    res.json({ success: true, data: AdaptiveLearningService.recordQuizResult(req.user, req.body) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/revisions/:revisionId/complete', (req, res) => {
  try {
    res.json({
      success: true,
      data: AdaptiveLearningService.completeRevision(req.user, req.params.revisionId, req.body.confidence)
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/planner/generate', (req, res) => {
  try {
    res.json({ success: true, data: AdaptiveLearningService.generatePlan(req.user, req.body) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/planner/:taskId', (req, res) => {
  try {
    res.json({ success: true, data: AdaptiveLearningService.updatePlanTask(req.user, req.params.taskId, req.body) });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/focus-sessions', (req, res) => {
  try {
    res.json({ success: true, data: AdaptiveLearningService.logFocusSession(req.user, req.body) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/analytics', (req, res) => {
  try {
    res.json({ success: true, data: AdaptiveLearningService.getAnalytics(req.user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/content/notes', async (req, res) => {
  try {
    if (!req.body.topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    res.json({ success: true, data: await AdaptiveLearningService.generateNotes(req.user, req.body) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/content/practice', async (req, res) => {
  try {
    if (!req.body.topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    res.json({ success: true, data: await AdaptiveLearningService.generatePractice(req.user, req.body) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
