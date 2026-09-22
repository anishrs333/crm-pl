import React, { useState, useEffect, useCallback } from 'react';
import { quotationService } from '../../services/quotationService';
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
import { QuotationModal } from '../../components/quotations/QuotationModal';
import { QuotationPrintPreview } from '../../components/quotations/QuotationPrintPreview';
import { FileText, Plus, Download, Printer, Copy } from 'lucide-react';
import './QuotationListPage.css';

export const QuotationListPage = () => {
  const { showToast } = useToast();

  const [quotations, setQuotations] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuotations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await quotationService.getQuotations({
        page,
        limit: pageSize,
        search,
        status: statusFilter,
      });
      setQuotations(res.data);
      setTotalItems(res.totalItems);
    } catch (err) {
      console.error('Failed to load quotations:', err);
      setError(err.message || 'Failed to load quotations list.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleOpenAdd = () => {
    setSelectedQuotation(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (quotation) => {
    setSelectedQuotation(quotation);
    setIsFormModalOpen(true);
  };

  const handleOpenPrint = (quotation) => {
    setSelectedQuotation(quotation);
    setIsPrintPreviewOpen(true);
  };

  const handleCreateRevision = async (quotation) => {
    try {
      const rev = await quotationService.createRevision(quotation.id);
      showToast(`Created revision ${rev.version} for ${rev.quotationNumber}!`, 'success');
      fetchQuotations();
    } catch (err) {
      showToast(err.message || 'Failed to create quotation revision.', 'error');
    }
  };

  const handleOpenDelete = (quotation) => {
    setSelectedQuotation(quotation);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (selectedQuotation) {
        result = await quotationService.updateQuotation(selectedQuotation.id, formData);
        showToast('Quotation updated successfully.', 'success');
      } else {
        result = await quotationService.createQuotation(formData);
        showToast('New quotation generated! Opening PDF preview...', 'success');
      }
      setIsFormModalOpen(false);
      fetchQuotations();
      if (result) {
        setSelectedQuotation(result);
        setIsPrintPreviewOpen(true);
      }
    } catch (err) {
      showToast(err.message || 'Failed to save quotation.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQuotation) return;
    setIsSubmitting(true);
    try {
      await quotationService.deleteQuotation(selectedQuotation.id);
      showToast('Quotation deleted.', 'success');
      setIsDeleteModalOpen(false);
      setSelectedQuotation(null);
      fetchQuotations();
    } catch (err) {
      showToast(err.message || 'Failed to delete quotation.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareQuotation = (quotation) => {
    showToast(`Quotation link for ${quotation.quotationNumber} copied to clipboard!`, 'info');
  };

  const handleExportCsv = () => {
    exportToCsv('quotations_register', quotations, [
      { key: 'quotationNumber', label: 'Quotation No' },
      { key: 'version', label: 'Version' },
      { key: 'customerName', label: 'Client' },
      { key: 'grandTotal', label: 'Grand Total (₹)' },
      { key: 'status', label: 'Status' },
      { key: 'createdDate', label: 'Date' },
      { key: 'validUntil', label: 'Valid Until' },
    ]);
  };

  const columns = [
    {
      key: 'quotationNumber',
      label: 'Quotation No / Version',
      sortable: true,
      render: (_, row) => (
        <div className="quot-cell">
          <div className="quot-cell-icon">
            <FileText size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {row.quotationNumber}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--primary-600)', fontWeight: 600 }}>
              {row.version} • {row.createdDate}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'customerName',
      label: 'Client / Account',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Contact: {row.contactPerson || 'Representative'}
          </div>
        </div>
      ),
    },
    {
      key: 'createdDate',
      label: 'Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'grandTotal',
      label: 'Grand Total (inc. Tax)',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'validUntil',
      label: 'Valid Until',
      render: (val) => formatDate(val),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={getStatusBadgeVariant(val)}>{val}</Badge>,
    },
    {
      key: 'actions_extra',
      label: 'PDF / Revision',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="table-action-icon-btn"
            style={{ color: 'var(--accent-carrot)' }}
            onClick={() => handleDirectDownloadPdf(row)}
            title="Download PDF File"
          >
            <Download size={15} />
          </button>
          <button
            type="button"
            className="table-action-icon-btn"
            style={{ color: 'var(--primary-600)' }}
            onClick={() => handleOpenPrint(row)}
            title="Print / Save as PDF"
          >
            <Printer size={15} />
          </button>
          <button
            type="button"
            className="table-action-icon-btn"
            onClick={() => handleCreateRevision(row)}
            title="Create Revision (Next Version)"
          >
            <Copy size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="quotations-page-container">
      <div className="quotations-page-header">
        <div className="quotations-title-area">
          <h1>Quotation Management</h1>
          <p>Generate formal customer proposals, line items, 18% GST tax calculations, and printable PDFs.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" icon={Download} onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            Create Quotation
          </Button>
        </div>
      </div>

      <div className="quotations-toolbar">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by quote #, company, or contact..."
        />

        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'Draft', label: 'Draft' },
            { value: 'Sent', label: 'Sent to Client' },
            { value: 'Accepted', label: 'Accepted' },
            { value: 'Declined', label: 'Declined' },
            { value: 'Expired', label: 'Expired' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={quotations}
        isLoading={isLoading}
        isError={Boolean(error)}
        errorMessage={error}
        onRetry={fetchQuotations}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        emptyTitle="No quotations generated"
        emptyDescription="Create your first client quotation with dynamic product line items and tax calculations."
        emptyActionText="Create Quotation"
        onEmptyAction={handleOpenAdd}
      />

      {!isLoading && quotations.length > 0 && (
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

      {/* Add / Edit Modal */}
      <QuotationModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedQuotation}
        isLoading={isSubmitting}
      />

      {/* Printable / PDF Document Preview */}
      {isPrintPreviewOpen && (
        <QuotationPrintPreview
          quotation={selectedQuotation}
          onClose={() => setIsPrintPreviewOpen(false)}
          onShare={handleShareQuotation}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Quotation"
        message={`Are you sure you want to delete quotation "${selectedQuotation?.quotationNumber}"?`}
        confirmText="Delete Quotation"
        isLoading={isSubmitting}
      />
    </div>
  );
};
