'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { insightsService } from '@/services/api';

export default function InsightsPanel({ insights: initialInsights }) {
  const [insights, setInsights] = useState(initialInsights);
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    loadAIStatus();
  }, []);

  const loadAIStatus = async () => {
    try {
      const status = await insightsService.getAIStatus();
      setAiStatus(status);
    } catch (error) {
      console.error('Failed to load AI status:', error);
    }
  };

  const refreshInsights = async () => {
    setLoading(true);
    try {
      const response = await insightsService.getInsights();
      setInsights(response.insights);
    } catch (error) {
      console.error('Failed to refresh insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
          </div>
          <button
            onClick={refreshInsights}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* AI Status */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              aiStatus?.aiEnabled ? 'bg-success-400' : 'bg-warning-400'
            }`}></div>
            <span className="text-sm font-medium text-gray-700">
              {aiStatus?.service || 'AI Service'}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {aiStatus?.aiEnabled 
              ? 'AI analysis is active and processing feedback'
              : 'Using mock AI service for demonstration'
            }
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="spinner w-6 h-6 text-primary-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Generating insights...</p>
          </div>
        )}

        {/* Insights Content */}
        {!loading && insights && (
          <div className="space-y-6">
            {/* Summary */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1 text-success-500" />
                Summary
              </h4>
              <p className="text-sm text-gray-900 leading-relaxed">
                {insights.summary}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Based on {insights.totalAnalyzed} feedback submissions
              </div>
            </div>

            {/* Trends */}
            {insights.trends && insights.trends.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-primary-500" />
                  Key Trends
                </h4>
                <div className="space-y-2">
                  {insights.trends.map((trend, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{trend}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-1 text-warning-500" />
                  Recommendations
                </h4>
                <div className="space-y-3">
                  {insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-3 bg-warning-50 rounded-lg border-l-4 border-warning-400">
                      <p className="text-sm text-warning-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated timestamp */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* No Insights State */}
        {!loading && !insights && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-sm font-medium text-gray-900 mb-2">No insights available</h4>
            <p className="text-sm text-gray-500 mb-4">
              Submit some feedback to generate AI-powered insights and recommendations.
            </p>
            <button
              onClick={refreshInsights}
              className="btn-outline text-sm"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty Insights State */}
        {!loading && insights && insights.totalAnalyzed === 0 && (
          <div className="text-center py-6">
            <Brain className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-gray-900 mb-2">Ready for Analysis</h4>
            <p className="text-sm text-gray-500">
              AI insights will appear here once you have feedback to analyze.
            </p>
          </div>
        )}
      </div>

      {/* AI Capabilities Footer */}
      {aiStatus?.capabilities && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <details className="group">
            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
              AI Capabilities
            </summary>
            <div className="mt-2 space-y-1">
              {aiStatus.capabilities.map((capability, index) => (
                <div key={index} className="text-xs text-gray-500 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-success-400" />
                  {capability}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}