import api from './api';

const mapUser = (u) => {
  const rawRole = (u.role || '').toLowerCase();
  const mappedRole = rawRole === 'manager' ? 'Manager' : 'Admin';
  const fullName = (u.first_name || u.last_name)
    ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
    : u.username;

  return {
    ...u,
    id: u.id,
    name: fullName,
    username: u.username,
    email: u.email || '',
    role: mappedRole,
    status: u.is_active ? 'Active' : 'Inactive',
    department: u.department || (mappedRole === 'Admin' ? 'Management' : 'Sales'),
    phone: u.phone || '',
    createdAt: u.date_joined || new Date().toISOString(),
  };
};

export const userService = {
  getUsers: async ({ page = 1, limit = 10, search = '', role = '', status = '' } = {}) => {
    const params = { page, page_size: limit };
    if (search) params.search = search;

    const response = await api.get('/users/', { params });

    const rawList = Array.isArray(response) ? response : (response?.results || response?.data || []);
    let filtered = rawList.map(mapUser);

    if (role) {
      filtered = filtered.filter((u) => u.role === role);
    }
    if (status) {
      filtered = filtered.filter((u) => u.status === status);
    }

    const totalItems = response?.count ?? filtered.length;

    return {
      data: filtered,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit) || 1,
    };
  },

  getUserById: async (id) => {
    const user = await api.get(`/users/${id}/`);
    return mapUser(user);
  },

  createUser: async (userData) => {
    const nameParts = (userData.name || '').trim().split(' ');
    const firstName = userData.first_name || nameParts[0] || 'User';
    const lastName = userData.last_name || (nameParts.slice(1).join(' ') || '');

    const payload = {
      username: userData.username.trim(),
      email: userData.email.trim(),
      first_name: firstName,
      last_name: lastName,
      role: (userData.role || 'admin').toLowerCase(),
      phone: userData.phone || '',
      department: userData.department || 'Operations',
      is_active: userData.status !== 'Inactive',
    };

    if (userData.password) {
      payload.password = userData.password;
    }

    const created = await api.post('/users/', payload);
    return mapUser(created);
  },

  updateUser: async (id, userData) => {
    const payload = {};
    if (userData.name) {
      const parts = userData.name.trim().split(' ');
      payload.first_name = parts[0];
      payload.last_name = parts.slice(1).join(' ');
    }
    if (userData.email) payload.email = userData.email;
    if (userData.role) payload.role = userData.role.toLowerCase();
    if (userData.phone !== undefined) payload.phone = userData.phone;
    if (userData.department) payload.department = userData.department;
    if (userData.status !== undefined) payload.is_active = userData.status === 'Active';

    const updated = await api.patch(`/users/${id}/`, payload);
    return mapUser(updated);
  },

  deleteUser: async (id) => {
    await api.delete(`/users/${id}/`);
    return { success: true, message: 'User deleted successfully.' };
  },
};
