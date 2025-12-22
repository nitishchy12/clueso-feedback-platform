const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const Feedback = require('../models/Feedback');
const {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  getFeedbackStats,
  deleteFeedback
} = require('../controllers/feedbackController');

const router = express.Router();

// Validation rules
const createFeedbackValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  
  body('category')
    .isIn(['bug', 'feature', 'general', 'improvement', 'complaint'])
    .withMessage('Category must be one of: bug, feature, general, improvement, complaint'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be one of: low, medium, high, critical')
];

const updateStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid feedback ID'),
  
  body('status')
    .isIn(['open', 'in-progress', 'resolved', 'closed'])
    .withMessage('Status must be one of: open, in-progress, resolved, closed'),
  
  body('response')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Response cannot exceed 500 characters')
];

const feedbackIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid feedback ID')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('category')
    .optional()
    .isIn(['bug', 'feature', 'general', 'improvement', 'complaint'])
    .withMessage('Invalid category'),
  
  query('status')
    .optional()
    .isIn(['open', 'in-progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  
  query('sentiment')
    .optional()
    .isIn(['positive', 'neutral', 'negative'])
    .withMessage('Invalid sentiment'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'category', 'priority', 'status'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Routes

// Create new feedback
router.post('/', authenticateToken, createFeedbackValidation, createFeedback);

// Get all feedback (with pagination and filters)
router.get('/', authenticateToken, paginationValidation, getAllFeedback);

// Get feedback statistics
router.get('/stats', authenticateToken, getFeedbackStats);

// Get feedback by ID
router.get('/:id', authenticateToken, feedbackIdValidation, getFeedbackById);

// Update feedback status (admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, updateStatusValidation, updateFeedbackStatus);

// Simple status update for users (own feedback only)
router.patch('/:id/resolve', authenticateToken, feedbackIdValidation, async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const userId = req.user._id;

    // Find feedback and check ownership
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({
        message: 'Feedback not found',
        code: 'FEEDBACK_NOT_FOUND'
      });
    }

    // Check if user owns this feedback or is admin
    if (feedback.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'You can only update your own feedback',
        code: 'ACCESS_DENIED'
      });
    }

    // Update status to resolved
    feedback.status = 'resolved';
    await feedback.save();

    // Populate for response
    await feedback.populate('userId', 'name email');

    // Emit real-time update
    req.io.emit('feedback:updated', {
      id: feedback._id,
      status: feedback.status,
      updatedAt: new Date()
    });

    res.json({
      message: 'Feedback marked as resolved',
      feedback
    });

  } catch (error) {
    console.error('Resolve feedback error:', error);
    res.status(500).json({
      message: 'Failed to update feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete feedback (admin or owner)
router.delete('/:id', authenticateToken, feedbackIdValidation, deleteFeedback);

module.exports = router;