import express from 'express';
import fs from 'fs';
import ResumeAnalyzerService from '../services/resumeAnalyzerService.js';

const router = express.Router();

const uploadResume = (req, res, next) => {
  if (!req.upload) {
    return res.status(500).json({ error: 'Upload middleware is not configured' });
  }

  req.upload.single('resume')(req, res, (error) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    next();
  });
};

// Upload and analyze resume
router.post('/analyze', uploadResume, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // Ensure uploads directory exists
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads', { recursive: true });
    }

    const uploadPath = `/uploads/${req.file.filename}`;
    const fullPath = req.file.path;

    // Extract text from PDF
    const resumeText = await ResumeAnalyzerService.extractTextFromPDF(fullPath);

    // Analyze resume
    const { company = 'Tech Company' } = req.body;
    const analysis = await ResumeAnalyzerService.analyzeResume(resumeText, company);

    res.json({
      success: true,
      data: {
        ...analysis,
        filePath: uploadPath,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analysis only (if resume text is provided)
router.post('/analyze-text', async (req, res) => {
  try {
    const { resumeText, company = 'Tech Company' } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const analysis = await ResumeAnalyzerService.analyzeResume(resumeText, company);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find job openings
router.post('/job-search', async (req, res) => {
  try {
    const { jobTitle, experience = 'mid-level' } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ error: 'Job title is required' });
    }

    const jobs = await ResumeAnalyzerService.findJobOpenings(jobTitle, experience);
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate match score between resume and job
router.post('/match-score', async (req, res) => {
  try {
    const { resumeAnalysis, jobRequirements } = req.body;

    if (!resumeAnalysis || !jobRequirements) {
      return res.status(400).json({ error: 'Resume analysis and job requirements are required' });
    }

    const matchScore = await ResumeAnalyzerService.calculateMatchScore(resumeAnalysis, jobRequirements);
    res.json({ success: true, data: matchScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
