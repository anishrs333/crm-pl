import api from './api';

const mapProduct = (p) => ({
  ...p,
  id: p.id,
  name: p.name,
  code: p.sku || p.code || `SKU-${p.id}`,
  category: p.product_type === 'service' ? 'Services' : (p.category || 'Standard'),
  unitPrice: parseFloat(p.unit_price || p.unitPrice || 0),
  taxPercentage: parseFloat(p.tax_rate || p.taxPercentage || 18),
  description: p.description || '',
  status: p.is_active ? 'Active' : 'Inactive',
  createdAt: p.created_at || new Date().toISOString(),
});

export const productService = {
  getProducts: async ({ page = 1, limit = 10, search = '', category = '', status = '' } = {}) => {
    const params = { page, page_size: limit };
    if (search) params.search = search;

    const response = await api.get('/products/', { params });

    const rawList = Array.isArray(response) ? response : (response?.results || response?.data || []);
    const totalItems = response?.count ?? rawList.length;

    return {
      data: rawList.map(mapProduct),
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit) || 1,
    };
  },

  getAllActiveProducts: async () => {
    const response = await api.get('/products/');
    const list = Array.isArray(response) ? response : (response?.results || []);
    return list.filter((p) => p.is_active).map(mapProduct);
  },

  getProductById: async (id) => {
    const product = await api.get(`/products/${id}/`);
    return mapProduct(product);
  },

  createProduct: async (productData) => {
    const payload = {
      name: productData.name,
      sku: productData.code || `SKU-${Date.now().toString().slice(-6)}`,
      product_type: productData.category?.toLowerCase() === 'services' ? 'service' : 'product',
      unit_price: parseFloat(productData.unitPrice || 0),
      tax_rate: parseFloat(productData.taxPercentage || 18),
      description: productData.description || '',
      is_active: productData.status !== 'Inactive',
    };

    const created = await api.post('/products/', payload);
    return mapProduct(created);
  },

  updateProduct: async (id, productData) => {
    const payload = { ...productData };
    if (productData.code) payload.sku = productData.code;
    if (productData.unitPrice !== undefined) payload.unit_price = parseFloat(productData.unitPrice);
    if (productData.taxPercentage !== undefined) payload.tax_rate = parseFloat(productData.taxPercentage);
    if (productData.status !== undefined) payload.is_active = productData.status === 'Active';

    const updated = await api.patch(`/products/${id}/`, payload);
    return mapProduct(updated);
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/${id}/`);
    return { success: true };
  },
};
