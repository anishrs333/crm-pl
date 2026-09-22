import React from 'react';
import './FormField.css';

export const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  icon: Icon,
  options = [], // for select type
  disabled = false,
  className = '',
  rows = 3,
}) => {
  const isSelect = type === 'select';
  const isTextarea = type === 'textarea';

  return (
    <div className={`crm-form-group ${className}`}>
      {label && (
        <label className="crm-form-label" htmlFor={name}>
          {label}
          {required && <span className="crm-form-required">*</span>}
        </label>
      )}

      <div className="crm-form-control-wrapper">
        {Icon && !isSelect && !isTextarea && (
          <Icon size={16} className="crm-input-icon-left" />
        )}

        {isSelect ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`crm-select ${error ? 'has-error' : ''}`}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : isTextarea ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={`crm-textarea ${error ? 'has-error' : ''}`}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`crm-input ${Icon ? 'has-icon-left' : ''} ${
              error ? 'has-error' : ''
            }`}
          />
        )}
      </div>

      {error && <span className="crm-form-error-msg">{error}</span>}
      {!error && helperText && (
        <span className="crm-form-helper-text">{helperText}</span>
      )}
    </div>
  );
};
