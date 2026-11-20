/**
 * Quản lý State Pub/Sub đồng bộ LocalStorage và đa tab (thay thế Pinia)
 */

export function createStore(key, initialValue) {
  let state = structuredClone(initialValue);

  // Khôi phục từ localStorage nếu có
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        state = { ...state, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn(`[Store ${key}] Lỗi đọc từ localStorage:`, e);
    }
  }

  const subscribers = new Set();

  const emit = () => {
    subscribers.forEach(fn => {
      try {
        fn(state);
      } catch (e) {
        console.error(`[Store ${key}] Lỗi listener:`, e);
      }
    });
  };

  // Đồng bộ giữa các tab trình duyệt
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('storage', (e) => {
      if (e.key === key && e.newValue) {
        try {
          state = JSON.parse(e.newValue);
          emit();
        } catch (err) {
          console.warn(`[Store ${key}] Lỗi parse sync:`, err);
        }
      }
    });
  }

  return {
    get: () => state,
    set(patch) {
      if (typeof patch === 'function') {
        state = patch(state);
      } else {
        state = { ...state, ...patch };
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(key, JSON.stringify(state));
        } catch (e) {
          console.warn(`[Store ${key}] Lỗi ghi localStorage:`, e);
        }
      }
      emit();
    },
    subscribe(fn) {
      subscribers.add(fn);
      // Gọi ngay 1 lần với state hiện tại
      try {
        fn(state);
      } catch (e) {
        console.error(`[Store ${key}] Error in initial subscribe call:`, e);
      }
      return () => subscribers.delete(fn);
    }
  };
}
