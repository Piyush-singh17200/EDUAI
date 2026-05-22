import express from 'express';
import AITutorService from '../services/aiTutorService.js';

const router = express.Router();

// Ask a question to the AI tutor
router.post('/ask', async (req, res) => {
  try {
    const { question, subject = 'General' } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const response = await AITutorService.askQuestion(question, subject);
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Streamed answer for better perceived performance
router.post('/ask-stream', async (req, res) => {
  try {
    const { question, subject = 'General' } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await AITutorService.askQuestionStream(question, subject);
    
    for await (const chunk of stream.stream) {
      const chunkText = chunk.text();
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

// Generate a quiz on a topic
router.post('/quiz', async (req, res) => {
  try {
    const { topic, difficulty = 'intermediate', numberOfQuestions = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const quiz = await AITutorService.generateQuiz(topic, difficulty, numberOfQuestions);
    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Explain a concept
router.post('/explain', async (req, res) => {
  try {
    const { concept, depth = 'beginner' } = req.body;

    if (!concept) {
      return res.status(400).json({ error: 'Concept is required' });
    }

    const explanation = await AITutorService.explainConcept(concept, depth);
    res.json({ success: true, data: explanation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate a learning path for a subject
router.post('/learning-path', async (req, res) => {
  try {
    const { subject, targetLevel = 'intermediate', weeksDuration = 8 } = req.body;

    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const path = await AITutorService.generateLearningPath(subject, targetLevel, weeksDuration);
    res.json({ success: true, data: path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
