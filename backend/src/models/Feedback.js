const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Feedback title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Feedback message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters long'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['bug', 'feature', 'general', 'improvement', 'complaint'],
      message: 'Category must be one of: bug, feature, general, improvement, complaint'
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: {
      type: String,
      default: 'web'
    }
  },
  aiAnalysis: {
    summary: String,
    keywords: [String],
    suggestedActions: [String],
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  responses: [{
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ category: 1, status: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ 'aiAnalysis.keywords': 1 });
feedbackSchema.index({ sentiment: 1 });

// Virtual for feedback age in days
feedbackSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Static method to get feedback statistics
feedbackSchema.statics.getStats = async function(userId = null) {
  const matchStage = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byCategory: {
          $push: {
            category: '$category',
            count: 1
          }
        },
        byStatus: {
          $push: {
            status: '$status',
            count: 1
          }
        },
        bySentiment: {
          $push: {
            sentiment: '$sentiment',
            count: 1
          }
        }
      }
    }
  ]);

  return stats[0] || { total: 0, byCategory: [], byStatus: [], bySentiment: [] };
};

// Static method to get recent feedback
feedbackSchema.statics.getRecent = function(limit = 10, userId = null) {
  const query = userId ? { userId } : {};
  return this.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Instance method to add AI analysis
feedbackSchema.methods.addAIAnalysis = function(analysis) {
  this.aiAnalysis = {
    summary: analysis.summary,
    keywords: analysis.keywords || [],
    suggestedActions: analysis.suggestedActions || [],
    confidenceScore: analysis.confidenceScore || 0.5
  };
  
  // Update sentiment from AI analysis
  if (analysis.sentiment) {
    this.sentiment = analysis.sentiment;
  }
  
  return this.save();
};

// Instance method to update status
feedbackSchema.methods.updateStatus = function(newStatus, adminId = null) {
  this.status = newStatus;
  if (adminId && newStatus !== 'open') {
    this.responses.push({
      adminId,
      message: `Status updated to: ${newStatus}`,
      timestamp: new Date()
    });
  }
  return this.save();
};

module.exports = mongoose.model('Feedback', feedbackSchema);