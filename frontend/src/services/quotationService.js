import api, { isMockEnabled, mockDelay } from './api';
import { initialQuotations } from './mockData';

let mockQuotationsList = [...initialQuotations];

const normalizeQuotation = (q) => {
  if (!q) return q;
  return {
    id: q.id,
    quotationNumber: q.quote_number || q.quotationNumber || `QT-2026-${String(q.id).padStart(4, '0')}`,
    version: q.version || 'v1.0',
    customer: q.customer,
    customerName: q.customer_name || q.customerName || (q.customer_details ? q.customer_details.name : 'Client'),
    contactPerson: q.contact_person || q.contactPerson || '',
    email: q.email || (q.customer_details ? q.customer_details.email : ''),
    phone: q.phone || (q.customer_details ? q.customer_details.phone : ''),
    address: q.address || (q.customer_details ? q.customer_details.address : ''),
    createdDate: q.created_at ? q.created_at.split('T')[0] : (q.createdDate || new Date().toISOString().split('T')[0]),
    validUntil: q.valid_until || q.validUntil || '',
    status: q.status_label || (q.status ? q.status.charAt(0).toUpperCase() + q.status.slice(1) : 'Draft'),
    terms: q.terms_and_conditions || q.terms || '',
    notes: q.notes || '',
    subtotal: Number(q.subtotal) || 0,
    taxTotal: Number(q.tax_amount) || Number(q.taxTotal) || 0,
    grandTotal: Number(q.grand_total) || Number(q.grandTotal) || 0,
    items: (q.items || []).map((item) => ({
      id: item.id,
      productId: item.product,
      name: item.description || item.name || '',
      description: item.description || '',
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unit_price || item.unitPrice) || 0,
      taxPercentage: Number(item.tax_percentage || item.taxPercentage) || 18,
      lineTotal: Number(item.line_total || item.lineTotal) || 0,
    })),
  };
};

const mapPayloadToBackend = (data) => {
  const payload = {
    customer_name: data.customerName || data.customer_name || 'Client',
    valid_until: data.validUntil || data.valid_until || null,
    status: (data.status || 'draft').toLowerCase(),
    terms_and_conditions: data.terms || data.terms_and_conditions || '',
    notes: data.notes || '',
    items: (data.items || []).map((item) => ({
      product: typeof item.productId === 'number' ? item.productId : null,
      description: item.name || item.description || 'Deliverable Line Item',
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unitPrice || item.unit_price) || 0,
      tax_percentage: Number(item.taxPercentage || item.tax_percentage) || 18,
    })),
  };

  if (data.customer && typeof data.customer === 'number') {
    payload.customer = data.customer;
  }

  return payload;
};

export const quotationService = {
  getQuotations: async ({ page = 1, limit = 10, search = '', status = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockQuotationsList];

      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            (item.quotationNumber || item.quote_number || '').toLowerCase().includes(q) ||
            (item.customerName || item.customer_name || '').toLowerCase().includes(q)
        );
      }

      const totalItems = filtered.length;
      const startIndex = (page - 1) * limit;
      const data = filtered.slice(startIndex, startIndex + limit).map(normalizeQuotation);

      return {
        data,
        results: data,
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit) || 1,
      };
    }

    try {
      const res = await api.get('/quotations/', {
        params: { page, limit, search, status },
      });
      const dataList = (Array.isArray(res) ? res : (res.results || res.data || [])).map(normalizeQuotation);
      const total = res.count || dataList.length;
      return {
        data: dataList,
        results: dataList,
        totalItems: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      console.warn('Quotation API fallback:', err);
      const normalizedMock = mockQuotationsList.map(normalizeQuotation);
      return { data: normalizedMock, results: normalizedMock, totalItems: normalizedMock.length, totalPages: 1 };
    }
  },

  getQuotationById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockQuotationsList.find((q) => q.id === id);
      if (!found) throw new Error('Quotation not found.');
      return normalizeQuotation(found);
    }
    try {
      const res = await api.get(`/quotations/${id}/`);
      return normalizeQuotation(res);
    } catch (e) {
      const fallback = mockQuotationsList.find((q) => q.id === id) || { id, quote_number: 'QT-2026-0001' };
      return normalizeQuotation(fallback);
    }
  },

  createQuotation: async (quotationData) => {
    if (isMockEnabled) {
      await mockDelay(null, 400);

      const nextNumberIndex = String(mockQuotationsList.length + 1).padStart(3, '0');
      const quotationNumber = quotationData.quotationNumber || `QT-2026-${nextNumberIndex}`;

      const newQuotation = {
        ...quotationData,
        id: `quot-${Date.now().toString().slice(-4)}`,
        quotationNumber,
        createdDate: new Date().toISOString().split('T')[0],
      };

      mockQuotationsList = [newQuotation, ...mockQuotationsList];
      return normalizeQuotation(newQuotation);
    }

    const payload = mapPayloadToBackend(quotationData);
    const res = await api.post('/quotations/', payload);
    return normalizeQuotation(res);
  },

  updateQuotation: async (id, quotationData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const index = mockQuotationsList.findIndex((q) => q.id === id);
      if (index === -1) throw new Error('Quotation not found.');

      const updated = {
        ...mockQuotationsList[index],
        ...quotationData,
      };

      mockQuotationsList[index] = updated;
      return normalizeQuotation(updated);
    }

    const payload = mapPayloadToBackend(quotationData);
    const res = await api.patch(`/quotations/${id}/`, payload);
    return normalizeQuotation(res);
  },

  createRevision: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);
      const original = mockQuotationsList.find((q) => q.id === id);
      const revision = {
        ...original,
        id: `quot-${Date.now().toString().slice(-4)}`,
        status: 'Draft',
      };
      mockQuotationsList = [revision, ...mockQuotationsList];
      return normalizeQuotation(revision);
    }

    const res = await api.post(`/quotations/${id}/accept/`);
    return normalizeQuotation(res);
  },

  deleteQuotation: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      mockQuotationsList = mockQuotationsList.filter((q) => q.id !== id);
      return { success: true };
    }
    return await api.delete(`/quotations/${id}/`);
  },
};

export default quotationService;
