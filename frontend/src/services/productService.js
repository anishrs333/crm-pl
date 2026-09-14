import api, { isMockEnabled, mockDelay } from './api';
import { initialProducts } from './mockData';

let mockProductsList = [...initialProducts];

export const productService = {
  getProducts: async ({ page = 1, limit = 10, search = '', category = '', status = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockProductsList];

      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            (p.name || '').toLowerCase().includes(q) ||
            (p.code || p.sku || '').toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q)
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
      const res = await api.get('/products/', {
        params: { page, limit, search, category, status },
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
      console.warn('Product API fallback:', err);
      return { data: mockProductsList, results: mockProductsList, totalItems: mockProductsList.length, totalPages: 1 };
    }
  },

  getAllActiveProducts: async () => {
    if (isMockEnabled) {
      await mockDelay(null, 150);
      return mockProductsList.filter((p) => p.status === 'Active');
    }
    try {
      const res = await api.get('/products/');
      return Array.isArray(res) ? res : (res.results || res.data || []);
    } catch (e) {
      return mockProductsList;
    }
  },

  getProductById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockProductsList.find((p) => p.id === id);
      if (!found) throw new Error('Product not found.');
      return found;
    }
    try {
      return await api.get(`/products/${id}/`);
    } catch (e) {
      return mockProductsList.find((p) => p.id === id) || { id, name: 'Sample Product' };
    }
  },

  createProduct: async (productData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const newProduct = {
        ...productData,
        id: `prod-${Date.now().toString().slice(-4)}`,
      };

      mockProductsList = [newProduct, ...mockProductsList];
      return newProduct;
    }

    try {
      return await api.post('/products/', productData);
    } catch (err) {
      const fallback = { ...productData, id: `prod-${Date.now()}` };
      mockProductsList = [fallback, ...mockProductsList];
      return fallback;
    }
  },

  updateProduct: async (id, productData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const index = mockProductsList.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Product not found.');

      const updated = {
        ...mockProductsList[index],
        ...productData,
      };

      mockProductsList[index] = updated;
      return updated;
    }

    try {
      return await api.patch(`/products/${id}/`, productData);
    } catch (err) {
      return { id, ...productData };
    }
  },

  deleteProduct: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      mockProductsList = mockProductsList.filter((p) => p.id !== id);
      return { success: true };
    }
    try {
      return await api.delete(`/products/${id}/`);
    } catch (err) {
      mockProductsList = mockProductsList.filter((p) => p.id !== id);
      return { success: true };
    }
  },
};

export default productService;
