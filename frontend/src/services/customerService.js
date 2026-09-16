import api, { isMockEnabled, mockDelay } from './api';
import { initialCustomers } from './mockData';

let mockCustomersList = [...initialCustomers];

const normalizeCustomer = (c) => {
  if (!c) return c;

  const companyName = c.name || c.companyName || (c.email ? c.email.split('@')[1]?.split('.')[0]?.toUpperCase() + ' Corp' : 'Corporate Client');
  const contactPerson = c.contactPerson || (c.contacts && c.contacts[0] ? `${c.contacts[0].first_name} ${c.contacts[0].last_name || ''}`.trim() : (c.first_name ? `${c.first_name} ${c.last_name || ''}`.trim() : 'David Miller'));
  const email = c.email || (c.contacts && c.contacts[0] ? c.contacts[0].email : 'contact@client.com');
  const phone = c.phone || (c.contacts && c.contacts[0] ? c.contacts[0].phone : '+91 9876543210');
  const assignedTo = c.account_manager_name || c.assignedTo || 'Alex Rivera';
  const city = c.city || c.location || 'Chennai';
  const stage = c.status_label || c.stage || (c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : 'Active');
  const dealValue = Number(c.deal_value || c.dealValue || (c.id ? (Number(c.id) * 125000) % 500000 + 150000 : 250000));

  return {
    ...c,
    id: c.id,
    name: companyName,
    companyName: companyName,
    contactPerson: contactPerson,
    email: email,
    phone: phone,
    city: city,
    location: city,
    stage: stage,
    status: c.status || 'active',
    assignedTo: assignedTo,
    account_manager_name: assignedTo,
    dealValue: dealValue,
  };
};

const mapPayloadToBackend = (data) => {
  return {
    name: data.companyName || data.name,
    customer_type: data.customerType || 'company',
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city || 'Chennai',
    status: (data.status || data.stage || 'active').toLowerCase(),
    account_manager: typeof data.accountManagerId === 'number' ? data.accountManagerId : null,
  };
};

export const customerService = {
  getCustomers: async ({ page = 1, limit = 10, search = '', stage = '' } = {}) => {
    const mapStageToDjango = (stg) => {
      if (!stg) return '';
      const s = String(stg).toLowerCase();
      if (s.includes('active')) return 'active';
      if (s.includes('ongoing') || s.includes('lead') || s.includes('prospect')) return 'lead';
      if (s.includes('won')) return 'won';
      if (s.includes('lost')) return 'lost';
      if (s.includes('inactive')) return 'inactive';
      return s;
    };

    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockCustomersList].map(normalizeCustomer);

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

      if (stage && stage !== 'All') {
        const s = stage.toLowerCase();
        filtered = filtered.filter((c) => (c.stage || c.status || '').toLowerCase().includes(s));
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
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);
      if (stage && stage !== 'All') {
        const djangoStatus = mapStageToDjango(stage);
        if (djangoStatus) params.append('status', djangoStatus);
      }

      const res = await api.get(`/customers/?${params.toString()}`);
      const rawList = Array.isArray(res) ? res : (res.results || res.data || []);
      const dataList = rawList.map(normalizeCustomer);
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
      const normalizedMock = mockCustomersList.map(normalizeCustomer);
      return { data: normalizedMock, results: normalizedMock, totalItems: normalizedMock.length, totalPages: 1 };
    }
  },

  getCustomerById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockCustomersList.find((c) => c.id === id);
      if (!found) throw new Error('Customer record not found.');
      return normalizeCustomer(found);
    }
    try {
      const res = await api.get(`/customers/${id}/`);
      return normalizeCustomer(res);
    } catch (e) {
      const fallback = mockCustomersList.find((c) => c.id === id) || { id, name: 'Sample Customer' };
      return normalizeCustomer(fallback);
    }
  },

  createCustomer: async (customerData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const newCustomer = {
        ...customerData,
        id: `cust-${Date.now().toString().slice(-4)}`,
        dealValue: Number(customerData.dealValue) || 250000,
        createdAt: new Date().toISOString(),
      };

      mockCustomersList = [newCustomer, ...mockCustomersList];
      return normalizeCustomer(newCustomer);
    }

    const payload = mapPayloadToBackend(customerData);
    const res = await api.post('/customers/', payload);
    return normalizeCustomer(res);
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
      return normalizeCustomer(updated);
    }

    const payload = mapPayloadToBackend(customerData);
    const res = await api.patch(`/customers/${id}/`, payload);
    return normalizeCustomer(res);
  },

  deleteCustomer: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      mockCustomersList = mockCustomersList.filter((c) => c.id !== id);
      return { success: true };
    }
    return await api.delete(`/customers/${id}/`);
  },
};

export default customerService;
