/**
 * Quản lý Giỏ hàng toàn cục (thay thế cart Pinia store)
 */
import { createStore } from '../core/store.js';
import { mockService } from '../services/mockService.js';

const store = createStore('phh_cart_store', { items: [] });
let isLoaded = false;
let loadPromise = null;

export const cartStore = {
  get() {
    return store.get();
  },

  getItems() {
    return store.get().items || [];
  },

  async ensureLoaded(force = false) {
    if (isLoaded && !force) return store.get().items;
    if (loadPromise && !force) return loadPromise;

    loadPromise = (async () => {
      try {
        const items = await mockService.getCart();
        store.set({ items: items || [] });
        isLoaded = true;
        return store.get().items;
      } catch (err) {
        console.error('Lỗi khi nạp giỏ hàng:', err);
        return [];
      } finally {
        loadPromise = null;
      }
    })();

    return loadPromise;
  },

  count() {
    const items = store.get().items || [];
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  },

  totalAmount() {
    const items = store.get().items || [];
    return items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  },

  async addItem(variantId, quantity = 1) {
    await this.ensureLoaded();
    const updated = await mockService.addToCart(variantId, quantity);
    store.set({ items: updated });
    return updated;
  },

  async updateQuantity(variantId, quantity) {
    await this.ensureLoaded();
    const updated = await mockService.updateCartQuantity(variantId, quantity);
    store.set({ items: updated });
    return updated;
  },

  async removeItem(variantId) {
    await this.ensureLoaded();
    const updated = await mockService.removeFromCart(variantId);
    store.set({ items: updated });
    return updated;
  },

  async clear() {
    await mockService.clearCart();
    store.set({ items: [] });
    return [];
  },

  subscribe(fn) {
    return store.subscribe(fn);
  }
};
