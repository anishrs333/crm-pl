import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './DashboardCard.css';

export const DashboardCard = ({
  title,
  value,
  icon: Icon,
  variant = 'primary', // primary | success | warning | danger | info
  trend,               // e.g. "+14.5%" or "-2.4%"
  trendType = 'positive', // positive | negative | neutral
  subtitle = 'vs last month',
  className = '',
}) => {
  const isPositive = trendType === 'positive';
  const isNegative = trendType === 'negative';

  return (
    <div className={`metric-card ${className}`}>
      <div className="metric-card-top">
        <span className="metric-title">{title}</span>
        {Icon && (
          <div className={`metric-icon-box metric-icon-${variant}`}>
            <Icon size={22} />
          </div>
        )}
      </div>

      <div className="metric-value-row">
        <span className="metric-value">{value}</span>
        {trend && (
          <span
            className={`metric-trend ${
              isPositive
                ? 'trend-positive'
                : isNegative
                ? 'trend-negative'
                : 'trend-neutral'
            }`}
          >
            {isPositive && <ArrowUpRight size={13} />}
            {isNegative && <ArrowDownRight size={13} />}
            {trend}
          </span>
        )}
      </div>

      {subtitle && <span className="metric-subtitle">{subtitle}</span>}
    </div>
  );
};
