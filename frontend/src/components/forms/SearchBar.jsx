import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

export const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  className = '',
}) => {
  return (
    <div className={`crm-search-bar ${className}`}>
      <Search size={16} className="crm-search-icon" />
      <input
        type="text"
        className="crm-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="crm-search-clear-btn"
          onClick={() => onChange('')}
          aria-label="Clear search query"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
