import api from './api';

const mapQuotation = (q) => ({
  ...q,
  id: q.id,
  quotationNumber: q.quote_number || q.quotationNumber || `QUOTE-${q.id}`,
  customerName: q.customer_name || (q.customer ? `Customer #${q.customer}` : 'Client Organization'),
  contactPerson: q.contact_person || 'Client Contact',
  grandTotal: parseFloat(q.total_amount || q.grandTotal || 0),
  subtotal: parseFloat(q.subtotal || 0),
  taxAmount: parseFloat(q.tax_amount || 0),
  status: q.status ? (q.status.charAt(0).toUpperCase() + q.status.slice(1)) : 'Draft',
  version: q.version || 'v1.0',
  createdDate: q.created_at ? q.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
  validUntil: q.valid_until,
});

export const quotationService = {
  getQuotations: async ({ page = 1, limit = 10, search = '', status = '' } = {}) => {
    const params = { page, page_size: limit };
    if (search) params.search = search;
    if (status) params.status = status.toLowerCase();

    const response = await api.get('/quotations/', { params });

    const rawList = Array.isArray(response) ? response : (response?.results || response?.data || []);
    const totalItems = response?.count ?? rawList.length;

    return {
      data: rawList.map(mapQuotation),
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit) || 1,
    };
  },

  getQuotationById: async (id) => {
    const quotation = await api.get(`/quotations/${id}/`);
    return mapQuotation(quotation);
  },

  createQuotation: async (quotationData) => {
    const quoteNumber = quotationData.quotationNumber || `PLSTS/CRM/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`;
    const payload = {
      quote_number: quoteNumber,
      customer: quotationData.customerId || quotationData.customer,
      subtotal: parseFloat(quotationData.subtotal || quotationData.grandTotal || 0),
      tax_amount: parseFloat(quotationData.taxAmount || 0),
      discount_amount: parseFloat(quotationData.discountAmount || 0),
      total_amount: parseFloat(quotationData.grandTotal || 0),
      status: (quotationData.status || 'draft').toLowerCase(),
      valid_until: quotationData.validUntil || null,
      notes: quotationData.notes || '',
    };

    const created = await api.post('/quotations/', payload);
    return mapQuotation(created);
  },

  updateQuotation: async (id, quotationData) => {
    const payload = { ...quotationData };
    if (quotationData.status) payload.status = quotationData.status.toLowerCase();
    if (quotationData.grandTotal !== undefined) payload.total_amount = parseFloat(quotationData.grandTotal);

    const updated = await api.patch(`/quotations/${id}/`, payload);
    return mapQuotation(updated);
  },

  createRevision: async (id) => {
    // Clone existing quotation as a revised draft
    const original = await api.get(`/quotations/${id}/`);
    const newQuoteNumber = `${original.quote_number}-R1`;
    const payload = {
      quote_number: newQuoteNumber,
      customer: original.customer,
      subtotal: original.subtotal,
      tax_amount: original.tax_amount,
      total_amount: original.total_amount,
      status: 'draft',
    };
    const created = await api.post('/quotations/', payload);
    return mapQuotation(created);
  },

  deleteQuotation: async (id) => {
    await api.delete(`/quotations/${id}/`);
    return { success: true };
  },
};
