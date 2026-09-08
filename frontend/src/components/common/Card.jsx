import React from 'react';
import './Card.css';

export const Card = ({
  children,
  className = '',
  hoverable = false,
  ...rest
}) => {
  return (
    <div
      className={`crm-card ${hoverable ? 'hoverable' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`crm-card-header ${className}`}>
      <div>
        {title && <h3 className="crm-card-title">{title}</h3>}
        {subtitle && <p className="crm-card-subtitle">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="crm-card-header-action">{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className = '', noPadding = false }) => {
  return (
    <div
      className={`crm-card-body ${className}`}
      style={noPadding ? { padding: 0 } : undefined}
    >
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => {
  return <div className={`crm-card-footer ${className}`}>{children}</div>;
};
