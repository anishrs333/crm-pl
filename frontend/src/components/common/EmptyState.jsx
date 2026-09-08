import React from 'react';
import { Inbox, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import './EmptyState.css';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items matching your criteria or currently available in the system.',
  actionText,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div className={`crm-state-box ${className}`}>
      <div className="crm-state-icon-wrapper state-empty-icon">
        <Icon size={28} />
      </div>
      <h3 className="crm-state-title">{title}</h3>
      <p className="crm-state-description">{description}</p>
      {actionText && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          icon={actionIcon}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const ErrorState = ({
  title = 'Unable to load data',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`crm-state-box ${className}`} role="alert">
      <div className="crm-state-icon-wrapper state-error-icon">
        <AlertCircle size={28} />
      </div>
      <h3 className="crm-state-title">{title}</h3>
      <p className="crm-state-description">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          icon={RefreshCw}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
