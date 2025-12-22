'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Clock,
  Plus,
  RefreshCw,
  BarChart3,
  AlertCircle
} from 'lucide-react';

import Navbar from '@/components/Navbar';
import FeedbackForm from '@/components/FeedbackForm';
import FeedbackList from '@/components/FeedbackList';
import InsightsPanel from '@/components/InsightsPanel';
import StatsCard from '@/components/StatsCard';

import { authService, feedbackService, insightsService } from '@/services/api';
import { useSocket } from '@/services/socket';

export default function DashboardPage() {
  const router = useRouter();
  const socket = useSocket();
  
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [insights, setInsights] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeDashboard();
  }, []);

  useEffect(() => {
    if (user) {
      // Connect to socket and setup listeners
      socket.connect(user.id);
      
      const unsubscribeFeedbackNew = socket.on('feedback:new', handleNewFeedback);
      const unsubscribeFeedbackUpdated = socket.on('feedback:updated', handleFeedbackUpdate);
      const unsubscribeFeedbackDeleted = socket.on('feedback:deleted', handleFeedbackDelete);

      return () => {
        unsubscribeFeedbackNew();
        unsubscribeFeedbackUpdated();
        unsubscribeFeedbackDeleted();
      };
    }
  }, [user]);

  const initializeDashboard = async () => {
    try {
      // Check authentication
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      // Get user profile
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      // Load dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [statsResponse, insightsResponse] = await Promise.all([
        feedbackService.getFeedbackStats(),
        insightsService.getInsights().catch(() => null) // Don't fail if insights fail
      ]);

      setStats(statsResponse.stats);
      setRecentFeedback(statsResponse.recentFeedback || []);
      setInsights(insightsResponse?.insights || null);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load some dashboard data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
      toast.success('Dashboard refreshed');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  const handleNewFeedback = (data) => {
    // Update stats
    setStats(prev => prev ? {
      ...prev,
      total: prev.total + 1,
      categoryDistribution: {
        ...prev.categoryDistribution,
        [data.category]: (prev.categoryDistribution[data.category] || 0) + 1
      }
    } : null);

    // Add to recent feedback
    setRecentFeedback(prev => [
      {
        _id: data.id,
        title: data.title,
        category: data.category,
        priority: data.priority,
        userId: { name: data.user.name, email: data.user.email },
        createdAt: data.createdAt
      },
      ...prev.slice(0, 4) // Keep only 5 most recent
    ]);
  };

  const handleFeedbackUpdate = (data) => {
    setRecentFeedback(prev => 
      prev.map(feedback => 
        feedback._id === data.id 
          ? { ...feedback, status: data.status, updatedAt: data.updatedAt }
          : feedback
      )
    );
  };

  const handleFeedbackDelete = (data) => {
    setRecentFeedback(prev => prev.filter(feedback => feedback._id !== data.id));
    
    // Update stats
    setStats(prev => prev ? {
      ...prev,
      total: Math.max(0, prev.total - 1)
    } : null);
  };

  const handleFeedbackSubmitted = () => {
    setShowFeedbackForm(false);
    loadDashboardData(); // Refresh data
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 text-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Here's what's happening with your feedback today.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Feedback
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Feedback"
              value={stats.total}
              icon={MessageSquare}
              color="primary"
              trend={stats.total > 0 ? '+12%' : null}
            />
            <StatsCard
              title="Open Issues"
              value={stats.statusDistribution?.open || 0}
              icon={AlertCircle}
              color="warning"
            />
            <StatsCard
              title="Resolved"
              value={stats.statusDistribution?.resolved || 0}
              icon={TrendingUp}
              color="success"
            />
            <StatsCard
              title="Positive Sentiment"
              value={stats.sentimentDistribution?.positive || 0}
              icon={Users}
              color="success"
              percentage={stats.total > 0 ? Math.round((stats.sentimentDistribution?.positive || 0) / stats.total * 100) : 0}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Feedback */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Feedback</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-500">Live</span>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <FeedbackList 
                  feedback={recentFeedback} 
                  showPagination={false}
                  compact={true}
                  onFeedbackUpdate={loadDashboardData}
                />
                {recentFeedback.length === 0 && (
                  <div className="p-6 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">No feedback yet</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Get started by submitting your first feedback.
                    </p>
                    <button
                      onClick={() => setShowFeedbackForm(true)}
                      className="btn-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feedback
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Insights Panel */}
          <div className="lg:col-span-1">
            <InsightsPanel insights={insights} />
            
            {/* Quick Stats */}
            {stats && (
              <div className="card mt-6">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Quick Stats
                  </h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {/* Category Distribution */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">By Category</h4>
                      <div className="space-y-2">
                        {Object.entries(stats.categoryDistribution || {}).map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">{category}</span>
                            <span className="text-sm font-medium text-gray-900">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Distribution */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">By Status</h4>
                      <div className="space-y-2">
                        {Object.entries(stats.statusDistribution || {}).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">{status.replace('-', ' ')}</span>
                            <span className="text-sm font-medium text-gray-900">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <FeedbackForm
          onClose={() => setShowFeedbackForm(false)}
          onSubmit={handleFeedbackSubmitted}
        />
      )}
    </div>
  );
}