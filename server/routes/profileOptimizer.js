import express from 'express';
import ProfileOptimizerService from '../services/profileOptimizerService.js';

const router = express.Router();

// Analyze GitHub profile
router.get('/github/:username', async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: 'GitHub username is required' });
    }

    const analysis = await ProfileOptimizerService.analyzeGitHub(username);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze LinkedIn profile
router.post('/linkedin', async (req, res) => {
  try {
    const { profileData } = req.body;

    if (!profileData) {
      return res.status(400).json({ error: 'Profile data is required' });
    }

    const analysis = await ProfileOptimizerService.analyzeLinkedIn(profileData);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get portfolio project suggestions
router.post('/portfolio-suggestions', async (req, res) => {
  try {
    const { careerGoal, currentSkills = [] } = req.body;

    if (!careerGoal) {
      return res.status(400).json({ error: 'Career goal is required' });
    }

    const suggestions = await ProfileOptimizerService.getPortfolioSuggestions(careerGoal, currentSkills);
    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile optimization plan
router.post('/optimize', async (req, res) => {
  try {
    const { profileType, currentState } = req.body;

    if (!profileType || !currentState) {
      return res.status(400).json({ error: 'Profile type and current state are required' });
    }

    const plan = await ProfileOptimizerService.optimizeProfile(profileType, currentState);
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
