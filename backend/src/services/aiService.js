const axios = require('axios');
const Feedback = require('../models/Feedback');

class AIService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.isOpenAIEnabled = !!this.openaiApiKey;
  }

  // Analyze feedback using AI (OpenAI or mock)
  async analyzeFeedback(feedbackId, message) {
    try {
      if (this.isOpenAIEnabled) {
        return await this.analyzeWithOpenAI(message);
      } else {
        return this.analyzeWithMockService(message);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to mock service if OpenAI fails
      return this.analyzeWithMockService(message);
    }
  }

  // OpenAI-powered analysis
  async analyzeWithOpenAI(message) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant that analyzes user feedback. 
              Analyze the feedback and return a JSON object with:
              - summary: Brief summary of the feedback (max 100 chars)
              - keywords: Array of 3-5 relevant keywords
              - suggestedActions: Array of 2-3 actionable suggestions
              - confidenceScore: Number between 0-1 indicating analysis confidence
              - sentiment: "positive", "neutral", or "negative"
              
              Return only valid JSON, no additional text.`
            },
            {
              role: 'user',
              content: `Analyze this feedback: "${message}"`
            }
          ],
          max_tokens: 300,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const analysis = JSON.parse(content);

      return {
        summary: analysis.summary || 'AI analysis completed',
        keywords: analysis.keywords || [],
        suggestedActions: analysis.suggestedActions || [],
        confidenceScore: analysis.confidenceScore || 0.7,
        sentiment: analysis.sentiment || 'neutral'
      };

    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Mock AI service for development/demo
  analyzeWithMockService(message) {
    const words = message.toLowerCase().split(' ');
    
    // Simple keyword extraction
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];
    const keywords = words
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 5);

    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'like', 'awesome', 'fantastic', 'wonderful', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'horrible', 'worst', 'broken', 'bug', 'error', 'problem', 'issue'];
    
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    let sentiment = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';

    // Generate summary
    const summary = message.length > 80 
      ? message.substring(0, 77) + '...' 
      : message;

    // Generate suggested actions based on keywords
    const suggestedActions = [];
    if (keywords.some(k => ['bug', 'error', 'broken', 'issue'].includes(k))) {
      suggestedActions.push('Investigate technical issue');
      suggestedActions.push('Assign to development team');
    } else if (keywords.some(k => ['feature', 'add', 'new', 'request'].includes(k))) {
      suggestedActions.push('Evaluate feature request');
      suggestedActions.push('Add to product roadmap');
    } else {
      suggestedActions.push('Review feedback with team');
      suggestedActions.push('Follow up with user');
    }

    return {
      summary,
      keywords,
      suggestedActions,
      confidenceScore: 0.6, // Mock confidence score
      sentiment
    };
  }

  // Generate insights from multiple feedback entries
  async generateInsights(userId = null) {
    try {
      const query = userId ? { userId } : {};
      const recentFeedback = await Feedback.find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      if (recentFeedback.length === 0) {
        return {
          summary: 'No feedback available for analysis',
          trends: [],
          recommendations: ['Encourage users to submit more feedback'],
          totalAnalyzed: 0
        };
      }

      if (this.isOpenAIEnabled) {
        return await this.generateInsightsWithOpenAI(recentFeedback);
      } else {
        return this.generateInsightsWithMockService(recentFeedback);
      }

    } catch (error) {
      console.error('Generate insights error:', error);
      return this.generateInsightsWithMockService([]);
    }
  }

  // OpenAI-powered insights generation
  async generateInsightsWithOpenAI(feedbackList) {
    try {
      const feedbackText = feedbackList
        .map(f => `${f.category}: ${f.message}`)
        .join('\n');

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Analyze this collection of user feedback and provide insights. 
              Return a JSON object with:
              - summary: Overall summary of feedback themes
              - trends: Array of 3-5 key trends identified
              - recommendations: Array of 3-5 actionable recommendations
              - totalAnalyzed: Number of feedback items analyzed
              
              Return only valid JSON, no additional text.`
            },
            {
              role: 'user',
              content: `Analyze this feedback collection:\n${feedbackText}`
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);

    } catch (error) {
      console.error('OpenAI insights error:', error);
      return this.generateInsightsWithMockService(feedbackList);
    }
  }

  // Mock insights generation
  generateInsightsWithMockService(feedbackList) {
    const categoryCount = {};
    const sentimentCount = { positive: 0, neutral: 0, negative: 0 };
    const commonKeywords = {};

    feedbackList.forEach(feedback => {
      // Count categories
      categoryCount[feedback.category] = (categoryCount[feedback.category] || 0) + 1;
      
      // Count sentiments
      sentimentCount[feedback.sentiment]++;
      
      // Extract keywords from AI analysis if available
      if (feedback.aiAnalysis && feedback.aiAnalysis.keywords) {
        feedback.aiAnalysis.keywords.forEach(keyword => {
          commonKeywords[keyword] = (commonKeywords[keyword] || 0) + 1;
        });
      }
    });

    const topCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b, 'general');
    
    const topKeywords = Object.keys(commonKeywords)
      .sort((a, b) => commonKeywords[b] - commonKeywords[a])
      .slice(0, 5);

    const trends = [
      `${topCategory} feedback represents ${Math.round((categoryCount[topCategory] / feedbackList.length) * 100)}% of submissions`,
      `${sentimentCount.positive} positive vs ${sentimentCount.negative} negative responses`,
      topKeywords.length > 0 ? `Common themes: ${topKeywords.join(', ')}` : 'Diverse feedback topics'
    ];

    const recommendations = [
      categoryCount.bug > 0 ? 'Prioritize bug fixes to improve user experience' : 'Continue monitoring for technical issues',
      categoryCount.feature > 0 ? 'Evaluate popular feature requests for roadmap inclusion' : 'Gather more feature feedback',
      sentimentCount.negative > sentimentCount.positive ? 'Focus on addressing user pain points' : 'Maintain current positive user experience'
    ];

    return {
      summary: `Analyzed ${feedbackList.length} feedback submissions. Primary focus areas: ${topCategory} improvements and user experience enhancement.`,
      trends: trends.filter(Boolean),
      recommendations: recommendations.filter(Boolean),
      totalAnalyzed: feedbackList.length
    };
  }
}

module.exports = new AIService();