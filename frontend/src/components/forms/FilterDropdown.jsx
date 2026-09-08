import React from 'react';
import './FilterDropdown.css';

export const FilterDropdown = ({
  label,
  value,
  onChange,
  options = [],
  className = '',
}) => {
  return (
    <div className={`crm-filter-wrapper ${className}`}>
      {label && <span className="crm-filter-label">{label}:</span>}
      <select
        className="crm-filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
