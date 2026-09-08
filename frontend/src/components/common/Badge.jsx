import React from 'react';
import './Badge.css';

export const Badge = ({
  children,
  variant = 'neutral', // success | warning | danger | info | purple | neutral
  withDot = true,
  className = '',
}) => {
  return (
    <span className={`crm-badge crm-badge-${variant} ${className}`}>
      {withDot && <span className="crm-badge-dot" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};
export default Badge;
