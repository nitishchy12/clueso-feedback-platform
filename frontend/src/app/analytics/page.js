'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart,
  Activity,
  Calendar
} from 'lucide-react';

import Navbar from '@/components/Navbar';
import { authService, feedbackService } from '@/services/api';

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      // Check authentication
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      // Get user profile
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      // Load stats
      const statsResponse = await feedbackService.getFeedbackStats();
      setStats(statsResponse.stats);
    } catch (error) {
      console.error('Page initialization error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 text-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Detailed insights and trends from your feedback data
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Feedback</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.total || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.total || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-success-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response Time <span className="italic text-gray-500">(Simulated)</span></p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">2.4h</p>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-warning-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Feedback by Category
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {stats && Object.entries(stats.categoryDistribution || {}).map(([category, count]) => {
                  const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                        <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Feedback by Status
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {stats && Object.entries(stats.statusDistribution || {}).map(([status, count]) => {
                  const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  const colorClass = 
                    status === 'open' ? 'bg-primary-600' :
                    status === 'in-progress' ? 'bg-warning-600' :
                    status === 'resolved' ? 'bg-success-600' :
                    'bg-gray-600';
                  
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {status.replace('-', ' ')}
                        </span>
                        <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${colorClass} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="card lg:col-span-2">
            <div className="card-header">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">Sentiment Analysis</h3>
                <span
                  title="Sentiment analysis is currently rule-based using keyword matching"
                  className="text-gray-400 cursor-help text-sm"
                >
                  ⓘ
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-3 gap-6">
                {stats && Object.entries(stats.sentimentDistribution || {}).map(([sentiment, count]) => {
                  const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  const colorClass = 
                    sentiment === 'positive' ? 'text-success-600 bg-success-50' :
                    sentiment === 'negative' ? 'text-error-600 bg-error-50' :
                    'text-gray-600 bg-gray-50';
                  
                  return (
                    <div key={sentiment} className={`p-6 rounded-lg ${colorClass}`}>
                      <p className="text-sm font-medium capitalize mb-2">{sentiment}</p>
                      <p className="text-3xl font-bold">{count}</p>
                      <p className="text-sm mt-1">{percentage}% of total</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-8 card">
          <div className="card-body text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">More Analytics Coming Soon</h3>
            <p className="text-gray-600">
              We're working on adding more detailed analytics including time-series charts,
              user engagement metrics, and advanced filtering options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}