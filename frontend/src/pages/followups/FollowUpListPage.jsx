import React, { useState, useEffect, useCallback } from 'react';
import { followUpService } from '../../services/followUpService';
import { useToast } from '../../hooks/useToast';
import { exportToCsv } from '../../utils/exportToCsv';
import { formatDateTime } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/forms/SearchBar';
import { FilterDropdown } from '../../components/forms/FilterDropdown';
import { DataTable } from '../../components/tables/DataTable';
import { Pagination } from '../../components/tables/Pagination';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import { FollowUpModal } from '../../components/followups/FollowUpModal';
import { PhoneCall, Calendar, Plus, Download, Check, Clock } from 'lucide-react';
import './FollowUpListPage.css';

export const FollowUpListPage = () => {
  const { showToast } = useToast();

  const [followUps, setFollowUps] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFollowUps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await followUpService.getFollowUps({
        page,
        limit: pageSize,
        search,
        status: statusFilter,
        type: typeFilter,
        assignedTo: assignedFilter,
      });
      setFollowUps(res.data);
      setTotalItems(res.totalItems);
    } catch (err) {
      console.error('Failed to load follow-ups:', err);
      setError(err.message || 'Failed to load scheduled follow-ups.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter, typeFilter, assignedFilter]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const handleToggleStatus = async (id) => {
    try {
      const updated = await followUpService.toggleStatus(id);
      showToast(
        updated.status === 'Completed'
          ? 'Follow-up marked as Completed! 🎉'
          : 'Follow-up returned to Pending status.',
        'info',
        2500
      );
      fetchFollowUps();
    } catch (err) {
      showToast(err.message || 'Failed to toggle status.', 'error');
    }
  };

  const handleOpenAdd = () => {
    setSelectedFollowUp(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (flw) => {
    setSelectedFollowUp(flw);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (flw) => {
    setSelectedFollowUp(flw);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedFollowUp) {
        await followUpService.updateFollowUp(selectedFollowUp.id, formData);
        showToast('Follow-up record updated.', 'success');
      } else {
        await followUpService.scheduleFollowUp(formData);
        showToast('New follow-up scheduled.', 'success');
      }
      setIsFormModalOpen(false);
      setSelectedFollowUp(null);
      fetchFollowUps();
    } catch (err) {
      showToast(err.message || 'Failed to save follow-up.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFollowUp) return;
    setIsSubmitting(true);
    try {
      await followUpService.deleteFollowUp(selectedFollowUp.id);
      showToast('Follow-up deleted.', 'success');
      setIsDeleteModalOpen(false);
      setSelectedFollowUp(null);
      fetchFollowUps();
    } catch (err) {
      showToast(err.message || 'Failed to delete follow-up.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    exportToCsv('follow_ups_schedule', followUps, [
      { key: 'title', label: 'Subject' },
      { key: 'entityName', label: 'Entity / Client' },
      { key: 'contactPerson', label: 'Contact Person' },
      { key: 'type', label: 'Type' },
      { key: 'scheduledDate', label: 'Date & Time' },
      { key: 'assignedTo', label: 'Assigned Salesperson' },
      { key: 'status', label: 'Status' },
    ]);
  };

  const columns = [
    {
      key: 'title',
      label: 'Follow-up Subject / Notes',
      sortable: true,
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.title}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {row.notes || 'No extra notes'}
          </div>
        </div>
      ),
    },
    {
      key: 'entityName',
      label: 'Client / Lead',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.entityName}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {row.contactPerson ? `${row.contactPerson} (${row.entityType})` : row.entityType}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Medium',
      render: (val) => (
        <Badge variant={val === 'Call' ? 'info' : val === 'Meeting' ? 'purple' : 'neutral'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'scheduledDate',
      label: 'Scheduled For',
      sortable: true,
      render: (val) => formatDateTime(val),
    },
    {
      key: 'assignedTo',
      label: 'Salesperson',
      render: (val) => val || '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => (
        <button
          type="button"
          className={`flw-status-btn ${
            val === 'Completed' ? 'flw-status-completed' : 'flw-status-pending'
          }`}
          onClick={() => handleToggleStatus(row.id)}
          title="Click to toggle status"
        >
          {val === 'Completed' ? <Check size={12} /> : <Clock size={12} />}
          <span>{val}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="followups-page-container">
      <div className="followups-page-header">
        <div className="followups-title-area">
          <h1>Follow-up Management</h1>
          <p>Schedule, track, and log all prospect interactions, phone calls, meetings, and next touches.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" icon={Download} onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            Schedule Follow-up
          </Button>
        </div>
      </div>

      <div className="followups-toolbar">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by subject, company, or contact..."
        />

        <div className="followups-filters-group">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Pending', label: 'Pending Follow-ups' },
              { value: 'Completed', label: 'Completed' },
            ]}
          />

          <FilterDropdown
            label="Medium"
            value={typeFilter}
            onChange={(val) => {
              setTypeFilter(val);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Types' },
              { value: 'Call', label: 'Phone Call' },
              { value: 'Meeting', label: 'Meeting' },
              { value: 'Email', label: 'Email' },
              { value: 'Demo', label: 'Product Demo' },
            ]}
          />

          <FilterDropdown
            label="Salesperson"
            value={assignedFilter}
            onChange={(val) => {
              setAssignedFilter(val);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Salespeople' },
              { value: 'Alex Rivera', label: 'Alex Rivera' },
              { value: 'Jessica Chen', label: 'Jessica Chen' },
              { value: 'Sarah Connor', label: 'Sarah Connor' },
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={followUps}
        isLoading={isLoading}
        isError={Boolean(error)}
        errorMessage={error}
        onRetry={fetchFollowUps}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        emptyTitle="No follow-ups scheduled"
        emptyDescription="Schedule client calls or meetings to stay ahead on your sales commitments."
        emptyActionText="Schedule Follow-up"
        onEmptyAction={handleOpenAdd}
      />

      {!isLoading && followUps.length > 0 && (
        <Pagination
          currentPage={page}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
        />
      )}

      <FollowUpModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedFollowUp}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Follow-up"
        message={`Are you sure you want to remove follow-up "${selectedFollowUp?.title}"?`}
        confirmText="Delete Follow-up"
        isLoading={isSubmitting}
      />
    </div>
  );
};
