/**
 * Mock localStorage và môi trường browser cho Node.js test runner
 */
class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) ?? null;
  }
  setItem(key, val) {
    this.store.set(key, String(val));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

if (!globalThis.localStorage) {
  globalThis.localStorage = new MemoryStorage();
}

// Tự động nạp Fixture dữ liệu cô lập cho môi trường Node.js unit tests
import * as fixtures from './fixtures/testFixtures.js';
globalThis.__TEST_FIXTURES__ = fixtures;
if (localStorage.getItem('ph_products') === null) {
  localStorage.setItem('ph_products', JSON.stringify(fixtures.INITIAL_PRODUCTS));
  localStorage.setItem('ph_categories', JSON.stringify(fixtures.INITIAL_CATEGORIES));
  localStorage.setItem('ph_users', JSON.stringify(fixtures.INITIAL_USERS));
  localStorage.setItem('ph_coupons', JSON.stringify(fixtures.INITIAL_COUPONS));
  localStorage.setItem('ph_orders', JSON.stringify(fixtures.INITIAL_ORDERS));
  localStorage.setItem('ph_warranties', JSON.stringify(fixtures.INITIAL_WARRANTIES));
  localStorage.setItem('ph_cart', JSON.stringify([]));
}

if (!globalThis.window) {
  globalThis.window = {
    localStorage: globalThis.localStorage,
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { search: '', href: 'http://localhost/' }
  };
}
