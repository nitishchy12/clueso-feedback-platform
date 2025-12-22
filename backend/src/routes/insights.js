const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');

const router = express.Router();

// Get AI-generated insights
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Only show user's own insights unless admin
    const userId = req.user.role === 'admin' ? null : req.user._id;
    
    const insights = await aiService.generateInsights(userId);
    
    res.json({
      insights,
      generatedAt: new Date().toISOString(),
      aiEnabled: aiService.isOpenAIEnabled
    });

  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      message: 'Failed to generate insights',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get AI service status
router.get('/status', authenticateToken, (req, res) => {
  res.json({
    aiEnabled: aiService.isOpenAIEnabled,
    service: aiService.isOpenAIEnabled ? 'OpenAI GPT-3.5' : 'Mock AI Service',
    capabilities: [
      'Feedback summarization',
      'Keyword extraction',
      'Sentiment analysis',
      'Trend identification',
      'Action recommendations'
    ]
  });
});

module.exports = router;