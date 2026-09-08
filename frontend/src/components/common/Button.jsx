import React from 'react';
import './Button.css';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary', // primary | secondary | outline | danger | ghost
  size = 'md',        // sm | md | lg
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  rightIcon: RightIcon,
  className = '',
  onClick,
  ...rest
}) => {
  return (
    <button
      type={type}
      className={`crm-btn crm-btn-${variant} crm-btn-${size} ${
        fullWidth ? 'full-width' : ''
      } ${isLoading ? 'is-loading' : ''} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {isLoading ? (
        <span className="crm-btn-spinner" aria-hidden="true" />
      ) : (
        Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      )}

      <span>{children}</span>

      {!isLoading && RightIcon && (
        <RightIcon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      )}
    </button>
  );
};
