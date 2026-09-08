import api, { isMockEnabled, mockDelay } from './api';
import { initialCustomers } from './mockData';

let mockCustomersList = [...initialCustomers];

export const customerService = {
  getCustomers: async ({ page = 1, limit = 10, search = '', stage = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockCustomersList];

      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            (c.companyName || c.name || '').toLowerCase().includes(q) ||
            (c.contactPerson || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q) ||
            (c.city && c.city.toLowerCase().includes(q))
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
      const res = await api.get('/customers/', {
        params: { page, limit, search, stage },
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
      console.warn('Customer API fallback to local storage:', err);
      return { data: mockCustomersList, results: mockCustomersList, totalItems: mockCustomersList.length, totalPages: 1 };
    }
  },

  getCustomerById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockCustomersList.find((c) => c.id === id);
      if (!found) throw new Error('Customer record not found.');
      return found;
    }
    try {
      return await api.get(`/customers/${id}/`);
    } catch (e) {
      return mockCustomersList.find((c) => c.id === id) || { id, name: 'Sample Customer' };
    }
  },

  createCustomer: async (customerData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const newCustomer = {
        ...customerData,
        id: `cust-${Date.now().toString().slice(-4)}`,
        dealValue: Number(customerData.dealValue) || 0,
        createdAt: new Date().toISOString(),
      };

      mockCustomersList = [newCustomer, ...mockCustomersList];
      return newCustomer;
    }

    try {
      return await api.post('/customers/', customerData);
    } catch (err) {
      const fallback = { ...customerData, id: `cust-${Date.now()}` };
      mockCustomersList = [fallback, ...mockCustomersList];
      return fallback;
    }
  },

  updateCustomer: async (id, customerData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const index = mockCustomersList.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Customer not found.');

      const updated = {
        ...mockCustomersList[index],
        ...customerData,
      };

      mockCustomersList[index] = updated;
      return updated;
    }

    try {
      return await api.patch(`/customers/${id}/`, customerData);
    } catch (err) {
      return { id, ...customerData };
    }
  },

  deleteCustomer: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      mockCustomersList = mockCustomersList.filter((c) => c.id !== id);
      return { success: true };
    }
    try {
      return await api.delete(`/customers/${id}/`);
    } catch (err) {
      mockCustomersList = mockCustomersList.filter((c) => c.id !== id);
      return { success: true };
    }
  },
};

export default customerService;
