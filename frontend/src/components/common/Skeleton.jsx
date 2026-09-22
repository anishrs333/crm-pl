import React from 'react';
import './Skeleton.css';

export const Skeleton = ({
  width = '100%',
  height = '20px',
  borderRadius,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`crm-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: borderRadius || 'var(--radius-sm)',
        ...style,
      }}
    />
  );
};

export const LoadingSpinner = ({
  message = 'Loading CRM data...',
  size = 36,
  className = '',
}) => {
  return (
    <div className={`spinner-wrapper ${className}`} role="status">
      <div
        className="crm-spinner"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {message && (
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {message}
        </span>
      )}
    </div>
  );
};
