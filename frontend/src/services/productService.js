import api, { isMockEnabled, mockDelay } from './api';
import { initialProducts } from './mockData';

let mockProductsList = [...initialProducts];

export const productService = {
  getProducts: async ({ page = 1, limit = 10, search = '', category = '', status = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockProductsList];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
      }

      if (category) {
        filtered = filtered.filter((p) => p.category === category);
      }

      if (status) {
        filtered = filtered.filter((p) => p.status === status);
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

    return await api.get('/products', {
      params: { page, limit, search, category, status },
    });
  },

  getAllActiveProducts: async () => {
    if (isMockEnabled) {
      await mockDelay(null, 150);
      return mockProductsList.filter((p) => p.status === 'Active');
    }
    return await api.get('/products/active');
  },

  getProductById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockProductsList.find((p) => p.id === id);
      if (!found) throw new Error('Product not found.');
      return found;
    }
    return await api.get(`/products/${id}`);
  },

  createProduct: async (productData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const exists = mockProductsList.some(
        (p) => p.code.toLowerCase() === productData.code.trim().toLowerCase()
      );
      if (exists) {
        throw new Error('A product with this product code / SKU already exists.');
      }

      const newProduct = {
        ...productData,
        id: `prod-${Date.now().toString().slice(-4)}`,
        unitPrice: Number(productData.unitPrice) || 0,
        taxPercentage: Number(productData.taxPercentage) || 18,
      };

      mockProductsList = [newProduct, ...mockProductsList];
      return newProduct;
    }

    return await api.post('/products', productData);
  },

  updateProduct: async (id, productData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const index = mockProductsList.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Product not found.');

      const updated = {
        ...mockProductsList[index],
        ...productData,
        unitPrice: Number(productData.unitPrice) || 0,
        taxPercentage: Number(productData.taxPercentage) || 18,
      };

      mockProductsList[index] = updated;
      return updated;
    }

    return await api.put(`/products/${id}`, productData);
  },

  deleteProduct: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      mockProductsList = mockProductsList.filter((p) => p.id !== id);
      return { success: true };
    }
    return await api.delete(`/products/${id}`);
  },
};
