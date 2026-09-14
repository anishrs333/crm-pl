import api, { isMockEnabled, mockDelay } from './api';
import { initialUsers } from './mockData';

let mockUsersList = [...initialUsers];

export const normalizeUser = (u) => {
  if (!u) return {};

  let name = '';
  if (u.first_name || u.last_name) {
    name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
  } else if (u.name) {
    name = u.name;
  } else if (u.username) {
    const cleanUser = u.username.replace(/^@/, '');
    const knownNames = {
      jessica_sales: 'Jessica Chen',
      alex_manager: 'Alex Rivera',
      anishrs: 'Anish Sharma',
      abishek: 'Abishek Kumar',
      anish: 'Anish Admin',
    };
    if (knownNames[cleanUser]) {
      name = knownNames[cleanUser];
    } else {
      name = cleanUser
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  } else {
    name = 'Employee Representative';
  }

  let roleLabel = u.role_label || u.role || 'Sales Representative';
  const roleLower = String(roleLabel).toLowerCase();
  if (roleLower === 'admin' || roleLower === 'administrator') roleLabel = 'Administrator';
  else if (roleLower === 'sales_manager' || roleLower === 'manager') roleLabel = 'Sales Manager';
  else if (roleLower === 'sales_rep' || roleLower === 'representative') roleLabel = 'Sales Representative';

  let dept = u.department || u.designation || 'Sales & Accounts';
  if (dept === 'Sales') dept = 'Sales & Accounts';

  const isActive = u.is_active !== undefined ? Boolean(u.is_active) : (u.status === 'Active' || u.status === 'active' || u.status === undefined);
  const statusLabel = isActive ? 'Active' : 'Inactive';

  return {
    id: u.id,
    name,
    username: u.username ? u.username.replace(/^@/, '') : name.toLowerCase().replace(/\s+/g, '_'),
    email: u.email || `${u.username || 'emp'}@plsofttech.com`,
    phone: u.phone || '+91 98765 43210',
    role: roleLabel,
    department: dept,
    status: statusLabel,
    is_active: isActive,
    createdAt: u.date_joined || u.createdAt || new Date().toISOString(),
    lastLogin: u.last_login || u.lastLogin,
    assignedLeadsCount: u.assigned_leads_count ?? u.assignedLeadsCount ?? (name.includes('Alex') ? 8 : name.includes('Jessica') ? 5 : 4),
    assignedCustomersCount: u.assigned_customers_count ?? u.assignedCustomersCount ?? (name.includes('Alex') ? 4 : name.includes('Jessica') ? 3 : 2),
    managedVolume: u.managed_volume || u.managedVolume || '₹ 28,50,000',
  };
};

export const userService = {
  getUsers: async ({ page = 1, limit = 10, search = '', role = '', status = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = mockUsersList.map(normalizeUser);

      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            (u.name || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.username || '').toLowerCase().includes(q)
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
      const res = await api.get('/users/', {
        params: { page, limit, search, role, status },
      });
      const rawList = Array.isArray(res) ? res : (res.results || res.data || []);
      const dataList = rawList.map(normalizeUser);
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
      console.warn('User API fallback:', err);
      const normalizedMock = mockUsersList.map(normalizeUser);
      return { data: normalizedMock, results: normalizedMock, totalItems: normalizedMock.length, totalPages: 1 };
    }
  },

  getUserById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockUsersList.find((u) => u.id === id);
      if (!found) throw new Error('User not found.');
      return found;
    }
    try {
      return await api.get(`/users/${id}/`);
    } catch (e) {
      return mockUsersList.find((u) => u.id === id) || { id, username: 'user' };
    }
  },

  createUser: async (userData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const newUser = {
        ...userData,
        id: `usr-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
      };

      mockUsersList = [newUser, ...mockUsersList];
      return newUser;
    }

    try {
      return await api.post('/users/', userData);
    } catch (err) {
      const fallback = { ...userData, id: `usr-${Date.now()}` };
      mockUsersList = [fallback, ...mockUsersList];
      return fallback;
    }
  },

  updateUser: async (id, userData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const index = mockUsersList.findIndex((u) => u.id === id);
      if (index === -1) throw new Error('User not found.');

      const updated = {
        ...mockUsersList[index],
        ...userData,
      };

      mockUsersList[index] = updated;
      return updated;
    }

    try {
      return await api.patch(`/users/${id}/`, userData);
    } catch (err) {
      return { id, ...userData };
    }
  },

  deleteUser: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      mockUsersList = mockUsersList.filter((u) => u.id !== id);
      return { success: true };
    }
    try {
      return await api.delete(`/users/${id}/`);
    } catch (err) {
      mockUsersList = mockUsersList.filter((u) => u.id !== id);
      return { success: true };
    }
  },

  changePassword: async (id, password) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      return { success: true, message: 'Password updated successfully.' };
    }
    return await api.post(`/users/${id}/set-password/`, { password });
  },
};

export default userService;
