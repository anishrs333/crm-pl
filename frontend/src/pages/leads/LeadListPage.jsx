import React, { useState, useEffect, useCallback } from 'react';
import { leadService } from '../../services/leadService';
import { customerService } from '../../services/customerService';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, getStatusBadgeVariant, getInitials } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/forms/SearchBar';
import { FilterDropdown } from '../../components/forms/FilterDropdown';
import { DataTable } from '../../components/tables/DataTable';
import { Pagination } from '../../components/tables/Pagination';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import { LeadModal } from '../../components/leads/LeadModal';
import { LeadDetailsModal } from '../../components/leads/LeadDetailsModal';
import { Flame, Plus } from 'lucide-react';
import './LeadListPage.css';

export const LeadListPage = () => {
  const { showToast } = useToast();

  const [leads, setLeads] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeads = useCallback(async (overrideFilters = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const activeSearch = overrideFilters && overrideFilters.search !== undefined ? overrideFilters.search : search;
      const activeStatus = overrideFilters && overrideFilters.status !== undefined ? overrideFilters.status : statusFilter;
      const activeSource = overrideFilters && overrideFilters.source !== undefined ? overrideFilters.source : sourceFilter;
      const activePage = overrideFilters && overrideFilters.page !== undefined ? overrideFilters.page : page;

      const res = await leadService.getLeads({
        page: activePage,
        limit: pageSize,
        search: activeSearch,
        status: activeStatus,
        source: activeSource,
      });
      setLeads(res.data);
      setTotalItems(res.totalItems);
    } catch (err) {
      console.error('Failed to load leads:', err);
      setError(err.message || 'Failed to load leads pipeline.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter, sourceFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleOpenAdd = () => {
    setSelectedLead(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setSelectedLead(lead);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (lead) => {
    setSelectedLead(lead);
    setIsDetailsModalOpen(true);
  };

  const handleOpenDelete = (lead) => {
    setSelectedLead(lead);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedLead) {
        const updated = await leadService.updateLead(selectedLead.id, formData);
        showToast('Lead details updated successfully.', 'success');
        setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updated : l)));
        setIsFormModalOpen(false);
        setSelectedLead(null);
        await fetchLeads();
      } else {
        const created = await leadService.createLead(formData);
        showToast('New lead added to sales pipeline.', 'success');
        setStatusFilter('');
        setSourceFilter('');
        setSearch('');
        setPage(1);
        setIsFormModalOpen(false);
        setSelectedLead(null);
        setLeads((prev) => [created, ...prev.filter((l) => String(l.id) !== String(created.id))]);
        await fetchLeads({ page: 1, search: '', status: '', source: '' });
      }
    } catch (err) {
      showToast(err.message || 'Failed to save lead.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLead) return;
    setIsSubmitting(true);
    try {
      await leadService.deleteLead(selectedLead.id);
      showToast(`Lead "${selectedLead.name}" deleted.`, 'success');
      setIsDeleteModalOpen(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (err) {
      showToast(err.message || 'Failed to delete lead.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert Lead to Customer
  const handleConvertToCustomer = async (lead) => {
    try {
      await customerService.createCustomer({
        companyName: lead.name,
        contactPerson: lead.contactName,
        email: lead.email,
        phone: lead.phone,
        stage: 'Active',
        dealValue: lead.estimatedValue,
        assignedTo: lead.assignedTo,
        city: 'Converted Lead',
      });
      await leadService.updateLead(lead.id, { status: 'Won' });
      showToast(`🎉 Lead "${lead.name}" converted to an Active Customer!`, 'success', 4500);
      setIsDetailsModalOpen(false);
      fetchLeads();
    } catch (err) {
      showToast(err.message || 'Failed to convert lead.', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Company / Lead',
      sortable: true,
      render: (_, row) => (
        <div className="lead-cell">
          <div className="lead-cell-icon">
            <Flame size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {row.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {row.contactName}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (val) => val,
    },
    {
      key: 'estimatedValue',
      label: 'Est. Value',
      render: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'score',
      label: 'Score',
      render: (val) => (
        <Badge variant={val >= 70 ? 'success' : val >= 50 ? 'warning' : 'neutral'}>
          {val || 50} pts
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={getStatusBadgeVariant(val)}>{val}</Badge>,
    },
    {
      key: 'assignedTo',
      label: 'Assigned Rep',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-700)',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getInitials(val || 'Unassigned')}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {val || 'Unassigned'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="leads-page-container">
      <div className="leads-page-header">
        <div className="leads-title-area">
          <h1>Leads Pipeline</h1>
          <p>Track potential clients from initial acquisition through qualification and conversion.</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add Lead
        </Button>
      </div>

      <div className="leads-toolbar">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by company, contact, or email..."
        />

        <div className="leads-filters-group">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'New', label: 'New' },
              { value: 'Contacted', label: 'Contacted' },
              { value: 'Qualified', label: 'Qualified' },
              { value: 'Proposal', label: 'Proposal' },
              { value: 'Won', label: 'Won' },
              { value: 'Lost', label: 'Lost' },
            ]}
          />

          <FilterDropdown
            label="Source"
            value={sourceFilter}
            onChange={(val) => {
              setSourceFilter(val);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Sources' },
              { value: 'Website', label: 'Website' },
              { value: 'LinkedIn', label: 'LinkedIn' },
              { value: 'Referral', label: 'Referral' },
              { value: 'Cold Call', label: 'Cold Call' },
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={leads}
        isLoading={isLoading}
        isError={Boolean(error)}
        errorMessage={error}
        onRetry={fetchLeads}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        emptyTitle="No leads in pipeline"
        emptyDescription="No leads found matching your criteria. Add new prospects to grow pipeline."
        emptyActionText="Create Lead"
        onEmptyAction={handleOpenAdd}
      />

      {!isLoading && leads.length > 0 && (
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

      <LeadModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedLead}
        isLoading={isSubmitting}
      />

      <LeadDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        lead={selectedLead}
        onEdit={handleOpenEdit}
        onConvertToCustomer={handleConvertToCustomer}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Sales Lead"
        message={`Are you sure you want to delete lead "${selectedLead?.name}"?`}
        confirmText="Delete Lead"
        isLoading={isSubmitting}
      />
    </div>
  );
};
