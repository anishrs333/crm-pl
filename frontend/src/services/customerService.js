import api, { isMockEnabled, mockDelay } from './api';
import { initialCustomers } from './mockData';

let mockCustomersList = [...initialCustomers];

export const customerService = {
  /**
   * Get paginated and filtered customers
   */
  getCustomers: async ({ page = 1, limit = 10, search = '', stage = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockCustomersList];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.companyName.toLowerCase().includes(q) ||
            c.contactPerson.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.city && c.city.toLowerCase().includes(q))
        );
      }

      if (stage) {
        filtered = filtered.filter((c) => c.stage === stage);
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

    return await api.get('/customers', {
      params: { page, limit, search, stage },
    });
  },

  /**
   * Get customer by ID
   */
  getCustomerById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockCustomersList.find((c) => c.id === id);
      if (!found) throw new Error('Customer record not found.');
      return found;
    }
    return await api.get(`/customers/${id}`);
  },

  /**
   * Create new customer
   */
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

    return await api.post('/customers', customerData);
  },

  /**
   * Update customer
   */
  updateCustomer: async (id, customerData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const index = mockCustomersList.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Customer not found.');

      const updated = {
        ...mockCustomersList[index],
        ...customerData,
        dealValue: Number(customerData.dealValue) || 0,
      };

      mockCustomersList[index] = updated;
      return updated;
    }

    return await api.put(`/customers/${id}`, customerData);
  },

  /**
   * Delete customer
   */
  deleteCustomer: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      mockCustomersList = mockCustomersList.filter((c) => c.id !== id);
      return { success: true };
    }
    return await api.delete(`/customers/${id}`);
  },
};
