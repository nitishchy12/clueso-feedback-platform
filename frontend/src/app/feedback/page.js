'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Filter, 
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import Navbar from '@/components/Navbar';
import FeedbackForm from '@/components/FeedbackForm';
import FeedbackList from '@/components/FeedbackList';

import { authService, feedbackService } from '@/services/api';
import { useSocket } from '@/services/socket';

export default function FeedbackPage() {
  const router = useRouter();
  const socket = useSocket();
  
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    priority: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  useEffect(() => {
    initializePage();
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

  useEffect(() => {
    loadFeedback();
  }, [filters, pagination.currentPage]);

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

      // Load initial feedback
      await loadFeedback();
    } catch (error) {
      console.error('Page initialization error:', error);
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const loadFeedback = async () => {
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await feedbackService.getAllFeedback(params);
      setFeedback(response.feedback || []);
      setPagination(prev => ({
        ...prev,
        ...response.pagination
      }));
    } catch (error) {
      console.error('Error loading feedback:', error);
      toast.error('Failed to load feedback');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadFeedback();
      toast.success('Feedback refreshed');
    } catch (error) {
      toast.error('Failed to refresh feedback');
    } finally {
      setRefreshing(false);
    }
  };

  const handleNewFeedback = (data) => {
    // Add new feedback to the list if it matches current filters
    const newFeedback = {
      _id: data.id,
      title: data.title,
      category: data.category,
      priority: data.priority,
      status: 'open',
      userId: { name: data.user.name, email: data.user.email },
      createdAt: data.createdAt
    };

    setFeedback(prev => [newFeedback, ...prev.slice(0, pagination.itemsPerPage - 1)]);
    setPagination(prev => ({
      ...prev,
      totalItems: prev.totalItems + 1
    }));
  };

  const handleFeedbackUpdate = (data) => {
    setFeedback(prev => 
      prev.map(item => 
        item._id === data.id 
          ? { ...item, status: data.status, updatedAt: data.updatedAt }
          : item
      )
    );
  };

  const handleFeedbackDelete = (data) => {
    setFeedback(prev => prev.filter(item => item._id !== data.id));
    setPagination(prev => ({
      ...prev,
      totalItems: Math.max(0, prev.totalItems - 1)
    }));
  };

  const handleFeedbackSubmitted = () => {
    setShowFeedbackForm(false);
    loadFeedback(); // Refresh the list
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 text-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">All Feedback</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and review all feedback submissions
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

        {/* Filters */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search feedback..."
                  className="input pl-10"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <select
                className="input"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="general">General</option>
                <option value="improvement">Improvement</option>
                <option value="complaint">Complaint</option>
              </select>

              {/* Status Filter */}
              <select
                className="input"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              {/* Priority Filter */}
              <select
                className="input"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Feedback ({pagination.totalItems})
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live Updates</span>
              </div>
            </div>
          </div>
          
          <div className="card-body p-0">
            <FeedbackList 
              feedback={feedback}
              showPagination={false}
              compact={false}
              onFeedbackUpdate={loadFeedback}
            />
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} results
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <span className="text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
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