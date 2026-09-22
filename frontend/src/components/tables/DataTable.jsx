import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit2, Trash2 } from 'lucide-react';
import { EmptyState, ErrorState } from '../common/EmptyState';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './DataTable.css';

export const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  sortBy,
  sortOrder = 'asc',
  onSort,
  onView,
  onEdit,
  onDelete,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records to display.',
  emptyActionText,
  onEmptyAction,
  className = '',
}) => {
  const hasActions = Boolean(onView || onEdit || onDelete);

  const handleHeaderClick = (col) => {
    if (!col.sortable || !onSort) return;
    const isCurrent = sortBy === col.key;
    const newOrder = isCurrent && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(col.key, newOrder);
  };

  if (isError) {
    return (
      <div className="crm-table-container">
        <ErrorState
          title="Failed to load table data"
          message={errorMessage}
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <div className={`crm-table-container ${className}`}>
      <div className="crm-table-responsive">
        <table className="crm-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.sortable ? 'sortable' : ''}
                  onClick={() => handleHeaderClick(col)}
                  style={{ textAlign: col.align || 'left', width: col.width }}
                >
                  <span className="th-content">
                    {col.label}
                    {col.sortable && (
                      sortBy === col.key ? (
                        sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={13} color="#94a3b8" />
                      )
                    )}
                  </span>
                </th>
              ))}

              {hasActions && (
                <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  style={{ padding: '40px 0' }}
                >
                  <LoadingSpinner message="Fetching records..." />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  style={{ padding: 0 }}
                >
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionText={emptyActionText}
                    onAction={onEmptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row[keyField] || index}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}

                  {hasActions && (
                    <td>
                      <div className="table-row-actions">
                        {onView && (
                          <button
                            type="button"
                            className="table-action-icon-btn"
                            onClick={() => onView(row)}
                            title="View details"
                            aria-label="View details"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            type="button"
                            className="table-action-icon-btn btn-edit"
                            onClick={() => onEdit(row)}
                            title="Edit record"
                            aria-label="Edit record"
                          >
                            <Edit2 size={15} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            className="table-action-icon-btn btn-delete"
                            onClick={() => onDelete(row)}
                            title="Delete record"
                            aria-label="Delete record"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
