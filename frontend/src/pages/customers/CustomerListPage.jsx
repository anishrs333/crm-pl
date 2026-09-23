import React, { useState, useEffect, useCallback } from 'react';
import { customerService } from '../../services/customerService';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, getInitials, getStatusBadgeVariant } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/forms/SearchBar';
import { FilterDropdown } from '../../components/forms/FilterDropdown';
import { DataTable } from '../../components/tables/DataTable';
import { Pagination } from '../../components/tables/Pagination';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import { CustomerModal } from '../../components/customers/CustomerModal';
import { CustomerDetailsModal } from '../../components/customers/CustomerDetailsModal';
import { Building2, Plus, UserCheck } from 'lucide-react';
import './CustomerListPage.css';

export const CustomerListPage = () => {
  const { showToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await customerService.getCustomers({
        page,
        limit: pageSize,
        search,
        stage: stageFilter,
      });
      setCustomers(res.data);
      setTotalItems(res.totalItems);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError(err.message || 'Failed to load customer list.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, stageFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleStageFilterChange = (val) => {
    setStageFilter(val);
    setPage(1);
  };

  const handleOpenAdd = () => {
    setSelectedCustomer(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleOpenDelete = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedCustomer) {
        await customerService.updateCustomer(selectedCustomer.id, formData);
        showToast('Customer details updated.', 'success');
      } else {
        await customerService.createCustomer(formData);
        showToast('New customer record added.', 'success');
      }
      setIsFormModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      showToast(err.message || 'Failed to save customer.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;
    setIsSubmitting(true);
    try {
      await customerService.deleteCustomer(selectedCustomer.id);
      showToast(`Customer ${selectedCustomer.companyName || selectedCustomer.name} deleted.`, 'success');
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      showToast(err.message || 'Failed to delete customer.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'companyName',
      label: 'Company / Organization',
      sortable: true,
      render: (_, row) => (
        <div className="company-cell">
          <div className="company-cell-icon">
            <Building2 size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
              {row.companyName || row.name || 'Corporate Client'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {row.email || row.industry || 'Client Account'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'contactPerson',
      label: 'Primary Contact Person',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {row.contactPerson || row.contact_person || 'Primary Representative'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {row.phone || 'Phone on record'}
          </div>
        </div>
      ),
    },
    {
      key: 'stage',
      label: 'Account Stage',
      render: (val) => (
        <Badge variant={getStatusBadgeVariant(val)}>
          {val || 'Active Account'}
        </Badge>
      ),
    },
    {
      key: 'dealValue',
      label: 'Contract Deal Value',
      render: (val, row) => (
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
          {formatCurrency(val ?? row.deal_value ?? 0)}
        </span>
      ),
    },
    {
      key: 'assignedTo',
      label: 'Assigned Account Rep',
      render: (val, row) => {
        const displayRep = val || row.account_manager_name || 'Unassigned';
        return (
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
              {getInitials(displayRep)}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {displayRep}
            </span>
          </div>
        );
      },
    },
    {
      key: 'city',
      label: 'Location',
      render: (val, row) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {val || row.city || 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="customers-page-container">
      <div className="customers-page-header">
        <div className="customers-title-area">
          <h1>Customers</h1>
          <p>Maintain client accounts, contractual values, and assigned sales representatives.</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add Customer
        </Button>
      </div>

      <div className="customers-toolbar">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by company, contact, or email..."
        />

        <FilterDropdown
          label="Stage"
          value={stageFilter}
          onChange={handleStageFilterChange}
          options={[
            { value: '', label: 'All Stages' },
            { value: 'Active', label: 'Active Account' },
            { value: 'Ongoing', label: 'Ongoing Lead / Prospect' },
            { value: 'Won', label: 'Closed Won' },
            { value: 'Lost', label: 'Closed Lost' },
            { value: 'Inactive', label: 'Inactive' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        isError={Boolean(error)}
        errorMessage={error}
        onRetry={fetchCustomers}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        emptyTitle="No customer accounts"
        emptyDescription="No customer records match your current filter selection."
        emptyActionText="Add Customer"
        onEmptyAction={handleOpenAdd}
      />

      {!isLoading && customers.length > 0 && (
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

      <CustomerModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCustomer}
        isLoading={isSubmitting}
      />

      <CustomerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        customer={selectedCustomer}
        onEdit={handleOpenEdit}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={`Are you sure you want to remove "${selectedCustomer?.companyName}"? This action cannot be reversed.`}
        confirmText="Delete Customer"
        isLoading={isSubmitting}
      />
    </div>
  );
};
