import express from 'express';
import StudyPlannerService from '../services/studyPlannerService.js';

const router = express.Router();

// Upload and parse timetable
router.post('/parse-timetable', async (req, res) => {
  try {
    const { timeTableData } = req.body;

    if (!timeTableData) {
      return res.status(400).json({ error: 'Timetable data is required' });
    }

    const parsed = await StudyPlannerService.parseTimeTable(timeTableData);
    res.json({ success: true, data: parsed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate optimized study schedule
router.post('/optimize-schedule', async (req, res) => {
  try {
    const { timeTableData, preferences = {} } = req.body;

    if (!timeTableData) {
      return res.status(400).json({ error: 'Timetable data is required' });
    }

    const optimized = await StudyPlannerService.generateOptimizedSchedule(timeTableData, preferences);
    res.json({ success: true, data: optimized });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get study resources for a subject
router.post('/resources', async (req, res) => {
  try {
    const { subject, studyLevel = 'intermediate' } = req.body;

    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const resources = await StudyPlannerService.suggestStudyResources(subject, studyLevel);
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
