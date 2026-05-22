import express from 'express';
import CareerRoadmapService from '../services/careerRoadmapService.js';

const router = express.Router();

// Generate career roadmap
router.post('/generate', async (req, res) => {
  try {
    const { 
      careerGoal, 
      currentLevel = 'beginner', 
      timelineWeeks = 8, 
      collegeCommitment = 'balanced' 
    } = req.body;

    if (!careerGoal) {
      return res.status(400).json({ error: 'Career goal is required' });
    }

    const roadmap = await CareerRoadmapService.generateRoadmap(
      careerGoal, 
      currentLevel, 
      timelineWeeks, 
      collegeCommitment
    );

    res.json({ success: true, data: roadmap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Balance college and career schedule
router.post('/balance-schedule', async (req, res) => {
  try {
    const { 
      collegeSchedule, 
      careerGoal, 
      totalHoursPerDay = 10 
    } = req.body;

    if (!collegeSchedule || !careerGoal) {
      return res.status(400).json({ error: 'College schedule and career goal are required' });
    }

    const balanced = await CareerRoadmapService.balanceSchedule(
      collegeSchedule, 
      careerGoal, 
      totalHoursPerDay
    );

    res.json({ success: true, data: balanced });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project ideas
router.post('/project-ideas', async (req, res) => {
  try {
    const { careerGoal, level = 'beginner' } = req.body;

    if (!careerGoal) {
      return res.status(400).json({ error: 'Career goal is required' });
    }

    const projects = await CareerRoadmapService.getProjectIdeas(careerGoal, level);
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate DSA learning path
router.post('/dsa-path', async (req, res) => {
  try {
    const { careerGoal = 'Software Engineer', duration = 8 } = req.body;

    const dsaPath = await CareerRoadmapService.generateDSAPath(careerGoal, duration);
    res.json({ success: true, data: dsaPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
