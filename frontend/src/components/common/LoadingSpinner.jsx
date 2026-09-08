import React from 'react';
import './Skeleton.css';

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
