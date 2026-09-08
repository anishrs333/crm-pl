import api, { isMockEnabled, mockDelay } from './api';
import { initialQuotations } from './mockData';

let mockQuotationsList = [...initialQuotations];

export const quotationService = {
  getQuotations: async ({ page = 1, limit = 10, search = '', status = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockQuotationsList];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.quotationNumber.toLowerCase().includes(q) ||
            item.customerName.toLowerCase().includes(q) ||
            item.contactPerson.toLowerCase().includes(q)
        );
      }

      if (status) {
        filtered = filtered.filter((item) => item.status === status);
      }

      const totalItems = filtered.length;
      const startIndex = (page - 1) * limit;
      const data = filtered.slice(startIndex, startIndex + limit);

      return {
        data,
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      };
    }

    return await api.get('/quotations', {
      params: { page, limit, search, status },
    });
  },

  getQuotationById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockQuotationsList.find((q) => q.id === id);
      if (!found) throw new Error('Quotation not found.');
      return found;
    }
    return await api.get(`/quotations/${id}`);
  },

  createQuotation: async (quotationData) => {
    if (isMockEnabled) {
      await mockDelay(null, 400);

      const nextNumberIndex = String(mockQuotationsList.length + 1).padStart(3, '0');
      const quotationNumber = quotationData.quotationNumber || `PLSTS/CRM/2026/${nextNumberIndex}`;

      const newQuotation = {
        ...quotationData,
        id: `quot-${Date.now().toString().slice(-4)}`,
        quotationNumber,
        version: quotationData.version || 'v1.0',
        createdDate: quotationData.createdDate || new Date().toISOString().split('T')[0],
      };

      mockQuotationsList = [newQuotation, ...mockQuotationsList];
      return newQuotation;
    }

    return await api.post('/quotations', quotationData);
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

    return await api.put(`/quotations/${id}`, quotationData);
  },

  createRevision: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const original = mockQuotationsList.find((q) => q.id === id);
      if (!original) throw new Error('Original quotation not found.');

      const currentVerNum = parseFloat(original.version.replace('v', '')) || 1.0;
      const nextVer = `v${(currentVerNum + 0.1).toFixed(1)}`;

      const revision = {
        ...original,
        id: `quot-${Date.now().toString().slice(-4)}`,
        version: nextVer,
        status: 'Draft',
        createdDate: new Date().toISOString().split('T')[0],
      };

      mockQuotationsList = [revision, ...mockQuotationsList];
      return revision;
    }

    return await api.post(`/quotations/${id}/revision`);
  },

  deleteQuotation: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      mockQuotationsList = mockQuotationsList.filter((q) => q.id !== id);
      return { success: true };
    }
    return await api.delete(`/quotations/${id}`);
  },
};
