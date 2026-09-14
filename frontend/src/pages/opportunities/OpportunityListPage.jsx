import React, { useState, useEffect, useCallback } from 'react';
import { opportunityService } from '../../services/opportunityService';
import { useToast } from '../../hooks/useToast';
import { exportToCsv } from '../../utils/exportToCsv';
import { formatCurrency, formatDate, getStatusBadgeVariant } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/forms/SearchBar';
import { FilterDropdown } from '../../components/forms/FilterDropdown';
import { DataTable } from '../../components/tables/DataTable';
import { Pagination } from '../../components/tables/Pagination';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import { OpportunityModal } from '../../components/opportunities/OpportunityModal';
import { TrendingUp, Plus, Download } from 'lucide-react';
import './OpportunityListPage.css';

export const OpportunityListPage = () => {
  const { showToast } = useToast();

  const [opportunities, setOpportunities] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await opportunityService.getOpportunities({
        page,
        limit: pageSize,
        search,
        stage: stageFilter,
        assignedTo: assignedFilter,
      });
      setOpportunities(res.data);
      setTotalItems(res.totalItems);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
      setError(err.message || 'Failed to load sales opportunities.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, stageFilter, assignedFilter]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleOpenAdd = () => {
    setSelectedOpp(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (opp) => {
    setSelectedOpp(opp);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (opp) => {
    setSelectedOpp(opp);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedOpp) {
        await opportunityService.updateOpportunity(selectedOpp.id, formData);
        showToast('Sales opportunity updated.', 'success');
      } else {
        await opportunityService.createOpportunity(formData);
        showToast('New sales opportunity created.', 'success');
      }
      setIsFormModalOpen(false);
      setSelectedOpp(null);
      fetchOpportunities();
    } catch (err) {
      showToast(err.message || 'Failed to save opportunity.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOpp) return;
    setIsSubmitting(true);
    try {
      await opportunityService.deleteOpportunity(selectedOpp.id);
      showToast('Opportunity removed from pipeline.', 'success');
      setIsDeleteModalOpen(false);
      setSelectedOpp(null);
      fetchOpportunities();
    } catch (err) {
      showToast(err.message || 'Failed to delete opportunity.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    exportToCsv('sales_opportunities', opportunities, [
      { key: 'title', label: 'Opportunity Title' },
      { key: 'customerName', label: 'Customer' },
      { key: 'stage', label: 'Stage' },
      { key: 'dealValue', label: 'Value (₹)' },
      { key: 'probability', label: 'Probability (%)' },
      { key: 'expectedCloseDate', label: 'Closing Date' },
      { key: 'assignedTo', label: 'Salesperson' },
    ]);
  };

  const columns = [
    {
      key: 'title',
      label: 'Opportunity / Client',
      sortable: true,
      render: (_, row) => (
        <div className="opp-cell">
          <div className="opp-cell-icon">
            <TrendingUp size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.title}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {row.customerName} {row.contactPerson ? `• ${row.contactPerson}` : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'stage',
      label: 'Stage',
      render: (val) => (
        <Badge
          variant={
            val === 'Closed Won'
              ? 'success'
              : val === 'Closed Lost'
              ? 'danger'
              : val === 'Negotiation'
              ? 'purple'
              : 'warning'
          }
        >
          {val}
        </Badge>
      ),
    },
    {
      key: 'dealValue',
      label: 'Deal Value',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'probability',
      label: 'Win Probability',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '50px',
              height: '6px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${val}%`,
                height: '100%',
                backgroundColor: val >= 75 ? 'var(--success-solid)' : val >= 50 ? 'var(--primary-600)' : 'var(--warning-solid)',
              }}
            />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{val}%</span>
        </div>
      ),
    },
    {
      key: 'expectedCloseDate',
      label: 'Expected Close',
      render: (val) => formatDate(val),
    },
    {
      key: 'assignedTo',
      label: 'Salesperson',
      render: (val) => val || '—',
    },
  ];

  return (
    <div className="opportunities-page-container">
      <div className="opportunities-page-header">
        <div className="opportunities-title-area">
          <h1>Sales & Opportunity Pipeline</h1>
          <p>Track high-value prospects, closing probabilities, and stage velocity across your sales team.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" icon={Download} onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            New Opportunity
          </Button>
        </div>
      </div>

      <div className="opportunities-toolbar">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search opportunities or clients..."
        />

        <div className="opportunities-filters-group">
          <FilterDropdown
            label="Stage"
            value={stageFilter}
            onChange={(val) => {
              setStageFilter(val);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Stages' },
              { value: 'Qualification', label: 'Qualification' },
              { value: 'Proposal', label: 'Proposal Presented' },
              { value: 'Negotiation', label: 'Negotiation' },
              { value: 'Closed Won', label: 'Closed Won' },
              { value: 'Closed Lost', label: 'Closed Lost' },
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
        data={opportunities}
        isLoading={isLoading}
        isError={Boolean(error)}
        errorMessage={error}
        onRetry={fetchOpportunities}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        emptyTitle="No opportunities in pipeline"
        emptyDescription="Create your first opportunity to track deal closure stages."
        emptyActionText="Create Opportunity"
        onEmptyAction={handleOpenAdd}
      />

      {!isLoading && opportunities.length > 0 && (
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

      <OpportunityModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedOpp}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Opportunity"
        message={`Are you sure you want to delete "${selectedOpp?.title}"?`}
        confirmText="Delete Opportunity"
        isLoading={isSubmitting}
      />
    </div>
  );
};
