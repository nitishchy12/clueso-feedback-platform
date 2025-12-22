'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { X, Send, AlertCircle } from 'lucide-react';
import { feedbackService } from '@/services/api';

export default function FeedbackForm({ onClose, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const categories = [
    { value: 'bug', label: 'Bug Report', description: 'Something is broken or not working' },
    { value: 'feature', label: 'Feature Request', description: 'Suggest a new feature or improvement' },
    { value: 'general', label: 'General Feedback', description: 'General comments or suggestions' },
    { value: 'improvement', label: 'Improvement', description: 'Enhance existing functionality' },
    { value: 'complaint', label: 'Complaint', description: 'Report an issue or concern' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-600' },
    { value: 'medium', label: 'Medium', color: 'text-warning-600' },
    { value: 'high', label: 'High', color: 'text-error-600' },
    { value: 'critical', label: 'Critical', color: 'text-error-700' },
  ];

  const onFormSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      await feedbackService.createFeedback(data);
      toast.success('Feedback submitted successfully!');
      reset();
      onSubmit?.();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit feedback';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Submit Feedback</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              {...register('title', {
                required: 'Title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters',
                },
                maxLength: {
                  value: 100,
                  message: 'Title cannot exceed 100 characters',
                },
              })}
              type="text"
              className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="Brief summary of your feedback"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-error-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register('category', {
                required: 'Please select a category',
              })}
              className={`input ${errors.category ? 'input-error' : ''}`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-error-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.category.message}
              </p>
            )}
            
            {/* Category descriptions */}
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((category) => (
                <div key={category.value} className="text-xs text-gray-500">
                  <span className="font-medium">{category.label}:</span> {category.description}
                </div>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              {...register('priority')}
              className="input"
              defaultValue="medium"
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              How urgent is this feedback? Default is Medium.
            </p>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              {...register('message', {
                required: 'Message is required',
                minLength: {
                  value: 10,
                  message: 'Message must be at least 10 characters',
                },
                maxLength: {
                  value: 1000,
                  message: 'Message cannot exceed 1000 characters',
                },
              })}
              rows={6}
              className={`input resize-none ${errors.message ? 'input-error' : ''}`}
              placeholder="Describe your feedback in detail. Include steps to reproduce if reporting a bug, or explain your use case for feature requests."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-error-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.message.message}
              </p>
            )}
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Be specific and provide context for better assistance</span>
              <span>Min 10, Max 1000 characters</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <h4 className="text-sm font-medium text-primary-900 mb-2">💡 Tips for great feedback:</h4>
          <ul className="text-xs text-primary-800 space-y-1">
            <li>• Be specific about what you experienced</li>
            <li>• Include steps to reproduce issues</li>
            <li>• Mention your browser/device if relevant</li>
            <li>• Suggest solutions if you have ideas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}