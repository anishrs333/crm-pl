import React, { useState, useEffect, useCallback } from 'react';
import { productService } from '../../services/productService';
import { useToast } from '../../hooks/useToast';
import { exportToCsv } from '../../utils/exportToCsv';
import { formatCurrency, getStatusBadgeVariant } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/forms/SearchBar';
import { FilterDropdown } from '../../components/forms/FilterDropdown';
import { DataTable } from '../../components/tables/DataTable';
import { Pagination } from '../../components/tables/Pagination';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import { ProductModal } from '../../components/products/ProductModal';
import { Package, Plus, Download } from 'lucide-react';
import './ProductListPage.css';

export const ProductListPage = () => {
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productService.getProducts({
        page,
        limit: pageSize,
        search,
        category: categoryFilter,
        status: statusFilter,
      });
      setProducts(res.data);
      setTotalItems(res.totalItems);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Failed to load product catalog.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, formData);
        showToast('Product updated successfully.', 'success');
      } else {
        await productService.createProduct(formData);
        showToast('New product added to catalog.', 'success');
      }
      setIsFormModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to save product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await productService.deleteProduct(selectedProduct.id);
      showToast(`Product ${selectedProduct.name} deleted.`, 'success');
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to delete product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    exportToCsv('products_catalog', products, [
      { key: 'code', label: 'Product Code' },
      { key: 'name', label: 'Product Name' },
      { key: 'category', label: 'Category' },
      { key: 'unitPrice', label: 'Unit Price' },
      { key: 'taxPercentage', label: 'Tax %' },
      { key: 'status', label: 'Status' },
    ]);
  };

  const columns = [
    {
      key: 'code',
      label: 'Product / SKU',
      sortable: true,
      render: (_, row) => (
        <div className="product-cell">
          <div className="product-cell-icon">
            <Package size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{row.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (val) => val,
    },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'taxPercentage',
      label: 'Tax (GST)',
      render: (val) => `${val}%`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={getStatusBadgeVariant(val)}>{val}</Badge>,
    },
  ];

  return (
    <div className="products-page-container">
      <div className="products-page-header">
        <div className="products-title-area">
          <h1>Product & Service Catalog</h1>
          <p>Manage deliverables, pricing rules, tax rates, and SKUs used in quotation generation.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" icon={Download} onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            Add Product/Service
          </Button>
        </div>
      </div>

      <div className="products-toolbar">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by code, title, description..."
        />

        <div className="products-filters-group">
          <FilterDropdown
            label="Category"
            value={categoryFilter}
            onChange={(val) => {
              setCategoryFilter(val);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Categories' },
              { value: 'Software License', label: 'Software License' },
              { value: 'Implementation', label: 'Implementation' },
              { value: 'Infrastructure', label: 'Infrastructure' },
              { value: 'Service Contract', label: 'Service Contract' },
              { value: 'Professional Services', label: 'Professional Services' },
            ]}
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
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        isError={Boolean(error)}
        errorMessage={error}
        onRetry={fetchProducts}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        emptyTitle="No items in catalog"
        emptyDescription="Add products and services to enable quotation line-item selection."
        emptyActionText="Add First Product"
        onEmptyAction={handleOpenAdd}
      />

      {!isLoading && products.length > 0 && (
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

      <ProductModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedProduct}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Catalog Item"
        message={`Are you sure you want to delete "${selectedProduct?.name}"?`}
        confirmText="Delete Product"
        isLoading={isSubmitting}
      />
    </div>
  );
};
