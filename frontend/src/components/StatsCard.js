'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary',
  trend,
  percentage,
  description 
}) {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      icon: 'text-primary-600',
      text: 'text-primary-600'
    },
    success: {
      bg: 'bg-success-50',
      icon: 'text-success-600',
      text: 'text-success-600'
    },
    warning: {
      bg: 'bg-warning-50',
      icon: 'text-warning-600',
      text: 'text-warning-600'
    },
    error: {
      bg: 'bg-error-50',
      icon: 'text-error-600',
      text: 'text-error-600'
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      text: 'text-gray-600'
    }
  };

  const colors = colorClasses[color] || colorClasses.primary;

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = (trendValue) => {
    if (!trendValue) return null;
    
    const isPositive = trendValue.startsWith('+');
    return isPositive ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trendValue) => {
    if (!trendValue) return '';
    
    const isPositive = trendValue.startsWith('+');
    return isPositive ? 'text-success-600' : 'text-error-600';
  };

  const TrendIcon = getTrendIcon(trend);

  return (
    <div className="card hover:shadow-medium transition-shadow duration-200">
      <div className="card-body">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
              <Icon className={`h-4 w-4 ${colors.icon}`} />
            </div>
          </div>
          
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatValue(value)}
                  {percentage !== undefined && (
                    <span className="text-sm font-medium text-gray-500 ml-1">
                      ({percentage}%)
                    </span>
                  )}
                </div>
                
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${getTrendColor(trend)}`}>
                    {TrendIcon && <TrendIcon className="h-3 w-3 mr-0.5 flex-shrink-0" />}
                    {trend}
                  </div>
                )}
              </dd>
              
              {description && (
                <dd className="text-xs text-gray-500 mt-1">
                  {description}
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}