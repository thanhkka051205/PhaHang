/**
 * Quản lý phiên đăng nhập Khách Hàng và Quản Trị Viên (DEC-001, UI-09)
 */
import { createStore } from '../core/store.js';
import { mockService } from '../services/mockService.js';
import { API_CONFIG } from '../config/apiConfig.js';
import { apiClient } from '../services/apiClient.js';

const clientAuthStore = createStore('phh_client_session', { user: null });
const adminAuthStore = createStore('phh_admin_session', { user: null });

function shouldUseAuthApi() {
  return Boolean(API_CONFIG.USE_API && API_CONFIG.DOMAINS?.auth !== 'local');
}

function shouldFallbackToMock(err) {
  return Boolean(err?.isNetworkError && API_CONFIG.FALLBACK_TO_MOCK);
}

export const authStore = {
  // Client auth
  getClientUser() {
    return clientAuthStore.get().user;
  },
  async loginClient(email, password) {
    if (!email || !password) {
      throw new Error('Vui lòng nhập đầy đủ email và mật khẩu.');
    }

    if (shouldUseAuthApi()) {
      try {
        const { user } = await apiClient.login(email.trim(), password, 'client');
        if (!user) {
          apiClient.logout('client');
          throw new Error('Không nhận được thông tin tài khoản từ máy chủ.');
        }
        if (!user.isActive) {
          apiClient.logout('client');
          throw new Error('Tài khoản đã bị tạm khóa. Vui lòng liên hệ hotline.');
        }
        clientAuthStore.set({ user });
        return user;
      } catch (err) {
        if (!shouldFallbackToMock(err)) {
          throw err;
        }
      }
    }

    const users = await mockService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }
    if (user.password && user.password !== password) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }
    if (!user.isActive) {
      throw new Error('Tài khoản đã bị tạm khóa. Vui lòng liên hệ hotline.');
    }
    clientAuthStore.set({ user });
    return user;
  },
  async registerClient(userData) {
    if (shouldUseAuthApi()) {
      try {
        const beUser = await apiClient.register({
          fullName: userData.fullName,
          email: userData.email,
          password: userData.password
        });
        const user = {
          ...beUser,
          phone: userData.phone || beUser?.phone || '',
          agreedPrivacyPolicy: !!userData.agreedPrivacyPolicy
        };
        clientAuthStore.set({ user });
        return user;
      } catch (err) {
        if (!shouldFallbackToMock(err)) {
          throw err;
        }
      }
    }

    const user = await mockService.registerUser(userData);
    clientAuthStore.set({ user });
    return user;
  },
  logoutClient() {
    apiClient.logout('client');
    clientAuthStore.set({ user: null });
  },
  subscribeClient(fn) {
    return clientAuthStore.subscribe(fn);
  },

  // Admin auth
  getAdminUser() {
    return adminAuthStore.get().user;
  },
  async loginAdmin(email, password) {
    if (!email || !password) {
      throw new Error('Vui lòng nhập đầy đủ email và mật khẩu.');
    }

    if (shouldUseAuthApi()) {
      try {
        const { user } = await apiClient.login(email.trim(), password, 'admin');
        if (!user) {
          apiClient.logout('admin');
          throw new Error('Không nhận được thông tin tài khoản từ máy chủ.');
        }
        if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
          apiClient.logout('admin');
          throw new Error('Bạn không có quyền truy cập cổng Quản trị.');
        }
        if (!user.isActive) {
          apiClient.logout('admin');
          throw new Error('Tài khoản quản trị đang bị khóa.');
        }
        adminAuthStore.set({ user });
        return user;
      } catch (err) {
        if (!shouldFallbackToMock(err)) {
          throw err;
        }
      }
    }

    const users = await mockService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      throw new Error('Tài khoản quản trị không tồn tại.');
    }
    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      throw new Error('Bạn không có quyền truy cập cổng Quản trị.');
    }
    if (user.password && user.password !== password) {
      throw new Error('Email hoặc mật khẩu quản trị không chính xác.');
    }
    if (!user.isActive) {
      throw new Error('Tài khoản quản trị đang bị khóa.');
    }
    adminAuthStore.set({ user });
    return user;
  },
  logoutAdmin() {
    apiClient.logout('admin');
    adminAuthStore.set({ user: null });
  },
  subscribeAdmin(fn) {
    return adminAuthStore.subscribe(fn);
  }
};
