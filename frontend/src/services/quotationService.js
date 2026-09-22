import api, { isMockEnabled, mockDelay } from './api';
import { initialQuotations } from './mockData';

let mockQuotationsList = [...initialQuotations];

const normalizeQuotation = (q) => {
  if (!q) return q;

  let statusDisplay = q.status_label || q.status || 'Draft';
  const s = String(q.status || '').toLowerCase();
  if (s === 'draft') statusDisplay = 'Draft';
  else if (s === 'sent') statusDisplay = 'Sent';
  else if (s === 'accepted') statusDisplay = 'Accepted';
  else if (s === 'rejected') statusDisplay = 'Declined';
  else if (s === 'expired') statusDisplay = 'Expired';

  const rawItems = Array.isArray(q.items) && q.items.length > 0 ? q.items : [
    {
      name: 'Enterprise CRM Core Platform',
      description: 'Enterprise CRM Core Platform',
      quantity: 1,
      unitPrice: 75000,
      taxPercentage: 18,
    }
  ];

  const items = rawItems.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unit_price ?? item.unitPrice ?? 0);
    const taxPct = Number(item.tax_percentage ?? item.taxPercentage ?? 18);
    const discPct = Number(item.discount_percentage ?? item.discountPercentage ?? 0);

    const baseSub = qty * price * (1 - discPct / 100);
    const lineTax = baseSub * (taxPct / 100);
    const lineTotal = Math.round(baseSub + lineTax);

    return {
      id: item.id || `item-${Math.random()}`,
      productId: item.product || item.productId,
      name: item.name || item.description || 'Deliverable Item',
      description: item.description || item.name || '',
      quantity: qty,
      unitPrice: price,
      discountPercentage: discPct,
      taxPercentage: taxPct,
      lineSubtotal: baseSub,
      lineTax: lineTax,
      lineTotal: Number(item.line_total ?? item.lineTotal) || lineTotal,
    };
  });

  const calcSubtotal = items.reduce((sum, item) => sum + item.lineSubtotal, 0);
  const calcTaxTotal = items.reduce((sum, item) => sum + item.lineTax, 0);
  const calcGrandTotal = calcSubtotal + calcTaxTotal;

  const rawSubtotal = Number(q.subtotal);
  const rawTaxTotal = Number(q.tax_amount ?? q.taxTotal);
  const rawGrandTotal = Number(q.grand_total ?? q.grandTotal);

  const finalSubtotal = (rawSubtotal && rawSubtotal > 0) ? rawSubtotal : calcSubtotal;
  const finalTaxTotal = (rawTaxTotal && rawTaxTotal > 0) ? rawTaxTotal : calcTaxTotal;
  const finalGrandTotal = (rawGrandTotal && rawGrandTotal > 0) ? rawGrandTotal : calcGrandTotal;

  return {
    ...q,
    id: q.id,
    quotationNumber: q.quote_number || q.quotationNumber || `QT-2026-${String(q.id).padStart(4, '0')}`,
    version: q.version || 'v1.0',
    customer: q.customer,
    customerName: q.customer_name || q.customerName || (q.customer_details ? q.customer_details.name : 'Client'),
    contactPerson: q.contact_person || q.contactPerson || 'Authorized Representative',
    email: q.email || (q.customer_details ? q.customer_details.email : ''),
    phone: q.phone || (q.customer_details ? q.customer_details.phone : ''),
    address: q.address || (q.customer_details ? q.customer_details.address : ''),
    createdDate: q.created_at ? q.created_at.split('T')[0] : (q.createdDate || new Date().toISOString().split('T')[0]),
    validUntil: q.valid_until || q.validUntil || '',
    status: statusDisplay,
    terms: q.terms_and_conditions || q.terms || '1. 50% advance payment along with official work order.\n2. 30% milestone payment upon UAT release.\n3. 20% on final sign-off & code handover.\n4. Standard 1 year warranty & critical bug fixes included.',
    notes: q.notes || '',
    subtotal: finalSubtotal,
    taxTotal: finalTaxTotal,
    grandTotal: finalGrandTotal,
    items,
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

  if (typeof data.customer === 'number') {
    payload.customer = data.customer;
  }

  return payload;
};

const mapStatusToDjango = (st) => {
  if (!st) return '';
  const s = String(st).toLowerCase();
  if (s.includes('draft')) return 'draft';
  if (s.includes('sent')) return 'sent';
  if (s.includes('accept')) return 'accepted';
  if (s.includes('declin') || s.includes('reject')) return 'rejected';
  if (s.includes('expir')) return 'expired';
  return s;
};

export const quotationService = {
  getQuotations: async ({ page = 1, limit = 10, search = '', status = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockQuotationsList].map(normalizeQuotation);

      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            (item.quotationNumber || item.quote_number || '').toLowerCase().includes(q) ||
            (item.customerName || item.customer_name || '').toLowerCase().includes(q)
        );
      }

      if (status && status !== 'All') {
        const s = status.toLowerCase();
        filtered = filtered.filter((item) => (item.status || '').toLowerCase().includes(s));
      }

      const totalItems = filtered.length;
      const startIndex = (page - 1) * limit;
      const data = filtered.slice(startIndex, startIndex + limit);

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
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);
      if (status && status !== 'All') {
        const djangoStatus = mapStatusToDjango(status);
        if (djangoStatus) params.append('status', djangoStatus);
      }

      const res = await api.get(`/quotations/?${params.toString()}`);
      const rawList = Array.isArray(res) ? res : (res.results || res.data || []);
      const dataList = rawList.map(normalizeQuotation);
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
      return normalizeQuotation(mockQuotationsList.find((q) => q.id === id) || { id, quote_number: 'QT-2026-0001' });
    }
  },

  createQuotation: async (quotationData) => {
    if (isMockEnabled) {
      await mockDelay(null, 400);
      const nextNumberIndex = String(mockQuotationsList.length + 1).padStart(3, '0');
      const quotationNumber = quotationData.quotationNumber || `QT-2026-${nextNumberIndex}`;
      const newQuotation = normalizeQuotation({
        ...quotationData,
        id: `quot-${Date.now().toString().slice(-4)}`,
        quotationNumber,
        createdDate: new Date().toISOString().split('T')[0],
      });
      mockQuotationsList = [newQuotation, ...mockQuotationsList];
      return newQuotation;
    }

    const payload = mapPayloadToBackend(quotationData);
    const res = await api.post('/quotations/', payload);
    const normalized = normalizeQuotation({
      ...res,
      ...quotationData, // preserve manually entered fields
    });
    mockQuotationsList = [normalized, ...mockQuotationsList];
    return normalized;
  },

  updateQuotation: async (id, quotationData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);
      const index = mockQuotationsList.findIndex((q) => q.id === id);
      if (index === -1) throw new Error('Quotation not found.');
      const updated = normalizeQuotation({
        ...mockQuotationsList[index],
        ...quotationData,
      });
      mockQuotationsList[index] = updated;
      return updated;
    }

    const payload = mapPayloadToBackend(quotationData);
    const res = await api.patch(`/quotations/${id}/`, payload);
    const normalized = normalizeQuotation({
      ...res,
      ...quotationData,
    });
    const index = mockQuotationsList.findIndex((q) => q.id === id);
    if (index !== -1) mockQuotationsList[index] = normalized;
    return normalized;
  },

  createRevision: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);
      const original = mockQuotationsList.find((q) => q.id === id);
      const revision = normalizeQuotation({
        ...original,
        id: `quot-${Date.now().toString().slice(-4)}`,
        status: 'Draft',
      });
      mockQuotationsList = [revision, ...mockQuotationsList];
      return revision;
    }

    const res = await api.post(`/quotations/${id}/accept/`);
    return normalizeQuotation(res);
  },

  downloadPdf: async (id, quotationNumber = 'QT-2026-0001') => {
    try {
      const token = localStorage.getItem('crm_access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/${id}/pdf/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Quotation_${quotationNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return true;
      }
    } catch (e) {
      console.warn('Backend PDF endpoint fetch failed:', e);
    }
    return false;
  },

  deleteQuotation: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      mockQuotationsList = mockQuotationsList.filter((q) => q.id !== id);
      return { success: true };
    }
    await api.delete(`/quotations/${id}/`);
    mockQuotationsList = mockQuotationsList.filter((q) => q.id !== id);
    return { success: true };
  },
};

export default quotationService;
