import api, { isMockEnabled, mockDelay } from './api';
import { initialUsers } from './mockData';

let mockUsersList = [...initialUsers];

const mapRoleToDjango = (rl) => {
  if (!rl) return 'sales_rep';
  const r = String(rl).toLowerCase();
  if (r.includes('admin')) return 'admin';
  if (r.includes('manager')) return 'manager';
  if (r.includes('rep') || r.includes('sales')) return 'sales_rep';
  if (r.includes('supp')) return 'support';
  return 'sales_rep';
};

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
      crm_admin: 'CRM Admin',
      manager_crm: 'CRM Manager',
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
  else if (roleLower === 'manager' || roleLower === 'sales_manager') roleLabel = 'Sales Manager';
  else if (roleLower === 'sales_rep' || roleLower === 'representative') roleLabel = 'Sales Representative';
  else if (roleLower === 'support') roleLabel = 'Support';

  let dept = u.department || u.designation || 'Sales & Accounts';
  if (dept === 'Sales') dept = 'Sales & Accounts';

  const isActive = u.is_active !== undefined ? Boolean(u.is_active) : (u.status === 'Active' || u.status === 'active' || u.status === undefined);
  const statusLabel = isActive ? 'Active' : 'Inactive';

  return {
    ...u,
    id: u.id,
    name,
    username: u.username ? u.username.replace(/^@/, '') : name.toLowerCase().replace(/\s+/g, '_'),
    email: u.email || `${u.username || 'emp'}@plsofttech.com`,
    phone: u.phone || '',
    role: roleLabel,
    department: dept,
    status: statusLabel,
    is_active: isActive,
    createdAt: u.date_joined || u.createdAt || new Date().toISOString(),
    lastLogin: u.last_login || u.lastLogin,
    assignedLeadsCount: u.assigned_leads_count ?? u.assignedLeadsCount ?? 0,
    assignedCustomersCount: u.assigned_customers_count ?? u.assignedCustomersCount ?? 0,
    managedVolume: u.managed_volume || u.managedVolume || '₹ 0',
  };
};

const mapPayloadToBackend = (data) => {
  const nameStr = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Employee';
  const parts = nameStr.split(' ');
  const firstName = parts[0] || 'Employee';
  const lastName = parts.slice(1).join(' ') || '';

  const cleanUser = (data.username || data.email ? (data.email || '').split('@')[0] : firstName.toLowerCase()).replace(/[^a-zA-Z0-9_]/g, '_');

  return {
    username: cleanUser || `usr_${Date.now().toString().slice(-4)}`,
    password: data.password || 'Admin123!@#',
    first_name: firstName,
    last_name: lastName,
    email: data.email || `${cleanUser}@plsofttech.com`,
    role: mapRoleToDjango(data.role),
    department: data.department || 'Sales',
    designation: data.designation || data.role || 'Sales Rep',
    phone: data.phone || '',
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

      if (role && role !== 'All') {
        const r = role.toLowerCase();
        filtered = filtered.filter((u) => (u.role || '').toLowerCase().includes(r));
      }

      if (status && status !== 'All') {
        const s = status.toLowerCase();
        filtered = filtered.filter((u) => (u.status || '').toLowerCase() === s);
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
      if (role && role !== 'All') {
        const djangoRole = mapRoleToDjango(role);
        if (djangoRole) params.append('role', djangoRole);
      }
      if (status && status !== 'All') {
        if (status.toLowerCase() === 'active') params.append('is_active', 'true');
        else if (status.toLowerCase() === 'inactive') params.append('is_active', 'false');
      }

      const res = await api.get(`/users/?${params.toString()}`);
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
      return normalizeUser(found);
    }
    try {
      const res = await api.get(`/users/${id}/`);
      return normalizeUser(res);
    } catch (e) {
      return normalizeUser(mockUsersList.find((u) => u.id === id) || { id, username: 'user' });
    }
  },

  createUser: async (userData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);
      const newUser = normalizeUser({
        ...userData,
        id: `usr-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
      });
      mockUsersList = [newUser, ...mockUsersList];
      return newUser;
    }

    const payload = mapPayloadToBackend(userData);
    const res = await api.post('/users/', payload);
    const normalized = normalizeUser(res);
    mockUsersList = [normalized, ...mockUsersList];
    return normalized;
  },

  updateUser: async (id, userData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);
      const index = mockUsersList.findIndex((u) => u.id === id);
      if (index === -1) throw new Error('User not found.');
      const updated = normalizeUser({
        ...mockUsersList[index],
        ...userData,
      });
      mockUsersList[index] = updated;
      return updated;
    }

    const payload = mapPayloadToBackend(userData);
    delete payload.password; // Do not send password on user detail update
    delete payload.username;
    const res = await api.patch(`/users/${id}/`, payload);
    const normalized = normalizeUser(res);
    const index = mockUsersList.findIndex((u) => u.id === id);
    if (index !== -1) mockUsersList[index] = normalized;
    return normalized;
  },

  deleteUser: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      mockUsersList = mockUsersList.filter((u) => u.id !== id);
      return { success: true };
    }
    await api.delete(`/users/${id}/`);
    mockUsersList = mockUsersList.filter((u) => u.id !== id);
    return { success: true };
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
