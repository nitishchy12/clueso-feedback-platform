'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  MessageSquare, 
  Clock, 
  User, 
  ChevronRight,
  Bug,
  Lightbulb,
  MessageCircle,
  TrendingUp,
  AlertTriangle,
  X,
  CheckCircle
} from 'lucide-react';

import { feedbackService } from '@/services/api';

export default function FeedbackList({ 
  feedback = [], 
  showPagination = true, 
  compact = false,
  onFeedbackClick,
  onFeedbackUpdate
}) {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const getCategoryIcon = (category) => {
    const icons = {
      bug: Bug,
      feature: Lightbulb,
      general: MessageCircle,
      improvement: TrendingUp,
      complaint: AlertTriangle,
    };
    return icons[category] || MessageCircle;
  };

  const getCategoryColor = (category) => {
    const colors = {
      bug: 'text-error-600 bg-error-50',
      feature: 'text-primary-600 bg-primary-50',
      general: 'text-gray-600 bg-gray-50',
      improvement: 'text-success-600 bg-success-50',
      complaint: 'text-warning-600 bg-warning-50',
    };
    return colors[category] || 'text-gray-600 bg-gray-50';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-warning-500',
      high: 'text-error-500',
      critical: 'text-error-700',
    };
    return colors[priority] || 'text-gray-500';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-primary-100 text-primary-800',
      'in-progress': 'bg-warning-100 text-warning-800',
      resolved: 'bg-success-100 text-success-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleFeedbackClick = (feedbackItem) => {
    if (onFeedbackClick) {
      onFeedbackClick(feedbackItem);
    } else {
      setSelectedFeedback(feedbackItem);
    }
  };

  const handleStatusUpdate = async (feedbackId, newStatus) => {
    setUpdatingStatus(feedbackId);
    try {
      if (newStatus === 'resolved') {
        await feedbackService.resolveFeedback(feedbackId);
      } else {
        await feedbackService.updateFeedbackStatus(feedbackId, { status: newStatus });
      }
      if (onFeedbackUpdate) {
        onFeedbackUpdate();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      // Show more specific error message
      const errorMessage = error.response?.data?.message || 'Failed to update feedback status';
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (feedback.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-sm font-medium text-gray-900 mb-2">No feedback found</h3>
        <p className="text-sm text-gray-500">
          {compact ? 'No recent feedback to display.' : 'Try adjusting your filters or submit new feedback.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {feedback.map((item, index) => {
        const CategoryIcon = getCategoryIcon(item.category);
        const categoryColor = getCategoryColor(item.category);
        const priorityColor = getPriorityColor(item.priority);
        const statusColor = getStatusColor(item.status);

        return (
          <div
            key={item._id}
            className={`
              ${index !== feedback.length - 1 ? 'border-b border-gray-200' : ''}
              ${compact ? 'p-4' : 'p-6'}
              hover:bg-gray-50 transition-colors cursor-pointer
            `}
            onClick={() => handleFeedbackClick(item)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {/* Category Icon */}
                <div className={`p-2 rounded-lg ${categoryColor}`}>
                  <CategoryIcon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className={`${compact ? 'text-sm' : 'text-base'} font-medium text-gray-900 truncate`}>
                      {item.title}
                    </h3>
                    
                    {/* Priority indicator */}
                    {item.priority && item.priority !== 'medium' && (
                      <span className={`text-xs font-medium ${priorityColor}`}>
                        {item.priority.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Message preview */}
                  {!compact && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.message}
                    </p>
                  )}

                  {/* Status badge and actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{item.userId?.name || 'Unknown User'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(item.createdAt)}</span>
                      </div>

                      {/* Category badge */}
                      <span className="badge badge-gray capitalize">
                        {item.category}
                      </span>

                      {/* Status badge */}
                      {item.status && (
                        <span className={`badge ${statusColor} capitalize`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      )}
                    </div>

                    {/* Quick status update for open items */}
                    {item.status === 'open' && !compact && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(item._id, 'resolved');
                        }}
                        disabled={updatingStatus === item._id}
                        className="text-xs text-success-600 hover:text-success-700 flex items-center space-x-1 px-2 py-1 rounded hover:bg-success-50 transition-colors"
                      >
                        {updatingStatus === item._id ? (
                          <div className="spinner w-3 h-3"></div>
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        <span>Mark Resolved</span>
                      </button>
                    )}

                    {/* Show resolved indicator */}
                    {item.status === 'resolved' && !compact && (
                      <div className="text-xs text-success-600 flex items-center space-x-1 px-2 py-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Resolved</span>
                      </div>
                    )}
                  </div>

                  {/* AI Analysis preview */}
                  {item.aiAnalysis && !compact && (
                    <div className="mt-2 p-2 bg-primary-50 rounded text-xs">
                      <span className="font-medium text-primary-700">AI Summary: </span>
                      <span className="text-primary-600">{item.aiAnalysis.summary}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
            </div>
          </div>
        );
      })}

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}
    </div>
  );
}

// Feedback Detail Modal Component
function FeedbackDetailModal({ feedback, onClose }) {
  const CategoryIcon = getCategoryIcon(feedback.category);
  const categoryColor = getCategoryColor(feedback.category);
  const statusColor = getStatusColor(feedback.status);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${categoryColor}`}>
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{feedback.title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`badge ${statusColor} capitalize`}>
                  {feedback.status?.replace('-', ' ') || 'open'}
                </span>
                <span className="badge badge-gray capitalize">{feedback.category}</span>
                {feedback.priority && feedback.priority !== 'medium' && (
                  <span className={`badge ${
                    feedback.priority === 'high' || feedback.priority === 'critical' 
                      ? 'badge-error' 
                      : 'badge-warning'
                  }`}>
                    {feedback.priority}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Message */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Message</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{feedback.message}</p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Submitted by:</span>
              <p className="text-gray-900">{feedback.userId?.name || 'Unknown User'}</p>
              <p className="text-gray-500">{feedback.userId?.email}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Submitted:</span>
              <p className="text-gray-900">
                {new Date(feedback.createdAt).toLocaleDateString()} at{' '}
                {new Date(feedback.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* AI Analysis */}
          {feedback.aiAnalysis && (
            <div className="p-4 bg-primary-50 rounded-lg">
              <h4 className="text-sm font-medium text-primary-900 mb-2">AI Analysis</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Summary:</span> {feedback.aiAnalysis.summary}</p>
                {feedback.aiAnalysis.keywords?.length > 0 && (
                  <p>
                    <span className="font-medium">Keywords:</span>{' '}
                    {feedback.aiAnalysis.keywords.join(', ')}
                  </p>
                )}
                {feedback.aiAnalysis.suggestedActions?.length > 0 && (
                  <div>
                    <span className="font-medium">Suggested Actions:</span>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {feedback.aiAnalysis.suggestedActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions (moved outside component to avoid re-creation)
function getCategoryIcon(category) {
  const icons = {
    bug: Bug,
    feature: Lightbulb,
    general: MessageCircle,
    improvement: TrendingUp,
    complaint: AlertTriangle,
  };
  return icons[category] || MessageCircle;
}

function getCategoryColor(category) {
  const colors = {
    bug: 'text-error-600 bg-error-50',
    feature: 'text-primary-600 bg-primary-50',
    general: 'text-gray-600 bg-gray-50',
    improvement: 'text-success-600 bg-success-50',
    complaint: 'text-warning-600 bg-warning-50',
  };
  return colors[category] || 'text-gray-600 bg-gray-50';
}

function getStatusColor(status) {
  const colors = {
    open: 'bg-primary-100 text-primary-800',
    'in-progress': 'bg-warning-100 text-warning-800',
    resolved: 'bg-success-100 text-success-800',
    closed: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-primary-100 text-primary-800';
}