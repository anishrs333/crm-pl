import api from './api';

const mapCustomer = (c) => ({
  ...c,
  id: c.id,
  companyName: c.name || c.companyName || 'Enterprise Client',
  contactPerson: c.contact_person || c.name || 'Account Lead',
  email: c.email || '',
  phone: c.phone || '',
  city: c.city || '',
  country: c.country || '',
  stage: c.customer_type === 'individual' ? 'Active' : 'Contract Signed',
  dealValue: Number(c.deal_value || c.dealValue || 0),
  assignedTo: c.account_manager_name || 'Direct Rep',
  createdAt: c.created_at || new Date().toISOString(),
});

export const customerService = {
  getCustomers: async ({ page = 1, limit = 10, search = '', stage = '' } = {}) => {
    const params = { page, page_size: limit };
    if (search) params.search = search;

    const response = await api.get('/customers/', { params });

    const rawList = Array.isArray(response) ? response : (response?.results || response?.data || []);
    const totalItems = response?.count ?? rawList.length;

    return {
      data: rawList.map(mapCustomer),
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit) || 1,
    };
  },

  getCustomerById: async (id) => {
    const customer = await api.get(`/customers/${id}/`);
    return mapCustomer(customer);
  },

  createCustomer: async (customerData) => {
    const payload = {
      name: customerData.companyName || customerData.name,
      customer_type: customerData.customer_type || 'company',
      email: customerData.email || '',
      phone: customerData.phone || '',
      city: customerData.city || '',
      country: customerData.country || '',
      address: customerData.address || '',
      website: customerData.website || '',
    };

    const created = await api.post('/customers/', payload);
    return mapCustomer(created);
  },

  updateCustomer: async (id, customerData) => {
    const payload = { ...customerData };
    if (customerData.companyName) payload.name = customerData.companyName;

    const updated = await api.patch(`/customers/${id}/`, payload);
    return mapCustomer(updated);
  },

  deleteCustomer: async (id) => {
    await api.delete(`/customers/${id}/`);
    return { success: true };
  },
};
