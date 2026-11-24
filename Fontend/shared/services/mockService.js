/**
 * Local Storage Service cho toàn bộ dữ liệu Điện Máy Pha Hằng
 * Nguyên tắc: Zero Runtime Mock Data & 100% SRS Field Compliance (DEC-008 / TASK-032)
 */
import { CORE_CATEGORIES } from '../models/srsSchemas.js';
import { removeVietnameseTones } from '../core/format.js';
import { API_CONFIG } from '../config/apiConfig.js';
import { apiClient } from './apiClient.js';
import { toCategory, toProduct, fromProduct } from './adapters.js';

export const STORAGE_KEYS = {
  CATEGORIES: 'ph_categories',
  PRODUCTS: 'ph_products',
  USERS: 'ph_users',
  COUPONS: 'ph_coupons',
  ORDERS: 'ph_orders',
  WARRANTIES: 'ph_warranties',
  CART: 'ph_cart',
  VERSION: 'ph_clean_storage_v3'
};

function getTestFallback(key, defaultValue) {
  if (typeof globalThis !== 'undefined' && globalThis.__TEST_FIXTURES__) {
    if (key === STORAGE_KEYS.PRODUCTS) return globalThis.__TEST_FIXTURES__.INITIAL_PRODUCTS || defaultValue;
    if (key === STORAGE_KEYS.CATEGORIES) return globalThis.__TEST_FIXTURES__.INITIAL_CATEGORIES || CORE_CATEGORIES;
    if (key === STORAGE_KEYS.USERS) return globalThis.__TEST_FIXTURES__.INITIAL_USERS || defaultValue;
    if (key === STORAGE_KEYS.COUPONS) return globalThis.__TEST_FIXTURES__.INITIAL_COUPONS || defaultValue;
    if (key === STORAGE_KEYS.ORDERS) return globalThis.__TEST_FIXTURES__.INITIAL_ORDERS || defaultValue;
    if (key === STORAGE_KEYS.WARRANTIES) return globalThis.__TEST_FIXTURES__.INITIAL_WARRANTIES || defaultValue;
  }
  return defaultValue;
}

function getStorage(key, defaultValue) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getTestFallback(key, defaultValue);
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : getTestFallback(key, defaultValue);
  } catch {
    return getTestFallback(key, defaultValue);
  }
}

function setStorage(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

/**
 * Hỗ trợ seed dữ liệu độc lập cho unit test (chỉ dùng trong tests/)
 */
export function seedStorageForTesting(fixtures = {}) {
  if (fixtures.INITIAL_PRODUCTS) setStorage(STORAGE_KEYS.PRODUCTS, fixtures.INITIAL_PRODUCTS);
  if (fixtures.INITIAL_CATEGORIES) setStorage(STORAGE_KEYS.CATEGORIES, fixtures.INITIAL_CATEGORIES);
  if (fixtures.INITIAL_USERS) setStorage(STORAGE_KEYS.USERS, fixtures.INITIAL_USERS);
  if (fixtures.INITIAL_COUPONS) setStorage(STORAGE_KEYS.COUPONS, fixtures.INITIAL_COUPONS);
  if (fixtures.INITIAL_ORDERS) setStorage(STORAGE_KEYS.ORDERS, fixtures.INITIAL_ORDERS);
  if (fixtures.INITIAL_WARRANTIES) setStorage(STORAGE_KEYS.WARRANTIES, fixtures.INITIAL_WARRANTIES);
}

// Khởi tạo DB LocalStorage sạch - Zero Runtime Mock Data
export function initMockDB(options = {}) {
  const fixtures = options?.fixtures || (typeof globalThis !== 'undefined' ? globalThis.__TEST_FIXTURES__ : null);
  if (fixtures) {
    seedStorageForTesting(fixtures);
    return;
  }

  // Khởi tạo các mảng dữ liệu rỗng chuẩn, chỉ nạp CORE_CATEGORIES cho danh mục
  if (!getStorage(STORAGE_KEYS.CATEGORIES, null)) {
    setStorage(STORAGE_KEYS.CATEGORIES, CORE_CATEGORIES);
  }
  if (!getStorage(STORAGE_KEYS.PRODUCTS, null)) {
    setStorage(STORAGE_KEYS.PRODUCTS, []);
  }
  if (!getStorage(STORAGE_KEYS.USERS, null)) {
    setStorage(STORAGE_KEYS.USERS, []);
  }
  if (!getStorage(STORAGE_KEYS.COUPONS, null)) {
    setStorage(STORAGE_KEYS.COUPONS, []);
  }
  if (!getStorage(STORAGE_KEYS.ORDERS, null)) {
    setStorage(STORAGE_KEYS.ORDERS, []);
  }
  if (!getStorage(STORAGE_KEYS.WARRANTIES, null)) {
    setStorage(STORAGE_KEYS.WARRANTIES, []);
  }
  if (!getStorage(STORAGE_KEYS.CART, null)) {
    setStorage(STORAGE_KEYS.CART, []);
  }
}

initMockDB();

export const mockService = {
  // Categories
  async getCategories() {
    if (API_CONFIG.USE_API && API_CONFIG.DOMAINS?.catalog !== 'local') {
      try {
        const res = await apiClient.getCategories();
        if (Array.isArray(res) && res.length > 0) {
          return res.map(toCategory);
        }
      } catch (err) {
        if (!API_CONFIG.FALLBACK_TO_MOCK) throw err;
      }
    }
    return getStorage(STORAGE_KEYS.CATEGORIES, CORE_CATEGORIES);
  },

  // Products
  async getProducts(query = {}) {
    let prods = null;
    if (API_CONFIG.USE_API && API_CONFIG.DOMAINS?.catalog !== 'local') {
      try {
        const res = await apiClient.getProducts();
        const list = Array.isArray(res) ? res : (res?.items || res?.content || []);
        if (list.length > 0) {
          prods = list.map(dto => toProduct(dto));
        }
      } catch (err) {
        if (!API_CONFIG.FALLBACK_TO_MOCK) throw err;
      }
    }
    if (!prods) {
      prods = getStorage(STORAGE_KEYS.PRODUCTS, []);
    }

    // Ẩn sản phẩm isVisible === false với khách hàng trừ khi includeHidden = true
    if (!query.includeHidden) {
      prods = prods.filter(p => p.isVisible !== false);
    }

    // Lọc theo Danh mục
    if (query.categoryId) {
      const catId = Number(query.categoryId);
      const allCats = getStorage(STORAGE_KEYS.CATEGORIES, CORE_CATEGORIES);
      const childIds = allCats.filter(c => c.parentId === catId).map(c => c.id);
      const targetIds = [catId, ...childIds];
      prods = prods.filter(p => targetIds.includes(p.categoryId));
    }

    // Lọc theo Brand
    if (query.brand) {
      const b = query.brand.toLowerCase();
      prods = prods.filter(p => p.brand.toLowerCase() === b);
    }

    // Lọc theo Giá
    if (query.minPrice !== undefined && query.minPrice !== null) {
      prods = prods.filter(p => {
        const minP = Math.min(...p.variants.map(v => v.price));
        return minP >= query.minPrice;
      });
    }
    if (query.maxPrice !== undefined && query.maxPrice !== null) {
      prods = prods.filter(p => {
        const minP = Math.min(...p.variants.map(v => v.price));
        return minP <= query.maxPrice;
      });
    }

    // Tìm kiếm (DEC-002: Tiếng Việt không dấu)
    if (query.q) {
      const normQ = removeVietnameseTones(query.q);
      prods = prods.filter(p => {
        const nameMatch = removeVietnameseTones(p.name).includes(normQ);
        const brandMatch = removeVietnameseTones(p.brand).includes(normQ);
        const descMatch = removeVietnameseTones(p.description || '').includes(normQ);
        return nameMatch || brandMatch || descMatch;
      });
    }

    // Sắp xếp
    if (query.sort === 'price_asc') {
      prods.sort((a, b) => Math.min(...a.variants.map(v => v.price)) - Math.min(...b.variants.map(v => v.price)));
    } else if (query.sort === 'price_desc') {
      prods.sort((a, b) => Math.min(...b.variants.map(v => v.price)) - Math.min(...a.variants.map(v => v.price)));
    } else if (query.sort === 'name_asc') {
      prods.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Mặc định sản phẩm mới nhất
      prods.sort((a, b) => b.id - a.id);
    }

    const total = prods.length;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12; // UI-10: 12 sp/trang
    const start = (page - 1) * limit;
    const items = prods.slice(start, start + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  async getProductById(id) {
    if (API_CONFIG.USE_API && API_CONFIG.DOMAINS?.catalog !== 'local') {
      try {
        const res = await apiClient.getProductById(id);
        if (res) return toProduct(res);
      } catch (err) {
        if (!API_CONFIG.FALLBACK_TO_MOCK) throw err;
      }
    }
    const prods = getStorage(STORAGE_KEYS.PRODUCTS, []);
    const p = prods.find(item => item.id === Number(id));
    if (!p) throw new Error('Không tìm thấy sản phẩm.');
    return p;
  },

  async createProduct(data) {
    if (API_CONFIG.USE_API && API_CONFIG.DOMAINS?.catalog !== 'local') {
      try {
        const payload = fromProduct(data);
        await apiClient.createProduct(payload);
      } catch (err) {
        if (!API_CONFIG.FALLBACK_TO_MOCK) throw err;
      }
    }
    const prods = getStorage(STORAGE_KEYS.PRODUCTS, []);
    const newId = prods.length > 0 ? Math.max(...prods.map(p => p.id)) + 1 : 1;
    const newProd = {
      id: newId,
      ...data,
      variants: (data.variants || []).map((v, idx) => ({
        id: newId * 100 + (idx + 1),
        productId: newId,
        ...v
      }))
    };
    prods.unshift(newProd);
    setStorage(STORAGE_KEYS.PRODUCTS, prods);
    return newProd;
  },

  async updateProduct(id, data) {
    if (API_CONFIG.USE_API && API_CONFIG.DOMAINS?.catalog !== 'local') {
      try {
        const payload = fromProduct({ id, ...data });
        await apiClient.updateProduct(id, payload);
      } catch (err) {
        if (!API_CONFIG.FALLBACK_TO_MOCK) throw err;
      }
    }
    const prods = getStorage(STORAGE_KEYS.PRODUCTS, []);
    const idx = prods.findIndex(p => p.id === Number(id));
    if (idx === -1) throw new Error('Không tìm thấy sản phẩm cần cập nhật.');
    prods[idx] = { ...prods[idx], ...data };
    setStorage(STORAGE_KEYS.PRODUCTS, prods);
    return prods[idx];
  },

  async deleteProduct(id) {
    if (API_CONFIG.USE_API && API_CONFIG.DOMAINS?.catalog !== 'local') {
      try {
        await apiClient.deleteProduct(id);
      } catch (err) {
        if (!API_CONFIG.FALLBACK_TO_MOCK) throw err;
      }
    }
    let prods = getStorage(STORAGE_KEYS.PRODUCTS, []);
    prods = prods.filter(p => p.id !== Number(id));
    setStorage(STORAGE_KEYS.PRODUCTS, prods);
    return true;
  },

  // Giỏ hàng
  async getCart() {
    return getStorage(STORAGE_KEYS.CART, []);
  },

  async addToCart(variantId, quantity = 1) {
    const cart = getStorage(STORAGE_KEYS.CART, []);
    const prods = getStorage(STORAGE_KEYS.PRODUCTS, []);
    
    // Tìm variant và product
    let targetProduct = null;
    let targetVariant = null;
    for (const p of prods) {
      const v = p.variants.find(va => va.id === Number(variantId));
      if (v) {
        targetProduct = p;
        targetVariant = v;
        break;
      }
    }

    if (!targetProduct || !targetVariant) {
      throw new Error('Sản phẩm hoặc biến thể không tồn tại.');
    }

    const existIdx = cart.findIndex(c => c.variantId === Number(variantId));
    if (existIdx > -1) {
      cart[existIdx].quantity += quantity;
    } else {
      cart.push({
        id: Date.now(),
        productId: targetProduct.id,
        variantId: targetVariant.id,
        productName: targetProduct.name,
        thumbnail: targetProduct.thumbnail,
        variantSpec: targetVariant.spec,
        variantColor: targetVariant.color,
        price: targetVariant.price,
        listPrice: targetVariant.listPrice,
        quantity,
        stockQty: targetVariant.stockQty
      });
    }

    setStorage(STORAGE_KEYS.CART, cart);
    return cart;
  },

  async updateCartQuantity(variantId, quantity) {
    let cart = getStorage(STORAGE_KEYS.CART, []);
    if (quantity <= 0) {
      cart = cart.filter(c => c.variantId !== Number(variantId));
    } else {
      const item = cart.find(c => c.variantId === Number(variantId));
      if (item) {
        item.quantity = quantity;
      }
    }
    setStorage(STORAGE_KEYS.CART, cart);
    return cart;
  },

  async removeFromCart(variantId) {
    let cart = getStorage(STORAGE_KEYS.CART, []);
    cart = cart.filter(c => c.variantId !== Number(variantId));
    setStorage(STORAGE_KEYS.CART, cart);
    return cart;
  },

  async clearCart() {
    setStorage(STORAGE_KEYS.CART, []);
    return [];
  },

  // Đơn hàng
  async getOrders(query = {}) {
    let orders = getStorage(STORAGE_KEYS.ORDERS, []);
    if (query.userId) {
      orders = orders.filter(o => o.userId === Number(query.userId));
    }
    if (query.status) {
      orders = orders.filter(o => o.status === query.status);
    }
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return orders;
  },

  async getOrderById(id) {
    const orders = getStorage(STORAGE_KEYS.ORDERS, []);
    const o = orders.find(item => item.id === Number(id));
    if (!o) throw new Error('Không tìm thấy đơn hàng.');
    return o;
  },

  async getOrderByCode(code) {
    const orders = getStorage(STORAGE_KEYS.ORDERS, []);
    const o = orders.find(item => item.orderCode.toLowerCase() === code.trim().toLowerCase());
    if (!o) throw new Error('Không tìm thấy đơn hàng với mã ' + code);
    return o;
  },

  async createOrder(orderData) {
    const orders = getStorage(STORAGE_KEYS.ORDERS, []);
    const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    const orderCode = 'PH-' + (1000 + newId);
    const newOrder = {
      id: newId,
      orderCode,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      ...orderData
    };
    orders.unshift(newOrder);
    setStorage(STORAGE_KEYS.ORDERS, orders);

    // Xóa giỏ hàng sau khi đặt thành công
    setStorage(STORAGE_KEYS.CART, []);
    return newOrder;
  },

  // Lấy đơn hàng riêng của người dùng đã đăng nhập (bảo vệ quyền riêng tư theo NĐ 13/2023)
  async getMyOrders(user) {
    if (!user) return [];
    const orders = getStorage(STORAGE_KEYS.ORDERS, []);
    const cleanUserPhone = (user.phone || '').replace(/[\s.-]/g, '');
    return orders
      .filter(o => {
        if (o.userId && o.userId === user.id) return true;
        const oPhone = (o.receiverPhone || o.phone || '').replace(/[\s.-]/g, '');
        return Boolean(cleanUserPhone && oPhone === cleanUserPhone);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Tra cứu bảo mật cho khách vãng lai: Yêu cầu cả mã đơn + SĐT
  async lookupGuestOrder(orderIdentifier, phone) {
    if (!orderIdentifier || !phone) {
      throw new Error('Vui lòng cung cấp cả Mã đơn hàng và Số điện thoại đặt hàng.');
    }
    const cleanCode = orderIdentifier.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/[\s.-]/g, '');
    const orders = getStorage(STORAGE_KEYS.ORDERS, []);

    const found = orders.find(o => {
      const matchCode = String(o.id) === cleanCode ||
        (o.orderCode && o.orderCode.toLowerCase() === cleanCode) ||
        cleanCode === `dh${o.id}` ||
        cleanCode === `#dh${o.id}`;
      const oPhone = (o.receiverPhone || o.phone || '').replace(/[\s.-]/g, '');
      return matchCode && oPhone === cleanPhone;
    });

    if (!found) {
      throw new Error('Không tìm thấy đơn hàng phù hợp với thông tin đã cung cấp.');
    }

    // Che mờ thông tin cá nhân (Data Masking) để bảo vệ quyền riêng tư
    const maskName = (name) => {
      if (!name) return 'Khách hàng';
      const parts = name.trim().split(' ');
      if (parts.length <= 1) return parts[0];
      return `${parts[0]} *** ${parts[parts.length - 1]}`;
    };
    const maskPhone = (p) => {
      if (!p || p.length < 6) return '098***';
      return `${p.slice(0, 3)}****${p.slice(-3)}`;
    };
    const maskAddress = (addr) => {
      if (!addr) return 'Gia Lâm, Hà Nội';
      const parts = addr.split(',');
      if (parts.length > 2) {
        return `***, ${parts.slice(-2).join(',').trim()}`;
      }
      return '***, Gia Lâm, Hà Nội';
    };

    return {
      ...found,
      customerName: maskName(found.customerName || found.receiverName),
      receiverName: maskName(found.receiverName || found.customerName),
      phone: maskPhone(found.phone || found.receiverPhone),
      receiverPhone: maskPhone(found.receiverPhone || found.phone),
      address: maskAddress(found.address || found.shipAddress),
      shipAddress: maskAddress(found.shipAddress || found.address),
      isGuestMasked: true
    };
  },

  async updateOrderStatus(id, status) {
    const orders = getStorage(STORAGE_KEYS.ORDERS, []);
    const o = orders.find(item => item.id === Number(id));
    if (!o) throw new Error('Không tìm thấy đơn hàng.');
    o.status = status;
    setStorage(STORAGE_KEYS.ORDERS, orders);
    return o;
  },

  // Coupons
  async getCoupons() {
    return getStorage(STORAGE_KEYS.COUPONS, []);
  },

  async applyCoupon(code, subtotal) {
    const coupons = getStorage(STORAGE_KEYS.COUPONS, []);
    const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      throw new Error('Mã giảm giá không tồn tại.');
    }
    if (!coupon.isActive) {
      throw new Error('Mã giảm giá đã hết hiệu lực.');
    }
    const today = new Date().toISOString().split('T')[0];
    if (today < coupon.startDate || today > coupon.endDate) {
      throw new Error('Mã giảm giá đã hết hạn sử dụng.');
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENT') {
      discount = Math.floor((subtotal * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, subtotal);

    return {
      coupon,
      discountAmount: discount,
      finalTotal: subtotal - discount
    };
  },

  // Users (Admin / Staff / Customer)
  async getUsers() {
    return getStorage(STORAGE_KEYS.USERS, []);
  },

  async createUser(userData) {
    const users = getStorage(STORAGE_KEYS.USERS, []);
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Email đã tồn tại.');
    }
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      createdAt: new Date().toISOString(),
      isActive: true,
      ...userData
    };
    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  async registerUser({ fullName, email, phone, password }) {
    if (!fullName || !email || !phone || !password) {
      throw new Error('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
    }
    if (password.length < 8) {
      throw new Error('Mật khẩu bắt buộc phải có tối thiểu 8 ký tự (FR-01.4).');
    }
    const users = getStorage(STORAGE_KEYS.USERS, []);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/[\s.-]/g, '');

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Địa chỉ email này đã được đăng ký tài khoản.');
    }
    if (users.some(u => u.phone && u.phone.replace(/[\s.-]/g, '') === cleanPhone)) {
      throw new Error('Số điện thoại này đã được đăng ký tài khoản.');
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password,
      role: 'CUSTOMER',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  async toggleUserStatus(id) {
    const users = getStorage(STORAGE_KEYS.USERS, []);
    const u = users.find(user => user.id === Number(id));
    if (!u) throw new Error('Không tìm thấy người dùng.');
    u.isActive = !u.isActive;
    setStorage(STORAGE_KEYS.USERS, users);
    return u;
  },

  async updateUserRole(id, newRole) {
    const users = getStorage(STORAGE_KEYS.USERS, []);
    const u = users.find(user => user.id === Number(id));
    if (!u) throw new Error('Không tìm thấy người dùng.');
    u.role = newRole;
    setStorage(STORAGE_KEYS.USERS, users);
    return u;
  },

  async updateUserStatus(id, status) {
    const users = getStorage(STORAGE_KEYS.USERS, []);
    const u = users.find(user => user.id === Number(id));
    if (!u) throw new Error('Không tìm thấy người dùng.');
    u.status = Boolean(status);
    setStorage(STORAGE_KEYS.USERS, users);
    return u;
  },

  // Bảo hành điện tử (FR-12, UC-12, Wireframe Hình 14)
  async getWarranties(query = {}) {
    let warranties = getStorage(STORAGE_KEYS.WARRANTIES, []);
    if (query.status) {
      warranties = warranties.filter(w => w.status === query.status);
    }
    if (query.q) {
      const q = query.q.toLowerCase().trim();
      warranties = warranties.filter(w =>
        (w.serialNo && w.serialNo.toLowerCase().includes(q)) ||
        (w.customerPhone && w.customerPhone.includes(q)) ||
        (w.productName && w.productName.toLowerCase().includes(q)) ||
        (w.orderCode && w.orderCode.toLowerCase().includes(q))
      );
    }
    return warranties;
  },

  async lookupWarranty(keyword) {
    if (!keyword) return [];
    const q = keyword.toLowerCase().trim();
    const warranties = getStorage(STORAGE_KEYS.WARRANTIES, []);
    return warranties.filter(w =>
      (w.serialNo && w.serialNo.toLowerCase().includes(q)) ||
      (w.customerPhone && w.customerPhone.trim() === q)
    );
  },

  async assignSerialNumber(orderId, orderItemId, serialNo) {
    const orders = getStorage(STORAGE_KEYS.ORDERS, []);
    const order = orders.find(o => o.id === Number(orderId));
    if (!order) throw new Error('Không tìm thấy đơn hàng.');

    const item = (order.items || []).find(it => it.id === Number(orderItemId));
    if (!item) throw new Error('Không tìm thấy sản phẩm trong đơn.');

    item.serialNo = serialNo.trim().toUpperCase();
    setStorage(STORAGE_KEYS.ORDERS, orders);

    // Tự động tạo bản ghi bảo hành điện tử (FR-07.5, FR-12)
    const warranties = getStorage(STORAGE_KEYS.WARRANTIES, []);
    const existingIdx = warranties.findIndex(w => w.serialNo === item.serialNo);

    const now = new Date();
    const startDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const endDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear() + 2}`;

    const warrantyRecord = {
      id: warranties.length > 0 ? Math.max(...warranties.map(w => w.id)) + 1 : 1,
      orderItemId: item.id,
      orderCode: order.orderCode,
      serialNo: item.serialNo,
      imei: item.serialNo,
      productName: item.productName,
      variantInfo: item.variantInfo,
      customerName: order.receiverName,
      customerPhone: order.receiverPhone,
      startDate,
      endDate,
      status: 'ACTIVE'
    };

    if (existingIdx > -1) {
      warranties[existingIdx] = { ...warranties[existingIdx], ...warrantyRecord };
    } else {
      warranties.unshift(warrantyRecord);
    }
    setStorage(STORAGE_KEYS.WARRANTIES, warranties);

    return { order, warranty: warrantyRecord };
  },

  // Báo cáo thống kê Dashboard
  async getDashboardSummary() {
    const orders = getStorage(STORAGE_KEYS.ORDERS, []);
    const prods = getStorage(STORAGE_KEYS.PRODUCTS, []);
    const users = getStorage(STORAGE_KEYS.USERS, []);

    const totalRevenue = orders
      .filter(o => o.status === 'COMPLETED' || o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const totalProducts = prods.length;
    const totalCustomers = users.filter(u => u.role === 'CUSTOMER').length;

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalCustomers
    };
  }
};
