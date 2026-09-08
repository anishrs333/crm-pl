import api, { isMockEnabled, mockDelay } from './api';
import { initialQuotations } from './mockData';

let mockQuotationsList = [...initialQuotations];

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
      const data = filtered.slice(startIndex, startIndex + limit);

      return {
        data,
        results: data,
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      };
    }

    try {
      const res = await api.get('/quotations/', {
        params: { page, limit, search, status },
      });
      const dataList = Array.isArray(res) ? res : (res.results || res.data || []);
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
      return { data: mockQuotationsList, results: mockQuotationsList, totalItems: mockQuotationsList.length, totalPages: 1 };
    }
  },

  getQuotationById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockQuotationsList.find((q) => q.id === id);
      if (!found) throw new Error('Quotation not found.');
      return found;
    }
    try {
      return await api.get(`/quotations/${id}/`);
    } catch (e) {
      return mockQuotationsList.find((q) => q.id === id) || { id, quote_number: 'QT-2026-0001' };
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
      return newQuotation;
    }

    try {
      return await api.post('/quotations/', quotationData);
    } catch (err) {
      const fallback = { ...quotationData, id: `quot-${Date.now()}` };
      mockQuotationsList = [fallback, ...mockQuotationsList];
      return fallback;
    }
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
      return updated;
    }

    try {
      return await api.patch(`/quotations/${id}/`, quotationData);
    } catch (err) {
      return { id, ...quotationData };
    }
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
      return revision;
    }

    try {
      return await api.post(`/quotations/${id}/accept/`);
    } catch (err) {
      return { id, status: 'accepted' };
    }
  },

  deleteQuotation: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      mockQuotationsList = mockQuotationsList.filter((q) => q.id !== id);
      return { success: true };
    }
    try {
      return await api.delete(`/quotations/${id}/`);
    } catch (err) {
      mockQuotationsList = mockQuotationsList.filter((q) => q.id !== id);
      return { success: true };
    }
  },
};

export default quotationService;
