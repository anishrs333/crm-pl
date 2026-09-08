import React, { useState, useEffect } from 'react';
import { Modal } from '../modals/Modal';
import { FormField } from '../forms/FormField';
import { Button } from '../common/Button';
import { productService } from '../../services/productService';
import { formatCurrency } from '../../utils/formatters';
import { validators } from '../../utils/validators';
import { Plus, Trash2, FileText, User, Calendar } from 'lucide-react';
import './QuotationModal.css';

export const QuotationModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = Boolean(initialData);

  const [availableProducts, setAvailableProducts] = useState([]);
  const [formData, setFormData] = useState({
    quotationNumber: '',
    version: 'v1.0',
    customerName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    createdDate: '',
    validUntil: '',
    status: 'Draft',
    assignedTo: 'Alex Rivera',
    terms: '1. 50% advance payment along with official work order.\n2. 30% milestone payment upon UAT release.\n3. 20% on final sign-off & code handover.\n4. Standard 1 year warranty & critical bug fixes included.',
    items: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const prods = await productService.getAllActiveProducts();
        setAvailableProducts(prods);
      } catch (e) {
        console.error('Failed to load active products for quote:', e);
      }
    };
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        quotationNumber: initialData.quotationNumber || '',
        version: initialData.version || 'v1.0',
        customerName: initialData.customerName || '',
        contactPerson: initialData.contactPerson || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        createdDate: initialData.createdDate || '',
        validUntil: initialData.validUntil || '',
        status: initialData.status || 'Draft',
        assignedTo: initialData.assignedTo || 'Alex Rivera',
        terms: initialData.terms || '',
        items: initialData.items ? [...initialData.items] : [],
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      const expiry = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      setFormData({
        quotationNumber: '',
        version: 'v1.0',
        customerName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        createdDate: today,
        validUntil: expiry,
        status: 'Draft',
        assignedTo: 'Alex Rivera',
        terms: '1. 50% advance payment along with official work order.\n2. 30% milestone payment upon UAT release.\n3. 20% on final sign-off & code handover.\n4. Standard 1 year warranty & critical bug fixes included.',
        items: [
          {
            productId: 'prod-001',
            name: 'Enterprise CRM Core Platform',
            description: 'Core CRM modules license',
            quantity: 1,
            unitPrice: 75000,
            discountPercentage: 0,
            taxPercentage: 18,
            lineTotal: 88500,
          },
        ],
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Recalculate line total for an item
  const calculateLineTotal = (item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const discount = Number(item.discountPercentage) || 0;
    const tax = Number(item.taxPercentage) || 18;

    const baseAfterDiscount = (qty * price) * (1 - discount / 100);
    return Math.round(baseAfterDiscount * (1 + tax / 100));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // If product selection changed, auto-populate name, unit price, tax %
    if (field === 'productId') {
      const prod = availableProducts.find((p) => p.id === value);
      if (prod) {
        updatedItems[index].name = prod.name;
        updatedItems[index].description = prod.description;
        updatedItems[index].unitPrice = prod.unitPrice;
        updatedItems[index].taxPercentage = prod.taxPercentage;
      }
    }

    updatedItems[index].lineTotal = calculateLineTotal(updatedItems[index]);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = () => {
    const defaultProd = availableProducts[0];
    const newItem = {
      productId: defaultProd ? defaultProd.id : '',
      name: defaultProd ? defaultProd.name : 'Custom Deliverable',
      description: defaultProd ? defaultProd.description : '',
      quantity: 1,
      unitPrice: defaultProd ? defaultProd.unitPrice : 10000,
      discountPercentage: 0,
      taxPercentage: defaultProd ? defaultProd.taxPercentage : 18,
      lineTotal: defaultProd ? defaultProd.unitPrice * 1.18 : 11800,
    };
    newItem.lineTotal = calculateLineTotal(newItem);
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) {
      alert('Quotation must contain at least one item.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Financial totals
  const subtotal = formData.items.reduce(
    (acc, item) => acc + (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
    0
  );

  const discountTotal = formData.items.reduce((acc, item) => {
    const base = (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
    return acc + base * ((Number(item.discountPercentage) || 0) / 100);
  }, 0);

  const taxTotal = formData.items.reduce((acc, item) => {
    const baseAfterDiscount =
      (Number(item.quantity) || 1) *
      (Number(item.unitPrice) || 0) *
      (1 - (Number(item.discountPercentage) || 0) / 100);
    return acc + baseAfterDiscount * ((Number(item.taxPercentage) || 0) / 100);
  }, 0);

  const grandTotal = Math.round(subtotal - discountTotal + taxTotal);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      setErrors({ customerName: 'Customer name is required.' });
      return;
    }

    const payload = {
      ...formData,
      subtotal,
      discountTotal: Math.round(discountTotal),
      taxTotal: Math.round(taxTotal),
      grandTotal,
    };

    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Quotation ${formData.quotationNumber}` : 'Create New Quotation'}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Generate Quotation'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Section 1: Header Parameters */}
        <div className="quot-form-section">
          <div className="quot-section-title">
            <span>Client & Header Information</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary-600)' }}>
              Version: {formData.version}
            </span>
          </div>

          <div className="quot-grid-3">
            <FormField
              label="Client / Company Name"
              name="customerName"
              placeholder="e.g. Acme Global Corp"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              error={errors.customerName}
              required
              icon={User}
            />

            <FormField
              label="Contact Person"
              name="contactPerson"
              placeholder="e.g. David Miller"
              value={formData.contactPerson}
              onChange={(e) =>
                setFormData({ ...formData, contactPerson: e.target.value })
              }
            />

            <FormField
              label="Client Email"
              name="email"
              type="email"
              placeholder="e.g. dmiller@acme.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="quot-grid-3" style={{ marginTop: '8px' }}>
            <FormField
              label="Quotation Date"
              name="createdDate"
              type="date"
              value={formData.createdDate}
              onChange={(e) =>
                setFormData({ ...formData, createdDate: e.target.value })
              }
              icon={Calendar}
            />

            <FormField
              label="Valid Until (Expiry Date)"
              name="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={(e) =>
                setFormData({ ...formData, validUntil: e.target.value })
              }
              icon={Calendar}
            />

            <FormField
              label="Quotation Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              options={[
                { value: 'Draft', label: 'Draft' },
                { value: 'Sent', label: 'Sent to Client' },
                { value: 'Accepted', label: 'Accepted / Approved' },
                { value: 'Declined', label: 'Declined' },
                { value: 'Expired', label: 'Expired' },
              ]}
            />
          </div>
        </div>

        {/* Section 2: Line Items Table */}
        <div className="quot-form-section">
          <div className="quot-section-title">
            <span>Products & Services Line Items</span>
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="line-items-table">
              <thead>
                <tr>
                  <th style={{ width: '32%' }}>Item / Product</th>
                  <th style={{ width: '12%' }}>Qty</th>
                  <th style={{ width: '18%' }}>Unit Price ($/₹)</th>
                  <th style={{ width: '12%' }}>Disc %</th>
                  <th style={{ width: '12%' }}>GST %</th>
                  <th style={{ width: '14%' }}>Total</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <select
                        className="line-item-input"
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        style={{ marginBottom: '4px' }}
                      >
                        {availableProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} - {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        className="line-item-input"
                        placeholder="Description/Scope..."
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        className="line-item-input"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="line-item-input"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="line-item-input"
                        value={item.discountPercentage}
                        onChange={(e) => handleItemChange(idx, 'discountPercentage', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="line-item-input"
                        value={item.taxPercentage}
                        onChange={(e) => handleItemChange(idx, 'taxPercentage', e.target.value)}
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {formatCurrency(item.lineTotal)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{ color: 'var(--danger-solid)', cursor: 'pointer' }}
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="quot-summary-box">
            <div className="quot-summary-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="quot-summary-row">
              <span>Total Discount:</span>
              <span style={{ color: 'var(--danger-solid)' }}>-{formatCurrency(discountTotal)}</span>
            </div>
            <div className="quot-summary-row">
              <span>GST / Tax Total:</span>
              <span>+{formatCurrency(taxTotal)}</span>
            </div>
            <div className="quot-summary-row total">
              <span>Grand Total:</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Terms & Conditions */}
        <div className="quot-form-section">
          <FormField
            label="Terms & Conditions"
            name="terms"
            type="textarea"
            value={formData.terms}
            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
};
