const { validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const aiService = require('../services/aiService');

// Create new feedback
const createFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, message, category, priority = 'medium' } = req.body;
    const userId = req.user._id;

    // Create feedback
    const feedback = new Feedback({
      userId,
      title: title.trim(),
      message: message.trim(),
      category,
      priority,
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        source: 'web'
      }
    });

    await feedback.save();

    // Populate user data
    await feedback.populate('userId', 'name email');

    // Generate AI analysis and wait for it to complete
    try {
      const analysis = await aiService.analyzeFeedback(feedback._id, message);
      if (analysis) {
        await feedback.addAIAnalysis(analysis);
      }
    } catch (err) {
      console.error('AI analysis failed:', err);
    }

    // Increment user feedback count
    await req.user.incrementFeedbackCount();

    // Emit real-time update to all connected clients
    req.io.emit('feedback:new', {
      id: feedback._id,
      title: feedback.title,
      category: feedback.category,
      priority: feedback.priority,
      user: {
        name: feedback.userId.name,
        email: feedback.userId.email
      },
      createdAt: feedback.createdAt
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback._id,
        title: feedback.title,
        message: feedback.message,
        category: feedback.category,
        priority: feedback.priority,
        status: feedback.status,
        user: {
          name: feedback.userId.name,
          email: feedback.userId.email
        },
        createdAt: feedback.createdAt
      }
    });

  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({
      message: 'Failed to submit feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all feedback (with pagination and filters)
const getAllFeedback = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      priority,
      sentiment,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (sentiment) filter.sentiment = sentiment;

    // If not admin, only show user's own feedback
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [feedback, total] = await Promise.all([
      Feedback.find(filter)
        .populate('userId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Feedback.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      feedback,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      message: 'Failed to retrieve feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get feedback by ID
const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedback = await Feedback.findById(id)
      .populate('userId', 'name email')
      .populate('responses.adminId', 'name email');

    if (!feedback) {
      return res.status(404).json({
        message: 'Feedback not found',
        code: 'FEEDBACK_NOT_FOUND'
      });
    }

    // Check if user can access this feedback
    if (req.user.role !== 'admin' && feedback.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    res.json({ feedback });

  } catch (error) {
    console.error('Get feedback by ID error:', error);
    res.status(500).json({
      message: 'Failed to retrieve feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update feedback status (admin only)
const updateFeedbackStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, response } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        message: 'Feedback not found',
        code: 'FEEDBACK_NOT_FOUND'
      });
    }

    // Update status
    await feedback.updateStatus(status, req.user._id);

    // Add response if provided
    if (response && response.trim()) {
      feedback.responses.push({
        adminId: req.user._id,
        message: response.trim(),
        timestamp: new Date()
      });
      await feedback.save();
    }

    // Populate for response
    await feedback.populate('userId', 'name email');
    await feedback.populate('responses.adminId', 'name email');

    // Emit real-time update
    req.io.emit('feedback:updated', {
      id: feedback._id,
      status: feedback.status,
      updatedAt: new Date()
    });

    res.json({
      message: 'Feedback updated successfully',
      feedback
    });

  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({
      message: 'Failed to update feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get feedback statistics
const getFeedbackStats = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? null : req.user._id;
    
    const [stats, recentFeedback] = await Promise.all([
      Feedback.getStats(userId),
      Feedback.getRecent(5, userId)
    ]);

    // Calculate category distribution
    const categoryStats = {};
    const statusStats = {};
    const sentimentStats = {};

    // Initialize counters
    ['bug', 'feature', 'general', 'improvement', 'complaint'].forEach(cat => {
      categoryStats[cat] = 0;
    });
    ['open', 'in-progress', 'resolved', 'closed'].forEach(status => {
      statusStats[status] = 0;
    });
    ['positive', 'neutral', 'negative'].forEach(sentiment => {
      sentimentStats[sentiment] = 0;
    });

    // Count occurrences
    const allFeedback = await Feedback.find(userId ? { userId } : {});
    allFeedback.forEach(feedback => {
      categoryStats[feedback.category]++;
      statusStats[feedback.status]++;
      sentimentStats[feedback.sentiment]++;
    });

    res.json({
      stats: {
        total: stats.total || 0,
        categoryDistribution: categoryStats,
        statusDistribution: statusStats,
        sentimentDistribution: sentimentStats
      },
      recentFeedback
    });

  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      message: 'Failed to retrieve statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete feedback (admin only or own feedback)
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        message: 'Feedback not found',
        code: 'FEEDBACK_NOT_FOUND'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && feedback.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    await Feedback.findByIdAndDelete(id);

    // Emit real-time update
    req.io.emit('feedback:deleted', { id });

    res.json({
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      message: 'Failed to delete feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  getFeedbackStats,
  deleteFeedback
};