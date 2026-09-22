import api, { isMockEnabled, mockDelay } from './api';
import { initialProducts } from './mockData';

let mockProductsList = [...initialProducts];

const mapCategoryToDjango = (cat) => {
  if (!cat) return 'software';
  const c = String(cat).toLowerCase();
  if (c.includes('soft')) return 'software';
  if (c.includes('hard') || c.includes('infra')) return 'hardware';
  if (c.includes('service') || c.includes('impl') || c.includes('pro')) return 'service';
  if (c.includes('sub')) return 'subscription';
  if (c.includes('maint')) return 'maintenance';
  return 'other';
};

const normalizeProduct = (p) => {
  if (!p) return p;
  return {
    ...p,
    id: p.id,
    code: p.sku || p.code || `PRD-${p.id}`,
    sku: p.sku || p.code || `PRD-${p.id}`,
    name: p.name || '',
    category: p.category_label || p.category || 'Software License',
    unitPrice: Number(p.unit_price ?? p.unitPrice ?? 0),
    unit_price: Number(p.unit_price ?? p.unitPrice ?? 0),
    taxPercentage: Number(p.tax_percentage ?? p.taxPercentage ?? 18),
    tax_percentage: Number(p.tax_percentage ?? p.taxPercentage ?? 18),
    status: p.is_active !== undefined ? (p.is_active ? 'Active' : 'Inactive') : (p.status || 'Active'),
    is_active: p.is_active !== undefined ? Boolean(p.is_active) : p.status !== 'Inactive',
    description: p.description || '',
  };
};

const mapPayloadToBackend = (data) => {
  return {
    sku: (data.code || data.sku || `SKU-${Date.now().toString().slice(-6)}`).toUpperCase(),
    name: data.name || 'New Product',
    category: mapCategoryToDjango(data.category),
    unit_price: parseFloat(data.unitPrice || data.unit_price) || 0,
    tax_percentage: parseFloat(data.taxPercentage || data.tax_percentage) || 18,
    is_active: data.status === 'Active' || data.is_active === true,
    description: data.description || '',
  };
};

export const productService = {
  getProducts: async ({ page = 1, limit = 10, search = '', category = '', status = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockProductsList].map(normalizeProduct);

      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            (p.name || '').toLowerCase().includes(q) ||
            (p.code || p.sku || '').toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q)
        );
      }

      if (category && category !== 'All') {
        const c = category.toLowerCase();
        filtered = filtered.filter((p) => (p.category || '').toLowerCase().includes(c));
      }

      if (status && status !== 'All') {
        const s = status.toLowerCase();
        filtered = filtered.filter((p) => {
          const st = p.status || (p.is_active ? 'Active' : 'Inactive');
          return st.toLowerCase() === s;
        });
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
      if (category && category !== 'All') params.append('category', mapCategoryToDjango(category));
      if (status && status !== 'All') {
        if (status.toLowerCase() === 'active') params.append('is_active', 'true');
        else if (status.toLowerCase() === 'inactive') params.append('is_active', 'false');
      }

      const res = await api.get(`/products/?${params.toString()}`);
      const rawList = Array.isArray(res) ? res : (res.results || res.data || []);
      const dataList = rawList.map(normalizeProduct);
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
      console.warn('Product API fallback:', err);
      const normalizedMock = mockProductsList.map(normalizeProduct);
      return { data: normalizedMock, results: normalizedMock, totalItems: normalizedMock.length, totalPages: 1 };
    }
  },

  getAllActiveProducts: async () => {
    if (isMockEnabled) {
      await mockDelay(null, 150);
      return mockProductsList.map(normalizeProduct).filter((p) => p.status === 'Active');
    }
    try {
      const res = await api.get('/products/');
      const rawList = Array.isArray(res) ? res : (res.results || res.data || []);
      return rawList.map(normalizeProduct);
    } catch (e) {
      return mockProductsList.map(normalizeProduct);
    }
  },

  getProductById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockProductsList.find((p) => p.id === id);
      if (!found) throw new Error('Product not found.');
      return normalizeProduct(found);
    }
    try {
      const res = await api.get(`/products/${id}/`);
      return normalizeProduct(res);
    } catch (e) {
      return normalizeProduct(mockProductsList.find((p) => p.id === id) || { id, name: 'Sample Product' });
    }
  },

  createProduct: async (productData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);
      const newProduct = normalizeProduct({
        ...productData,
        id: `prod-${Date.now().toString().slice(-4)}`,
      });
      mockProductsList = [newProduct, ...mockProductsList];
      return newProduct;
    }

    const payload = mapPayloadToBackend(productData);
    const res = await api.post('/products/', payload);
    const normalized = normalizeProduct(res);
    mockProductsList = [normalized, ...mockProductsList];
    return normalized;
  },

  updateProduct: async (id, productData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);
      const index = mockProductsList.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Product not found.');
      const updated = normalizeProduct({
        ...mockProductsList[index],
        ...productData,
      });
      mockProductsList[index] = updated;
      return updated;
    }

    const payload = mapPayloadToBackend(productData);
    const res = await api.patch(`/products/${id}/`, payload);
    const normalized = normalizeProduct(res);
    const index = mockProductsList.findIndex((p) => p.id === id);
    if (index !== -1) mockProductsList[index] = normalized;
    return normalized;
  },

  deleteProduct: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      mockProductsList = mockProductsList.filter((p) => p.id !== id);
      return { success: true };
    }
    await api.delete(`/products/${id}/`);
    mockProductsList = mockProductsList.filter((p) => p.id !== id);
    return { success: true };
  },
};

export default productService;
